import { Loader2 } from "lucide-react"
import { useState, type FormEvent } from "react"
import { saveToken } from "~lib/auth"
import { ApiError, register } from "~lib/api"
import { validateSignupForm } from "~lib/popup-validation"
import "~style.css"

type FieldErrors = Partial<Record<"email" | "password" | "confirmPassword", string>>

type SignupProps = {
  onSuccess: (token: string) => void
  onSwitchToLogin: () => void
}

export function Signup({ onSuccess, onSwitchToLogin }: SignupProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setApiError(null)

    const parsed = validateSignupForm(email, password, confirmPassword)
    if (!parsed.ok) {
      setFieldErrors(parsed.errors)
      return
    }

    setFieldErrors({})

    setIsSubmitting(true)
    try {
      const result = await register(parsed.email.toLowerCase(), parsed.password)
      await saveToken(result.token, result.user)
      onSuccess(result.token)
    } catch (e) {
      if (e instanceof ApiError) {
        setApiError(e.message)
      } else {
        setApiError("Network error")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[600px] w-full flex-col items-center justify-center bg-transparent px-6">
      <div
        className="w-full rounded-xl border border-[var(--pv-border)] bg-[var(--pv-card)] p-6"
        style={{ boxShadow: "0 0 80px -30px rgba(245,158,11,0.08)" }}>
        <h1 className="text-lg font-semibold text-[var(--pv-text)]">Create account</h1>

        <form className="mt-6 flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pv-signup-email" className="text-sm font-medium text-[var(--pv-text)]">
              Email
            </label>
            <input
              id="pv-signup-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-invalid={fieldErrors.email ? true : undefined}
              aria-describedby={fieldErrors.email ? "pv-signup-email-err" : undefined}
              className="w-full rounded-lg border border-[var(--pv-border)] bg-[var(--pv-surface-muted)] px-4 py-2.5 text-sm text-[var(--pv-text)] transition-colors placeholder:text-[var(--pv-text-dim)] focus:border-[#F59E0B] focus:outline-none focus:ring-1 focus:ring-[#F59E0B]/30"
            />
            {fieldErrors.email ? (
              <p id="pv-signup-email-err" className="text-xs text-[#EF4444]" role="alert">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="pv-signup-password" className="text-sm font-medium text-[var(--pv-text)]">
              Password
            </label>
            <input
              id="pv-signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              aria-invalid={fieldErrors.password ? true : undefined}
              aria-describedby={fieldErrors.password ? "pv-signup-password-err" : undefined}
              className="w-full rounded-lg border border-[var(--pv-border)] bg-[var(--pv-surface-muted)] px-4 py-2.5 text-sm text-[var(--pv-text)] transition-colors placeholder:text-[var(--pv-text-dim)] focus:border-[#F59E0B] focus:outline-none focus:ring-1 focus:ring-[#F59E0B]/30"
            />
            {fieldErrors.password ? (
              <p id="pv-signup-password-err" className="text-xs text-[#EF4444]" role="alert">
                {fieldErrors.password}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="pv-signup-confirm"
              className="text-sm font-medium text-[var(--pv-text)]">
              Confirm password
            </label>
            <input
              id="pv-signup-confirm"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              aria-invalid={fieldErrors.confirmPassword ? true : undefined}
              aria-describedby={fieldErrors.confirmPassword ? "pv-signup-confirm-err" : undefined}
              className="w-full rounded-lg border border-[var(--pv-border)] bg-[var(--pv-surface-muted)] px-4 py-2.5 text-sm text-[var(--pv-text)] transition-colors placeholder:text-[var(--pv-text-dim)] focus:border-[#F59E0B] focus:outline-none focus:ring-1 focus:ring-[#F59E0B]/30"
            />
            {fieldErrors.confirmPassword ? (
              <p id="pv-signup-confirm-err" className="text-xs text-[#EF4444]" role="alert">
                {fieldErrors.confirmPassword}
              </p>
            ) : null}
          </div>

          {apiError ? (
            <p className="text-xs text-[#EF4444]" role="alert">
              {apiError}
            </p>
          ) : null}

          <div className="shimmer-button w-full rounded-lg">
            <button
              type="submit"
              disabled={isSubmitting}
              className="pv-button-primary pv-focus relative z-[1] w-full rounded-lg py-2.5 text-sm font-semibold text-[var(--pv-primary-foreground)]">
              {isSubmitting ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin" aria-hidden />
              ) : (
                "Create account"
              )}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--pv-text-muted)]">
          Already have an account?{" "}
          <button
            type="button"
            className="text-sm text-[#F59E0B] transition-colors hover:text-[#FDE68A]"
            onClick={onSwitchToLogin}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
