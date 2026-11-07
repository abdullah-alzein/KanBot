import type { MenuItem } from '../../components/RowMenu'
import { END_OF_LIST } from '../../hooks/useMoveTodo'
import type { MoveVars } from '../../lib/optimistic'
import type { Sprint, Todo } from '../../types/api'

/** Menu entries that move a todo to the backlog or to another open sprint (non-drag alternative). */
export function sprintMoveItems(todo: Todo, sprints: Sprint[], move: (v: MoveVars) => void): MenuItem[] {
  const items: MenuItem[] = []
  if (todo.sprintId !== null) items.push({ label: 'Move to backlog', onSelect: () => move({ todo, sprintId: null, position: END_OF_LIST }) })
  for (const s of sprints) {
    if (s.status === 'completed' || s.id === todo.sprintId) continue
    items.push({ label: `Move to ${s.name}`, onSelect: () => move({ todo, sprintId: s.id, position: END_OF_LIST }) })
  }
  return items
}
