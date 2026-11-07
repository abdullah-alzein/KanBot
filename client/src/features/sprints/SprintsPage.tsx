import { Link, useParams } from 'react-router'
import { EmptyState, ErrorState, LoadingState } from '../../components/states'
import { useSprints } from '../../hooks/useSprints'
import { formatRange } from '../../lib/format'

const STATUS_LABEL = { planned: 'Planned', active: 'Active', completed: 'Completed' } as const

export function SprintsPage() {
  const { projectId = '' } = useParams()
  const sprints = useSprints(projectId)

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Sprints</h1>
          <p className="muted">Active, planned and completed sprints.</p>
        </div>
      </header>
      {sprints.isPending && <LoadingState label="Loading sprints…" />}
      {sprints.isError && <ErrorState message={sprints.error.message} onRetry={() => sprints.refetch()} />}
      {sprints.data && sprints.data.length === 0 && (
        <EmptyState title="No sprints yet" description="Create a sprint from the backlog to start planning.">
          <Link to={`/projects/${projectId}/backlog`} className="btn btn-primary btn-md">
            Go to backlog
          </Link>
        </EmptyState>
      )}
      {sprints.data && sprints.data.length > 0 && (
        <ul className="sprint-list">
          {sprints.data.map((s) => {
            const stats = s.completedStats ?? s.stats
            return (
              <li key={s.id}>
                <Link to={`/projects/${projectId}/sprints/${s.id}`} className="sprint-row">
                  <span className="sprint-row-name">{s.name}</span>
                  <span className={`badge badge-sprint-${s.status}`}>{STATUS_LABEL[s.status]}</span>
                  <span className="muted sprint-row-dates">{formatRange(s.startDate, s.endDate)}</span>
                  <span className="sprint-row-points">
                    {stats.donePoints}/{stats.totalPoints} pts
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
