import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { path: string[] } },
) {
  try {
    const pathParts = (await params).path;
    const filePath = join(process.cwd(), "storage", ...pathParts);

    const file = await readFile(filePath);

    // Determina o Content-Type básico
    const ext = filePath.split(".").pop()?.toLowerCase();
    const contentType =
      ext === "png"
        ? "image/png"
        : ext === "svg"
          ? "image/svg+xml"
          : "image/jpeg";

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Arquivo não encontrado" },
      { status: 404 },
    );
  }
}
