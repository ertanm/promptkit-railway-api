import type { PlasmoCSConfig } from "plasmo"
import { findSiteConfig } from "~lib/sites.config"
import { findInputElement, injectText } from "~lib/inject"

export const config: PlasmoCSConfig = {
  matches: [
    "https://chat.openai.com/*",
    "https://chatgpt.com/*",
    "https://claude.ai/*",
    "https://v0.dev/*",
    "https://v0.app/*",
  ],
  run_at: "document_idle",
}

const siteConfig = findSiteConfig(window.location.hostname)

/** Match server-side limit (server/schemas.ts allows 20 000 chars). */
const MAX_BODY_LENGTH = 20000

type InjectPromptMessage = {
  type: "INJECT_PROMPT"
  body: string
}

function isInjectPromptMessage(message: unknown): message is InjectPromptMessage {
  return (
    typeof message === "object" &&
    message !== null &&
    (message as { type?: unknown }).type === "INJECT_PROMPT" &&
    typeof (message as { body?: unknown }).body === "string" &&
    (message as { body: string }).body.length > 0 &&
    (message as { body: string }).body.length <= MAX_BODY_LENGTH
  )
}

const OBSERVER_FLAG = "data-injectkit-observer"

function setupObserver() {
  // Prevent duplicate observers when the content script is re-injected
  if (!siteConfig || document.body.hasAttribute(OBSERVER_FLAG)) return
  document.body.setAttribute(OBSERVER_FLAG, "true")

  const observer = new MutationObserver(() => {
    const input = findInputElement(siteConfig)
    if (input) {
      input.dataset.injectkitReady = "true"
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
}

function handleInjectMessage(
  message: unknown,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: { ok: boolean; details?: string }) => void,
): boolean {
  if (sender.id !== chrome.runtime.id) {
    return false
  }

  if (!siteConfig || !isInjectPromptMessage(message)) {
    sendResponse({ ok: false, details: "Invalid message or unsupported site" })
    return false
  }

  const input = findInputElement(siteConfig)
  if (!input) {
    sendResponse({ ok: false, details: `Could not find input element on ${siteConfig.name}` })
    return false
  }

  const result = injectText(input, message.body, siteConfig.inputType)
  sendResponse(result)
  return false
}

if (siteConfig) {
  chrome.runtime.onMessage.addListener(handleInjectMessage)
  setupObserver()
}
