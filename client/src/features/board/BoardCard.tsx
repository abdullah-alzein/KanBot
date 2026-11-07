import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { PointsBadge, PriorityBadge, TypeBadge } from '../../components/Badges'
import { STATUS_LABELS } from '../../lib/constants'
import { TODO_STATUSES, type Todo, type TodoStatus } from '../../types/api'

interface Props {
  todo: Todo
  onOpen: (id: string) => void
  onStatus: (todo: Todo, status: TodoStatus) => void
}

export function CardBody({ todo, onOpen, onStatus, handle }: Props & { handle?: React.ReactNode }) {
  return (
    <>
      <div className="card-top">
        {handle}
        <span className="todo-key">{todo.key}</span>
        <TypeBadge type={todo.type} />
      </div>
      <button type="button" className="card-title" onClick={() => onOpen(todo.id)}>
        {todo.title}
      </button>
      <div className="card-meta">
        <PriorityBadge priority={todo.priority} />
        <PointsBadge points={todo.storyPoints} />
      </div>
      <select className="card-status" aria-label={`Status of ${todo.key}`} value={todo.status} onChange={(e) => onStatus(todo, e.target.value as TodoStatus)}>
        {TODO_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </>
  )
}

export function BoardCard(props: Props) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: props.todo.id })
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`board-card ${isDragging ? 'is-dragging' : ''}`}>
      <CardBody
        {...props}
        handle={
          <button type="button" ref={setActivatorNodeRef} className="drag-handle" aria-label={`Move ${props.todo.key}`} title="Drag to move (or press Space, then use arrow keys)" {...attributes} {...listeners}>
            <GripVertical size={16} aria-hidden="true" />
          </button>
        }
      />
    </li>
  )
}
