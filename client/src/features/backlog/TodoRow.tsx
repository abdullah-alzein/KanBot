import { GripVertical } from 'lucide-react'
import type { ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PointsBadge, PriorityBadge, TypeBadge } from '../../components/Badges'
import type { Todo } from '../../types/api'

interface RowProps {
  todo: Todo
  onOpen: (id: string) => void
  handle?: ReactNode
  menu?: ReactNode
}

export function TodoRow({ todo, onOpen, handle, menu }: RowProps) {
  return (
    <div className="todo-row-wrap">
      {handle}
      <button type="button" className="todo-row" onClick={() => onOpen(todo.id)}>
        <TypeBadge type={todo.type} />
        <span className="todo-key">{todo.key}</span>
        <span className="todo-title">{todo.title}</span>
        {todo.labels.length > 0 && (
          <span className="todo-labels">
            {todo.labels.map((l) => (
              <span key={l} className="label-chip">
                {l}
              </span>
            ))}
          </span>
        )}
        <PriorityBadge priority={todo.priority} />
        <PointsBadge points={todo.storyPoints} />
      </button>
      {menu}
    </div>
  )
}

/** Plain list item for read-only lists (sprint sections, sprint details). */
export function StaticTodoItem(props: Omit<RowProps, 'handle'>) {
  return (
    <li>
      <TodoRow {...props} handle={<span className="drag-spacer" />} />
    </li>
  )
}

interface SortableProps extends Omit<RowProps, 'handle'> {
  dragDisabled?: boolean
}

export function SortableTodoItem({ dragDisabled, ...rest }: SortableProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: rest.todo.id,
    disabled: dragDisabled,
  })
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={isDragging ? 'is-dragging' : undefined}>
      <TodoRow
        {...rest}
        handle={
          <button
            type="button"
            ref={setActivatorNodeRef}
            className="drag-handle"
            aria-label={`Reorder ${rest.todo.key}`}
            title={dragDisabled ? 'Clear the filters to reorder' : 'Drag to reorder (or press Space, then use arrow keys)'}
            disabled={dragDisabled}
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} aria-hidden="true" />
          </button>
        }
      />
    </li>
  )
}
