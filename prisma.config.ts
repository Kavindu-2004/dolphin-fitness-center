import "dotenv/config";
import { defineConfig } from "prisma/config";

const FALLBACK_DATABASE_URL =
  "mysql://admin:DolphinGym2026Strong@dolphin-fitness-db.cy5eq6w8grgd.us-east-1.rds.amazonaws.com:3306/dolphin_fitness_center";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL || FALLBACK_DATABASE_URL,
  },
});