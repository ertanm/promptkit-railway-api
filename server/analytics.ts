import { Router } from "express"
import type { Request, Response } from "express"
import { z } from "zod"
import { getPrisma } from "./db.js"
import { resolveUserId, AuthError } from "./config.js"

export const analyticsRouter = Router()

const logEventSchema = z.object({
  promptId: z.string().min(1),
  site: z.string().min(1),
  action: z.string().default("inject"),
})

analyticsRouter.post("/api/analytics/events", async (req: Request, res: Response) => {
  const parsed = logEventSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed" })
  }
  try {
    const userId = await resolveUserId(req)
    const prisma = getPrisma()

    await prisma.usageEvent.create({
      data: {
        userId,
        promptId: parsed.data.promptId,
        site: parsed.data.site,
        action: parsed.data.action,
      },
    })

    return res.status(201).json({ ok: true })
  } catch (err) {
    if (err instanceof AuthError) return res.status(401).json({ error: err.message })
    return res.status(500).json({ error: "Failed to log event" })
  }
})

analyticsRouter.get("/api/analytics/top-prompts", async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req)
    const prisma = getPrisma()

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
    if (user.plan !== "PRO") {
      return res.status(403).json({ error: "Analytics is a Pro feature" })
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const results = await prisma.usageEvent.groupBy({
      by: ["promptId"],
      where: { userId, createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    })

    type GroupResult = (typeof results)[number]
    type PromptRow = { id: string; title: string; spaceId: string }

    const promptIds = results.map((r: GroupResult) => r.promptId)
    const prompts = await prisma.prompt.findMany({
      where: { id: { in: promptIds } },
      select: { id: true, title: true, spaceId: true },
    })

    const promptMap = new Map<string, PromptRow>(
      prompts.map((p: PromptRow) => [p.id, p])
    )

    const topPrompts = results.map((r: GroupResult) => {
      const prompt = promptMap.get(r.promptId)
      return {
        promptId: r.promptId,
        title: prompt?.title ?? "Deleted prompt",
        spaceId: prompt?.spaceId ?? null,
        injectCount: r._count.id,
      }
    })

    return res.json(topPrompts)
  } catch (err) {
    if (err instanceof AuthError) return res.status(401).json({ error: err.message })
    return res.status(500).json({ error: "Failed to fetch analytics" })
  }
})
