/** Legacy single flag (pre–per-account onboarding). Migrated to per-user keys on first open. */
export const LEGACY_ONBOARDING_COMPLETE_KEY = "pv_onboarding_complete" as const

export function onboardingDoneKeyForUser(userId: string): string {
  return `pv_onboarding_done:${userId}`
}

/**
 * Whether to show the “how InjectKit works” tour for this account.
 * Uses one key per `userId` so logging out and back in does not replay the tour.
 * Migrates `LEGACY_ONBOARDING_COMPLETE_KEY` → per-user when present.
 */
export async function shouldShowOnboardingTour(userId: string | null): Promise<boolean> {
  if (!userId) {
    return false
  }
  const key = onboardingDoneKeyForUser(userId)
  const result = await chrome.storage.local.get([key, LEGACY_ONBOARDING_COMPLETE_KEY])
  if (result[key] === true) {
    return false
  }
  if (result[LEGACY_ONBOARDING_COMPLETE_KEY] === true) {
    await chrome.storage.local.set({ [key]: true })
    await chrome.storage.local.remove(LEGACY_ONBOARDING_COMPLETE_KEY)
    return false
  }
  return true
}

export async function markOnboardingCompleteForUser(userId: string | null): Promise<void> {
  if (!userId) {
    await chrome.storage.local.set({ [LEGACY_ONBOARDING_COMPLETE_KEY]: true })
    return
  }
  await chrome.storage.local.set({ [onboardingDoneKeyForUser(userId)]: true })
  await chrome.storage.local.remove(LEGACY_ONBOARDING_COMPLETE_KEY)
}
