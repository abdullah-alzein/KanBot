import { createContext } from 'react'

export interface AiActions {
  /** False outside a project (no assistant without a project). */
  enabled: boolean
  openAssistant: () => void
  openGenerate: () => void
  openPlan: () => void
  openSummary: () => void
}

export const AiContext = createContext<AiActions>({
  enabled: false,
  openAssistant: () => undefined,
  openGenerate: () => undefined,
  openPlan: () => undefined,
  openSummary: () => undefined,
})
