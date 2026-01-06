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
import type { Product } from "@/generated/prisma/client";
import { CreateProductForm } from "./create-product-form";

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  const [isCreateProductModalOpen, setCreateProductModalOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie seus produtos aqui. Adicione, edite ou remova produtos.
          </p>
        </div>
        <Button onClick={() => setCreateProductModalOpen(true)}>
          Adicionar Produto
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>SKU: {product.sku}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Preço:</span>{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(product.price)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg">
          <p className="text-lg font-medium">Nenhum produto encontrado.</p>
          <p className="text-muted-foreground mb-4">
            Comece adicionando um novo produto.
          </p>
          <Button onClick={() => setCreateProductModalOpen(true)}>
            Adicionar Produto
          </Button>
        </div>
      )}

      <CreateProductForm
        open={isCreateProductModalOpen}
        onOpenChange={setCreateProductModalOpen}
      />
    </>
  );
}
