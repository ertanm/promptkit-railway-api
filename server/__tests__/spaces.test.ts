import { describe, it, expect, beforeAll, afterEach } from "vitest"
import request from "supertest"
import { app } from "../app.js"
import { setupTestDb, cleanDb } from "./helpers.js"

beforeAll(async () => {
  await setupTestDb()
})

afterEach(async () => {
  await cleanDb()
})

describe("POST /api/spaces", () => {
  it("creates a space", async () => {
    const res = await request(app).post("/api/spaces").send({ name: "My Space" })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ name: "My Space" })
    expect(res.body.id).toBeDefined()
  })

  it("returns 400 for missing name", async () => {
    const res = await request(app).post("/api/spaces").send({})
    expect(res.status).toBe(400)
  })

  it("returns 400 for name exceeding 60 chars", async () => {
    const res = await request(app).post("/api/spaces").send({ name: "a".repeat(61) })
    expect(res.status).toBe(400)
  })

  it("returns 409 for duplicate space name", async () => {
    await request(app).post("/api/spaces").send({ name: "Duplicate" })
    const res = await request(app).post("/api/spaces").send({ name: "Duplicate" })
    expect(res.status).toBe(409)
  })
})

describe("GET /api/spaces", () => {
  it("returns user spaces", async () => {
    await request(app).post("/api/spaces").send({ name: "Space A" })
    await request(app).post("/api/spaces").send({ name: "Space B" })

    const res = await request(app).get("/api/spaces")
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
  })

  it("returns empty array when user has no spaces", async () => {
    const res = await request(app).get("/api/spaces")
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

describe("PATCH /api/spaces/:id", () => {
  it("renames a space", async () => {
    const created = await request(app).post("/api/spaces").send({ name: "Old Name" })
    const res = await request(app)
      .patch(`/api/spaces/${created.body.id}`)
      .send({ name: "New Name" })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe("New Name")
  })

  it("returns 400 for invalid payload", async () => {
    const created = await request(app).post("/api/spaces").send({ name: "Old Name" })
    const res = await request(app).patch(`/api/spaces/${created.body.id}`).send({ name: "" })

    expect(res.status).toBe(400)
  })

  it("returns 409 for duplicate names", async () => {
    const first = await request(app).post("/api/spaces").send({ name: "First" })
    await request(app).post("/api/spaces").send({ name: "Second" })

    const res = await request(app).patch(`/api/spaces/${first.body.id}`).send({ name: "Second" })
    expect(res.status).toBe(409)
  })

  it("returns 404 for non-existent space", async () => {
    const res = await request(app).patch("/api/spaces/nonexistent").send({ name: "Nope" })
    expect(res.status).toBe(404)
  })
})

describe("DELETE /api/spaces/:id", () => {
  it("deletes an empty space", async () => {
    const created = await request(app).post("/api/spaces").send({ name: "Delete Me" })
    const res = await request(app).delete(`/api/spaces/${created.body.id}`)

    expect(res.status).toBe(204)
  })

  it("returns 409 when deleting a non-empty space", async () => {
    const created = await request(app).post("/api/spaces").send({ name: "Used Space" })
    await request(app)
      .post("/api/prompts")
      .send({ title: "Prompt", body: "Body", spaceId: created.body.id })

    const res = await request(app).delete(`/api/spaces/${created.body.id}`)
    expect(res.status).toBe(409)
  })

  it("returns 404 for non-existent space", async () => {
    const res = await request(app).delete("/api/spaces/nonexistent")
    expect(res.status).toBe(404)
  })
})
