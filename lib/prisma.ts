import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const FALLBACK_DATABASE_URL =
  "mysql://admin:DolphinGym2026Strong@dolphin-fitness-db.cy5eq6w8grgd.us-east-1.rds.amazonaws.com:3306/dolphin_fitness_center";

function getDatabaseConfig() {
  const databaseUrl = process.env.DATABASE_URL || FALLBACK_DATABASE_URL;

  const url = new URL(databaseUrl);

  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace("/", ""),
    allowPublicKeyRetrieval: true,
  };
}

const adapter = new PrismaMariaDb(getDatabaseConfig());

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}