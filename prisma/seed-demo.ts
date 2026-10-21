import "dotenv/config";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const daysAhead = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "demo@autosystem.dev" },
  });
  if (!user) throw new Error("Usuário demo não encontrado. Rode o setup antes.");

  const member = await prisma.member.findFirst({ where: { userId: user.id } });
  if (!member) throw new Error("Membership não encontrado.");
  const orgId = member.organizationId;

  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: { plan: "PLUS", status: "trialing", trialEndsAt: daysAhead(14) },
    create: {
      id: randomUUID(),
      userId: user.id,
      plan: "PLUS",
      status: "trialing",
      trialEndsAt: daysAhead(14),
    },
  });

  const customersData = [
    {
      name: "Mariana Souza",
      email: "mariana.souza@email.com",
      document: "529.982.247-25",
      documentType: "CPF" as const,
      phone: "(11) 91111-2222",
      address: "Rua das Palmeiras, 210 - Moema, São Paulo - SP",
    },
    {
      name: "Rafael Oliveira",
      email: "rafael.oliveira@email.com",
      document: "390.533.447-05",
      documentType: "CPF" as const,
      phone: "(11) 92222-3333",
      address: "Av. Rebouças, 1500 - Pinheiros, São Paulo - SP",
    },
    {
      name: "Transportadora Boa Viagem Ltda",
      email: "frota@boaviagem.com.br",
      document: "45.997.418/0001-53",
      documentType: "CNPJ" as const,
      phone: "(11) 93333-4444",
      address: "Rod. Anhanguera, km 21 - Guarulhos - SP",
    },
    {
      name: "Carlos Ferreira",
      email: "carlos.ferreira@email.com",
      document: "153.509.460-56",
      documentType: "CPF" as const,
      phone: "(11) 94444-5555",
      address: "Rua Vergueiro, 850 - Vila Mariana, São Paulo - SP",
    },
    {
      name: "Luciana Mendes",
      email: "luciana.mendes@email.com",
      document: "666.247.850-03",
      documentType: "CPF" as const,
      phone: "(11) 95555-6666",
      address: "Rua Tito, 340 - Lapa, São Paulo - SP",
    },
  ];

  const customers = [];
  for (const c of customersData) {
    customers.push(
      await prisma.customer.create({
        data: { ...c, id: randomUUID(), organizationId: orgId },
      }),
    );
  }

  const vehiclesData = [
    { marca: "Fiat", model: "Uno 1.0 Fire", year: 2018, licensePlate: "FCP2E19", customerId: customers[0].id },
    { marca: "Honda", model: "Civic EXL 2.0", year: 2020, licensePlate: "GKR4C12", customerId: customers[1].id },
    { marca: "Volkswagen", model: "Saveiro CS 1.6", year: 2015, licensePlate: "HBD7J40", customerId: customers[2].id },
    { marca: "Toyota", model: "Corolla XEI 2.0", year: 2022, licensePlate: "JAP9L31", customerId: customers[3].id },
    { marca: "Chevrolet", model: "Onix LT 1.0", year: 2019, licensePlate: "KDF5M78", customerId: customers[4].id },
  ];

  const vehicles = [];
  for (const v of vehiclesData) {
    vehicles.push(
      await prisma.vehicle.create({
        data: { ...v, id: randomUUID(), organizationId: orgId },
      }),
    );
  }

  const productsData = [
    { name: "Óleo Motor Selenia 5W30 (5L)", sku: "OLE-5W30-5L", category: "Lubrificantes", unit: "UN", price: 289.9, costPrice: 190, stockQuantity: 12, minStock: 4 },
    { name: "Filtro de Óleo Tecfil PSL560", sku: "FLT-PSL560", category: "Filtros", unit: "UN", price: 42.9, costPrice: 25, stockQuantity: 3, minStock: 5 },
    { name: "Filtro de Ar Wega FA-210", sku: "FLT-AR-210", category: "Filtros", unit: "UN", price: 69.9, costPrice: 40, stockQuantity: 8, minStock: 4 },
    { name: "Pastilha de Freio Dianteira Bosch", sku: "FRN-BOS-118", category: "Freios", unit: "PAR", price: 189.9, costPrice: 120, stockQuantity: 6, minStock: 4 },
    { name: "Vela de Ignição NGK BKR6E", sku: "VEL-NGK-BKR6E", category: "Ignição", unit: "UN", price: 32.9, costPrice: 18, stockQuantity: 4, minStock: 8 },
    { name: "Bateria 60Ah Moura", sku: "BAT-60AH", category: "Elétrica", unit: "UN", price: 549.9, costPrice: 390, stockQuantity: 5, minStock: 2 },
    { name: "Correia Dentada Gates 5411", sku: "COR-GAT-5411", category: "Motor", unit: "UN", price: 219.9, costPrice: 140, stockQuantity: 2, minStock: 3 },
    { name: "Fluido de Freio DOT 4 (300ml)", sku: "FLU-DOT4-300", category: "Freios", unit: "UN", price: 27.9, costPrice: 14, stockQuantity: 20, minStock: 6 },
    { name: "Arrefecimento Liquido Francool (1L)", sku: "ARF-FRAN-1L", category: "Elétrica", unit: "UN", price: 39.9, costPrice: 22, stockQuantity: 15, minStock: 5 },
    { name: "Kit Embreagem LuK 624 3021 00", sku: "EMB-LUK-624", category: "Motor", unit: "KIT", price: 899.9, costPrice: 610, stockQuantity: 1, minStock: 2 },
  ];

  const products = [];
  for (const p of productsData) {
    products.push(
      await prisma.product.create({
        data: { ...p, id: randomUUID(), organizationId: orgId },
      }),
    );
  }

  const budgetsData = [
    {
      customerIdx: 0, vehicleIdx: 0, status: "pending" as const,
      items: [{ pi: 0, q: 1 }, { pi: 1, q: 1 }], labor: 120,
      obs: "Troca de óleo e filtro. Cliente aguarda aprovação.",
      km: 82500, fuel: "3/4", createdAt: daysAgo(2),
    },
    {
      customerIdx: 4, vehicleIdx: 4, status: "pending" as const,
      items: [{ pi: 4, q: 4 }], labor: 90,
      obs: "Rendimento irregular em marcha lenta.",
      km: 45200, fuel: "1/2", createdAt: daysAgo(1),
    },
    {
      customerIdx: 1, vehicleIdx: 1, status: "aproved" as const,
      items: [{ pi: 3, q: 1 }, { pi: 7, q: 2 }], labor: 250,
      obs: "Pastilhas dianteiras com desgaste excessivo.",
      km: 31800, fuel: "Cheio", createdAt: daysAgo(10),
    },
    {
      customerIdx: 2, vehicleIdx: 2, status: "aproved" as const,
      items: [{ pi: 6, q: 1 }, { pi: 4, q: 4 }], labor: 400,
      obs: "Revisão de 100.000 km - troca de correia e velas.",
      km: 98700, fuel: "1/4", createdAt: daysAgo(20),
    },
    {
      customerIdx: 3, vehicleIdx: 3, status: "aproved" as const,
      items: [{ pi: 5, q: 1 }], labor: 150,
      obs: "Bateria descarregando. Teste de alternador OK.",
      km: 15400, fuel: "Cheio", createdAt: daysAgo(16),
    },
    {
      customerIdx: 0, vehicleIdx: 0, status: "rejected" as const,
      items: [{ pi: 2, q: 1 }], labor: 80,
      obs: "Cliente vai aguardar a próxima revisão.",
      km: 81900, fuel: "3/4", createdAt: daysAgo(15),
    },
  ];

  const budgets = [];
  for (const b of budgetsData) {
    const itemsAmount = b.items.reduce(
      (acc, it) => acc + products[it.pi].price * it.q,
      0,
    );
    const budget = await prisma.budget.create({
      data: {
        id: randomUUID(),
        customerId: customers[b.customerIdx].id,
        vehicleId: vehicles[b.vehicleIdx].id,
        organizationId: orgId,
        itemsAmount,
        laborValue: b.labor,
        totalAmount: itemsAmount + b.labor,
        status: b.status,
        observacoes: b.obs,
        kilometers: b.km,
        fuelLevel: b.fuel,
        createdAt: b.createdAt,
        updatedAt: b.createdAt,
        items: {
          create: b.items.map((it) => ({
            id: randomUUID(),
            productId: products[it.pi].id,
            quantity: it.q,
            unitPrice: products[it.pi].price,
          })),
        },
      },
    });
    budgets.push(budget);
  }

  const osData = [
    { budgetIdx: 2, status: "in_progress" as const, createdAt: daysAgo(9), obs: "Peças retiradas do estoque. Serviço em execução." },
    { budgetIdx: 3, status: "open" as const, createdAt: daysAgo(19), obs: "Aguardando confirmação de horário com o cliente." },
    { budgetIdx: 4, status: "completed" as const, createdAt: daysAgo(12), obs: "Serviço concluído e entregue." },
  ];

  const serviceOrders = [];
  for (const os of osData) {
    const b = budgets[os.budgetIdx];
    const bItems = budgetsData[os.budgetIdx].items;
    const created = await prisma.serviceOrder.create({
      data: {
        id: randomUUID(),
        budgetId: b.id,
        customerId: b.customerId,
        vehicleId: b.vehicleId,
        organizationId: orgId,
        itemsAmount: b.itemsAmount,
        laborValue: b.laborValue,
        totalAmount: b.totalAmount,
        status: os.status,
        observacoes: os.obs,
        createdAt: os.createdAt,
        updatedAt: os.createdAt,
        items: {
          create: bItems.map((it) => ({
            id: randomUUID(),
            productId: products[it.pi].id,
            quantity: it.q,
            unitPrice: products[it.pi].price,
          })),
        },
      },
    });
    serviceOrders.push(created);
  }

  const transactionsData = [
    { description: "Serviço - Troca de bateria (Corolla)", amount: 699.9, costAmount: 390, type: "INCOME" as const, status: "PAID" as const, category: "SERVICE" as const, dueDate: daysAgo(11), paymentDate: daysAgo(11), paymentMethod: "PIX", serviceOrderId: serviceOrders[2].id },
    { description: "Contrato mensal de manutenção de frota - Boa Viagem", amount: 9000, costAmount: 1500, type: "INCOME" as const, status: "PAID" as const, category: "SERVICE" as const, dueDate: daysAgo(6), paymentDate: daysAgo(6), paymentMethod: "PIX" },
    { description: "Aluguel da oficina", amount: 3500, costAmount: 0, type: "EXPENSE" as const, status: "PAID" as const, category: "RENT" as const, dueDate: daysAgo(5), paymentDate: daysAgo(5), paymentMethod: "PIX" },
    { description: "Salários da equipe", amount: 4200, costAmount: 0, type: "EXPENSE" as const, status: "PAID" as const, category: "SALARY" as const, dueDate: daysAgo(10), paymentDate: daysAgo(10), paymentMethod: "Transferência" },
    { description: "DAS - Simples Nacional", amount: 890, costAmount: 0, type: "EXPENSE" as const, status: "PENDING" as const, category: "TAX" as const, dueDate: daysAhead(5) },
    { description: "Compra de peças - Distribuidora Central", amount: 1200, costAmount: 1200, type: "EXPENSE" as const, status: "PAID" as const, category: "PRODUCT" as const, dueDate: daysAgo(25), paymentDate: daysAgo(25), paymentMethod: "Boleto" },
    { description: "Entrada - Orçamento aprovado (Civic)", amount: 495.7, costAmount: 245.7, type: "INCOME" as const, status: "PENDING" as const, category: "SERVICE" as const, dueDate: daysAgo(3) },
    { description: "Serviços diversos - semana 38", amount: 1150, costAmount: 300, type: "INCOME" as const, status: "PAID" as const, category: "SERVICE" as const, dueDate: daysAgo(18), paymentDate: daysAgo(18), paymentMethod: "Dinheiro" },
    { description: "Assinatura AutoSystem - Plus", amount: 119.99, costAmount: 0, type: "EXPENSE" as const, status: "PAID" as const, category: "OTHER" as const, dueDate: daysAgo(7), paymentDate: daysAgo(7), paymentMethod: "Cartão" },
    { description: "Revisão completa - Saveiro (frota)", amount: 751.5, costAmount: 351.6, type: "INCOME" as const, status: "PENDING" as const, category: "SERVICE" as const, dueDate: daysAhead(2) },
  ];

  for (const t of transactionsData) {
    await prisma.transaction.create({
      data: {
        id: randomUUID(),
        ...t,
        netAmount: t.amount - t.costAmount,
        organizationId: orgId,
      },
    });
  }

  const notificationsData = [
    { type: "NEW_BUDGET" as const, title: "Novo orçamento", message: "Mariana Souza aguarda aprovação do orçamento.", read: false, budgetId: budgets[0].id },
    { type: "BUDGET_APPROVED" as const, title: "Orçamento aprovado", message: "Rafael Oliveira aprovou o orçamento do Civic.", read: false, budgetId: budgets[2].id },
    { type: "SERVICE_ORDER_COMPLETED" as const, title: "OS concluída", message: "Ordem de serviço do Corolla foi finalizada.", read: true, serviceOrderId: serviceOrders[2].id },
    { type: "NEW_CUSTOMER" as const, title: "Novo cliente", message: "Luciana Mendes foi cadastrada na oficina.", read: true, customerId: customers[4].id },
  ];

  for (const n of notificationsData) {
    await prisma.notification.create({
      data: { id: randomUUID(), ...n, organizationId: orgId },
    });
  }

  console.log("Seed concluído:", {
    customers: customers.length,
    vehicles: vehicles.length,
    products: products.length,
    budgets: budgets.length,
    serviceOrders: serviceOrders.length,
    transactions: transactionsData.length,
    notifications: notificationsData.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
