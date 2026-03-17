import { describe, it, expect, beforeAll, afterEach, beforeEach } from "vitest"
import request from "supertest"
import { app } from "../app.js"
import { setupTestDb, cleanDb, getOrCreateDevUser, createTestSpace, createTestPrompt } from "./helpers.js"
import { getPrisma } from "../db.js"

let spaceId: string

beforeAll(async () => {
  await setupTestDb()
})

beforeEach(async () => {
  await cleanDb()
  const user = await getOrCreateDevUser()
  const space = await createTestSpace(user.id)
  spaceId = space.id
})

describe("POST /api/prompts", () => {
  it("creates a prompt", async () => {
    const res = await request(app)
      .post("/api/prompts")
      .send({ title: "Hello", body: "World", spaceId, tags: ["greeting"] })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ title: "Hello", body: "World", spaceId })
    expect(res.body.tags).toEqual(["greeting"])
  })

  it("returns 400 for missing title", async () => {
    const res = await request(app).post("/api/prompts").send({ body: "World", spaceId })
    expect(res.status).toBe(400)
  })

  it("returns 404 for non-existent space", async () => {
    const res = await request(app)
      .post("/api/prompts")
      .send({ title: "Hello", body: "World", spaceId: "nonexistent" })
    expect(res.status).toBe(404)
  })

  it("returns 400 when body exceeds max length", async () => {
    const res = await request(app)
      .post("/api/prompts")
      .send({ title: "Huge", body: "x".repeat(20001), spaceId })
    expect(res.status).toBe(400)
  })

  it("creates a prompt without tags", async () => {
    const res = await request(app)
      .post("/api/prompts")
      .send({ title: "No tags", body: "Body", spaceId })
    expect(res.status).toBe(201)
    expect(res.body.tags).toEqual([])
  })
})

describe("GET /api/spaces/:spaceId/prompts", () => {
  it("returns prompts for a space", async () => {
    await createTestPrompt(spaceId, { title: "P1" })
    await createTestPrompt(spaceId, { title: "P2" })

    const res = await request(app).get(`/api/spaces/${spaceId}/prompts`)
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(2)
  })

  it("excludes soft-deleted prompts", async () => {
    const prompt = await createTestPrompt(spaceId)
    const prisma = getPrisma()
    await prisma.prompt.update({
      where: { id: prompt.id },
      data: { deletedAt: new Date() },
    })

    const res = await request(app).get(`/api/spaces/${spaceId}/prompts`)
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(0)
  })

  it("returns 404 for non-existent space", async () => {
    const res = await request(app).get("/api/spaces/nonexistent/prompts")
    expect(res.status).toBe(404)
  })

  it("supports pagination with limit", async () => {
    for (let i = 0; i < 5; i++) {
      await createTestPrompt(spaceId, { title: `Prompt ${i}` })
    }

    const res = await request(app).get(`/api/spaces/${spaceId}/prompts?limit=2`)
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(2)
    expect(res.body.nextCursor).toBeDefined()
  })
})

describe("GET /api/prompts/:id", () => {
  it("returns a single prompt", async () => {
    const prompt = await createTestPrompt(spaceId, { title: "Specific" })
    const res = await request(app).get(`/api/prompts/${prompt.id}`)
    expect(res.status).toBe(200)
    expect(res.body.title).toBe("Specific")
  })

  it("returns 404 for non-existent prompt", async () => {
    const res = await request(app).get("/api/prompts/nonexistent")
    expect(res.status).toBe(404)
  })

  it("returns 404 for soft-deleted prompt", async () => {
    const prompt = await createTestPrompt(spaceId)
    const prisma = getPrisma()
    await prisma.prompt.update({
      where: { id: prompt.id },
      data: { deletedAt: new Date() },
    })
    const res = await request(app).get(`/api/prompts/${prompt.id}`)
    expect(res.status).toBe(404)
  })
})

describe("PATCH /api/prompts/:id", () => {
  it("updates prompt title", async () => {
    const prompt = await createTestPrompt(spaceId)
    const res = await request(app)
      .patch(`/api/prompts/${prompt.id}`)
      .send({ title: "Updated Title" })
    expect(res.status).toBe(200)
    expect(res.body.title).toBe("Updated Title")
  })

  it("updates prompt body", async () => {
    const prompt = await createTestPrompt(spaceId)
    const res = await request(app)
      .patch(`/api/prompts/${prompt.id}`)
      .send({ body: "New body" })
    expect(res.status).toBe(200)
    expect(res.body.body).toBe("New body")
  })

  it("updates prompt tags", async () => {
    const prompt = await createTestPrompt(spaceId)
    const res = await request(app)
      .patch(`/api/prompts/${prompt.id}`)
      .send({ tags: ["new-tag"] })
    expect(res.status).toBe(200)
    expect(res.body.tags).toEqual(["new-tag"])
  })

  it("returns 400 for empty update", async () => {
    const prompt = await createTestPrompt(spaceId)
    const res = await request(app).patch(`/api/prompts/${prompt.id}`).send({})
    expect(res.status).toBe(400)
  })

  it("returns 404 for non-existent prompt", async () => {
    const res = await request(app)
      .patch("/api/prompts/nonexistent")
      .send({ title: "Updated" })
    expect(res.status).toBe(404)
  })
})

describe("DELETE /api/prompts/:id", () => {
  it("soft-deletes a prompt", async () => {
    const prompt = await createTestPrompt(spaceId)
    const res = await request(app).delete(`/api/prompts/${prompt.id}`)
    expect(res.status).toBe(204)

    const getRes = await request(app).get(`/api/prompts/${prompt.id}`)
    expect(getRes.status).toBe(404)
  })

  it("returns 404 for non-existent prompt", async () => {
    const res = await request(app).delete("/api/prompts/nonexistent")
    expect(res.status).toBe(404)
  })

  it("returns 404 when deleting already-deleted prompt", async () => {
    const prompt = await createTestPrompt(spaceId)
    await request(app).delete(`/api/prompts/${prompt.id}`)
    const res = await request(app).delete(`/api/prompts/${prompt.id}`)
    expect(res.status).toBe(404)
  })
})
