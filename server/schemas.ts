import { z } from "zod"

export const createSpaceSchema = z.object({
  name: z.string().min(1, "name is required").max(60, "name must be 60 characters or fewer"),
})

export const updateSpaceSchema = z.object({
  name: z.string().min(1, "name is required").max(60, "name must be 60 characters or fewer"),
})

export const createPromptSchema = z.object({
  title: z.string().min(1, "title is required").max(200, "title must be 200 characters or fewer"),
  body: z
    .string()
    .min(1, "body is required")
    .max(20000, "body must be 20000 characters or fewer"),
  spaceId: z.string().min(1, "spaceId is required"),
  tags: z.array(z.string().max(50)).max(20).optional(),
})

export const updatePromptSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(20000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
})

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

export type CreateSpaceInput = z.infer<typeof createSpaceSchema>
export type UpdateSpaceInput = z.infer<typeof updateSpaceSchema>
export type CreatePromptInput = z.infer<typeof createPromptSchema>
export type UpdatePromptInput = z.infer<typeof updatePromptSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
