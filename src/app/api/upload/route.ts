import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getSession();

  if (!session?.user || !session.session.activeOrganizationId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const orgId = session.session.activeOrganizationId;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const budgetId = formData.get("budgetId") as string;

    if (!file) {
      return NextResponse.json({ error: "Arquivo ausente" }, { status: 400 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { slug: true },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Org não encontrada" },
        { status: 404 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), "storage", organization.slug, "imgs");
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const filePath = join(uploadDir, fileName);
    const publicPath = `/api/storage/${organization.slug}/imgs/${fileName}`;

    // Operação Atômica: Salva no Banco e no Disco
    await prisma.$transaction(async (tx) => {
      if (budgetId) {
        // Valida se o orçamento pertence à organização
        const budget = await tx.budget.findFirst({
          where: { id: budgetId, organizationId: orgId },
        });

        if (!budget) throw new Error("Orçamento inválido");

        await tx.budgetPhoto.create({
          data: { budgetId, url: publicPath },
        });
      }

      await writeFile(filePath, buffer);
    });

    return NextResponse.json({ url: publicPath, success: true });
  } catch (error) {
    console.error("Erro no upload atômico:", error);
    return NextResponse.json(
      { error: "Falha ao processar upload" },
      { status: 500 },
    );
  }
}
