import { useState, useEffect } from "react"
import { getToken, getUserIdFromToken } from "~lib/auth"
import { markOnboardingCompleteForUser, shouldShowOnboardingTour } from "~lib/onboarding"

const TOUR_STEPS = [
  {
    title: "Create a Space",
    description: "Organize your prompts into spaces — like folders for your AI workflows.",
    icon: "📁",
  },
  {
    title: "Add Your Prompts",
    description: "Save your best prompts with titles, tags, and full text for quick access.",
    icon: "✍️",
  },
  {
    title: "Inject Anywhere",
    description: "Press ⌘K on ChatGPT, Claude, or v0 to instantly inject any saved prompt.",
    icon: "⚡",
  },
]

export function OnboardingTour() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const token = await getToken()
      if (!token || cancelled) {
        return
      }
      const userId = getUserIdFromToken(token)
      const show = await shouldShowOnboardingTour(userId)
      if (!cancelled && show) {
        setVisible(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1)
    } else {
      void dismissTour()
    }
  }

  const dismissTour = async () => {
    const token = await getToken()
    const userId = token ? getUserIdFromToken(token) : null
    await markOnboardingCompleteForUser(userId)
    setVisible(false)
  }

  if (!visible) return null

  const current = TOUR_STEPS[step]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-[320px] rounded-xl border border-[var(--pv-border)] bg-[var(--pv-card)] p-8 shadow-2xl backdrop-blur-md"
        style={{ boxShadow: "0 0 80px -30px rgba(245, 158, 11, 0.08), 0 25px 50px -12px rgba(0, 0, 0, 0.45)" }}>
        <div className="mb-4 text-center">
          <span className="text-4xl">{current.icon}</span>
        </div>
        <h2 className="mb-2 text-center text-lg font-bold tracking-[-0.02em] leading-[1.1] text-[var(--pv-text)]">
          {current.title}
        </h2>
        <p className="mb-6 text-center text-sm leading-relaxed text-[var(--pv-text-muted)]">
          {current.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === step ? "bg-[var(--pv-accent)]" : "bg-[var(--pv-surface-muted)]"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void dismissTour()}
              className="px-3 py-1.5 text-xs text-[var(--pv-text-muted)] transition-colors hover:text-[var(--pv-text)]">
              Skip
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="rounded-lg bg-[var(--pv-accent)] px-4 py-1.5 text-xs font-medium text-[var(--pv-primary-foreground)] transition-colors hover:bg-[var(--pv-accent-hover)]">
              {step < TOUR_STEPS.length - 1 ? "Next" : "Get Started"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
