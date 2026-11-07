import { ChevronDown, ChevronRight, Pencil, Play, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { RowMenu } from '../../components/RowMenu'
import { Button } from '../../components/Button'
import { LoadingState, ErrorState } from '../../components/states'
import { useSprintTodos } from '../../hooks/useSprints'
import { formatRange } from '../../lib/format'
import type { MoveVars } from '../../lib/optimistic'
import type { Sprint } from '../../types/api'
import { sprintMoveItems } from '../backlog/moveItems'
import { StaticTodoItem } from '../backlog/TodoRow'

interface Props {
  sprint: Sprint
  projectId: string
  allSprints: Sprint[]
  activeSprintName: string | null
  onOpen: (id: string) => void
  onMove: (v: MoveVars) => void
  onEdit: (s: Sprint) => void
  onDelete: (s: Sprint) => void
  onStart: (s: Sprint) => void
}

export function SprintSection({ sprint, projectId, allSprints, activeSprintName, onOpen, onMove, onEdit, onDelete, onStart }: Props) {
  const [open, setOpen] = useState(true)
  const todos = useSprintTodos(projectId, sprint.id, open)
  const blocked = activeSprintName !== null
  const bodyId = `sprint-body-${sprint.id}`

  return (
    <section className="sprint-section" aria-label={sprint.name}>
      <header className="sprint-head">
        <button type="button" className="sprint-toggle" aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen((o) => !o)}>
          {open ? <ChevronDown size={18} aria-hidden="true" /> : <ChevronRight size={18} aria-hidden="true" />}
          <h2>{sprint.name}</h2>
          <span className="badge badge-sprint-planned">Planned</span>
        </button>
        <span className="muted sprint-stats">
          {sprint.stats.totalTodos} {sprint.stats.totalTodos === 1 ? 'todo' : 'todos'} · {sprint.stats.totalPoints} pts · {formatRange(sprint.startDate, sprint.endDate)}
        </span>
        <div className="sprint-actions">
          <Button size="sm" variant="primary" disabled={blocked} onClick={() => onStart(sprint)} aria-describedby={blocked ? `${bodyId}-blocked` : undefined}>
            <Play size={14} aria-hidden="true" /> Start sprint
          </Button>
          <button type="button" className="icon-btn" aria-label={`Edit ${sprint.name}`} onClick={() => onEdit(sprint)}>
            <Pencil size={16} aria-hidden="true" />
          </button>
          <button type="button" className="icon-btn" aria-label={`Delete ${sprint.name}`} onClick={() => onDelete(sprint)}>
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </header>
      {sprint.goal && <p className="sprint-goal">Goal: {sprint.goal}</p>}
      {blocked && (
        <p className="sprint-blocked muted" id={`${bodyId}-blocked`}>
          {activeSprintName} is still active. Complete it before starting another sprint.
        </p>
      )}
      {open && (
        <div id={bodyId} className="sprint-body">
          {todos.isPending && <LoadingState label="Loading todos…" />}
          {todos.isError && <ErrorState message={todos.error.message} onRetry={() => todos.refetch()} />}
          {todos.data && todos.data.length === 0 && <p className="sprint-empty muted">No todos yet. Use the “⋯” menu on a backlog todo to move it here.</p>}
          {todos.data && todos.data.length > 0 && (
            <ul className="todo-list todo-list-flat">
              {todos.data.map((t) => (
                <StaticTodoItem
                  key={t.id}
                  todo={t}
                  onOpen={onOpen}
                  menu={<RowMenu label={`Actions for ${t.key}`} items={sprintMoveItems(t, allSprints, onMove)} />}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}
