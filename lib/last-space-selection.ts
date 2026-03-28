import { getToken, getUser, getUserIdFromToken } from "./auth"

/**
 * Stable id for namespacing local preferences (matches stored `injectkit:user`.id and JWT `userId`).
 */
export async function getSessionIdentityForStorage(): Promise<string | null> {
  const user = await getUser()
  if (user?.id) {
    return user.id
  }
  const token = await getToken()
  if (!token) {
    return null
  }
  return getUserIdFromToken(token)
}

function storageKey(userId: string): string {
  return `pv_last_space:${userId}`
}

export async function getPersistedSelectedSpaceId(userId: string | null): Promise<string | null> {
  if (!userId || typeof chrome === "undefined" || !chrome.storage?.local) {
    return null
  }
  const k = storageKey(userId)
  const result = await chrome.storage.local.get(k)
  const v = result[k]
  return typeof v === "string" ? v : null
}

export async function setPersistedSelectedSpaceId(
  userId: string | null,
  spaceId: string | null,
): Promise<void> {
  if (!userId || typeof chrome === "undefined" || !chrome.storage?.local) {
    return
  }
  const k = storageKey(userId)
  if (!spaceId) {
    await chrome.storage.local.remove(k)
    return
  }
  await chrome.storage.local.set({ [k]: spaceId })
}
