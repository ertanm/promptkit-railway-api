import { Router } from "express"
import type { Request, Response } from "express"
import { getPrisma } from "./db.js"
import { resolveUserId, AuthError } from "./config.js"

export const versionsRouter = Router()

async function requirePro(userId: string): Promise<boolean> {
  const prisma = getPrisma()
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
  return user.plan === "PRO"
}

versionsRouter.get("/api/prompts/:id/versions", async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req)
    const isPro = await requirePro(userId)
    if (!isPro) {
      return res.status(403).json({ error: "Version history is a Pro feature" })
    }

    const prisma = getPrisma()
    const prompt = await prisma.prompt.findFirst({
      where: { id: req.params.id, space: { userId } },
    })
    if (!prompt) {
      return res.status(404).json({ error: "Prompt not found" })
    }

    const versions = await prisma.promptVersion.findMany({
      where: { promptId: req.params.id },
      orderBy: { version: "desc" },
    })

    return res.json(versions)
  } catch (err) {
    if (err instanceof AuthError) return res.status(401).json({ error: err.message })
    return res.status(500).json({ error: "Failed to fetch versions" })
  }
})

versionsRouter.post("/api/prompts/:id/revert/:versionId", async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req)
    const isPro = await requirePro(userId)
    if (!isPro) {
      return res.status(403).json({ error: "Version history is a Pro feature" })
    }

    const prisma = getPrisma()
    const prompt = await prisma.prompt.findFirst({
      where: { id: req.params.id, space: { userId }, deletedAt: null },
    })
    if (!prompt) {
      return res.status(404).json({ error: "Prompt not found" })
    }

    const targetVersion = await prisma.promptVersion.findFirst({
      where: { id: req.params.versionId, promptId: req.params.id },
    })
    if (!targetVersion) {
      return res.status(404).json({ error: "Version not found" })
    }

    const latestVersion = await prisma.promptVersion.findFirst({
      where: { promptId: req.params.id },
      orderBy: { version: "desc" },
    })

    const newVersionNumber = (latestVersion?.version ?? 0) + 1

    const [updatedPrompt] = await prisma.$transaction([
      prisma.prompt.update({
        where: { id: req.params.id },
        data: {
          title: targetVersion.title,
          body: targetVersion.body,
          tags: targetVersion.tags,
        },
      }),
      prisma.promptVersion.create({
        data: {
          promptId: req.params.id,
          title: targetVersion.title,
          body: targetVersion.body,
          tags: targetVersion.tags,
          version: newVersionNumber,
        },
      }),
    ])

    return res.json(updatedPrompt)
  } catch (err) {
    if (err instanceof AuthError) return res.status(401).json({ error: err.message })
    return res.status(500).json({ error: "Failed to revert prompt" })
  }
})

export async function createVersionOnUpdate(
  promptId: string,
  title: string,
  body: string,
  tags: string[],
) {
  const prisma = getPrisma()
  const latestVersion = await prisma.promptVersion.findFirst({
    where: { promptId },
    orderBy: { version: "desc" },
  })
  const newVersion = (latestVersion?.version ?? 0) + 1

  await prisma.promptVersion.create({
    data: {
      promptId,
      title,
      body,
      tags,
      version: newVersion,
    },
  })
}
