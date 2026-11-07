import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { bulkCreateTodos } from '../../api/todos'
import { generateTodos } from '../../api/ai'
import { errorMessage, fieldErrors } from '../../api/client'
import { Button } from '../../components/Button'
import { Dialog } from '../../components/Dialog'
import { TextArea, TextField } from '../../components/Field'
import { useToast } from '../../components/toast/useToast'
import { PRIORITY_LABELS, TYPE_LABELS } from '../../lib/constants'
import { invalidateWorkspace } from '../../lib/queryClient'
import {
  STORY_POINTS,
  TODO_PRIORITIES,
  TODO_TYPES,
  type AiSource,
  type StoryPoints,
  type TodoPriority,
  type TodoType,
} from '../../types/api'

const schema = z.object({
  prompt: z.string().trim().min(3, 'Describe what you want to build (at least 3 characters)').max(2000, 'Keep it under 2000 characters'),
  count: z.string().refine((v) => /^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 10, 'Enter a whole number from 1 to 10'),
})
type Values = z.infer<typeof schema>

interface Draft {
  id: number
  selected: boolean
  title: string
  description: string
  type: TodoType
  priority: TodoPriority
  storyPoints: string
}

export function GenerateTodosDialog({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const navigate = useNavigate()
  const toast = useToast()
  const qc = useQueryClient()
  const [drafts, setDrafts] = useState<Draft[] | null>(null)
  const [source, setSource] = useState<AiSource>('ai')
  const [genError, setGenError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { prompt: '', count: '5' } })

  const generate = handleSubmit(async (v) => {
    setGenError(null)
    try {
      const res = await generateTodos(projectId, { prompt: v.prompt, count: Number(v.count) })
      setSource(res.source)
      setDrafts(
        res.todos.map((t, i) => ({
          id: i,
          selected: true,
          title: t.title,
          description: t.description,
          type: t.type,
          priority: t.priority,
          storyPoints: t.storyPoints === null ? '' : String(t.storyPoints),
        })),
      )
    } catch (err) {
      const fe = fieldErrors(err)
      if (fe.prompt) setError('prompt', { message: fe.prompt })
      else if (fe.count) setError('count', { message: fe.count })
      else setGenError(errorMessage(err))
    }
  })

  const patch = (id: number, change: Partial<Draft>) => setDrafts((ds) => ds?.map((d) => (d.id === id ? { ...d, ...change } : d)) ?? null)
  const chosen = drafts?.filter((d) => d.selected) ?? []

  // Nothing is saved until this runs.
  const save = async () => {
    setSaveError(null)
    if (chosen.some((d) => !d.title.trim())) return setSaveError('Every selected todo needs a title.')
    setSaving(true)
    try {
      await bulkCreateTodos(projectId, {
        todos: chosen.map((d) => ({
          title: d.title.trim(),
          description: d.description,
          type: d.type,
          priority: d.priority,
          storyPoints: d.storyPoints === '' ? null : (Number(d.storyPoints) as StoryPoints),
        })),
      })
      await invalidateWorkspace(qc)
      toast(`Added ${chosen.length} ${chosen.length === 1 ? 'todo' : 'todos'} to the backlog`)
      onClose()
      navigate(`/projects/${projectId}/backlog`)
    } catch (err) {
      setSaveError(errorMessage(err))
      setSaving(false)
    }
  }

  return (
    <Dialog
      title="Generate todos with AI"
      onClose={onClose}
      titleExtra={drafts && source === 'mock' ? <span className="badge badge-mock">Mock AI</span> : undefined}
    >
      {!drafts ? (
        <form onSubmit={generate} noValidate>
          {genError && (
            <div className="banner banner-error" role="alert">
              {genError}{' '}
              <button type="button" className="link-btn" onClick={generate}>
                Try again
              </button>
            </div>
          )}
          <TextArea label="Describe a feature…" rows={4} autoFocus placeholder="e.g. User profile page with avatar upload" error={errors.prompt?.message} {...register('prompt')} />
          <TextField label="How many todos?" type="number" min={1} max={10} error={errors.count?.message} {...register('count')} />
          <p className="muted disclaimer">AI can make mistakes. Review before saving.</p>
          <div className="dialog-footer">
            <Button onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              {isSubmitting ? 'Generating…' : 'Generate'}
            </Button>
          </div>
        </form>
      ) : (
        <div>
          <p className="muted">Review and edit the drafts. Nothing is saved until you add them.</p>
          {saveError && (
            <p className="banner banner-error" role="alert">
              {saveError}
            </p>
          )}
          <ul className="drafts">
            {drafts.map((d, i) => (
              <li key={d.id} className={`draft ${d.selected ? '' : 'draft-off'}`}>
                <label className="draft-check">
                  <input type="checkbox" checked={d.selected} onChange={(e) => patch(d.id, { selected: e.target.checked })} />
                  <span className="sr-only">Include draft {i + 1}</span>
                </label>
                <div className="draft-main">
                  <input className="input" aria-label={`Title of draft ${i + 1}`} value={d.title} maxLength={200} onChange={(e) => patch(d.id, { title: e.target.value })} disabled={!d.selected} />
                  {d.description && <p className="muted draft-desc">{d.description}</p>}
                  <div className="draft-row">
                    <select className="input" aria-label={`Type of draft ${i + 1}`} value={d.type} onChange={(e) => patch(d.id, { type: e.target.value as TodoType })} disabled={!d.selected}>
                      {TODO_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {TYPE_LABELS[t]}
                        </option>
                      ))}
                    </select>
                    <select className="input" aria-label={`Priority of draft ${i + 1}`} value={d.priority} onChange={(e) => patch(d.id, { priority: e.target.value as TodoPriority })} disabled={!d.selected}>
                      {TODO_PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {PRIORITY_LABELS[p]}
                        </option>
                      ))}
                    </select>
                    <select className="input" aria-label={`Story points of draft ${i + 1}`} value={d.storyPoints} onChange={(e) => patch(d.id, { storyPoints: e.target.value })} disabled={!d.selected}>
                      <option value="">No estimate</option>
                      {STORY_POINTS.map((p) => (
                        <option key={p} value={p}>
                          {p} pts
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <p className="muted disclaimer">AI can make mistakes. Review before saving.</p>
          <div className="dialog-footer">
            <Button onClick={() => setDrafts(null)} disabled={saving}>
              Back
            </Button>
            <Button variant="primary" onClick={save} loading={saving} disabled={chosen.length === 0}>
              Add {chosen.length} to backlog
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  )
}
