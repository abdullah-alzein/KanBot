import type { ReactNode } from 'react'
import { Button } from './Button'

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="state" role="status">
      <span className="spinner spinner-lg" aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}

export function FullPageLoader() {
  return (
    <div className="full-page">
      <LoadingState label="Loading Kanbot…" />
    </div>
  )
}

export function EmptyState({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="state state-empty">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {children && <div className="state-actions">{children}</div>}
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', message, onRetry, children }: { title?: string; message: string; onRetry?: () => void; children?: ReactNode }) {
  return (
    <div className="state state-error" role="alert">
      <h2>{title}</h2>
      <p>{message}</p>
      <div className="state-actions">
        {onRetry && <Button onClick={onRetry}>Try again</Button>}
        {children}
      </div>
    </div>
  )
}
