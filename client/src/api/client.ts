import type { ApiErrorBody, ErrorCode } from '../types/api'

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000/api'
const TOKEN_KEY = 'kanbot.token'

/** The JWT is the only thing stored client-side. Never log it. */
export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      /* storage unavailable: session lasts until reload */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* ignore */
    }
  },
}

export type ApiErrorCode = ErrorCode | 'NETWORK_ERROR'
export type ApiErrorDetails = { path: string; message: string }[]

export class ApiError extends Error {
  status: number
  code: ApiErrorCode
  details?: ApiErrorDetails

  constructor(status: number, code: ApiErrorCode, message: string, details?: ApiErrorDetails) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE'

let unauthorizedHandler: (() => void) | null = null
/** Registered by AuthProvider: clears the session when any non-login request returns 401. */
export function setUnauthorizedHandler(fn: (() => void) | null) {
  unauthorizedHandler = fn
}

export async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = tokenStore.get()
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(BASE_URL + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server. Is it running?')
  }

  if (res.status === 204) return undefined as T

  const text = await res.text()
  let json: unknown = null
  if (text) {
    try {
      json = JSON.parse(text)
    } catch {
      json = null
    }
  }

  if (!res.ok) {
    const e = (json as ApiErrorBody | null)?.error
    const err = new ApiError(
      res.status,
      e?.code ?? 'INTERNAL_ERROR',
      e?.message ?? 'Something went wrong. Please try again.',
      e?.details,
    )
    if (res.status === 401 && path !== '/auth/login') unauthorizedHandler?.()
    throw err
  }
  return json as T
}

/** Maps `details[]` to `{ [field]: message }` (first message per top-level field). */
export function fieldErrors(err: unknown): Record<string, string> {
  const out: Record<string, string> = {}
  if (err instanceof ApiError && err.details) {
    for (const d of err.details) {
      const root = d.path.split('.')[0] ?? d.path
      if (root && !(root in out)) out[root] = d.message
    }
  }
  return out
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong. Please try again.'
}
