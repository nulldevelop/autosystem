"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Package, 
  Plus, 
  BarChart3, 
  Search, 
  Settings2, 
  History, 
  ArrowUpRight,
  TrendingUp,
  FileText
} from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Product } from "@/generated/prisma/client";
import { CreateProductForm } from "./create-product-form";
import { EditProductForm } from "./edit-product-form";
import { AdjustStockModal } from "./adjust-stock-modal";
import { ReportSelectionModal } from "./report-selection-modal";
import { ProductStats } from "./product-stats";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="flex flex-col gap-6">
      {/* Header Profissional */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-6 pt-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white font-poppins">
            Inventário de <span className="text-primary">Produtos</span>
          </h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
            Monitoramento em tempo real de ativos e suprimentos
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => setReportsModalOpen(true)}
            variant="outline" 
            className="flex-1 sm:flex-none gap-2 border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest"
          >
            <BarChart3 className="size-4" />
            Relatórios
          </Button>
          <Button 
            onClick={() => setCreateProductModalOpen(true)} 
            className="glow-primary flex-1 sm:flex-none gap-2 font-black uppercase italic tracking-tighter"
          >
            <Plus className="size-4" />
            Novo Produto
          </Button>
        </div>
      </div>

      <div className="px-6">
        <ProductStats products={products} />
      </div>

      {/* Filtros e Busca */}
      <div className="px-6">
        <div className="flex flex-col md:flex-row gap-4 bg-zinc-950/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/20" />
            <Input 
              placeholder="Filtrar por nome, SKU ou categoria técnica..." 
              className="pl-10 bg-white/[0.02] border-white/10 text-sm focus:border-primary/50 transition-all" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Listagem em Tabela */}
      <div className="px-6 pb-6">
        <div className="rounded-2xl border border-white/5 bg-zinc-950/50 overflow-hidden backdrop-blur-md">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 h-12">SKU / Cód</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 h-12">Produto / Descrição</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 h-12 text-center">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 h-12 text-right">Qtd Atual</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 h-12 text-right">Custo</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 h-12 text-right">Venda</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 h-12 text-right">Lucro/M</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 h-12 text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stockQuantity === 0;
                const isLowStock = product.stockQuantity <= product.minStock && !isOutOfStock;
                const profit = product.price - product.costPrice;
                const margin = product.price > 0 ? (profit / product.price) * 100 : 0;

                return (
                  <TableRow key={product.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <TableCell className="font-mono text-[11px] text-white/40 group-hover:text-primary transition-colors">
                      {product.sku}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-white group-hover:text-primary transition-colors">{product.name}</span>
                        <span className="text-[9px] uppercase font-black text-white/20 tracking-widest">{product.category || "Geral"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[9px] font-black uppercase tracking-tighter border-0 px-2 py-0.5",
                          isOutOfStock ? "bg-red-500/10 text-red-500" :
                          isLowStock ? "bg-yellow-500/10 text-yellow-500" :
                          "bg-emerald-500/10 text-emerald-500"
                        )}
                      >
                        {isOutOfStock ? "Esgotado" : isLowStock ? "Baixo" : "OK"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className={cn(
                          "font-black text-sm tabular-nums",
                          isOutOfStock ? "text-red-500" : isLowStock ? "text-yellow-500" : "text-white"
                        )}>
                          {product.stockQuantity} <span className="text-[10px] text-white/20">{product.unit}</span>
                        </span>
                        <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full transition-all duration-500",
                              isOutOfStock ? "w-0" : isLowStock ? "bg-yellow-500 w-1/3" : "bg-primary w-full"
                            )} 
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-white/40 tabular-nums">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.costPrice)}
                    </TableCell>
                    <TableCell className="text-right font-black text-white tabular-nums">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-emerald-500 font-bold text-xs tabular-nums">
                          +{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(profit)}
                        </span>
                        <span className="text-[9px] font-black text-white/20 uppercase tabular-nums">
                          {margin.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          onClick={() => handleAdjustClick(product)}
                          variant="ghost" 
                          size="icon" 
                          title="Ajustar Estoque"
                          className="size-8 rounded-lg hover:bg-white/5 hover:text-primary transition-all"
                        >
                          <TrendingUp className="size-4" />
                        </Button>
                        <Button 
                          onClick={() => handleEditClick(product)}
                          variant="ghost" 
                          size="icon" 
                          title="Editar Produto"
                          className="size-8 rounded-lg hover:bg-white/5 hover:text-white transition-all"
                        >
                          <ArrowUpRight className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
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
