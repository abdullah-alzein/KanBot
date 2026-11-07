import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router'
import { z } from 'zod'
import { fieldErrors, errorMessage } from '../../api/client'
import { Button } from '../../components/Button'
import { TextField } from '../../components/Field'
import { useAuth } from './useAuth'

const schema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
type Values = z.infer<typeof schema>

export function LoginPage() {
  const { login, sessionExpired } = useAuth()
  const [params] = useSearchParams()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await login(values.email, values.password)
      // GuestRoute redirects to ?redirect= (or /projects) as soon as the session starts.
    } catch (err) {
      const fe = fieldErrors(err)
      if (fe.email) setError('email', { message: fe.email })
      else if (fe.password) setError('password', { message: fe.password })
      else setFormError(errorMessage(err))
    }
  })

  const redirect = params.get('redirect')
  const registerLink = redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'

  return (
    <form onSubmit={onSubmit} noValidate className="auth-form">
      <h1>Log in</h1>
      <p className="muted">Pick up your sprint where you left it.</p>
      {sessionExpired && (
        <p className="banner banner-info" role="status">
          Your session has expired. Please log in again.
        </p>
      )}
      {formError && (
        <p className="banner banner-error" role="alert">
          {formError}
        </p>
      )}
      <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
      <TextField label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
      <Button type="submit" variant="primary" loading={isSubmitting} className="btn-block">
        Log in
      </Button>
      <p className="auth-switch">
        New to Kanbot? <Link to={registerLink}>Create an account</Link>
      </p>
    </form>
  )
}
