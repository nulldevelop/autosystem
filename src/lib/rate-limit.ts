import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type Options = { limit: number; windowSeconds: number };

/**
 * Limite de tentativas por chave, atômico e compartilhado entre instâncias.
 *
 * Um único INSERT ... ON CONFLICT incrementa (ou reinicia, se a janela venceu)
 * e devolve a contagem, então requisições simultâneas não furam o limite.
 * Se o banco falhar, libera (fail-open): o limite não pode tirar o site do ar.
 */
export async function rateLimit(
  key: string,
  { limit, windowSeconds }: Options,
): Promise<RateLimitResult> {
  try {
    const rows = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>`
      INSERT INTO rate_limit ("key", "count", "resetAt")
      VALUES (${key}, 1, now() + ${windowSeconds}::int * interval '1 second')
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN rate_limit."resetAt" <= now() THEN 1 ELSE rate_limit."count" + 1 END,
        "resetAt" = CASE WHEN rate_limit."resetAt" <= now()
          THEN now() + ${windowSeconds}::int * interval '1 second'
          ELSE rate_limit."resetAt" END
      RETURNING "count", "resetAt"`;

    const { count, resetAt } = rows[0];
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((new Date(resetAt).getTime() - Date.now()) / 1000),
    );

    // limpeza ocasional de contadores vencidos
    if (Math.random() < 0.01) {
      void prisma.rateLimitBucket
        .deleteMany({ where: { resetAt: { lt: new Date(Date.now() - 86_400_000) } } })
        .catch(() => {});
    }

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds,
    };
  } catch (error) {
    console.error("Erro no limite de tentativas (liberando):", error);
    return { allowed: true, remaining: limit, retryAfterSeconds: 0 };
  }
}

/** IP do cliente atrás de proxy (Vercel envia x-forwarded-for). */
export function getClientIp(headers: Pick<Headers, "get">) {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}

/** Hash para guardar o e-mail na chave sem manter o endereço em texto. */
export function hashKey(value: string) {
  return createHash("sha256").update(value.toLowerCase().trim()).digest("hex").slice(0, 32);
}
