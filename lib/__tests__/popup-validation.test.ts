import { describe, expect, it } from "vitest"
import {
  parsePromptVaultUser,
  validateLoginForm,
  validateSignupForm,
} from "../popup-validation"

describe("parsePromptVaultUser", () => {
  it("accepts a valid /me-shaped object", () => {
    expect(
      parsePromptVaultUser({ id: "u1", email: "a@b.co", plan: "free" })
    ).toEqual({ id: "u1", email: "a@b.co", plan: "free" })
  })

  it("rejects invalid plan or types", () => {
    expect(parsePromptVaultUser({ id: "u1", email: "a@b.co", plan: "team" })).toBeNull()
    expect(parsePromptVaultUser({ id: 1, email: "a@b.co", plan: "free" })).toBeNull()
    expect(parsePromptVaultUser(null)).toBeNull()
  })
})

describe("validateLoginForm", () => {
  it("returns trimmed email on success", () => {
    const r = validateLoginForm("  you@example.com  ", "secret")
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.email).toBe("you@example.com")
      expect(r.password).toBe("secret")
    }
  })

  it("reports field errors", () => {
    expect(validateLoginForm("", "").ok).toBe(false)
    expect(validateLoginForm("not-an-email", "x").ok).toBe(false)
    expect(validateLoginForm("you@example.com", "").ok).toBe(false)
  })
})

describe("validateSignupForm", () => {
  it("requires password length and match", () => {
    const short = validateSignupForm("you@example.com", "short", "short")
    expect(short.ok).toBe(false)
    if (!short.ok) {
      expect(short.errors.password).toBeDefined()
    }

    const mismatch = validateSignupForm("you@example.com", "longenough", "other")
    expect(mismatch.ok).toBe(false)
    if (!mismatch.ok) {
      expect(mismatch.errors.confirmPassword).toBe("Passwords do not match")
    }
  })
})
