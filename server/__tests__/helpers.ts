import { initPrisma, getPrisma } from "../db.js"
import { DEV_CLERK_ID, resetDevUserCache } from "../config.js"

export async function setupTestDb() {
  await initPrisma()
  return getPrisma()
}

export async function cleanDb() {
  const prisma = getPrisma()
  await prisma.$queryRaw`TRUNCATE TABLE "Prompt", "Space", "User" CASCADE`
  resetDevUserCache()
}

export async function getOrCreateDevUser() {
  const prisma = getPrisma()
  return prisma.user.upsert({
    where: { clerkId: DEV_CLERK_ID },
    create: { clerkId: DEV_CLERK_ID },
    update: {},
  })
}

export async function createTestSpace(userId: string, name = "Test Space") {
  const prisma = getPrisma()
  return prisma.space.create({
    data: { name, userId },
  })
}

export async function createTestPrompt(
  spaceId: string,
  overrides: { title?: string; body?: string; tags?: string[] } = {},
) {
  const prisma = getPrisma()
  return prisma.prompt.create({
    data: {
      title: overrides.title ?? "Test Prompt",
      body: overrides.body ?? "Test body content",
      tags: overrides.tags ?? ["test"],
      spaceId,
    },
  })
}
