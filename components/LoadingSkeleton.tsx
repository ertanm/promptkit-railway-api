export function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-[var(--pv-border)] bg-[var(--pv-surface)] p-3">
          <div className="mb-2 h-4 w-3/4 rounded bg-[var(--pv-surface-muted)]" />
          <div className="mb-1 h-3 w-full rounded bg-[var(--pv-surface-muted)]" />
          <div className="h-3 w-2/3 rounded bg-[var(--pv-surface-muted)]" />
          <div className="mt-2 flex gap-1">
            <div className="h-4 w-10 rounded bg-[var(--pv-surface-muted)]" />
            <div className="h-4 w-12 rounded bg-[var(--pv-surface-muted)]" />
          </div>
        </div>
      ))}
    </div>
  )
}
