// prisma.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  // ✅ Correct way: datasource has only 'url'
  // datasource: {
  // url: process.env["DATABASE_URL"],
  // directUrl: process.env["DIRECT_URL"],
  // },
  datasource: {
    url:
      process.env.NODE_ENV === "production"
        ? process.env.DIRECT_URL || process.env.DATABASE_URL
        : process.env.DATABASE_URL,
  },
});
