import { readFile } from "node:fs/promises";
import { join, normalize } from "node:path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const pathParts = (await params).path;
    const orgSlug = pathParts[0];

    // Valida se o usuário pertence à organização do slug solicitado
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organization: { slug: orgSlug },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Normaliza o caminho para evitar Path Traversal (escape com ..)
    const safePath = normalize(join(...pathParts)).replace(
      /^(\.\.(\/|\\))+/,
      "",
    );
    const storageDir = join(process.cwd(), "storage");
    const filePath = join(storageDir, safePath);

    // Garante que o arquivo está dentro da pasta storage
    if (!filePath.startsWith(storageDir)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const file = await readFile(filePath);

    const ext = filePath.split(".").pop()?.toLowerCase();
    const contentType =
      ext === "png"
        ? "image/png"
        : ext === "svg"
          ? "image/svg+xml"
          : ext === "webp"
            ? "image/webp"
            : "image/jpeg";

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "Arquivo não encontrado" },
      { status: 404 },
    );
  }
}
