import { AssistantDrawer } from './AssistantDrawer'
import { GenerateTodosDialog } from './GenerateTodosDialog'
import { PlanSprintDialog } from './PlanSprintDialog'
import { SummarizeSprintDialog } from './SummarizeSprintDialog'
import { useChat } from './useChat'

type Panel = 'assistant' | 'generate' | 'plan' | 'summary' | null

/** Rendered with key={projectId}, so the chat is reset whenever the project changes. */
export function AiPanels({ projectId, panel, setPanel }: { projectId: string; panel: Panel; setPanel: (p: Panel) => void }) {
  const chat = useChat(projectId)
  const close = () => setPanel(null)

  return (
    <>
      {panel === 'assistant' && (
        <AssistantDrawer
          messages={chat.messages}
          pending={chat.pending}
          error={chat.error}
          onSend={chat.send}
          onRetry={chat.retry}
          onReset={chat.reset}
          onClose={close}
          onGenerate={() => setPanel('generate')}
          onPlan={() => setPanel('plan')}
          onSummary={() => setPanel('summary')}
        />
      )}
      {panel === 'generate' && <GenerateTodosDialog projectId={projectId} onClose={close} />}
      {panel === 'plan' && <PlanSprintDialog projectId={projectId} onClose={close} />}
      {panel === 'summary' && <SummarizeSprintDialog projectId={projectId} onClose={close} />}
    </>
  )
}
