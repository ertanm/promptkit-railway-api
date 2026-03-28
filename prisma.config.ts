// Prisma 7 config: datasource URL must come from env.
// In Docker/Railway, DATABASE_URL is injected at runtime (no .env file).
import "dotenv/config"
import { defineConfig } from "prisma/config"

// During Docker build, DATABASE_URL isn't available — prisma generate doesn't
// need it, so we fall back to an empty string.  At runtime (start.sh),
// DATABASE_URL is always injected by Railway.
const url = process.env.DATABASE_URL ?? ""

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url,
  },
})
