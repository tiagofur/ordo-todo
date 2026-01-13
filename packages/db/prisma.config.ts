import { config } from "dotenv";
import { defineConfig } from "@prisma/config";

// Load .env file explicitly (if it exists)
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://ordo:ordo_dev_2024@localhost:5432/ordo_todo",
  },
  migrations: {
    seed: "node prisma/seed.js",
  },
});
