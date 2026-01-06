
import { ProductList } from "./_components/product-list";
import { getProducts } from "./_data-access/get-products";

export default async function ProductPage() {
  const products = await getProducts();

  return (
    <div className="p-6">
      <ProductList products={products} />
    </div>
  );
}
