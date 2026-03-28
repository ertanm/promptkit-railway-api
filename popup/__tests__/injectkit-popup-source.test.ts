import fs from "fs"
import path from "path"
import { describe, expect, it } from "vitest"

const root = path.resolve(__dirname, "../..")

describe("InjectKit popup source (design tokens & entry)", () => {
  it("imports global styles before any React component in popup.tsx", () => {
    const src = fs.readFileSync(path.join(root, "popup.tsx"), "utf8")
    const firstImport = src
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.startsWith("import "))
    expect(firstImport).toMatch(/^import\s+["']~style\.css["']/)
  })

  it("defines core --pv-* tokens in style.css", () => {
    const css = fs.readFileSync(path.join(root, "style.css"), "utf8")
    expect(css).toMatch(/--pv-bg:\s*#0c0a09/)
    expect(css).toMatch(/--pv-text:\s*#fafaf9/)
    expect(css).toMatch(/--pv-accent:\s*#f59e0b/)
  })

  it("keeps Popup.tsx inline text fallback in sync with style.css --pv-text (body supplies bg gradient)", () => {
    const popuptsx = fs.readFileSync(path.join(root, "popup/Popup.tsx"), "utf8")
    const css = fs.readFileSync(path.join(root, "style.css"), "utf8")
    const fg = css.match(/--pv-text:\s*([^;]+)/)?.[1]?.trim()
    expect(fg).toBeDefined()
    expect(popuptsx).toContain(`color: "${fg}"`)
  })
})
