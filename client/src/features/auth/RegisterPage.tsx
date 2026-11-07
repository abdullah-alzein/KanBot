import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router'
import { z } from 'zod'
import { errorMessage, fieldErrors } from '../../api/client'
import { Button } from '../../components/Button'
import { TextField } from '../../components/Field'
import { useAuth } from './useAuth'

const schema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(80, 'Name must be 80 characters or fewer'),
    email: z.email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })
type Values = z.infer<typeof schema>

const FIELDS: (keyof Values)[] = ['name', 'email', 'password']

export function RegisterPage() {
  const { register: signUp } = useAuth()
  const [params] = useSearchParams()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit(async (v) => {
    setFormError(null)
    try {
      await signUp(v.name, v.email, v.password)
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

  const redirect = params.get('redirect')
  const loginLink = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'

  return (
    <form onSubmit={onSubmit} noValidate className="auth-form">
      <h1>Create your account</h1>
      <p className="muted">One backlog, one board, one AI teammate.</p>
      {formError && (
        <p className="banner banner-error" role="alert">
          {formError}
        </p>
      )}
      <TextField label="Name" autoComplete="name" error={errors.name?.message} {...register('name')} />
      <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
      <TextField label="Password" type="password" autoComplete="new-password" hint="At least 8 characters." error={errors.password?.message} {...register('password')} />
      <TextField label="Confirm password" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
      <Button type="submit" variant="primary" loading={isSubmitting} className="btn-block">
        Create account
      </Button>
      <p className="auth-switch">
        Already have an account? <Link to={loginLink}>Log in</Link>
      </p>
    </form>
  )
}
