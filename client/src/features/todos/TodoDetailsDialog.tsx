import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { errorMessage, fieldErrors } from '../../api/client'
import { Button } from '../../components/Button'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { Dialog } from '../../components/Dialog'
import { SelectField, TextArea, TextField } from '../../components/Field'
import { ErrorState, LoadingState } from '../../components/states'
import { useToast } from '../../components/toast/useToast'
import { PRIORITY_LABELS, STATUS_LABELS, TYPE_LABELS } from '../../lib/constants'
import { useSprints } from '../../hooks/useSprints'
import { useDeleteTodo, useTodo, useUpdateTodo } from '../../hooks/useTodos'
import {
  STORY_POINTS,
  TODO_PRIORITIES,
  TODO_STATUSES,
  TODO_TYPES,
  type Sprint,
  type StoryPoints,
  type Todo,
  type UpdateTodoRequest,
} from '../../types/api'

const parseLabels = (v: string) =>
  v
    .split(',')
    .map((l) => l.trim())
    .filter(Boolean)

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be 200 characters or fewer'),
  description: z.string().max(5000, 'Description must be 5000 characters or fewer'),
  type: z.enum(TODO_TYPES),
  status: z.enum(TODO_STATUSES),
  priority: z.enum(TODO_PRIORITIES),
  storyPoints: z.string(),
  labels: z
    .string()
    .refine((v) => parseLabels(v).length <= 10, 'Use at most 10 labels')
    .refine((v) => parseLabels(v).every((l) => l.length <= 30), 'Each label must be 30 characters or fewer'),
  dueDate: z.string(),
  sprintId: z.string(),
})
type Values = z.infer<typeof schema>

function toValues(t: Todo): Values {
  return {
    title: t.title,
    description: t.description,
    type: t.type,
    status: t.status,
    priority: t.priority,
    storyPoints: t.storyPoints === null ? '' : String(t.storyPoints),
    labels: t.labels.join(', '),
    dueDate: t.dueDate ?? '',
    sprintId: t.sprintId ?? '',
  }
}

/** Only send what changed, so locked fields on completed-sprint todos never trigger a 409. */
function toPayload(v: Values, d: Values): UpdateTodoRequest {
  const p: UpdateTodoRequest = {}
  if (v.title.trim() !== d.title) p.title = v.title.trim()
  if (v.description !== d.description) p.description = v.description
  if (v.type !== d.type) p.type = v.type
  if (v.status !== d.status) p.status = v.status
  if (v.priority !== d.priority) p.priority = v.priority
  if (v.storyPoints !== d.storyPoints) p.storyPoints = v.storyPoints === '' ? null : (Number(v.storyPoints) as StoryPoints)
  if (v.labels !== d.labels) p.labels = parseLabels(v.labels)
  if (v.dueDate !== d.dueDate) p.dueDate = v.dueDate === '' ? null : v.dueDate
  if (v.sprintId !== d.sprintId) p.sprintId = v.sprintId === '' ? null : v.sprintId
  return p
}

const sprintLabel = (s: Sprint) => `${s.name} (${s.status})`

interface Props {
  todoId: string
  projectId: string
  onClose: () => void
}

export function TodoDetailsDialog({ todoId, projectId, onClose }: Props) {
  const todoQ = useTodo(todoId)
  const sprintsQ = useSprints(projectId)

  if (todoQ.isPending) {
    return (
      <Dialog title="Todo" variant="side" onClose={onClose}>
        <LoadingState label="Loading todo…" />
      </Dialog>
    )
  }
  if (todoQ.isError) {
    return (
      <Dialog title="Todo" variant="side" onClose={onClose}>
        <ErrorState message={todoQ.error.message} onRetry={() => todoQ.refetch()} />
      </Dialog>
    )
  }
  return <TodoForm todo={todoQ.data} sprints={sprintsQ.data ?? []} onClose={onClose} />
}

function TodoForm({ todo, sprints, onClose }: { todo: Todo; sprints: Sprint[]; onClose: () => void }) {
  const toast = useToast()
  const update = useUpdateTodo(todo.id)
  const del = useDeleteTodo()
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const defaults = toValues(todo)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: defaults })

  const current = sprints.find((s) => s.id === todo.sprintId)
  const locked = current?.status === 'completed'
  const selectable = sprints.filter((s) => s.status !== 'completed')

  const guardedClose = () => (isDirty ? setConfirmDiscard(true) : onClose())

  const onSubmit = handleSubmit(async (v) => {
    setFormError(null)
    const payload = toPayload(v, defaults)
    if (Object.keys(payload).length === 0) return onClose()
    try {
      await update.mutateAsync(payload)
      toast(`Saved ${todo.key}`)
      onClose()
    } catch (err) {
      const fe = fieldErrors(err)
      let matched = false
      for (const [field, message] of Object.entries(fe)) {
        if (field in defaults) {
          setError(field as keyof Values, { message })
          matched = true
        }
      }
      if (!matched) setFormError(errorMessage(err))
    }
  })

  const doDelete = () =>
    del.mutate(todo.id, {
      onSuccess: () => {
        toast(`Deleted ${todo.key}`)
        onClose()
      },
      onError: (err) => {
        toast(err.message, 'error')
        setConfirmDelete(false)
      },
    })

  return (
    <>
      <Dialog title={`${todo.key} · Details`} variant="side" onClose={guardedClose}>
        <form onSubmit={onSubmit} noValidate>
          {formError && (
            <p className="banner banner-error" role="alert">
              {formError}
            </p>
          )}
          <TextField label="Title" error={errors.title?.message} {...register('title')} />
          <TextArea label="Description" rows={5} error={errors.description?.message} {...register('description')} />
          <div className="field-row">
            <SelectField label="Type" error={errors.type?.message} {...register('type')}>
              {TODO_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t]}
                </option>
              ))}
            </SelectField>
            <SelectField label="Priority" error={errors.priority?.message} {...register('priority')}>
              {TODO_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </SelectField>
          </div>
          <div className="field-row">
            <SelectField label="Status" disabled={locked} error={errors.status?.message} {...register('status')}>
              {TODO_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </SelectField>
            <SelectField label="Story points" error={errors.storyPoints?.message} {...register('storyPoints')}>
              <option value="">Not estimated</option>
              {STORY_POINTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </SelectField>
          </div>
          <SelectField
            label="Sprint"
            disabled={locked}
            hint={locked ? "This todo belongs to a completed sprint and can't be moved." : undefined}
            error={errors.sprintId?.message}
            {...register('sprintId')}
          >
            <option value="">Backlog</option>
            {locked && current && <option value={current.id}>{sprintLabel(current)}</option>}
            {selectable.map((s) => (
              <option key={s.id} value={s.id}>
                {sprintLabel(s)}
              </option>
            ))}
          </SelectField>
          <TextField label="Labels" hint="Comma separated, up to 10." error={errors.labels?.message} {...register('labels')} />
          <TextField label="Due date" type="date" error={errors.dueDate?.message} {...register('dueDate')} />
          <div className="dialog-footer dialog-footer-split">
            <Button variant="danger" onClick={() => setConfirmDelete(true)} disabled={isSubmitting}>
              Delete
            </Button>
            <div className="dialog-footer-end">
              <Button onClick={guardedClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSubmitting}>
                Save changes
              </Button>
            </div>
          </div>
        </form>
      </Dialog>

      {confirmDiscard && (
        <ConfirmDialog
          title="Discard changes?"
          message="You have unsaved changes to this todo."
          confirmLabel="Discard changes"
          danger
          onConfirm={onClose}
          onCancel={() => setConfirmDiscard(false)}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title={`Delete ${todo.key}?`}
          message={`"${todo.title}" will be permanently deleted.`}
          confirmLabel="Delete todo"
          danger
          pending={del.isPending}
          onConfirm={doDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  )
}
