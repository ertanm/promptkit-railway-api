export {}

type InjectPromptMessage = {
  type: "INJECT_PROMPT"
  body: string
}

/** Match server-side limit (server/schemas.ts allows 20 000 chars). */
const MAX_BODY_LENGTH = 20000

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

/** Find the content script entry whose js array includes the inject filename. */
function getInjectScriptFiles(): string[] | undefined {
  const manifest = chrome.runtime.getManifest()
  const entries = manifest.content_scripts ?? []
  const injectEntry = entries.find((cs) =>
    cs.js?.some((file) => file.includes("inject"))
  )
  return (injectEntry?.js as string[] | undefined) ?? (entries[0]?.js as string[] | undefined)
}

/**
 * Give OS-level focus to the target tab's window and activate the tab.
 * This ensures `document.hasFocus() === true` in the target page so that
 * `execCommand("insertText")` actually works.
 */
function focusTab(tab: chrome.tabs.Tab): Promise<void> {
  return new Promise<void>((resolve) => {
    const windowId = tab.windowId
    const tabId = tab.id!
    if (windowId) {
      chrome.windows.update(windowId, { focused: true }, () => {
        chrome.tabs.update(tabId, { active: true }, () => resolve())
      })
    } else {
      chrome.tabs.update(tabId, { active: true }, () => resolve())
    }
  })
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) {
    sendResponse?.({ ok: false, error: "unauthorized_sender" })
    return
  }

  if (!isInjectPromptMessage(message)) {
    sendResponse?.({ ok: false, error: "invalid_message" })
    return
  }

  const urlPatterns = [
    "https://chat.openai.com/*",
    "https://chatgpt.com/*",
    "https://claude.ai/*",
    "https://v0.dev/*",
    "https://v0.app/*",
  ]

  chrome.tabs.query({ url: urlPatterns }, async (tabs) => {
    const tab = tabs.find((t) => t.active) ?? tabs[0]
    const tabId = tab?.id
    if (!tabId || !tab) {
      sendResponse?.({ ok: false, error: "no_tab", details: "Open ChatGPT, Claude, or v0 in a tab first" })
      return
    }

    // Give OS focus to the target tab so execCommand works in the content script
    await focusTab(tab)

    let didInject = false

    function trySend() {
      chrome.tabs.sendMessage(tabId, message, (response?: { ok: boolean; details?: string }) => {
        if (chrome.runtime.lastError) {
          const msg = String(chrome.runtime.lastError?.message ?? "")
          if (!didInject && (msg.includes("Receiving end does not exist") || msg.includes("receiving end"))) {
            didInject = true
            injectAndRetry()
            return
          }
          sendResponse?.({ ok: false, error: "send_failed", details: msg })
          return
        }
        // Forward content script's response back to the popup
        sendResponse?.(response ?? { ok: false, error: "no_response", details: "Content script did not respond" })
      })
    }

    function injectAndRetry() {
      const files = getInjectScriptFiles()
      if (files?.length) {
        chrome.scripting.executeScript({ target: { tabId }, files }, () => {
          if (chrome.runtime.lastError) {
            sendResponse?.({ ok: false, error: "inject_failed", details: String(chrome.runtime.lastError.message) })
            return
          }
          setTimeout(trySend, 50)
        })
      } else {
        sendResponse?.({ ok: false, error: "no_scripts", details: "Could not find inject content script in manifest" })
      }
    }

    trySend()
  })
  return true
})

chrome.commands?.onCommand?.addListener((command) => {
  if (command === "open-injectkit") {
    chrome.action.openPopup()
  }
})
