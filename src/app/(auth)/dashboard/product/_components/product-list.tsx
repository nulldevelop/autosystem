"use client";

import {
  FileSpreadsheet,
  Package,
  Pencil,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { Segmented, SearchInput } from "@/components/app/toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { AdjustStockModal } from "./adjust-stock-modal";
import { CreateProductForm } from "./create-product-form";
import { EditProductForm } from "./edit-product-form";
import { ProductStats } from "./product-stats";
import { ReportSelectionModal } from "./report-selection-modal";

interface ProductListProps {
  products: Product[];
  // biome-ignore lint/suspicious/noExplicitAny: organização repassada ao relatório PDF
  organization: any;
}

const isOut = (p: Product) => p.stockQuantity === 0;
const isLow = (p: Product) => p.stockQuantity <= p.minStock && !isOut(p);

type StockFilter = "all" | "low" | "out";

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

export function ProductList({ products, organization }: ProductListProps) {
  const [isCreateProductModalOpen, setCreateProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setEditProductModalOpen] = useState(false);
  const [isAdjustStockModalOpen, setAdjustStockModalOpen] = useState(false);
  const [isReportsModalOpen, setReportsModalOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  const lowCount = products.filter(isLow).length;
  const outCount = products.filter(isOut).length;

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term);
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && isLow(product)) ||
        (stockFilter === "out" && isOut(product));
      return matchesSearch && matchesStock;
    });
  }, [products, searchTerm, stockFilter]);

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setEditProductModalOpen(true);
  };

  const handleAdjustClick = (product: Product) => {
    setSelectedProduct(product);
    setAdjustStockModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estoque"
        description="Peças e insumos, com alerta de quantidade mínima."
        actions={
          <>
            <Button variant="outline" onClick={() => setReportsModalOpen(true)}>
              <FileSpreadsheet /> Relatório
            </Button>
            <Button onClick={() => setCreateProductModalOpen(true)}>
              <Plus /> Novo produto
            </Button>
          </>
        }
      />

      <ProductStats products={products} />

      <div className="flex flex-col gap-3 lg:flex-row">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por nome, SKU ou categoria"
        />
        <Segmented
          value={stockFilter}
          onChange={setStockFilter}
          options={[
            { value: "all", label: "Todos", count: products.length },
            { value: "low", label: "Baixo", count: lowCount },
            { value: "out", label: "Esgotados", count: outCount },
          ]}
        />
      </div>

      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum produto encontrado"
          description={
            searchTerm || stockFilter !== "all"
              ? "Nada bate com a busca ou o filtro atual."
              : "Cadastre peças e insumos para usá-los nos orçamentos."
          }
          action={
            !searchTerm && stockFilter === "all" ? (
              <Button onClick={() => setCreateProductModalOpen(true)}>
                <Plus /> Novo produto
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => {
            const out = isOut(product);
            const low = isLow(product);
            const profit = product.price - product.costPrice;
            const margin =
              product.price > 0 ? (profit / product.price) * 100 : 0;

            return (
              <li
                key={product.id}
                className="flex flex-col rounded-xl border bg-card transition-colors hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0 space-y-1">
                    <Badge
                      variant={out ? "danger" : low ? "warning" : "success"}
                    >
                      <span
                        className="size-1.5 rounded-full bg-current"
                        aria-hidden
                      />
                      {out ? "Esgotado" : low ? "Estoque baixo" : "Em estoque"}
                    </Badge>
                    <h3 className="truncate pt-1 font-semibold">
                      {product.name}
                    </h3>
                    <p className="truncate text-sm text-muted-foreground">
                      <span className="font-mono ">{product.sku}</span>
                      {" · "}
                      {product.category || "Sem categoria"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={cn(
                        "num font-display text-2xl font-semibold leading-none",
                        out && "text-destructive",
                        low && "text-warning",
                      )}
                    >
                      {product.stockQuantity}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {product.unit} · mín. {product.minStock}
                    </p>
                  </div>
                </div>

                <dl className="grid grid-cols-2 gap-px border-t bg-border text-sm">
                  <div className="bg-card px-4 py-3">
                    <dt className="text-xs text-muted-foreground">Venda</dt>
                    <dd className="num font-semibold">{brl(product.price)}</dd>
                  </div>
                  <div className="bg-card px-4 py-3">
                    <dt className="text-xs text-muted-foreground">
                      Lucro por unidade
                    </dt>
                    <dd className="num font-semibold text-success">
                      {brl(profit)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        {margin.toFixed(0)}%
                      </span>
                    </dd>
                  </div>
                </dl>

                <div className="mt-auto flex gap-2 rounded-b-xl border-t bg-surface p-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAdjustClick(product)}
                  >
                    <SlidersHorizontal /> Ajustar estoque
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditClick(product)}
                  >
                    <Pencil /> Editar
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <CreateProductForm
        open={isCreateProductModalOpen}
        onOpenChange={setCreateProductModalOpen}
      />

      <EditProductForm
        open={isEditProductModalOpen}
        onOpenChange={setEditProductModalOpen}
        product={selectedProduct}
      />

      <AdjustStockModal
        open={isAdjustStockModalOpen}
        onOpenChange={setAdjustStockModalOpen}
        product={selectedProduct}
      />

      <ReportSelectionModal
        open={isReportsModalOpen}
        onOpenChange={setReportsModalOpen}
        products={products}
        organization={organization}
      />
    </div>
  );
}
