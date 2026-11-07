import { useMutation, useQueryClient } from '@tanstack/react-query'
import { moveTodo } from '../api/todos'
import { useToast } from '../components/toast/useToast'
import { applyOptimisticMove, type MoveVars } from '../lib/optimistic'
import { invalidateWorkspace } from '../lib/queryClient'

/** Optimistic move/reorder with rollback and an error toast. */
export function useMoveTodo(projectId: string) {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (v: MoveVars) =>
      moveTodo(v.todo.id, {
        ...(v.sprintId !== undefined ? { sprintId: v.sprintId } : {}),
        ...(v.status ? { status: v.status } : {}),
        position: v.position,
      }),
    onMutate: (v) => applyOptimisticMove(qc, projectId, v),
    onError: (err, _v, snapshot) => {
      snapshot?.forEach(([key, data]) => qc.setQueryData(key, data))
      toast(`Couldn't move the todo: ${err.message}`, 'error')
    },
    onSettled: () => invalidateWorkspace(qc),
  })
}

export const END_OF_LIST = 1_000_000
