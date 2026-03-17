import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as { prisma?: any }

let _prisma: any = globalForPrisma.prisma ?? null

async function initPrisma() {
  if (_prisma) return _prisma
  const mod = await import("./generated/prisma/client.ts")
  const PrismaClient = mod.PrismaClient
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  _prisma = new PrismaClient({ adapter, log: ["error", "warn"] })
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = _prisma
  }
  return _prisma
}

export { initPrisma }

export function getPrisma() {
  if (!_prisma) throw new Error("Call initPrisma() before using getPrisma()")
  return _prisma
}
