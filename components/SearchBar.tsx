import { useRef, useEffect } from "react"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="relative">
      <svg
        className="absolute left-1.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-[var(--pv-text-muted)] opacity-50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search..."
        className="pv-focus h-5 w-full rounded-md border border-transparent bg-[var(--pv-surface)] pl-6 pr-5 text-[10px] text-[var(--pv-text)] placeholder:text-[var(--pv-text-muted)] placeholder:opacity-60 transition-colors hover:border-[var(--pv-border)] focus:border-[var(--pv-border)]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-0.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-[var(--pv-text-muted)] opacity-50 transition-opacity hover:opacity-100">
          <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
