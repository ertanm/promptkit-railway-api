import { getAuth } from "@clerk/express"
import type { Request } from "express"
import { getPrisma } from "./db.js"

export const DEV_CLERK_ID = "dev-user"

const isDevEnvironment = process.env.NODE_ENV === "development"

function isLocalRequest(req: Request): boolean {
  const ip = req.ip ?? ""
  return ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1"
}

let cachedDevUserId: string | null = null

export async function getDevUserId(): Promise<string> {
  if (cachedDevUserId) {
    const prisma = getPrisma()
    const existing = await prisma.user.findUnique({ where: { id: cachedDevUserId } })
    if (existing) {
      return cachedDevUserId
    }
    cachedDevUserId = null
  }
  const prisma = getPrisma()
  const user = await prisma.user.upsert({
    where: { clerkId: DEV_CLERK_ID },
    create: { clerkId: DEV_CLERK_ID },
    update: {},
  })
  cachedDevUserId = user.id
  return user.id
}

export async function resolveUserId(req: Request): Promise<string> {
  if (
    isDevEnvironment &&
    process.env.ALLOW_DEV_AUTO_AUTH === "true" &&
    isLocalRequest(req)
  ) {
    return getDevUserId()
  }
  const { userId: clerkId } = getAuth(req)
  if (!clerkId) {
    throw new AuthError("Unauthorized")
  }

  const prisma = getPrisma()
  const user = await prisma.user.upsert({
    where: { clerkId },
    create: { clerkId },
    update: {},
  })
  return user.id
}

export function resetDevUserCache() {
  cachedDevUserId = null
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AuthError"
  }
}
