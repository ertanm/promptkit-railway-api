import type { SiteConfig } from "./sites.config"

export function findInputElement(config: SiteConfig): HTMLElement | null {
  const selectors = [config.inputSelector, ...(config.fallbackSelectors ?? [])]
  for (const selector of selectors) {
    const el = document.querySelector<HTMLElement>(selector)
    if (el) return el
  }
  return null
}

export function injectText(element: HTMLElement, text: string, inputType: SiteConfig["inputType"]) {
  switch (inputType) {
    case "textarea":
      injectIntoTextarea(element as HTMLTextAreaElement, text)
      break
    case "contenteditable":
      injectIntoContentEditable(element, text)
      break
    case "prosemirror":
      injectIntoProseMirror(element, text)
      break
  }
}

function injectIntoTextarea(el: HTMLTextAreaElement, text: string) {
  el.focus()
  el.value = text
  el.dispatchEvent(new Event("input", { bubbles: true }))
  el.dispatchEvent(new Event("change", { bubbles: true }))
  el.setSelectionRange(text.length, text.length)
}

function injectIntoContentEditable(el: HTMLElement, text: string) {
  el.focus()
  el.textContent = ""

  const textNode = document.createTextNode(text)
  el.appendChild(textNode)

  el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }))

  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(false)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}

function injectIntoProseMirror(el: HTMLElement, text: string) {
  el.focus()
  while (el.firstChild) {
    el.removeChild(el.firstChild)
  }
  const paragraphs = text.split("\n")
  for (const paragraph of paragraphs) {
    const p = document.createElement("p")
    p.textContent = paragraph
    el.appendChild(p)
  }
  el.dispatchEvent(
    new InputEvent("input", { 
      bubbles: true, 
      inputType: "insertText", 
      data: text 
    })
  )
  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(false)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}
