import { Button } from './Button'
import { Dialog } from './Dialog'

interface Props {
  title: string
  message: string
  confirmLabel: string
  danger?: boolean
  pending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ title, message, confirmLabel, danger, pending, onConfirm, onCancel }: Props) {
  return (
    <Dialog title={title} onClose={onCancel}>
      <p className="confirm-message">{message}</p>
      <div className="dialog-footer">
        <Button onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={pending}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}
