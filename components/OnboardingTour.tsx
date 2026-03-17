import { useState, useEffect } from "react"

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

const STORAGE_KEY = "pv_onboarding_complete"

export function OnboardingTour() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    chrome.storage?.local?.get(STORAGE_KEY, (result) => {
      if (!result[STORAGE_KEY]) {
        setVisible(true)
      }
    })
  }, [])

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1)
    } else {
      handleDismiss()
    }
  }

  const handleDismiss = () => {
    setVisible(false)
    chrome.storage?.local?.set({ [STORAGE_KEY]: true })
  }

  if (!visible) return null

  const current = TOUR_STEPS[step]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[320px] rounded-2xl border border-[var(--pv-border)] bg-[color:color-mix(in_srgb,var(--pv-surface)_88%,transparent)] p-6 shadow-2xl backdrop-blur-md">
        <div className="text-center mb-4">
          <span className="text-4xl">{current.icon}</span>
        </div>
        <h2 className="mb-2 text-center text-lg font-semibold text-[var(--pv-text)]">{current.title}</h2>
        <p className="mb-6 text-center text-sm text-[var(--pv-text-muted)]">{current.description}</p>

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
              onClick={handleDismiss}
              className="px-3 py-1.5 text-xs text-[var(--pv-text-muted)] transition-colors hover:text-[var(--pv-text)]">
              Skip
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="rounded-lg bg-[var(--pv-accent)] px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--pv-accent-strong)]">
              {step < TOUR_STEPS.length - 1 ? "Next" : "Get Started"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
