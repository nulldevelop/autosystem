"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, Plus, BarChart3, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Product } from "@/generated/prisma/client";
import { CreateProductForm } from "./create-product-form";

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  const [isCreateProductModalOpen, setCreateProductModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white font-poppins">
            Controle de <span className="text-primary">Estoque</span>
          </h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
            Gestão inteligente de peças e suprimentos
          </p>
        </div>
        <Button 
          onClick={() => setCreateProductModalOpen(true)} 
          className="glow-primary w-full sm:w-auto gap-2"
        >
          <Plus className="size-4" />
          Novo Produto
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/20" />
          <Input placeholder="Buscar por nome ou SKU..." className="pl-10" />
        </div>
        <Button variant="outline" className="gap-2">
          <BarChart3 className="size-4" />
          Relatório de Estoque
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="relative group border-white/5 hover:border-primary/20 transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                  <Package className="size-5 text-white/40 group-hover:text-primary transition-colors" />
                </div>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                  {product.sku}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <CardTitle className="text-white text-xl mb-1 truncate">
                  {product.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary glow-primary" />
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Em estoque</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/20 uppercase">Preço Unitário</span>
                  <span className="text-xl font-black text-primary text-glow">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(product.price)}
                  </span>
                </div>
              </div>

              <Button variant="tech" className="w-full">
                Editar Detalhes
              </Button>
            </CardContent>
            <div className="absolute bottom-0 right-0 h-1 w-0 bg-primary group-hover:w-full transition-all duration-500" />
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-20 glass rounded-3xl border-2 border-dashed border-white/10">
          <div className="p-6 rounded-full bg-white/5 mb-6">
            <Package className="size-12 text-white/10" />
          </div>
          <h3 className="text-xl font-black italic text-white mb-2 uppercase tracking-tighter">Estoque Vazio</h3>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-8 max-w-xs">
            Você ainda não cadastrou produtos. Organize seu pátio agora.
          </p>
          <Button onClick={() => setCreateProductModalOpen(true)} className="glow-primary">
            Cadastrar Primeiro Produto
          </Button>
        </div>
      )}

      <CreateProductForm
        open={isCreateProductModalOpen}
        onOpenChange={setCreateProductModalOpen}
      />
    </div>
  );
}
