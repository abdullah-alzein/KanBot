import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { errorMessage, fieldErrors } from '../../api/client'
import { Button } from '../../components/Button'
import { Dialog } from '../../components/Dialog'
import { TextArea, TextField } from '../../components/Field'
import { useToast } from '../../components/toast/useToast'
import { useCreateSprint, useUpdateSprint } from '../../hooks/useSprints'
import type { Sprint } from '../../types/api'

const schema = z
  .object({
    name: z.string().trim().max(80, 'Name must be 80 characters or fewer'),
    goal: z.string().trim().max(300, 'Goal must be 300 characters or fewer'),
    startDate: z.string(),
    endDate: z.string(),
  })
  .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
    path: ['endDate'],
    message: 'End date must be on or after the start date',
  })
type Values = z.infer<typeof schema>
const FIELDS: (keyof Values)[] = ['name', 'goal', 'startDate', 'endDate']

export function SprintFormDialog({ projectId, sprint, onClose }: { projectId: string; sprint?: Sprint; onClose: () => void }) {
  const toast = useToast()
  const create = useCreateSprint(projectId)
  const update = useUpdateSprint(sprint?.id ?? '')
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: sprint?.name ?? '', goal: sprint?.goal ?? '', startDate: sprint?.startDate ?? '', endDate: sprint?.endDate ?? '' },
  })

  const onSubmit = handleSubmit(async (v) => {
    setFormError(null)
    if (sprint && !v.name) return setError('name', { message: 'Name is required' })
    const dates = { startDate: v.startDate || null, endDate: v.endDate || null }
    try {
      if (sprint) {
        await update.mutateAsync({ name: v.name, goal: v.goal, ...dates })
        toast('Sprint updated')
      } else {
        const created = await create.mutateAsync({ ...(v.name ? { name: v.name } : {}), goal: v.goal, ...dates })
        toast(`Created ${created.name}`)
      }
      onClose()
    } catch (err) {
      const fe = fieldErrors(err)
      let matched = false
      for (const f of FIELDS) {
        if (fe[f]) {
          setError(f, { message: fe[f] })
          matched = true
        }
      }
      if (!matched) setFormError(errorMessage(err))
    }
  })

  return (
    <Dialog title={sprint ? `Edit ${sprint.name}` : 'New sprint'} onClose={onClose}>
      <form onSubmit={onSubmit} noValidate>
        {formError && (
          <p className="banner banner-error" role="alert">
            {formError}
          </p>
        )}
        <TextField label="Name" autoFocus placeholder="Sprint N" hint={sprint ? undefined : 'Leave empty to use the next sprint number.'} error={errors.name?.message} {...register('name')} />
        <TextArea label="Goal" rows={2} error={errors.goal?.message} {...register('goal')} />
        <div className="field-row">
          <TextField label="Start date" type="date" error={errors.startDate?.message} {...register('startDate')} />
          <TextField label="End date" type="date" error={errors.endDate?.message} {...register('endDate')} />
        </div>
        <div className="dialog-footer">
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {sprint ? 'Save changes' : 'Create sprint'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
