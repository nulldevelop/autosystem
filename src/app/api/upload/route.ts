import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const organizationId = formData.get("organizationId") as string;

    if (!file || !organizationId) {
      return NextResponse.json(
        { error: "Arquivo ou ID da organização ausente" },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { slug: true },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organização não encontrada" },
        { status: 404 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Caminho: storage/[slug]/imgs/[filename]
    const uploadDir = join(process.cwd(), "storage", organization.slug, "imgs");
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    // Retorna o caminho relativo para ser salvo no banco de dados
    const publicPath = `/api/storage/${organization.slug}/imgs/${fileName}`;

    return NextResponse.json({ url: publicPath });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json({ error: "Falha ao salvar o arquivo" }, { status: 500 });
  }
}
