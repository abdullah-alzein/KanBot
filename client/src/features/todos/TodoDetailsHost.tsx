import { useSearchParams } from 'react-router'
import { TodoDetailsDialog } from './TodoDetailsDialog'

/** Renders the todo details dialog whenever the URL has ?todo=<id>. */
export function TodoDetailsHost({ projectId }: { projectId: string }) {
  const [params, setParams] = useSearchParams()
  const todoId = params.get('todo')
  if (!todoId) return null
  const close = () =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p)
        next.delete('todo')
        return next
      },
      { replace: true },
    )
  return <TodoDetailsDialog key={todoId} todoId={todoId} projectId={projectId} onClose={close} />
}
