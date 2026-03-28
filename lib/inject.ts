import type { SiteConfig } from "./sites.config"

export type InjectResult = { ok: true } | { ok: false; details: string }

export function findInputElement(config: SiteConfig): HTMLElement | null {
  const selectors = [config.inputSelector, ...(config.fallbackSelectors ?? [])]
  for (const selector of selectors) {
    const el = document.querySelector<HTMLElement>(selector)
    if (el) return el
  }
  return null
}

export function injectText(element: HTMLElement, text: string, inputType: SiteConfig["inputType"]): InjectResult {
  const resolvedType = resolveInputType(element, inputType)
  switch (resolvedType) {
    case "textarea":
      return injectIntoTextarea(element as HTMLTextAreaElement, text)
    case "contenteditable":
      return injectIntoContentEditable(element, text)
    case "prosemirror":
      return injectIntoProseMirror(element, text)
  }
}

function resolveInputType(el: HTMLElement, configured: SiteConfig["inputType"]): SiteConfig["inputType"] {
  if (el instanceof HTMLTextAreaElement) return "textarea"
  if (el.getAttribute("contenteditable") === "true") {
    return el.classList.contains("ProseMirror") ? "prosemirror" : "contenteditable"
  }
  return configured
}

function injectIntoTextarea(el: HTMLTextAreaElement, text: string): InjectResult {
  el.focus()
  el.value = text
  el.dispatchEvent(new Event("input", { bubbles: true }))
  el.dispatchEvent(new Event("change", { bubbles: true }))
  el.setSelectionRange(text.length, text.length)
  return { ok: true }
}

function injectIntoContentEditable(el: HTMLElement, text: string): InjectResult {
  el.focus()
  selectAllContents(el)
  const inserted = document.execCommand?.("insertText", false, text)
  if (inserted) {
    placeCaretAtEnd(el)
    return { ok: true }
  }
  // Fallback: synthetic paste event — lets React/ProseMirror reconcile via their paste handler
  const pasted = dispatchSyntheticPaste(el, text)
  if (pasted) {
    placeCaretAtEnd(el)
    return { ok: true }
  }
  return { ok: false, details: "execCommand and paste fallback both failed on contenteditable" }
}

function injectIntoProseMirror(el: HTMLElement, text: string): InjectResult {
  el.focus()
  selectAllContents(el)
  const inserted = document.execCommand?.("insertText", false, text)
  if (inserted) {
    placeCaretAtEnd(el)
    return { ok: true }
  }
  // Fallback: synthetic paste event — ProseMirror's paste handler updates EditorState correctly
  const pasted = dispatchSyntheticPaste(el, text)
  if (pasted) {
    placeCaretAtEnd(el)
    return { ok: true }
  }
  return { ok: false, details: "execCommand and paste fallback both failed on ProseMirror" }
}

function selectAllContents(el: HTMLElement) {
  const range = document.createRange()
  range.selectNodeContents(el)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}

function placeCaretAtEnd(el: HTMLElement) {
  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(false)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}

/**
 * Dispatches a synthetic paste event with a DataTransfer containing the text.
 * React and ProseMirror both listen for paste events and update their internal
 * state through the clipboard handler — unlike raw DOM mutations, this keeps
 * the framework state in sync.
 */
function dispatchSyntheticPaste(el: HTMLElement, text: string): boolean {
  const dt = new DataTransfer()
  dt.setData("text/plain", text)
  const pasteEvent = new ClipboardEvent("paste", {
    bubbles: true,
    cancelable: true,
    clipboardData: dt,
  })
  // If the paste event is cancelled (preventDefault called), the framework handled it
  const cancelled = !el.dispatchEvent(pasteEvent)
  return cancelled
}
