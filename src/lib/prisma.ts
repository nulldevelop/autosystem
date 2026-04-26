import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

// Otimização do Singleton para evitar estouro de conexões e pool timeout
const prismaClientSingleton = () => {
  // Nota: Em hospedagens compartilhadas como Hostinger, o limite de conexões é restrito.
  // 10 conexões costumam ser o "sweet spot" para evitar travar o banco.
  const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 10, // Reduzido de 20 para 10 para maior compatibilidade com o servidor
    idleTimeout: 20,    // Reduzido para liberar conexões mais rápido
    connectTimeout: 5,  // Timeout curto para falhar rápido e não segurar o pool
  });
  
  return new PrismaClient({ 
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

// Garantir que a instância seja única globalmente, inclusive em produção, 
// para evitar vazamento de conexões em ambientes de deploy específicos.
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
} else {
  // Em produção, alguns ambientes limpam o cache de módulos; manter no global é mais seguro.
  globalForPrisma.prisma = prisma;
}
