import { useState } from 'react'
import { Dialog } from '../../components/Dialog'
import { SelectField } from '../../components/Field'
import { EmptyState, ErrorState, LoadingState } from '../../components/states'
import { useSprints } from '../../hooks/useSprints'
import { SprintSummaryPanel } from '../sprints/SprintSummaryPanel'

export function SummarizeSprintDialog({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const sprints = useSprints(projectId)
  const [picked, setPicked] = useState('')
  const options = (sprints.data ?? []).filter((s) => s.status !== 'planned')
  const chosen = options.find((s) => s.id === picked) ?? options.find((s) => s.status === 'active') ?? options[0]

  return (
    <Dialog title="Summarize a sprint" onClose={onClose}>
      {sprints.isPending && <LoadingState label="Loading sprints…" />}
      {sprints.isError && <ErrorState message={sprints.error.message} onRetry={() => sprints.refetch()} />}
      {sprints.data && !chosen && <EmptyState title="Nothing to summarize yet" description="Start a sprint first. Planned sprints can't be summarized." />}
      {chosen && (
        <>
          <SelectField label="Sprint" value={chosen.id} onChange={(e) => setPicked(e.target.value)}>
            {options.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.status})
              </option>
            ))}
          </SelectField>
          <SprintSummaryPanel sprint={chosen} />
        </>
      )}
    </Dialog>
  )
}
