import { useMemo, useState, type ReactNode } from 'react'
import { AiContext, type AiActions } from './ai-context'
import { AiPanels } from './AiPanels'

type Panel = 'assistant' | 'generate' | 'plan' | 'summary' | null

/** Owns which AI panel is open. Chat state lives in AiPanels, which is re-mounted per project so it resets on project switch. */
export function AiProvider({ projectId, children }: { projectId: string | undefined; children: ReactNode }) {
  const [panel, setPanel] = useState<Panel>(null)
  const enabled = !!projectId

  const value = useMemo<AiActions>(
    () => ({
      enabled,
      openAssistant: () => setPanel('assistant'),
      openGenerate: () => setPanel('generate'),
      openPlan: () => setPanel('plan'),
      openSummary: () => setPanel('summary'),
    }),
    [enabled],
  )

  return (
    <AiContext.Provider value={value}>
      {children}
      {projectId && <AiPanels key={projectId} projectId={projectId} panel={panel} setPanel={setPanel} />}
    </AiContext.Provider>
  )
}
