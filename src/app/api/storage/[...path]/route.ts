import { readFile } from "node:fs/promises";
import { join, normalize } from "node:path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";

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
