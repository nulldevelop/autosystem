import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import React from "react";
import { BudgetPDF } from "@/app/(auth)/dashboard/budget/_components/BudgetPDF";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const budget = await prisma.budget.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
        items: {
          include: {
            product: true,
          },
        },
        organization: true,
      },
    });

    if (!budget) {
      return new NextResponse("Orçamento não encontrado", { status: 404 });
    }

    // Gerar o buffer do PDF
    // Usando JSX diretamente para melhor compatibilidade com React 18/19 e react-pdf
    const buffer = await renderToBuffer(<BudgetPDF budget={budget as any} />);

    // Retornar o PDF como resposta
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="orcamento-${budget.id.substring(0, 8)}.pdf"`,
      },
    });
  } catch (error) {
    console.error("ERRO CRÍTICO NA GERAÇÃO DE PDF:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    const errorStack = error instanceof Error ? error.stack : "";

    // Retornar o erro detalhado para facilitar o debug se necessário
    return new NextResponse(
      `Erro ao gerar PDF: ${errorMessage}\n${errorStack}`,
      {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      },
    );
  }
}
