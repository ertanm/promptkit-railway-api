interface EmptyStateProps {
  title?: string
  message?: string
  onAction?: () => void
  actionLabel?: string
}

export function EmptyState({
  title = "No prompts yet",
  message = "Create your first prompt to get started",
  onAction,
  actionLabel = "Create Prompt",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[color:color-mix(in_srgb,var(--pv-accent)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--pv-accent-soft)_80%,transparent)]">
        <svg className="h-7 w-7 text-[var(--pv-accent-strong)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <h3 className="mb-1 text-sm font-semibold text-[var(--pv-text)]">{title}</h3>
      <p className="mb-4 max-w-[240px] text-xs text-[var(--pv-text-muted)]">{message}</p>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="pv-button-primary">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
