"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, Plus, BarChart3, Search, AlertCircle, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Product } from "@/generated/prisma/client";
import { CreateProductForm } from "./create-product-form";
import { ProductStats } from "./product-stats";
import { Badge } from "@/components/ui/badge";

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  const [isCreateProductModalOpen, setCreateProductModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white font-poppins">
            Gestão de <span className="text-primary">Estoque</span>
          </h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
            Controle total de peças, insumos e lucratividade
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none gap-2 border-white/5 bg-white/5">
            <BarChart3 className="size-4" />
            Relatórios
          </Button>
          <Button 
            onClick={() => setCreateProductModalOpen(true)} 
            className="glow-primary flex-1 sm:flex-none gap-2"
          >
            <Plus className="size-4" />
            Novo Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <ProductStats products={products} />

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/20" />
          <Input 
            placeholder="Buscar por nome, SKU ou categoria..." 
            className="pl-10 bg-white/5 border-white/10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           {/* Aqui poderiam entrar filtros por categoria futuramente */}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => {
          const isOutOfStock = product.stockQuantity === 0;
          const isLowStock = product.stockQuantity <= product.minStock && !isOutOfStock;

          return (
            <Card key={product.id} className="relative group border-white/5 bg-zinc-950 hover:border-primary/20 transition-all duration-300 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="bg-white/5 border-white/10 text-[9px] uppercase font-black tracking-widest text-white/40">
                    {product.category || "Geral"}
                  </Badge>
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                    {product.sku}
                  </span>
                </div>
                <CardTitle className="text-white text-xl truncate group-hover:text-primary transition-colors">
                  {product.name}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block">Disponibilidade</span>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        isOutOfStock ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : 
                        isLowStock ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" : 
                        "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      }`} />
                      <span className={`text-sm font-black uppercase tracking-tighter ${
                        isOutOfStock ? "text-red-500" : 
                        isLowStock ? "text-yellow-500" : 
                        "text-emerald-500"
                      }`}>
                        {product.stockQuantity} {product.unit} em estoque
                      </span>
                    </div>
                  </div>
                  
                  {isLowStock && (
                    <Badge variant="destructive" className="animate-pulse bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[9px]">
                      Reposição Necessária
                    </Badge>
                  )}
                  {isOutOfStock && (
                    <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 text-[9px]">
                      Esgotado
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-[9px] font-black text-white/20 uppercase block mb-1 text-center">Custo</span>
                    <p className="text-sm font-bold text-white/60 text-center">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.costPrice)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <span className="text-[9px] font-black text-primary/40 uppercase block mb-1 text-center">Venda</span>
                    <p className="text-sm font-black text-primary text-center">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1 text-[10px] font-black uppercase h-9 border-white/5 bg-white/5 hover:bg-white/10">
                    Ajustar
                  </Button>
                  <Button variant="tech" className="flex-1 text-[10px] font-black uppercase h-9 group/btn">
                    Editar
                    <ArrowUpRight className="ml-1 size-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </Button>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-hover:w-full transition-all duration-500" />
            </Card>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-20 glass rounded-3xl border-2 border-dashed border-white/10">
          <div className="p-6 rounded-full bg-white/5 mb-6">
            <Package className="size-12 text-white/10" />
          </div>
          <h3 className="text-xl font-black italic text-white mb-2 uppercase tracking-tighter">
            {searchTerm ? "Nenhum resultado encontrado" : "Estoque Vazio"}
          </h3>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-8 max-w-xs">
            {searchTerm ? "Tente ajustar sua busca para encontrar o que precisa." : "Você ainda não cadastrou produtos. Organize seu pátio agora."}
          </p>
          {!searchTerm && (
            <Button onClick={() => setCreateProductModalOpen(true)} className="glow-primary">
              Cadastrar Primeiro Produto
            </Button>
          )}
        </div>
      )}

      <CreateProductForm
        open={isCreateProductModalOpen}
        onOpenChange={setCreateProductModalOpen}
      />
    </div>
  );
}
