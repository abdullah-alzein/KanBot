import type { QueryClient, QueryKey } from '@tanstack/react-query'
import { TODO_STATUSES, type SprintBoardResponse, type SprintStats, type Todo, type TodoStatus } from '../types/api'

export interface MoveVars {
  todo: Todo
  /** undefined = keep, null = backlog */
  sprintId?: string | null
  status?: TodoStatus
  /** Index in the target list after the todo has been removed from it (0 = top). */
  position: number
}
export type Snapshot = [QueryKey, unknown][]

function statsOf(columns: Record<TodoStatus, Todo[]>): SprintStats {
  const byStatus = { todo: 0, in_progress: 0, in_review: 0, done: 0 } as Record<TodoStatus, number>
  let totalPoints = 0
  let donePoints = 0
  for (const s of TODO_STATUSES) {
    byStatus[s] = columns[s].length
    for (const t of columns[s]) {
      totalPoints += t.storyPoints ?? 0
      if (s === 'done') donePoints += t.storyPoints ?? 0
    }
  }
  return { totalTodos: TODO_STATUSES.reduce((n, s) => n + columns[s].length, 0), doneTodos: byStatus.done, totalPoints, donePoints, byStatus }
}

/** Updates every cached todo list and board so the UI reflects the move immediately. Returns a snapshot for rollback. */
export async function applyOptimisticMove(qc: QueryClient, projectId: string, v: MoveVars): Promise<Snapshot> {
  await qc.cancelQueries({ queryKey: ['todos', projectId] })
  await qc.cancelQueries({ queryKey: ['board'] })
  const cache = qc.getQueryCache()
  const queries = [...cache.findAll({ queryKey: ['todos', projectId] }), ...cache.findAll({ queryKey: ['board'] })]
  const snapshot: Snapshot = queries.map((q) => [q.queryKey, q.state.data])

  const targetSprint = v.sprintId === undefined ? v.todo.sprintId : v.sprintId
  const moved: Todo = { ...v.todo, sprintId: targetSprint, status: v.status ?? v.todo.status }

  for (const q of queries) {
    const key = q.queryKey
    const data = q.state.data
    if (!data) continue

    if (key[0] === 'todos') {
      const list = (data as Todo[]).filter((t) => t.id !== moved.id)
      const f = key[3] as { search?: string; priority?: string; type?: string } | undefined
      const isTarget =
        key[2] === 'backlog'
          ? targetSprint === null && !!f && !f.search && !f.priority && !f.type
          : key[2] === 'sprint' && key[3] === targetSprint
      if (!isTarget) {
        qc.setQueryData(key, list)
      } else {
        const pos = Math.max(0, Math.min(v.position, list.length))
        qc.setQueryData(key, [...list.slice(0, pos), moved, ...list.slice(pos)])
      }
    } else {
      const board = data as SprintBoardResponse
      const columns = { ...board.columns }
      for (const s of TODO_STATUSES) columns[s] = board.columns[s].filter((t) => t.id !== moved.id)
      if (board.sprint.id === targetSprint) {
        const col = columns[moved.status]
        const pos = Math.max(0, Math.min(v.position, col.length))
        columns[moved.status] = [...col.slice(0, pos), moved, ...col.slice(pos)]
      }
      qc.setQueryData(key, { sprint: { ...board.sprint, stats: statsOf(columns) }, columns })
    }
  }
  return snapshot
}
