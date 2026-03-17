import { useState } from "react"
import type { Prompt } from "~lib/api"

interface PromptCardProps {
  prompt: Prompt
  isSelected: boolean
  onSelect: () => void
  onCopy: () => void
  onInject: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function PromptCard({
  prompt,
  isSelected,
  onSelect,
  onCopy,
  onInject,
  onEdit,
  onDelete,
}: PromptCardProps) {
  const [copied, setCopied] = useState(false)
  const preview = prompt.body.length > 130 ? `${prompt.body.slice(0, 130)}...` : prompt.body

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter") onInject()
        if (e.key === " ") {
          e.preventDefault()
          onSelect()
        }
      }}
      className={`relative cursor-pointer rounded-xl border p-3.5 transition-colors ${
        isSelected
          ? "border-[color:color-mix(in_srgb,var(--pv-accent)_42%,transparent)] bg-[color:color-mix(in_srgb,var(--pv-accent-soft)_75%,transparent)] shadow-sm shadow-[color:color-mix(in_srgb,var(--pv-accent)_20%,transparent)]"
          : "border-[var(--pv-border)] bg-[var(--pv-surface)] hover:bg-[var(--pv-surface-muted)]"
      }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-[var(--pv-text)]">
            {prompt.title}
          </h3>
          <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-[var(--pv-text-muted)]">
            {preview}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            title="Copy to clipboard"
            className="pv-focus rounded-md p-1.5 text-[var(--pv-text-muted)] transition-colors hover:bg-[var(--pv-surface-muted)] hover:text-[var(--pv-text)]">
            {copied ? (
              <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              title="Edit prompt"
              className="pv-focus rounded-md p-1.5 text-[var(--pv-text-muted)] transition-colors hover:bg-[var(--pv-surface-muted)] hover:text-[var(--pv-text)]">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.1 2.1 0 112.97 2.97L7.5 18.79 3 20l1.21-4.5 12.652-12.013z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              title="Delete prompt"
              className="pv-focus rounded-md p-1.5 text-[var(--pv-text-muted)] transition-colors hover:bg-red-500/15 hover:text-red-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0h8m-9 0a1 1 0 011-1h6a1 1 0 011 1" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {prompt.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-[var(--pv-border)] bg-[var(--pv-surface-muted)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--pv-text-muted)]">
              {tag}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onInject()
          }}
          title="Inject into chat"
          className="pv-focus inline-flex items-center gap-1.5 rounded-full bg-[color:color-mix(in_srgb,var(--pv-accent-soft)_90%,transparent)] px-2.5 py-1 text-[11px] font-medium text-[var(--pv-accent-strong)] transition-colors hover:bg-[var(--pv-accent)] hover:text-white">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <span>Inject</span>
        </button>
      </div>
    </div>
  )
}
