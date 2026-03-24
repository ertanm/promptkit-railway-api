import type { Space } from "~lib/api"

interface SpaceSelectorProps {
  spaces: Space[]
  selectedId: string | null
  onChange: (id: string | null) => void
  className?: string
}

export function SpaceSelector({ spaces, selectedId, onChange, className = "" }: SpaceSelectorProps) {
  return (
    <div className={`relative ${className}`}>
      <svg
        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--pv-accent)]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
        />
      </svg>
      <select
        value={selectedId ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="h-8 w-full min-w-0 cursor-pointer appearance-none rounded-lg border border-[var(--pv-border)] bg-[var(--pv-surface-muted)] pl-7.5 pr-7 text-xs font-medium text-[var(--pv-text)] outline-none transition-colors hover:border-[#F59E0B]/40 focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30"
        style={{ paddingLeft: "1.75rem" }}>
        <option value="">All Spaces</option>
        {spaces.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[var(--pv-text-muted)]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}
