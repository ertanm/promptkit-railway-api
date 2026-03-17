/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./popup.tsx", "./components/**/*.tsx", "./contents/**/*.ts", "./lib/**/*.ts"],
  darkMode: "media",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        mono: ['"DM Mono"', "ui-monospace", "monospace"],
      },
      colors: {
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
