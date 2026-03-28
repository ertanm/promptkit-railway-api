/**
 * Form and API response validation for the extension popup.
 * Avoids importing `zod` here: Parcel's zod entry can fail to bundle `./v3/external.js`,
 * which breaks `import { z } from "zod"` at runtime (`z.string is not a function`).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type InjectKitUser = {
  id: string
  email: string
  plan: "free" | "pro"
}

export function parseInjectKitUser(data: unknown): InjectKitUser | null {
  if (typeof data !== "object" || data === null) {
    return null
  }
  const o = data as Record<string, unknown>
  const { id, email, plan } = o
  if (typeof id !== "string" || typeof email !== "string") {
    return null
  }
  if (plan !== "free" && plan !== "pro") {
    return null
  }
  return { id, email, plan }
}

export type LoginFieldErrors = Partial<Record<"email" | "password", string>>

export function validateLoginForm(
  email: string,
  password: string
): { ok: true; email: string; password: string } | { ok: false; errors: LoginFieldErrors } {
  const errors: LoginFieldErrors = {}
  const trimmed = email.trim()
  if (!trimmed) {
    errors.email = "Enter a valid email"
  } else if (!EMAIL_RE.test(trimmed)) {
    errors.email = "Enter a valid email"
  }
  if (!password) {
    errors.password = "Password is required"
  }
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }
  return { ok: true, email: trimmed, password }
}

export type SignupFieldErrors = Partial<Record<"email" | "password" | "confirmPassword", string>>

export function validateSignupForm(
  email: string,
  password: string,
  confirmPassword: string
): { ok: true; email: string; password: string } | { ok: false; errors: SignupFieldErrors } {
  const errors: SignupFieldErrors = {}
  const trimmed = email.trim()
  if (!trimmed) {
    errors.email = "Enter a valid email"
  } else if (!EMAIL_RE.test(trimmed)) {
    errors.email = "Enter a valid email"
  }
  if (password.length < 8) {
    errors.password = "Password must be at least 8 characters"
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match"
  }
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }
  return { ok: true, email: trimmed, password }
}
