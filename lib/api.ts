const RAW_API_BASE = process.env.PLASMO_PUBLIC_API_URL ?? "http://localhost:3000"

if (
  !RAW_API_BASE.startsWith("http://localhost:") &&
  !RAW_API_BASE.startsWith("https://")
) {
  throw new Error("PLASMO_PUBLIC_API_URL must use https in production")
}
const API_BASE = RAW_API_BASE.replace(/\/+$/, "")

function resolveApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  if (API_BASE.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    return `${API_BASE}${normalizedPath.slice(4)}`
  }
  return `${API_BASE}${normalizedPath}`
}

export type Space = { id: string; name: string; userId: string; createdAt: string }
export type Prompt = {
  id: string
  title: string
  body: string
  tags: string[]
  spaceId: string
  createdAt: string
  updatedAt: string
}

type PromptListResponse = { data: Prompt[]; nextCursor?: string }

let _getToken: (() => Promise<string | null>) | null = null

export function setTokenGetter(fn: () => Promise<string | null>) {
  _getToken = fn
}

async function authHeaders(): Promise<HeadersInit> {
  if (!_getToken) return {}
  const token = await _getToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = {
    ...((init?.headers as Record<string, string>) ?? {}),
    ...(await authHeaders()),
  }
  const res = await fetch(resolveApiUrl(path), { ...init, headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.error ?? `Request failed: ${res.status}`)
  }
  return res
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function fetchSpaces(): Promise<Space[]> {
  const res = await apiFetch("/api/spaces")
  return res.json()
}

export async function fetchPrompts(spaceId: string): Promise<Prompt[]> {
  const res = await apiFetch(`/api/spaces/${spaceId}/prompts`)
  const payload = (await res.json()) as PromptListResponse | Prompt[]
  if (Array.isArray(payload)) return payload
  return payload.data
}

export async function createSpace(name: string): Promise<Space> {
  const res = await apiFetch("/api/spaces", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  return res.json()
}

export async function updateSpace(id: string, name: string): Promise<Space> {
  const res = await apiFetch(`/api/spaces/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  return res.json()
}

export async function deleteSpace(id: string): Promise<void> {
  await apiFetch(`/api/spaces/${id}`, { method: "DELETE" })
}

export async function createPrompt(data: {
  title: string
  body: string
  spaceId: string
  tags?: string[]
}): Promise<Prompt> {
  const res = await apiFetch("/api/prompts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function updatePrompt(
  id: string,
  data: { title?: string; body?: string; tags?: string[] },
): Promise<Prompt> {
  const res = await apiFetch(`/api/prompts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deletePrompt(id: string): Promise<void> {
  await apiFetch(`/api/prompts/${id}`, { method: "DELETE" })
}
