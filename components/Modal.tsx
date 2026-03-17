import type { ReactNode } from "react"

interface ModalProps {
  isOpen: boolean
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
}

export function Modal({ isOpen, title, description, children, onClose, footer }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--pv-border)] bg-[var(--pv-surface)] p-4 shadow-2xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--pv-text)]">{title}</h2>
            {description && <p className="mt-1 text-xs text-[var(--pv-text-muted)]">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="pv-focus rounded-md p-1 text-[var(--pv-text-muted)] hover:bg-[var(--pv-surface-muted)] hover:text-[var(--pv-text)]"
            aria-label="Close dialog">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div>{children}</div>
        {footer && <div className="mt-4 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}
