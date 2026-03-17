import { describe, expect, it, vi } from "vitest"
import { injectText } from "./inject"
import type { SiteConfig } from "./sites.config"

describe("injectText", () => {
  it("does not create HTML elements when injecting into textarea", () => {
    const textarea = document.createElement("textarea")
    const config = { inputType: "textarea" } as SiteConfig

    injectText(textarea as unknown as HTMLElement, "<b>test</b>", config.inputType)

    expect(textarea.value).toBe("<b>test</b>")
  })

  it("does not treat text as HTML when injecting into contenteditable", () => {
    const div = document.createElement("div")
    div.contentEditable = "true"
    const config = { inputType: "contenteditable" } as SiteConfig

    injectText(div, "<b>test</b>", config.inputType)

    expect(div.textContent).toBe("<b>test</b>")
    expect(div.querySelector("b")).toBeNull()
  })

  it("splits prose mirror content into paragraphs without interpreting HTML", () => {
    const div = document.createElement("div")
    const config = { inputType: "prosemirror" } as SiteConfig

    injectText(div, "<b>test</b>\nsecond line", config.inputType)

    const paragraphs = Array.from(div.querySelectorAll("p"))
    expect(paragraphs).toHaveLength(2)
    expect(paragraphs[0].textContent).toBe("<b>test</b>")
    expect(paragraphs[1].textContent).toBe("second line")
    expect(div.querySelector("b")).toBeNull()
  })
}

