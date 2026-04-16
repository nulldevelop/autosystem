"use client";

import { ArrowUpRight, Package, Plus, Search, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { AdjustStockModal } from "./adjust-stock-modal";
import { CreateProductForm } from "./create-product-form";
import { EditProductForm } from "./edit-product-form";
import { ProductStats } from "./product-stats";
import { ReportSelectionModal } from "./report-selection-modal";

interface ProductListProps {
  products: Product[];
  organization: any;
}

export function ProductList({ products, organization }: ProductListProps) {
  const [isCreateProductModalOpen, setCreateProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setEditProductModalOpen] = useState(false);
  const [isAdjustStockModalOpen, setAdjustStockModalOpen] = useState(false);
  const [isReportsModalOpen, setReportsModalOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setEditProductModalOpen(true);
  };

  const handleAdjustClick = (product: Product) => {
    setSelectedProduct(product);
    setAdjustStockModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      <div className="flex flex-col gap-5 lg:gap-6 shrink-0 px-3 lg:px-1">
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black italic uppercase tracking-tighter text-white">
              Inventário de <span className="text-primary">Produtos</span>
            </h1>
            <p className="text-white/40 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              Monitoramento em tempo real de ativos
            </p>
          </div>
          <Button
            onClick={() => setCreateProductModalOpen(true)}
            className="glow-primary h-11 sm:h-12 px-4 sm:px-8 font-black uppercase italic tracking-tighter text-sm sm:text-md w-full sm:w-auto"
          >
            <Plus className="size-4 sm:size-5 mr-2" />
            Novo Produto
          </Button>
        </div>

        <ProductStats products={products} />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/20" />
          <Input
            placeholder="Buscar produto..."
            className="pl-10 bg-white/[0.02] border-white/10 text-sm focus:border-primary/50 h-11 lg:h-12 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 pb-20 lg:pb-10 lg:pr-4 lg:px-0 px-3 overflow-y-auto">
        {filteredProducts.map((product) => {
          const isOutOfStock = product.stockQuantity === 0;
          const isLowStock =
            product.stockQuantity <= product.minStock && !isOutOfStock;
          const profit = product.price - product.costPrice;
          const margin = product.price > 0 ? (profit / product.price) * 100 : 0;

          return (
            <div
              key={product.id}
              className="rounded-2xl border border-white/5 bg-zinc-950/40 p-4 lg:p-5 space-y-3 lg:space-y-4 hover:border-primary/20 transition-all group"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[8px] lg:text-[9px] font-black text-white/20 uppercase tracking-widest">
                      {product.sku}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[7px] lg:text-[8px] font-black uppercase tracking-tighter border-0 px-1 py-0",
                        isOutOfStock
                          ? "bg-red-500/10 text-red-500"
                          : isLowStock
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-emerald-500/10 text-emerald-500",
                      )}
                    >
                      {isOutOfStock ? "Esgotado" : isLowStock ? "Baixo" : "OK"}
                    </Badge>
                  </div>
                  <h3 className="text-sm lg:text-xl font-black text-white uppercase italic tracking-tighter truncate group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-[8px] lg:text-[9px] font-black text-white/40 uppercase tracking-widest">
                    {product.category || "Geral"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div
                    className={cn(
                      "text-lg lg:text-xl font-black italic tracking-tighter tabular-nums",
                      isOutOfStock
                        ? "text-red-500"
                        : isLowStock
                          ? "text-yellow-500"
                          : "text-white",
                    )}
                  >
                    {product.stockQuantity}{" "}
                    <span className="text-[9px] lg:text-[10px] uppercase">
                      {product.unit}
                    </span>
                  </div>
                  <div className="w-12 lg:w-16 h-1 bg-white/5 rounded-full overflow-hidden ml-auto mt-1">
                    <div
                      className={cn(
                        "h-full transition-all duration-500",
                        isOutOfStock
                          ? "w-0"
                          : isLowStock
                            ? "bg-yellow-500 w-1/3"
                            : "bg-primary w-full",
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 lg:gap-3 pt-3 border-t border-white/5">
                <div className="p-2.5 lg:p-3 rounded-xl bg-white/5 space-y-0.5 lg:space-y-1">
                  <p className="text-[7px] lg:text-[8px] font-black text-white/20 uppercase tracking-widest leading-none">
                    Venda
                  </p>
                  <p className="text-xs lg:text-sm font-black text-white tabular-nums">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(product.price)}
                  </p>
                </div>
                <div className="p-2.5 lg:p-3 rounded-xl bg-emerald-500/5 space-y-0.5 lg:space-y-1">
                  <p className="text-[7px] lg:text-[8px] font-black text-emerald-500/40 uppercase tracking-widest leading-none">
                    Lucro
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] lg:text-xs font-black text-emerald-500 tabular-nums">
                      +
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(profit)}
                    </span>
                    <span className="text-[8px] lg:text-[9px] font-black text-emerald-500/60 tabular-nums">
                      {margin.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleAdjustClick(product)}
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 lg:h-9 gap-1.5 lg:gap-2 border-white/5 bg-white/5 text-[8px] lg:text-[9px] font-black uppercase tracking-wider lg:tracking-widest hover:border-primary/50"
                >
                  <TrendingUp className="size-3 lg:size-3.5" />
                  Estoque
                </Button>
                <Button
                  onClick={() => handleEditClick(product)}
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 lg:h-9 gap-1.5 lg:gap-2 border-white/5 bg-white/5 text-[8px] lg:text-[9px] font-black uppercase tracking-wider lg:tracking-widest hover:text-white"
                >
                  <ArrowUpRight className="size-3 lg:size-3.5" />
                  Editar
                </Button>
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="py-16 lg:py-24 text-center border-2 border-dashed border-white/5 rounded-2xl lg:rounded-[2rem] bg-white/[0.01]">
            <Package className="size-10 lg:size-12 text-white/10 mx-auto mb-4" />
            <h3 className="text-lg lg:text-xl font-black uppercase text-white/40 italic">
              Nenhum produto encontrado
            </h3>
          </div>
        )}
      </div>

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
