import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { planSprint } from '../../api/ai'
import { errorMessage, fieldErrors } from '../../api/client'
import { Button } from '../../components/Button'
import { Dialog } from '../../components/Dialog'
import { TextField } from '../../components/Field'
import { PointsBadge, PriorityBadge } from '../../components/Badges'
import { LoadingState } from '../../components/states'
import { useToast } from '../../components/toast/useToast'
import { useCreateSprint } from '../../hooks/useSprints'
import { useBacklog } from '../../hooks/useTodos'
import type { PlanSprintResponse } from '../../types/api'

const schema = z.object({
  capacity: z.string().refine((v) => /^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 200, 'Enter a whole number from 1 to 200'),
  focus: z.string().trim().max(300, 'Keep the focus under 300 characters'),
})
type Values = z.infer<typeof schema>

interface Plan extends PlanSprintResponse {
  capacity: number
}

export function PlanSprintDialog({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const navigate = useNavigate()
  const toast = useToast()
  const createSprint = useCreateSprint(projectId)
  const backlog = useBacklog(projectId, { search: '', priority: '', type: '' })
  const [plan, setPlan] = useState<Plan | null>(null)
  const [goal, setGoal] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [genError, setGenError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { capacity: '', focus: '' } })

  const suggest = handleSubmit(async (v) => {
    setGenError(null)
    try {
      const res = await planSprint(projectId, { capacity: Number(v.capacity), ...(v.focus ? { focus: v.focus } : {}) })
      setPlan({ ...res, capacity: Number(v.capacity) })
      setGoal(res.goal)
      setSelected(res.todoIds)
    } catch (err) {
      const fe = fieldErrors(err)
      if (fe.capacity) setError('capacity', { message: fe.capacity })
      else if (fe.focus) setError('focus', { message: fe.focus })
      else setGenError(errorMessage(err))
    }
  })

  // The model only returns ids: match them against the backlog we already have.
  const byId = new Map((backlog.data ?? []).map((t) => [t.id, t]))
  const suggested = (plan?.todoIds ?? []).map((id) => byId.get(id)).filter((t) => t !== undefined)
  const chosen = suggested.filter((t) => selected.includes(t.id))
  const total = chosen.reduce((n, t) => n + (t.storyPoints ?? 0), 0)
  const over = plan ? total > plan.capacity : false

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  // The sprint is only created here, after the user confirms.
  const create = async () => {
    setSaveError(null)
    setSaving(true)
    try {
      const sprint = await createSprint.mutateAsync({ goal: goal.trim(), todoIds: chosen.map((t) => t.id) })
      toast(`Created ${sprint.name} with ${chosen.length} ${chosen.length === 1 ? 'todo' : 'todos'}`)
      onClose()
      navigate(`/projects/${projectId}/backlog`)
    } catch (err) {
      setSaveError(errorMessage(err))
      setSaving(false)
    }
  }

  return (
    <Dialog title="Plan a sprint with AI" onClose={onClose} titleExtra={plan?.source === 'mock' ? <span className="badge badge-mock">Mock AI</span> : undefined}>
      {!plan ? (
        <form onSubmit={suggest} noValidate>
          {genError && (
            <div className="banner banner-error" role="alert">
              {genError}{' '}
              <button type="button" className="link-btn" onClick={suggest}>
                Try again
              </button>
            </div>
          )}
          <TextField label="Capacity (story points)" type="number" min={1} max={200} autoFocus hint="How many points can you finish in this sprint?" error={errors.capacity?.message} {...register('capacity')} />
          <TextField label="Focus (optional)" placeholder="e.g. AI features" error={errors.focus?.message} {...register('focus')} />
          <p className="muted disclaimer">AI can make mistakes. Review before saving.</p>
          <div className="dialog-footer">
            <Button onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              {isSubmitting ? 'Planning…' : 'Suggest plan'}
            </Button>
          </div>
        </form>
      ) : (
        <div>
          {saveError && (
            <p className="banner banner-error" role="alert">
              {saveError}
            </p>
          )}
          <TextField label="Sprint goal" value={goal} maxLength={300} onChange={(e) => setGoal(e.target.value)} />
          <p className="plan-reasoning">{plan.reasoning}</p>
          <p className={`plan-total ${over ? 'plan-over' : ''}`} aria-live="polite">
            {total} / {plan.capacity} pts selected{over ? ' (over capacity)' : ''}
          </p>
          {backlog.isPending && <LoadingState label="Loading backlog…" />}
          {backlog.data && suggested.length === 0 && <p className="muted">The AI didn't find backlog todos that fit. Estimate more todos or raise the capacity.</p>}
          <ul className="plan-list">
            {suggested.map((t) => (
              <li key={t.id}>
                <label className="plan-item">
                  <input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggle(t.id)} />
                  <span className="todo-key">{t.key}</span>
                  <span className="plan-title">{t.title}</span>
                  <PriorityBadge priority={t.priority} />
                  <PointsBadge points={t.storyPoints} />
                </label>
              </li>
            ))}
          </ul>
          <p className="muted disclaimer">AI can make mistakes. Review before saving.</p>
          <div className="dialog-footer">
            <Button onClick={() => setPlan(null)} disabled={saving}>
              Back
            </Button>
            <Button variant="primary" onClick={create} loading={saving}>
              Create sprint with {chosen.length} {chosen.length === 1 ? 'todo' : 'todos'}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  )
}
