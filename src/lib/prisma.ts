import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
  adapter: PrismaPg | undefined;
};

function createPool() {
  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      max: process.env.DATABASE_CONNECTION_LIMIT
        ? Number.parseInt(process.env.DATABASE_CONNECTION_LIMIT, 10)
        : 10,
      connectionTimeoutMillis: process.env.DATABASE_CONNECT_TIMEOUT
        ? Number.parseInt(process.env.DATABASE_CONNECT_TIMEOUT, 10)
        : 10000,
    });
  }

  return new Pool({
    host: process.env.DATABASE_HOST,
    port: Number.parseInt(process.env.DATABASE_PORT || "5432", 10),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    max: process.env.DATABASE_CONNECTION_LIMIT
      ? Number.parseInt(process.env.DATABASE_CONNECTION_LIMIT, 10)
      : 10,
    connectionTimeoutMillis: process.env.DATABASE_CONNECT_TIMEOUT
      ? Number.parseInt(process.env.DATABASE_CONNECT_TIMEOUT, 10)
      : 10000,
  });
}

function createPrismaClient() {
  const pool = globalForPrisma.pool ?? createPool();
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = pool;
  }
  const adapter = globalForPrisma.adapter ?? new PrismaPg(pool);
  if (!globalForPrisma.adapter) {
    globalForPrisma.adapter = adapter;
  }
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
