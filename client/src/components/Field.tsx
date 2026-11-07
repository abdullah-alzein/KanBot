import { useId, type ComponentProps, type ReactNode } from 'react'

interface WrapProps {
  label: string
  error?: string
  hint?: string
  id: string
  children: ReactNode
}

function FieldWrap({ label, error, hint, id, children }: WrapProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && (
        <p className="field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

const describedBy = (id: string, error?: string, hint?: string) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined

type Extra = { label: string; error?: string; hint?: string }

export function TextField({ label, error, hint, ...rest }: ComponentProps<'input'> & Extra) {
  const id = useId()
  return (
    <FieldWrap label={label} error={error} hint={hint} id={id}>
      <input id={id} className="input" aria-invalid={!!error} aria-describedby={describedBy(id, error, hint)} {...rest} />
    </FieldWrap>
  )
}

export function TextArea({ label, error, hint, ...rest }: ComponentProps<'textarea'> & Extra) {
  const id = useId()
  return (
    <FieldWrap label={label} error={error} hint={hint} id={id}>
      <textarea id={id} className="input textarea" aria-invalid={!!error} aria-describedby={describedBy(id, error, hint)} {...rest} />
    </FieldWrap>
  )
}

export function SelectField({ label, error, hint, children, ...rest }: ComponentProps<'select'> & Extra) {
  const id = useId()
  return (
    <FieldWrap label={label} error={error} hint={hint} id={id}>
      <select id={id} className="input" aria-invalid={!!error} aria-describedby={describedBy(id, error, hint)} {...rest}>
        {children}
      </select>
    </FieldWrap>
  )
}
