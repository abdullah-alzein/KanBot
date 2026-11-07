import { zodResolver } from '@hookform/resolvers/zod'
import { addDays, format } from 'date-fns'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { errorMessage, fieldErrors } from '../../api/client'
import { Button } from '../../components/Button'
import { Dialog } from '../../components/Dialog'
import { TextField } from '../../components/Field'
import { useToast } from '../../components/toast/useToast'
import { useStartSprint } from '../../hooks/useSprints'
import type { Sprint } from '../../types/api'

const schema = z
  .object({ startDate: z.string().min(1, 'Start date is required'), endDate: z.string().min(1, 'End date is required') })
  .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
    path: ['endDate'],
    message: 'End date must be on or after the start date',
  })
type Values = z.infer<typeof schema>

const iso = (d: Date) => format(d, 'yyyy-MM-dd')

export function StartSprintDialog({ sprint, projectId, onClose }: { sprint: Sprint; projectId: string; onClose: () => void }) {
  const navigate = useNavigate()
  const toast = useToast()
  const start = useStartSprint(sprint.id)
  const [formError, setFormError] = useState<string | null>(null)
  const today = new Date()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { startDate: iso(today), endDate: iso(addDays(today, 14)) },
  })

  const onSubmit = handleSubmit(async (v) => {
    setFormError(null)
    try {
      await start.mutateAsync(v)
      toast(`${sprint.name} started`)
      onClose()
      navigate(`/projects/${projectId}/board`)
    } catch (err) {
      const fe = fieldErrors(err)
      if (fe.startDate) setError('startDate', { message: fe.startDate })
      else if (fe.endDate) setError('endDate', { message: fe.endDate })
      else setFormError(errorMessage(err))
    }
  })

  return (
    <Dialog title={`Start ${sprint.name}`} onClose={onClose}>
      <form onSubmit={onSubmit} noValidate>
        {formError && (
          <p className="banner banner-error" role="alert">
            {formError}
          </p>
        )}
        <p className="confirm-message">
          {sprint.stats.totalTodos} {sprint.stats.totalTodos === 1 ? 'todo' : 'todos'} · {sprint.stats.totalPoints} pts will move to the board.
        </p>
        <div className="field-row">
          <TextField label="Start date" type="date" error={errors.startDate?.message} {...register('startDate')} />
          <TextField label="End date" type="date" error={errors.endDate?.message} {...register('endDate')} />
        </div>
        <div className="dialog-footer">
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Start sprint
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
