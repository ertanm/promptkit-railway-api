interface TabNavProps {
  tabs: { label: string; count: number }[]
  activeTab: string
  onTabChange: (label: string) => void
}

export function TabNav({ tabs, activeTab, onTabChange }: TabNavProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto py-1.5">
      {tabs.map((tab) => {
        const isActive = tab.label === activeTab
        return (
          <button
            key={tab.label}
            type="button"
            onClick={() => onTabChange(tab.label)}
            className={`pv-focus flex whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors ${
              isActive
                ? "border-[color:color-mix(in_srgb,var(--pv-accent)_45%,transparent)] bg-[color:color-mix(in_srgb,var(--pv-accent-soft)_85%,transparent)] text-[var(--pv-accent-strong)]"
                : "border-[var(--pv-border)] bg-[var(--pv-surface)] text-[var(--pv-text-muted)] hover:text-[var(--pv-text)]"
            }`}>
            <span>{tab.label}</span>
            <span
              className={`inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] ${
                isActive
                  ? "bg-[color:color-mix(in_srgb,var(--pv-accent)_30%,transparent)] text-[var(--pv-text)]"
                  : "bg-[var(--pv-surface-muted)] text-[var(--pv-text-muted)]"
              }`}>
              {tab.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
