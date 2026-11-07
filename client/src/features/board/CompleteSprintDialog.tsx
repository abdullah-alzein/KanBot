import { useState } from 'react'
import { useNavigate } from 'react-router'
import { errorMessage } from '../../api/client'
import { summarizeSprint } from '../../api/ai'
import { Button } from '../../components/Button'
import { Dialog } from '../../components/Dialog'
import { SelectField } from '../../components/Field'
import { useToast } from '../../components/toast/useToast'
import { useCompleteSprint, useSprints } from '../../hooks/useSprints'
import type { Sprint } from '../../types/api'

export function CompleteSprintDialog({ sprint, projectId, onClose }: { sprint: Sprint; projectId: string; onClose: () => void }) {
  const navigate = useNavigate()
  const toast = useToast()
  const complete = useCompleteSprint(sprint.id)
  const sprints = useSprints(projectId)
  const [target, setTarget] = useState('backlog')
  const [withSummary, setWithSummary] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const planned = (sprints.data ?? []).filter((s) => s.status === 'planned')
  const done = sprint.stats.doneTodos
  const unfinished = sprint.stats.totalTodos - done

  const submit = async () => {
    setError(null)
    setBusy(true)
    try {
      await complete.mutateAsync({ moveUnfinishedTo: target })
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
      return
    }
    toast(`${sprint.name} completed`)
    if (withSummary) {
      try {
        await summarizeSprint(sprint.id)
      } catch (err) {
        toast(`Sprint completed, but the AI summary failed: ${errorMessage(err)}`, 'error')
      }
    }
    onClose()
    navigate(`/projects/${projectId}/sprints/${sprint.id}`)
  }

  return (
    <Dialog title={`Complete ${sprint.name}`} onClose={busy ? () => undefined : onClose}>
      {error && (
        <p className="banner banner-error" role="alert">
          {error}
        </p>
      )}
      <div className="tiles tiles-2">
        <div className="tile">
          <span className="tile-label">Done</span>
          <strong className="tile-value">{done}</strong>
        </div>
        <div className="tile">
          <span className="tile-label">Not finished</span>
          <strong className="tile-value">{unfinished}</strong>
        </div>
      </div>
      <SelectField
        label="Move unfinished todos to"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        disabled={unfinished === 0}
        hint={unfinished === 0 ? 'Everything is done.' : 'They keep their current status.'}
      >
        <option value="backlog">Backlog</option>
        {planned.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </SelectField>
      <label className="check">
        <input type="checkbox" checked={withSummary} onChange={(e) => setWithSummary(e.target.checked)} />
        Generate AI summary after completing
      </label>
      <div className="dialog-footer">
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit} loading={busy}>
          Complete sprint
        </Button>
      </div>
    </Dialog>
  )
}
