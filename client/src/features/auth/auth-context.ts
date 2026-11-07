import { createContext } from 'react'
import type { User } from '../../types/api'

export type AuthStatus = 'loading' | 'authed' | 'guest' | 'error'

export interface AuthValue {
  user: User | null
  status: AuthStatus
  /** True after any non-login 401, so the login page can explain why the user is back there. */
  sessionExpired: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthValue | null>(null)
