import { type Mock, vi } from "vitest";

// biome-ignore lint/suspicious/noExplicitAny: mock genérico
type Fn = Mock<(...args: any[]) => any>;
type Model = Record<string, Fn>;

const models = new Map<string, Model>();
const allFns = new Set<Fn>();
const clientFns = new Map<string, Fn>();

function createModel(): Model {
  const fns = new Map<string, Fn>();
  return new Proxy({} as Model, {
    get(_target, method: string) {
      let fn = fns.get(method);
      if (!fn) {
        fn = vi.fn();
        fns.set(method, fn);
        allFns.add(fn);
      }
      return fn;
    },
  });
}

const transaction: Fn = vi.fn();

function defaultTransaction() {
  transaction.mockImplementation(async (cb: (tx: unknown) => unknown) =>
    cb(prismaMock),
  );
}

/**
 * Prisma falso: qualquer `prismaMock.<modelo>.<metodo>` é um vi.fn().
 * `$transaction(cb)` executa o callback com o próprio mock como `tx`.
 */
export const prismaMock = new Proxy({} as Record<string, Model>, {
  get(_target, name: string) {
    if (name === "$transaction") return transaction;
    if (name.startsWith("$")) {
      // $extends, $queryRaw...: métodos do cliente, não modelos
      let fn = clientFns.get(name);
      if (!fn) {
        fn = vi.fn();
        clientFns.set(name, fn);
        allFns.add(fn);
      }
      return fn;
    }
    let model = models.get(name);
    if (!model) {
      model = createModel();
      models.set(name, model);
    }
    return model;
  },
}) as Record<string, Model> & { $transaction: Fn; $extends: Fn };

defaultTransaction();

/** Zera chamadas e implementações de todos os métodos usados até agora. */
export function resetPrismaMock() {
  for (const fn of allFns) fn.mockReset();
  transaction.mockReset();
  defaultTransaction();
}
