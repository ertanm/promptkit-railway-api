import { Router } from "express"
import type { Request, Response } from "express"
import { z } from "zod"
import { getPrisma } from "./db.js"
import { resolveUserId, AuthError } from "./config.js"

export const importExportRouter = Router()

const MAX_IMPORT_SIZE = 5 * 1024 * 1024

const importPromptSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  tags: z.array(z.string().max(50)).max(20).optional().default([]),
})

const importSchema = z.object({
  spaceId: z.string().min(1),
  prompts: z.array(importPromptSchema).min(1).max(500),
})

importExportRouter.post("/api/prompts/import", async (req: Request, res: Response) => {
  const contentLength = parseInt(req.headers["content-length"] ?? "0", 10)
  if (contentLength > MAX_IMPORT_SIZE) {
    return res.status(413).json({ error: "Payload too large (max 5MB)" })
  }

  const parsed = importSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() })
  }

  try {
    const userId = await resolveUserId(req)
    const prisma = getPrisma()

    const space = await prisma.space.findFirst({
      where: { id: parsed.data.spaceId, userId },
    })
    if (!space) {
      return res.status(404).json({ error: "Space not found" })
    }

    const created = await prisma.prompt.createMany({
      data: parsed.data.prompts.map((p) => ({
        title: p.title,
        body: p.body,
        tags: p.tags,
        spaceId: parsed.data.spaceId,
      })),
    })

    return res.status(201).json({ imported: created.count })
  } catch (err) {
    if (err instanceof AuthError) return res.status(401).json({ error: err.message })
    return res.status(500).json({ error: "Failed to import prompts" })
  }
})

importExportRouter.get("/api/prompts/export", async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req)
    const prisma = getPrisma()
    const format = (req.query.format as string) ?? "json"
    const spaceId = req.query.spaceId as string | undefined

    const where: any = {
      space: { userId },
      deletedAt: null,
    }
    if (spaceId) {
      where.spaceId = spaceId
    }

    const prompts = await prisma.prompt.findMany({
      where,
      include: { space: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    })

    type PromptWithSpace = (typeof prompts)[number]

    if (format === "csv") {
      const header = "title,body,tags,space,createdAt\n"
      const rows = prompts.map((p: PromptWithSpace) => {
        const escapeCsv = (s: string) => `"${s.replace(/"/g, '""')}"`
        return [
          escapeCsv(p.title),
          escapeCsv(p.body),
          escapeCsv(p.tags.join(",")),
          escapeCsv(p.space.name),
          p.createdAt.toISOString(),
        ].join(",")
      })
      res.setHeader("Content-Type", "text/csv")
      res.setHeader("Content-Disposition", "attachment; filename=promptvault-export.csv")
      return res.send(header + rows.join("\n"))
    }

    const exportData = prompts.map((p: PromptWithSpace) => ({
      title: p.title,
      body: p.body,
      tags: p.tags,
      space: p.space.name,
      createdAt: p.createdAt,
    }))
    res.setHeader("Content-Type", "application/json")
    res.setHeader("Content-Disposition", "attachment; filename=promptvault-export.json")
    return res.json(exportData)
  } catch (err) {
    if (err instanceof AuthError) return res.status(401).json({ error: err.message })
    return res.status(500).json({ error: "Failed to export prompts" })
  }
})
