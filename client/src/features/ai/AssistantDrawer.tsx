import { ListPlus, RotateCcw, SendHorizontal, Sparkles, Wand2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '../../components/Button'
import { Dialog } from '../../components/Dialog'
import { Markdown } from '../../components/Markdown'
import { useAiStatus } from '../../hooks/useAiStatus'
import type { ChatMessage } from '../../types/api'

interface Props {
  messages: ChatMessage[]
  pending: boolean
  error: Error | null
  onSend: (text: string) => void
  onRetry: () => void
  onReset: () => void
  onClose: () => void
  onGenerate: () => void
  onPlan: () => void
  onSummary: () => void
}

const SUGGESTIONS = ['How is the sprint going?', 'What should I work on next?', 'Which backlog todos are most important?']

export function AssistantDrawer({ messages, pending, error, onSend, onRetry, onReset, onClose, onGenerate, onPlan, onSummary }: Props) {
  const status = useAiStatus()
  const [text, setText] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length, pending, error])

  const submit = () => {
    const t = text.trim()
    if (!t || pending) return
    setText('')
    onSend(t)
  }

  return (
    <Dialog
      title="Ask AI"
      variant="side"
      flush
      onClose={onClose}
      titleExtra={status.data?.mode === 'mock' ? <span className="badge badge-mock" title="No AI key is configured on the server, so answers are rule-based.">Mock AI</span> : undefined}
    >
      <div className="quick-actions">
        <Button size="sm" onClick={onGenerate}>
          <ListPlus size={14} aria-hidden="true" /> Create todos
        </Button>
        <Button size="sm" onClick={onPlan}>
          <Wand2 size={14} aria-hidden="true" /> Plan sprint
        </Button>
        <Button size="sm" onClick={onSummary}>
          <Sparkles size={14} aria-hidden="true" /> Summarize sprint
        </Button>
        {messages.length > 0 && (
          <Button size="sm" variant="ghost" onClick={onReset} disabled={pending}>
            <RotateCcw size={14} aria-hidden="true" /> New chat
          </Button>
        )}
      </div>

      <div className="chat-log" role="log" aria-live="polite" aria-label="Conversation">
        {messages.length === 0 && (
          <div className="chat-empty">
            <p>Ask about your backlog and sprint, or pick a suggestion.</p>
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" className="chip-btn" onClick={() => onSend(s)} disabled={pending}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg chat-${m.role}`}>
            <span className="chat-who">{m.role === 'user' ? 'You' : 'Kanbot'}</span>
            {m.role === 'assistant' ? <Markdown>{m.content}</Markdown> : <p className="chat-text">{m.content}</p>}
          </div>
        ))}
        {pending && (
          <div className="chat-msg chat-assistant" role="status">
            <span className="chat-who">Kanbot</span>
            <p className="chat-thinking">
              <span className="spinner" aria-hidden="true" /> Thinking…
            </p>
          </div>
        )}
        {error && !pending && (
          <div className="banner banner-error" role="alert">
            {error.message}{' '}
            <button type="button" className="link-btn" onClick={onRetry}>
              Try again
            </button>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="chat-input">
        <textarea
          className="input textarea chat-textarea"
          aria-label="Message"
          placeholder="Ask a question… "
          rows={2}
          maxLength={4000}
          value={text}
          autoFocus
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              submit()
            }
          }}
        />
        <Button variant="primary" onClick={submit} disabled={!text.trim() || pending} aria-label="Send message">
          <SendHorizontal size={16} aria-hidden="true" />
        </Button>
      </div>
      <p className="muted disclaimer">AI can make mistakes. Review before saving.</p>
    </Dialog>
  )
}
