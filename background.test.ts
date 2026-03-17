import { describe, expect, it, vi, beforeEach } from "vitest"

type Listener = Parameters<typeof chrome.runtime.onMessage.addListener>[0]

describe("background message handler", () => {
  let listener: Listener

  beforeEach(async () => {
    // Reload the background module to re-register the listener
    vi.resetModules()
    const onMessageSpy = vi.fn<(cb: Listener) => void>((cb) => {
      listener = cb
    })

    ;(chrome.runtime.onMessage.addListener as unknown as typeof onMessageSpy) = onMessageSpy as any

    await import("./background")
  })

  it("rejects messages from other extensions", () => {
    const sendResponse = vi.fn()

    listener?.({ type: "INJECT_PROMPT", body: "test" }, { id: "other-extension" } as any, sendResponse)

    expect(sendResponse).toHaveBeenCalledWith({ ok: false, error: "unauthorized_sender" })
  })

  it("rejects invalid message shapes", () => {
    const sendResponse = vi.fn()

    listener?.({ type: "INJECT_PROMPT" }, { id: chrome.runtime.id } as any, sendResponse)

    expect(sendResponse).toHaveBeenCalledWith({ ok: false, error: "invalid_message" })
  })

  it("accepts a valid INJECT_PROMPT message from this extension", () => {
    const sendResponse = vi.fn()
    const querySpy = vi.fn((_query, cb: (tabs: Array<{ id: number }>) => void) => {
      cb([{ id: 1 }])
    })
    const sendMessageSpy = vi.fn()

    ;(chrome.tabs.query as unknown as typeof querySpy) = querySpy as any
    ;(chrome.tabs.sendMessage as unknown as typeof sendMessageSpy) = sendMessageSpy as any

    listener?.({ type: "INJECT_PROMPT", body: "ok" }, { id: chrome.runtime.id } as any, sendResponse)

    expect(sendResponse).toHaveBeenCalledWith({ ok: true })
    expect(sendMessageSpy).toHaveBeenCalledWith(1, { type: "INJECT_PROMPT", body: "ok" })
  })
})

