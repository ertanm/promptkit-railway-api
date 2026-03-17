import { fetchSpaces, fetchPrompts, type Space, type Prompt } from "./api"
import {
  getCachedSpaces,
  setCachedSpaces,
  getCachedPrompts,
  setCachedPrompts,
  setLastSyncTime,
} from "./storage"

export interface SyncResult {
  spaces: Space[]
  prompts: Map<string, Prompt[]>
  isStale: boolean
}

export async function syncOnOpen(currentSpaceId?: string | null): Promise<SyncResult> {
  let isStale = false

  let spaces: Space[]
  try {
    spaces = await fetchSpaces()
    await setCachedSpaces(spaces)
  } catch {
    spaces = await getCachedSpaces()
    isStale = true
  }

  const prompts = new Map<string, Prompt[]>()

  if (currentSpaceId) {
    try {
      const res = await fetchPrompts(currentSpaceId)
      const data = Array.isArray(res) ? res : (res as any).data ?? []
      prompts.set(currentSpaceId, data)
      await setCachedPrompts(currentSpaceId, data)
    } catch {
      const cached = await getCachedPrompts(currentSpaceId)
      prompts.set(currentSpaceId, cached)
      isStale = true
    }
  }

  if (!isStale) {
    await setLastSyncTime()
  }

  return { spaces, prompts, isStale }
}
