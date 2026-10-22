import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { BudgetPDF } from "@/app/(auth)/dashboard/budget/_components/BudgetPDF";
import { getTenant } from "@/lib/tenant";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const tenant = await getTenant();
    if (!tenant) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { id } = await params;

    // O db da oficina só enxerga orçamentos da própria oficina
    const budget = await tenant.db.budget.findFirst({
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

    // biome-ignore lint/suspicious/noExplicitAny: tipos do Prisma x react-pdf
    const buffer = await renderToBuffer(<BudgetPDF budget={budget as any} />);

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="orcamento-${budget.id.substring(0, 8)}.pdf"`,
      },
    });
  } catch (error) {
    // detalhes só no log do servidor
    console.error("ERRO NA GERAÇÃO DE PDF:", error);
    return new NextResponse("Erro ao gerar PDF", { status: 500 });
  }
}
