import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { STATUS_LABELS } from '../../lib/constants'
import type { Todo, TodoStatus } from '../../types/api'
import { BoardCard } from './BoardCard'

interface Props {
  status: TodoStatus
  todos: Todo[]
  onOpen: (id: string) => void
  onStatus: (todo: Todo, status: TodoStatus) => void
}

export function BoardColumn({ status, todos, onOpen, onStatus }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: `col:${status}` })
  return (
    <section ref={setNodeRef} className={`board-col ${isOver ? 'is-over' : ''}`} aria-label={STATUS_LABELS[status]}>
      <header className="board-col-head">
        <h2>{STATUS_LABELS[status]}</h2>
        <span className="count" aria-label={`${todos.length} todos`}>
          {todos.length}
        </span>
      </header>
      <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul className="board-col-list">
          {todos.map((t) => (
            <BoardCard key={t.id} todo={t} onOpen={onOpen} onStatus={onStatus} />
          ))}
          {todos.length === 0 && <li className="board-col-empty">Nothing here</li>}
        </ul>
      </SortableContext>
    </section>
  )
}
