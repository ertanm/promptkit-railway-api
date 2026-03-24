import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  LEGACY_ONBOARDING_COMPLETE_KEY,
  markOnboardingCompleteForUser,
  onboardingDoneKeyForUser,
  shouldShowOnboardingTour,
} from "../onboarding"

const store: Record<string, unknown> = {}

function mockChromeStorage() {
  vi.stubGlobal("chrome", {
    storage: {
      local: {
        get: (keys: string | string[]) => {
          const list = Array.isArray(keys) ? keys : [keys]
          const out: Record<string, unknown> = {}
          for (const k of list) {
            if (k in store) out[k] = store[k]
          }
          return Promise.resolve(out)
        },
        set: (items: Record<string, unknown>) => {
          Object.assign(store, items)
          return Promise.resolve()
        },
        remove: (keys: string | string[]) => {
          const list = Array.isArray(keys) ? keys : [keys]
          for (const k of list) delete store[k]
          return Promise.resolve()
        },
      },
    },
  })
}

describe("onboarding storage (per userId)", () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k]
    mockChromeStorage()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("shouldShowOnboardingTour is true when no keys exist", async () => {
    await expect(shouldShowOnboardingTour("user-a")).resolves.toBe(true)
  })

  it("shouldShowOnboardingTour is false after markOnboardingCompleteForUser", async () => {
    await markOnboardingCompleteForUser("user-a")
    await expect(shouldShowOnboardingTour("user-a")).resolves.toBe(false)
  })

  it("different users have independent completion flags", async () => {
    await markOnboardingCompleteForUser("user-a")
    await expect(shouldShowOnboardingTour("user-b")).resolves.toBe(true)
    await expect(shouldShowOnboardingTour("user-a")).resolves.toBe(false)
  })

  it("migrates legacy global key to per-user and hides tour", async () => {
    store[LEGACY_ONBOARDING_COMPLETE_KEY] = true
    const key = onboardingDoneKeyForUser("user-migrate")
    await expect(shouldShowOnboardingTour("user-migrate")).resolves.toBe(false)
    expect(store[key]).toBe(true)
    expect(store[LEGACY_ONBOARDING_COMPLETE_KEY]).toBeUndefined()
  })

  it("shouldShowOnboardingTour is false when userId is null", async () => {
    await expect(shouldShowOnboardingTour(null)).resolves.toBe(false)
  })
})
