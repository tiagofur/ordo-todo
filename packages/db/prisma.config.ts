import "dotenv/config";
import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://ordo:ordo_dev_password@localhost:5433/ordo_todo",
  },
  migrations: {
    seed: "node prisma/seed.js",
  },
});
