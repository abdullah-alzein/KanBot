import { Link, useParams } from 'react-router'
import { ApiError } from '../../api/client'
import { EmptyState, ErrorState, LoadingState } from '../../components/states'
import { useOpenTodo } from '../../hooks/useOpenTodo'
import { useSprint, useSprintTodos } from '../../hooks/useSprints'
import { formatRange } from '../../lib/format'
import { StaticTodoItem } from '../backlog/TodoRow'
import { SprintSummaryPanel } from './SprintSummaryPanel'

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="tile">
      <span className="tile-label">{label}</span>
      <strong className="tile-value">{value}</strong>
      {sub && <span className="muted">{sub}</span>}
    </div>
  )
}

export function SprintDetailPage() {
  const { projectId = '', sprintId = '' } = useParams()
  const sprint = useSprint(sprintId)
  const todos = useSprintTodos(projectId, sprintId)
  const openTodo = useOpenTodo()

  if (sprint.isPending) return <LoadingState label="Loading sprint…" />
  if (sprint.isError) {
    const nf = sprint.error instanceof ApiError && sprint.error.status === 404
    return (
      <ErrorState title={nf ? 'Sprint not found' : undefined} message={sprint.error.message} onRetry={nf ? undefined : () => sprint.refetch()}>
        <Link to={`/projects/${projectId}/sprints`} className="btn btn-secondary btn-md">
          Back to sprints
        </Link>
      </ErrorState>
    )
  }

  const s = sprint.data
  // Completed sprints show the saved snapshot, never today's live numbers.
  const stats = s.completedStats ?? s.stats
  const pct = stats.totalPoints > 0 ? Math.round((stats.donePoints / stats.totalPoints) * 100) : stats.totalTodos > 0 ? Math.round((stats.doneTodos / stats.totalTodos) * 100) : 0

  return (
    <div className="page">
      <p className="muted breadcrumb">
        <Link to={`/projects/${projectId}/sprints`}>Sprints</Link> / {s.name}
      </p>
      <header className="page-header">
        <div>
          <h1>
            {s.name} <span className={`badge badge-sprint-${s.status}`}>{s.status[0]!.toUpperCase() + s.status.slice(1)}</span>
          </h1>
          <p className="muted">{formatRange(s.startDate, s.endDate)}</p>
          {s.goal && <p className="sprint-goal">Goal: {s.goal}</p>}
        </div>
        {s.status === 'active' && (
          <Link to={`/projects/${projectId}/board`} className="btn btn-primary btn-md">
            Open board
          </Link>
        )}
      </header>

      <div className="tiles">
        <Tile label="Completed todos" value={`${stats.doneTodos}/${stats.totalTodos}`} />
        <Tile label="Points done" value={`${stats.donePoints}/${stats.totalPoints}`} />
        {s.completedStats && <Tile label="Carried over" value={String(s.completedStats.carriedOver)} sub="moved out at completion" />}
        <Tile label="Completion" value={`${pct}%`} />
      </div>

      <SprintSummaryPanel sprint={s} />

      <div className="section-head">
        <h2>{s.status === 'completed' ? 'Completed todos' : 'Todos'}</h2>
      </div>
      {todos.isPending && <LoadingState label="Loading todos…" />}
      {todos.isError && <ErrorState message={todos.error.message} onRetry={() => todos.refetch()} />}
      {todos.data && todos.data.length === 0 && <EmptyState title="No todos in this sprint" />}
      {todos.data && todos.data.length > 0 && (
        <ul className="todo-list todo-list-flat">
          {todos.data.map((t) => (
            <StaticTodoItem key={t.id} todo={t} onOpen={openTodo} />
          ))}
        </ul>
      )}
    </div>
  )
}
