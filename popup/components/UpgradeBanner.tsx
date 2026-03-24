import "~style.css"

type UpgradeBannerProps = {
  feature: string
}

export function UpgradeBanner({ feature }: UpgradeBannerProps) {
  const handleUpgrade = async () => {
    const base = process.env.PLASMO_PUBLIC_API_URL
    if (typeof base !== "string" || base.length === 0) {
      return
    }
    const normalized = base.replace(/\/$/, "")
    try {
      const result = await chrome.storage.local.get("token")
      const token = result.token
      if (typeof token !== "string") {
        return
      }
      chrome.tabs.create({
        url: `${normalized}/billing/upgrade?token=${encodeURIComponent(token)}`,
      })
    } catch {
      // ignore
    }
  }

  return (
    <div className="rounded-xl border border-[#F59E0B]/20 bg-[#F59E0B]/5 p-4">
      <h2 className="text-sm font-semibold text-[var(--pv-text)]">Upgrade to Pro</h2>
      <p className="mt-1 text-xs text-[var(--pv-text-muted)]">
        Unlock {feature} and all Pro features.
      </p>
      <div className="shimmer-button mt-3 w-full rounded-lg">
        <button
          type="button"
          onClick={() => void handleUpgrade()}
          className="pv-button-primary pv-focus relative z-[1] w-full rounded-lg py-2 text-sm font-semibold text-[var(--pv-primary-foreground)]">
          Upgrade
        </button>
      </div>
    </div>
  )
}
