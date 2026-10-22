"use server";

import { headers } from "next/headers";
import * as z from "zod";
import { auth } from "@/lib/auth";
import { getClientIp, hashKey, rateLimit } from "@/lib/rate-limit";
import { attachReferrer } from "@/lib/referral";

const signUpSchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres." })
    .max(100, { message: "O nome deve ter no máximo 100 caracteres." })
    .trim(),
  // limpa espaços e caixa ANTES de validar (teclados de celular costumam deixar um espaço no fim)
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: "Por favor, insira um e-mail válido." })),
  password: z
    .string()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres." })
    .max(100, { message: "A senha deve ter no máximo 100 caracteres." })
    .regex(/[A-Z]/, {
      message: "A senha deve conter pelo menos uma letra maiúscula.",
    })
    .regex(/[a-z]/, {
      message: "A senha deve conter pelo menos uma letra minúscula.",
    })
    .regex(/[0-9]/, { message: "A senha deve conter pelo menos um número." }),
  referralCode: z.string().trim().max(32).optional(),
});

type SignUpResponse =
  | { success: true; message: string }
  | {
      success: false;
      error: {
        message: string;
        fieldErrors?: Partial<
          Record<keyof z.infer<typeof signUpSchema>, string[]>
        >;
      };
    };

export async function signUp(data: unknown): Promise<SignUpResponse> {
  const result = signUpSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: {
        message: "Dados de cadastro inválidos.",
        fieldErrors: result.error.flatten().fieldErrors,
      },
    };
  }

  try {
    const { name, email, password, referralCode } = result.data;

    // auth.api.* chamado no servidor não passa pelo limitador do better-auth:
    // sem isto dá para criar contas em massa e gastar a cota de e-mails.
    const ip = getClientIp(await headers());
    const [byIp, byEmail] = await Promise.all([
      rateLimit(`signup:ip:${ip}`, { limit: 10, windowSeconds: 3600 }),
      rateLimit(`signup:email:${hashKey(email)}`, {
        limit: 3,
        windowSeconds: 3600,
      }),
    ]);
    if (!byIp.allowed || !byEmail.allowed) {
      const wait = Math.max(byIp.retryAfterSeconds, byEmail.retryAfterSeconds);
      return {
        success: false,
        error: {
          message: `Muitas tentativas. Tente novamente em ${Math.ceil(wait / 60)} minuto(s).`,
        },
      };
    }

    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        callbackURL: "/dashboard",
      },
    });

    if (referralCode) {
      // falha na indicação nunca deve impedir o cadastro
      await attachReferrer(email, referralCode).catch((err) =>
        console.error("Erro ao vincular indicação:", err),
      );
    }

    return { success: true, message: "Conta criada com sucesso!" };
  } catch (error) {
    console.error("Erro no cadastro:", error);
    if (error instanceof Error) {
      if (
        error.message.toLowerCase().includes("already exists") ||
        error.message.toLowerCase().includes("já existe")
      ) {
        return {
          success: false,
          error: {
            message: "Este e-mail já está cadastrado.",
          },
        };
      }

      return {
        success: false,
        error: {
          message: "Não foi possível criar a conta. Tente novamente.",
        },
      };
    }

    return {
      success: false,
      error: {
        message: "Ocorreu um erro inesperado ao criar a conta.",
      },
    };
  }
}
