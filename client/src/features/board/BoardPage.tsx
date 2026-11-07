import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { CheckCheck, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { Button } from '../../components/Button'
import { Dialog } from '../../components/Dialog'
import { EmptyState, ErrorState, LoadingState } from '../../components/states'
import { useMoveTodo } from '../../hooks/useMoveTodo'
import { useOpenTodo } from '../../hooks/useOpenTodo'
import { useProject } from '../../hooks/useProjects'
import { useBoard } from '../../hooks/useSprints'
import { daysLeft, formatRange } from '../../lib/format'
import { TODO_STATUSES, type Todo, type TodoStatus } from '../../types/api'
import { SprintSummaryPanel } from '../sprints/SprintSummaryPanel'
import { CardBody } from './BoardCard'
import { BoardColumn } from './BoardColumn'
import { CompleteSprintDialog } from './CompleteSprintDialog'

function Progress({ label, done, total }: { label: string; done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className="progress">
      <div className="progress-label">
        <span>{label}</span>
        <strong>
          {done} / {total}
        </strong>
      </div>
      <div className="progress-bar" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function BoardPage() {
  const { projectId = '' } = useParams()
  const project = useProject(projectId)
  const activeId = project.data?.stats.activeSprint?.id
  const board = useBoard(activeId)
  const move = useMoveTodo(projectId)
  const openTodo = useOpenTodo()
  const [dragging, setDragging] = useState<Todo | null>(null)
  const [completing, setCompleting] = useState(false)
  const [summarizing, setSummarizing] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  if (!activeId) {
    return (
      <EmptyState title="No active sprint" description="Plan a sprint in the backlog and start it to see its board here.">
        <Link to={`/projects/${projectId}/backlog`} className="btn btn-primary btn-md">
          Go to backlog
        </Link>
      </EmptyState>
    )
  }
  if (board.isPending) return <LoadingState label="Loading board…" />
  if (board.isError) return <ErrorState message={board.error.message} onRetry={() => board.refetch()} />

  const { sprint, columns } = board.data
  const left = daysLeft(sprint.endDate)
  const leftText = left === null ? '' : left > 0 ? `${left} ${left === 1 ? 'day' : 'days'} left` : left === 0 ? 'Ends today' : `${-left} ${left === -1 ? 'day' : 'days'} overdue`

  const findColumn = (id: string): TodoStatus | null => {
    if (id.startsWith('col:')) return id.slice(4) as TodoStatus
    return TODO_STATUSES.find((s) => columns[s].some((t) => t.id === id)) ?? null
  }

  const onDragStart = ({ active }: DragStartEvent) => {
    const from = findColumn(String(active.id))
    setDragging(from ? (columns[from].find((t) => t.id === active.id) ?? null) : null)
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setDragging(null)
    if (!over) return
    const from = findColumn(String(active.id))
    const to = findColumn(String(over.id))
    if (!from || !to) return
    const todo = columns[from].find((t) => t.id === active.id)
    if (!todo) return
    const target = columns[to]
    const overIndex = target.findIndex((t) => t.id === over.id)
    const position = String(over.id).startsWith('col:') ? (from === to ? target.length - 1 : target.length) : overIndex
    if (from === to && target[position]?.id === todo.id) return
    move.mutate({ todo, status: to, position })
  }

  // Non-drag alternative: change status from the card; it lands at the bottom of the column.
  const changeStatus = (todo: Todo, status: TodoStatus) => {
    if (status === todo.status) return
    move.mutate({ todo, status, position: columns[status].length })
  }

  return (
    <div className="page page-wide">
      <header className="board-header">
        <div>
          <h1>{sprint.name}</h1>
          <p className="muted">
            {formatRange(sprint.startDate, sprint.endDate)}
            {leftText && ` · ${leftText}`}
          </p>
          {sprint.goal && <p className="sprint-goal">Goal: {sprint.goal}</p>}
        </div>
        <div className="board-actions">
          <Button onClick={() => setSummarizing(true)}>
            <Sparkles size={16} aria-hidden="true" /> Summarize
          </Button>
          <Button variant="primary" onClick={() => setCompleting(true)}>
            <CheckCheck size={16} aria-hidden="true" /> Complete sprint
          </Button>
        </div>
      </header>

      <div className="progress-row">
        <Progress label="Points done" done={sprint.stats.donePoints} total={sprint.stats.totalPoints} />
        <Progress label="Todos done" done={sprint.stats.doneTodos} total={sprint.stats.totalTodos} />
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setDragging(null)}>
        <div className="board-scroll">
          <div className="board-cols">
            {TODO_STATUSES.map((s) => (
              <BoardColumn key={s} status={s} todos={columns[s]} onOpen={openTodo} onStatus={changeStatus} />
            ))}
          </div>
        </div>
        <DragOverlay>
          {dragging ? (
            <div className="board-card board-card-overlay">
              <CardBody todo={dragging} onOpen={() => undefined} onStatus={() => undefined} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {completing && <CompleteSprintDialog sprint={sprint} projectId={projectId} onClose={() => setCompleting(false)} />}
      {summarizing && (
        <Dialog title={`${sprint.name} summary`} onClose={() => setSummarizing(false)}>
          <SprintSummaryPanel sprint={sprint} />
        </Dialog>
      )}
    </div>
  )
}
