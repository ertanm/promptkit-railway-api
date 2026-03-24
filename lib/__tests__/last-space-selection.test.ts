import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  getPersistedSelectedSpaceId,
  setPersistedSelectedSpaceId,
} from "../last-space-selection"

const store: Record<string, unknown> = {}

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k]
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
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("last-space-selection", () => {
  it("round-trips space id per user", async () => {
    await setPersistedSelectedSpaceId("user-1", "space-a")
    await expect(getPersistedSelectedSpaceId("user-1")).resolves.toBe("space-a")
    await expect(getPersistedSelectedSpaceId("user-2")).resolves.toBeNull()
  })

  it("remove clears key", async () => {
    await setPersistedSelectedSpaceId("user-1", "space-a")
    await setPersistedSelectedSpaceId("user-1", null)
    await expect(getPersistedSelectedSpaceId("user-1")).resolves.toBeNull()
  })
})
