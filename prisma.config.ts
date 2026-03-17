// Prisma 7 config: datasource URL must come from env.
// In Docker/Railway, DATABASE_URL is injected at runtime (no .env file).
import "dotenv/config"
import { defineConfig, env } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
})
