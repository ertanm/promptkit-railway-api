// Prisma 7 config: datasource URL must come from env.
// In Docker/Railway, DATABASE_URL is injected at runtime (no .env file).
import "dotenv/config"
import { defineConfig } from "prisma/config"

const url = process.env.DATABASE_URL
if (!url || url.trim() === "") {
  throw new Error(
    "DATABASE_URL is not set. In Railway: Variables → + New Variable → Add Reference → [Select your Postgres service] → DATABASE_URL"
  )
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url,
  },
})
