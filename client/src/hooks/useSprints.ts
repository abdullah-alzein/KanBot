import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { completeSprint, createSprint, deleteSprint, getBoard, getSprint, listSprints, startSprint, updateSprint } from '../api/sprints'
import { summarizeSprint } from '../api/ai'
import { listTodos } from '../api/todos'
import { invalidateWorkspace } from '../lib/queryClient'
import type { CompleteSprintRequest, CreateSprintRequest, StartSprintRequest, UpdateSprintRequest } from '../types/api'

export const useSprints = (projectId: string) =>
  useQuery({ queryKey: ['sprints', projectId], queryFn: () => listSprints(projectId) })

export const useSprint = (id: string) => useQuery({ queryKey: ['sprint', id], queryFn: () => getSprint(id) })

export const useBoard = (sprintId: string | undefined) =>
  useQuery({ queryKey: ['board', sprintId], queryFn: () => getBoard(sprintId!), enabled: !!sprintId })

export const useSprintTodos = (projectId: string, sprintId: string, enabled = true) =>
  useQuery({
    queryKey: ['todos', projectId, 'sprint', sprintId],
    queryFn: () => listTodos(projectId, { sprintId }),
    enabled,
  })

export function useCreateSprint(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateSprintRequest) => createSprint(projectId, body),
    onSuccess: () => invalidateWorkspace(qc),
  })
}

export function useUpdateSprint(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateSprintRequest) => updateSprint(id, body),
    onSuccess: () => invalidateWorkspace(qc),
  })
}

export function useDeleteSprint() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteSprint(id),
    onSuccess: () => invalidateWorkspace(qc),
  })
}

export function useStartSprint(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: StartSprintRequest) => startSprint(id, body),
    onSuccess: () => invalidateWorkspace(qc),
  })
}

export function useCompleteSprint(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CompleteSprintRequest) => completeSprint(id, body),
    onSuccess: () => invalidateWorkspace(qc),
  })
}

export function useSummarizeSprint(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => summarizeSprint(id),
    onSuccess: () => invalidateWorkspace(qc),
  })
}
