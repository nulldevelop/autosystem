import { Package } from "lucide-react";

interface LineItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: {
    id: string;
    sku?: string | null;
    name: string;
    category?: string | null;
  };
}

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

export function LineItems({
  items,
  title,
}: {
  items: LineItem[];
  title: string;
}) {
  const total = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Package className="size-4 text-primary" aria-hidden />
          {title}
        </h2>
        <span className="num text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "itens"}
        </span>
      </header>

      {items.length === 0 ? (
        <p className="p-10 text-center text-sm text-muted-foreground">
          Nenhum item adicionado.
        </p>
      ) : (
        <>
          {/* Mobile: um cartão por item */}
          <ul className="divide-y sm:hidden">
            {items.map((item) => (
              <li key={item.id} className="space-y-1 px-4 py-3">
                <p className="font-medium">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-mono">
                    {item.product.sku || item.product.id.substring(0, 6)}
                  </span>
                  {" · "}
                  {item.product.category || "Geral"}
                </p>
                <div className="num flex items-center justify-between pt-1 text-sm">
                  <span className="text-muted-foreground">
                    {item.quantity} × {brl(item.unitPrice)}
                  </span>
                  <span className="font-semibold">
                    {brl(item.quantity * item.unitPrice)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {/* Tablet e desktop: tabela */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Código</th>
                  <th className="px-4 py-2.5 font-medium">Descrição</th>
                  <th className="px-4 py-2.5 text-right font-medium">Qtd.</th>
                  <th className="px-4 py-2.5 text-right font-medium">
                    Unitário
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {item.product.sku || item.product.id.substring(0, 6)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.product.category || "Geral"}
                      </p>
                    </td>
                    <td className="num px-4 py-3 text-right">
                      {item.quantity}
                    </td>
                    <td className="num px-4 py-3 text-right text-muted-foreground">
                      {brl(item.unitPrice)}
                    </td>
                    <td className="num px-4 py-3 text-right font-semibold">
                      {brl(item.unitPrice * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="flex items-center justify-between border-t bg-surface px-4 py-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="num font-display text-lg font-semibold">
              {brl(total)}
            </span>
          </footer>
        </>
      )}
    </section>
  );
}
