import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
  variant?: 'center' | 'side'
  /** Extra header content next to the title (e.g. a badge). */
  titleExtra?: ReactNode
  /** Body becomes a non-scrolling flex column (used by the chat drawer). */
  flush?: boolean
}

/**
 * Modal built on the native <dialog> element: focus trap, Esc handling and
 * inert background come from the browser. Mounting opens it; unmounting closes it.
 */
export function Dialog({ title, onClose, children, variant = 'center', titleExtra, flush }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
    return () => d?.close()
  }, [])

  return (
    <dialog
      ref={ref}
      className={`dialog dialog-${variant}`}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="dialog-panel">
        <header className="dialog-header">
          <h2 id={titleId}>{title}</h2>
          {titleExtra}
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <div className={`dialog-body ${flush ? 'dialog-body-flush' : ''}`}>{children}</div>
      </div>
    </dialog>
  )
}
