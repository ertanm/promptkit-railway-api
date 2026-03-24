/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./popup.tsx",
    "./popup/**/*.tsx",
    "./components/**/*.tsx",
    "./contents/**/*.ts",
    "./lib/**/*.ts",
  ],
  darkMode: "media",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        mono: ['"DM Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        "pv-bg": "var(--pv-bg)",
        "pv-card": "var(--pv-card)",
        "pv-surface": "var(--pv-surface)",
        "pv-surface-muted": "var(--pv-surface-muted)",
        "pv-border": "var(--pv-border)",
        "pv-text": "var(--pv-text)",
        "pv-text-muted": "var(--pv-text-muted)",
        "pv-text-dim": "var(--pv-text-dim)",
        "pv-accent": "var(--pv-accent)",
        "pv-accent-hover": "var(--pv-accent-hover)",
        "pv-accent-strong": "var(--pv-accent-strong)",
        "pv-accent-soft": "var(--pv-accent-soft)",
        "pv-primary-foreground": "var(--pv-primary-foreground)",
        glass: {
          50: "rgba(255, 255, 255, 0.05)",
          100: "rgba(255, 255, 255, 0.10)",
          200: "rgba(255, 255, 255, 0.20)",
        },
      },
      backdropBlur: {
        glass: "16px",
      },
    },
  },
  plugins: [],
}
