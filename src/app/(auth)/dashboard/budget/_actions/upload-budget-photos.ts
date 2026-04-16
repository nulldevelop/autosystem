"use server";

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function uploadBudgetPhotos(formData: FormData) {
  try {
    const session = await getSession();

    if (!session?.user || !session.session.activeOrganizationId) {
      throw new Error("Não autorizado");
    }

    const budgetId = formData.get("budgetId") as string;
    const files = formData.getAll("files") as File[];

    if (!budgetId || files.length === 0) {
      throw new Error("Dados insuficientes");
    }

    const organization = await prisma.organization.findUnique({
      where: { id: session.session.activeOrganizationId },
      select: { slug: true },
    });

    if (!organization) {
      throw new Error("Organização não encontrada");
    }

    const uploadedUrls: string[] = [];

    // Caminho: storage/[slug]/[budgetId]/imgs/
    const uploadDir = join(
      process.cwd(),
      "storage",
      organization.slug,
      budgetId,
      "imgs",
    );
    await mkdir(uploadDir, { recursive: true });

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const filePath = join(uploadDir, fileName);

      await writeFile(filePath, buffer);

      const publicPath = `/api/storage/${organization.slug}/${budgetId}/imgs/${fileName}`;
      uploadedUrls.push(publicPath);

      // Salvar no banco
      await prisma.budgetPhoto.create({
        data: {
          budgetId,
          url: publicPath,
        },
      });
    }

    revalidatePath("/dashboard/budget");
    return { success: true, urls: uploadedUrls };
  } catch (error) {
    console.error("Erro no upload de fotos do orçamento:", error);
    return { success: false, error: "Falha ao salvar fotos" };
  }
}
