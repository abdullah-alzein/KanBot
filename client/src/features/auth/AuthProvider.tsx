import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as authApi from '../../api/auth'
import { ApiError, setUnauthorizedHandler, tokenStore } from '../../api/client'
import type { User } from '../../types/api'
import { AuthContext, type AuthStatus, type AuthValue } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient()
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>(() => (tokenStore.get() ? 'loading' : 'guest'))
  const [sessionExpired, setSessionExpired] = useState(false)

  // Any 401 outside the login request ends the session.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      tokenStore.clear()
      qc.clear()
      setUser(null)
      setStatus('guest')
      setSessionExpired(true)
    })
    return () => setUnauthorizedHandler(null)
  }, [qc])

  // Restore the session on startup.
  useEffect(() => {
    if (!tokenStore.get()) return
    let cancelled = false
    authApi
      .me()
      .then((r) => {
        if (cancelled) return
        setUser(r.user)
        setStatus('authed')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 401) {
          tokenStore.clear()
          setStatus('guest')
        } else {
          setStatus('error')
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const startSession = useCallback((token: string, u: User) => {
    tokenStore.set(token)
    setUser(u)
    setStatus('authed')
    setSessionExpired(false)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const r = await authApi.login({ email, password })
      startSession(r.token, r.user)
    },
    [startSession],
  )

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const r = await authApi.register({ name, email, password })
      startSession(r.token, r.user)
    },
    [startSession],
  )

  const logout = useCallback(() => {
    tokenStore.clear()
    qc.clear()
    setUser(null)
    setStatus('guest')
    setSessionExpired(false)
  }, [qc])

  const value = useMemo<AuthValue>(
    () => ({ user, status, sessionExpired, login, register, logout }),
    [user, status, sessionExpired, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
