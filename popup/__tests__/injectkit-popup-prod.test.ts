import fs from "fs"
import path from "path"
import { describe, expect, it } from "vitest"

const prodDir = path.resolve(__dirname, "../../build/chrome-mv3-prod")
const hasProdBuild = fs.existsSync(path.join(prodDir, "popup.html"))

/**
 * Run after `npm run build:prod`. These tests are skipped when the prod output
 * folder is missing (e.g. fresh clone). CI / release: build first, then test.
 */
describe.skipIf(!hasProdBuild)("chrome-mv3-prod popup CSS pipeline", () => {
  it("popup.html links a hashed popup stylesheet next to the HTML", () => {
    const html = fs.readFileSync(path.join(prodDir, "popup.html"), "utf8")
    const hrefMatch = html.match(/href="(\/popup\.[^"]+\.css)"/)
    expect(hrefMatch).toBeTruthy()
    const href = hrefMatch![1]
    expect(href).toMatch(/^\/popup\.[a-f0-9]+\.css$/i)

    const cssFileName = href.replace(/^\//, "")
    const cssPath = path.join(prodDir, cssFileName)
    expect(fs.existsSync(cssPath)).toBe(true)
  })

  it("extracted popup CSS is non-empty and contains --pv variables used by Tailwind", () => {
    const html = fs.readFileSync(path.join(prodDir, "popup.html"), "utf8")
    const hrefMatch = html.match(/href="(\/popup\.[^"]+\.css)"/)
    expect(hrefMatch).toBeTruthy()
    const cssFileName = hrefMatch![1].replace(/^\//, "")
    const cssPath = path.join(prodDir, cssFileName)
    const css = fs.readFileSync(cssPath, "utf8")

    expect(css.length).toBeGreaterThan(2000)
    expect(css).toContain("--pv-bg:")
    expect(css).toContain("--pv-text:")
    expect(css).toContain("var(--pv-bg)")
    expect(css).toContain("body")
  })

  it("popup bundle does not embed localhost API URL (production hygiene)", () => {
    const files = fs.readdirSync(prodDir).filter((f) => f.startsWith("popup.") && f.endsWith(".js"))
    expect(files.length).toBeGreaterThan(0)
    for (const f of files) {
      const js = fs.readFileSync(path.join(prodDir, f), "utf8")
      expect(js).not.toContain("localhost:3000")
    }
  })

  it("popup bundle does not include Parcel's broken zod subpath stub (would crash: z.string is not a function)", () => {
    const files = fs.readdirSync(prodDir).filter((f) => f.startsWith("popup.") && f.endsWith(".js"))
    expect(files.length).toBeGreaterThan(0)
    for (const f of files) {
      const js = fs.readFileSync(path.join(prodDir, f), "utf8")
      expect(js).not.toContain('./v3/external.js":!1')
    }
  })
})
