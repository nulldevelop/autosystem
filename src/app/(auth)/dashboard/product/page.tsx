import { checkPermission } from "@/utils/permissions/check-permission";
import { ProductList } from "./_components/product-list";
import { getProducts } from "./_data-access/get-products";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export default async function ProductPage() {
  await checkPermission("/dashboard/product");
  const [session, products] = await Promise.all([
    getSession(),
    getProducts(),
  ]);

  const organization = session?.session.activeOrganizationId 
    ? await prisma.organization.findUnique({
        where: { id: session.session.activeOrganizationId }
      })
    : null;

  return (
    <div className="">
      <ProductList products={products} organization={organization} />
    </div>
  );
}
