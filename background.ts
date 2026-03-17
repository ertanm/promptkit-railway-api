export {}

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
    (message as { body: string }).body.length <= 10000
  )
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

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0]
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, message)
      window.close?.()
    }
  })
  sendResponse({ ok: true })
  return true
})

chrome.commands?.onCommand?.addListener((command) => {
  if (command === "open-promptvault") {
    chrome.action.openPopup()
  }
})
