import { Loader2 } from "lucide-react"
import { useCallback, useState, type CSSProperties } from "react"
import { App } from "~components/App"
import { isTokenExpired, useAuth } from "~popup/hooks/useAuth"
import { Login } from "~popup/pages/Login"
import { Signup } from "~popup/pages/Signup"

/** Solid surface for main app (matches `App` chrome). Auth/loading stay transparent so `body` gradients show. */
const popupAppShellClassName =
  "min-h-[600px] w-[400px] bg-[var(--pv-bg)] text-[var(--pv-text)]"

/** No background — lets `style.css` body radial “shine” show through. */
const popupAuthShellClassName = "min-h-[600px] w-[400px] bg-transparent text-[var(--pv-text)]"

const popupTextStyle: CSSProperties = {
  color: "#fafaf9",
}

type AuthView = "login" | "signup"

type ViewState = "loading" | "auth" | "app"

export function Popup() {
  const { token, loading, setToken, clearToken } = useAuth()
  const [authView, setAuthView] = useState<AuthView>("login")

  const viewState: ViewState = loading
    ? "loading"
    : !token || isTokenExpired(token)
      ? "auth"
      : "app"

  const handleSignOut = useCallback(async () => {
    await clearToken()
    try {
      await chrome.storage.local.remove("injectkit_user")
    } catch {
      // ignore
    }
  }, [clearToken])

  if (viewState === "loading") {
    return (
      <div
        className={`flex h-[600px] w-[400px] items-center justify-center ${popupAuthShellClassName}`}
        style={popupTextStyle}>
        <Loader2 className="h-5 w-5 animate-spin text-[var(--pv-text-muted)]" aria-hidden />
      </div>
    )
  }

  if (viewState === "auth") {
    if (authView === "signup") {
      return (
        <div className={popupAuthShellClassName} style={popupTextStyle}>
          <Signup
            onSuccess={async (t) => {
              await setToken(t)
            }}
            onSwitchToLogin={() => setAuthView("login")}
          />
        </div>
      )
    }

    return (
      <div className={popupAuthShellClassName} style={popupTextStyle}>
        <Login
          onSuccess={async (t) => {
            await setToken(t)
          }}
          onSwitchToSignup={() => setAuthView("signup")}
        />
      </div>
    )
  }

  return (
    <div className={popupAppShellClassName} style={popupTextStyle}>
      <App onSignOut={() => void handleSignOut()} />
    </div>
  )
}
