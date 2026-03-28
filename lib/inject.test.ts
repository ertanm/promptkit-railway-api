import { describe, expect, it, vi, beforeEach } from "vitest"
import { injectText } from "./inject"
import type { SiteConfig } from "./sites.config"

// Stub DataTransfer and ClipboardEvent for jsdom (not available natively)
class MockDataTransfer {
  private data = new Map<string, string>()
  setData(type: string, val: string) { this.data.set(type, val) }
  getData(type: string) { return this.data.get(type) ?? "" }
}

class MockClipboardEvent extends Event {
  clipboardData: MockDataTransfer
  constructor(type: string, init?: EventInit & { clipboardData?: MockDataTransfer }) {
    super(type, init)
    this.clipboardData = init?.clipboardData ?? new MockDataTransfer()
  }
}

beforeEach(() => {
  ;(globalThis as any).DataTransfer = MockDataTransfer
  ;(globalThis as any).ClipboardEvent = MockClipboardEvent
})

describe("injectText", () => {
  it("does not create HTML elements when injecting into textarea", () => {
    const textarea = document.createElement("textarea")
    const config = { inputType: "textarea" } as SiteConfig

    const result = injectText(textarea as unknown as HTMLElement, "<b>test</b>", config.inputType)

    expect(textarea.value).toBe("<b>test</b>")
    expect(result.ok).toBe(true)
  })

  it("does not inject HTML via paste fallback on contenteditable", () => {
    const div = document.createElement("div")
    div.contentEditable = "true"
    document.body.appendChild(div)
    const config = { inputType: "contenteditable" } as SiteConfig

    // execCommand returns false in jsdom, so the paste fallback fires.
    // If no paste handler calls preventDefault, dispatchSyntheticPaste returns false
    // and the function reports failure — which is the correct safe behavior.
    const result = injectText(div, "<b>test</b>", config.inputType)

    // No raw HTML elements should be created in the DOM
    expect(div.querySelector("b")).toBeNull()
    document.body.removeChild(div)
  })

  it("does not inject HTML via paste fallback on prosemirror", () => {
    const div = document.createElement("div")
    document.body.appendChild(div)
    const config = { inputType: "prosemirror" } as SiteConfig

    const result = injectText(div, "<b>test</b>\nsecond line", config.inputType)

    // No raw HTML elements should be created in the DOM
    expect(div.querySelector("b")).toBeNull()
    expect(div.querySelector("p")).toBeNull()
    document.body.removeChild(div)
  })
})

