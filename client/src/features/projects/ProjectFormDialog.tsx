import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { errorMessage, fieldErrors } from '../../api/client'
import { Button } from '../../components/Button'
import { Dialog } from '../../components/Dialog'
import { TextArea, TextField } from '../../components/Field'
import { useToast } from '../../components/toast/useToast'
import { useCreateProject, useUpdateProject } from '../../hooks/useProjects'
import type { ProjectWithStats } from '../../types/api'

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80, 'Name must be 80 characters or fewer'),
  key: z.string().trim().refine((v) => v === '' || /^[A-Za-z]{2,6}$/.test(v), 'Key must be 2–6 letters'),
  description: z.string().trim().max(500, 'Description must be 500 characters or fewer'),
})
type Values = z.infer<typeof schema>
const FIELDS: (keyof Values)[] = ['name', 'key', 'description']

interface Props {
  project?: ProjectWithStats
  onClose: () => void
}

export function ProjectFormDialog({ project, onClose }: Props) {
  const navigate = useNavigate()
  const toast = useToast()
  const create = useCreateProject()
  const update = useUpdateProject(project?.id ?? '')
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: project?.name ?? '', key: project?.key ?? '', description: project?.description ?? '' },
  })

  const onSubmit = handleSubmit(async (v) => {
    setFormError(null)
    const key = v.key.trim().toUpperCase()
    try {
      if (project) {
        await update.mutateAsync({ name: v.name, description: v.description, ...(key ? { key } : {}) })
        toast('Project updated')
        onClose()
      } else {
        const created = await create.mutateAsync({ name: v.name, description: v.description, ...(key ? { key } : {}) })
        toast(`Created ${created.name}`)
        onClose()
        navigate(`/projects/${created.id}/backlog`)
      }
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
    <Dialog title={project ? 'Edit project' : 'New project'} onClose={onClose}>
      <form onSubmit={onSubmit} noValidate>
        {formError && (
          <p className="banner banner-error" role="alert">
            {formError}
          </p>
        )}
        <TextField label="Name" autoFocus error={errors.name?.message} {...register('name')} />
        <TextField
          label="Key"
          className="input input-upper"
          maxLength={6}
          hint={
            project
              ? 'Changing the key does not change existing todo keys.'
              : 'Optional. 2–6 letters, used in todo keys like KAN-12. Leave empty to generate one.'
          }
          error={errors.key?.message}
          {...register('key', { setValueAs: (v: string) => v.toUpperCase() })}
        />
        <TextArea label="Description" rows={3} error={errors.description?.message} {...register('description')} />
        <div className="dialog-footer">
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {project ? 'Save changes' : 'Create project'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
