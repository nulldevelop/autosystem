import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

/**
 * Isolamento por oficina (multi-tenant).
 *
 * `requireTenant()` valida a sessão E que o usuário é membro da oficina ativa.
 * `tenantDb(organizationId)` devolve um Prisma que injeta o filtro de oficina em
 * toda leitura, alteração e exclusão, e força o organizationId nas criações.
 * Assim uma query esquecida sem `organizationId` não alcança dados de outra oficina.
 */

export type TenantErrorCode =
  | "UNAUTHORIZED"
  | "ORGANIZATION_REQUIRED"
  | "FORBIDDEN";

const TENANT_MESSAGES: Record<TenantErrorCode, string> = {
  UNAUTHORIZED: "Você precisa estar autenticado.",
  ORGANIZATION_REQUIRED: "Você precisa ter uma oficina ativa.",
  FORBIDDEN: "Você não tem acesso a esta oficina.",
};

export class TenantError extends Error {
  constructor(public readonly code: TenantErrorCode) {
    super(TENANT_MESSAGES[code]);
    this.name = "TenantError";
  }
}

// Modelos com organizationId próprio
const DIRECT_MODELS = new Set([
  "Customer",
  "Vehicle",
  "Budget",
  "Product",
  "ServiceOrder",
  "Transaction",
  "Notification",
]);

// Modelos filhos: pertencem à oficina do pai
const CHILD_FILTERS: Record<string, (organizationId: string) => object> = {
  BudgetItem: (organizationId) => ({ budget: { organizationId } }),
  BudgetPhoto: (organizationId) => ({ budget: { organizationId } }),
  ServiceOrderItem: (organizationId) => ({ serviceOrder: { organizationId } }),
  ProductMovement: (organizationId) => ({ product: { organizationId } }),
};

const UNIQUE_OPS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "update",
  "delete",
  "upsert",
]);

const FILTER_OPS = new Set([
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
  "updateMany",
  "updateManyAndReturn",
  "deleteMany",
]);

type Args = Record<string, unknown> | undefined;

function withoutOrganizationId(data: unknown) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;
  const { organizationId: _ignored, ...rest } = data as Record<string, unknown>;
  return rest;
}

/**
 * Reescreve os argumentos de uma query para ficarem restritos à oficina.
 * Função pura: não altera `args` e devolve um objeto novo.
 */
export function scopeQueryArgs(
  model: string,
  operation: string,
  args: Args,
  organizationId: string,
): Args {
  const isDirect = DIRECT_MODELS.has(model);
  const childFilter = CHILD_FILTERS[model]?.(organizationId);
  if (!isDirect && !childFilter) return args;

  const filter = isDirect ? { organizationId } : (childFilter as object);
  const next: Record<string, unknown> = { ...(args ?? {}) };
  const where = next.where as Record<string, unknown> | undefined;

  if (UNIQUE_OPS.has(operation)) {
    // filtros extras ao lado da chave única são aceitos pelo Prisma
    next.where = { ...(where ?? {}), ...filter };
  } else if (FILTER_OPS.has(operation)) {
    next.where = where ? { AND: [where, filter] } : filter;
  }

  if (isDirect) {
    if (operation === "create") {
      next.data = { ...(next.data as object), organizationId };
    } else if (operation === "createMany" || operation === "createManyAndReturn") {
      const data = next.data;
      next.data = Array.isArray(data)
        ? data.map((row) => ({ ...row, organizationId }))
        : { ...(data as object), organizationId };
    } else if (operation === "upsert") {
      next.create = { ...(next.create as object), organizationId };
      next.update = withoutOrganizationId(next.update);
    } else if (
      operation === "update" ||
      operation === "updateMany" ||
      operation === "updateManyAndReturn"
    ) {
      next.data = withoutOrganizationId(next.data);
    }
  }

  return next;
}

export function tenantDb(organizationId: string) {
  return prisma.$extends({
    name: "tenant-scope",
    query: {
      $allModels: {
        $allOperations({ model, operation, args, query }) {
          return query(
            scopeQueryArgs(
              model,
              operation,
              args as Args,
              organizationId,
            ) as typeof args,
          );
        },
      },
    },
  });
}

export type TenantDb = ReturnType<typeof tenantDb>;

export type Tenant = {
  userId: string;
  organizationId: string;
  role: string;
  db: TenantDb;
};

/** Sessão válida + membro da oficina ativa. Devolve null se algo faltar. */
export async function getTenant(): Promise<Tenant | null> {
  try {
    return await requireTenant();
  } catch (error) {
    if (error instanceof TenantError) return null;
    throw error;
  }
}

/** Igual a getTenant, mas lança TenantError dizendo o que faltou. */
export async function requireTenant(): Promise<Tenant> {
  const session = await getSession();
  if (!session?.user) throw new TenantError("UNAUTHORIZED");

  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) throw new TenantError("ORGANIZATION_REQUIRED");

  const membership = await prisma.member.findFirst({
    where: { userId: session.user.id, organizationId },
    select: { role: true },
  });
  if (!membership) throw new TenantError("FORBIDDEN");

  return {
    userId: session.user.id,
    organizationId,
    role: membership.role,
    db: tenantDb(organizationId),
  };
}
