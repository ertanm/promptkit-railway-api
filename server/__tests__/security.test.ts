import { describe, it, expect, beforeAll, afterEach, vi } from "vitest"
import request from "supertest"
import { setupTestDb, cleanDb } from "./helpers.js"

beforeAll(async () => {
  await setupTestDb()
})

afterEach(async () => {
  await cleanDb()
})

describe("Security configuration", () => {
  it("rejects requests from unknown origins via CORS", async () => {
    const originalCors = process.env.CORS_ORIGINS
    process.env.CORS_ORIGINS = "https://allowed.com"

    vi.resetModules()
    const { initPrisma } = await import("../db.js")
    await initPrisma()
    const { app: corsApp } = await import("../app.js")

    const res = await request(corsApp)
      .get("/health")
      .set("Origin", "https://evil.com")

    expect(res.status).toBe(500)

    process.env.CORS_ORIGINS = originalCors
  })

  it("does not allow dev auto-auth when NODE_ENV is production", async () => {
    const originalNodeEnv = process.env.NODE_ENV
    const originalDevAutoAuth = process.env.ALLOW_DEV_AUTO_AUTH

    vi.resetModules()
    process.env.NODE_ENV = "production"
    process.env.ALLOW_DEV_AUTO_AUTH = "true"

    vi.doMock("@clerk/express", () => ({
      getAuth: () => ({ userId: undefined }),
    }))

    const { resolveUserId, AuthError } = await import("../config.js")
    const req = { ip: "127.0.0.1", headers: {} } as any

    await expect(resolveUserId(req)).rejects.toBeInstanceOf(AuthError)

    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV
    } else {
      process.env.NODE_ENV = originalNodeEnv
    }
    if (originalDevAutoAuth === undefined) {
      delete process.env.ALLOW_DEV_AUTO_AUTH
    } else {
      process.env.ALLOW_DEV_AUTO_AUTH = originalDevAutoAuth
    }
  })
})

