import { describe, expect, it, vi, beforeEach } from "vitest"

const chromeStub = {
  runtime: {
    id: "test-extension-id",
    onMessage: { addListener: vi.fn() },
    getManifest: vi.fn(() => ({ content_scripts: [] })),
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
    update: vi.fn((_id: number, _props: any, cb?: () => void) => cb?.()),
  },
  windows: {
    update: vi.fn((_id: number, _props: any, cb?: () => void) => cb?.()),
  },
} as unknown as typeof chrome

Object.assign(globalThis, { chrome: chromeStub })

type Listener = Parameters<typeof chrome.runtime.onMessage.addListener>[0]

describe("background message handler", () => {
  let listener: Listener

  beforeEach(async () => {
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

  it("accepts a valid INJECT_PROMPT message and forwards content script response", async () => {
    const sendResponse = vi.fn()
    const contentScriptResponse = { ok: true }
    const querySpy = vi.fn((_query: any, cb: (tabs: Array<{ id: number; windowId: number; active: boolean }>) => void) => {
      cb([{ id: 1, windowId: 10, active: true }])
    })
    const sendMessageSpy = vi.fn((_tabId: number, _msg: any, cb: (response: any) => void) => {
      cb(contentScriptResponse)
    })

    ;(chrome.tabs.query as unknown as typeof querySpy) = querySpy as any
    ;(chrome.tabs.sendMessage as unknown as typeof sendMessageSpy) = sendMessageSpy as any

    listener?.({ type: "INJECT_PROMPT", body: "ok" }, { id: chrome.runtime.id } as any, sendResponse)

    // Wait for async focusTab + trySend chain
    await vi.waitFor(() => {
      expect(sendResponse).toHaveBeenCalledWith(contentScriptResponse)
    })
    expect(sendMessageSpy).toHaveBeenCalledWith(1, { type: "INJECT_PROMPT", body: "ok" }, expect.any(Function))
  })
})

