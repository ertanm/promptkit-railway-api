import type { Space, Prompt } from "./api"

const STORAGE_KEYS = {
  SPACES: "injectkit:spaces",
  PROMPTS: "injectkit:prompts",
  LAST_SYNC: "injectkit:last_sync",
} as const

function getStorage(): typeof chrome.storage.local | null {
  return typeof chrome !== "undefined" && chrome.storage?.local ? chrome.storage.local : null
}

export async function getCachedSpaces(): Promise<Space[]> {
  const storage = getStorage()
  if (!storage) return []
  const result = await storage.get(STORAGE_KEYS.SPACES)
  return result[STORAGE_KEYS.SPACES] ?? []
}

export async function setCachedSpaces(spaces: Space[]): Promise<void> {
  const storage = getStorage()
  if (!storage) return
  const redacted = spaces.map(({ id, name, createdAt }) => ({
    id,
    name,
    createdAt,
  }))
  await storage.set({ [STORAGE_KEYS.SPACES]: redacted })
}

export async function getCachedPrompts(spaceId: string): Promise<Prompt[]> {
  // Prompt bodies can contain sensitive information. We avoid caching them in
  // chrome.storage.local and always return an empty list here. Callers should
  // treat this as a cache miss and fetch prompts from the API when needed.
  void spaceId
  return []
}

export async function setCachedPrompts(spaceId: string, prompts: Prompt[]): Promise<void> {
  // Intentionally a no-op: we no longer persist prompt bodies to
  // chrome.storage.local to reduce data-at-rest exposure.
  void spaceId
  void prompts
}

export async function getLastSyncTime(): Promise<number | null> {
  const storage = getStorage()
  if (!storage) return null
  const result = await storage.get(STORAGE_KEYS.LAST_SYNC)
  return result[STORAGE_KEYS.LAST_SYNC] ?? null
}

export async function setLastSyncTime(): Promise<void> {
  const storage = getStorage()
  if (!storage) return
  await storage.set({ [STORAGE_KEYS.LAST_SYNC]: Date.now() })
}
