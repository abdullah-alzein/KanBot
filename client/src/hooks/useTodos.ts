import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTodo, deleteTodo, getTodo, listTodos, updateTodo } from '../api/todos'
import { invalidateWorkspace } from '../lib/queryClient'
import type { CreateTodoRequest, TodoPriority, TodoType, UpdateTodoRequest } from '../types/api'

export interface BacklogFilters {
  search: string
  priority: TodoPriority | ''
  type: TodoType | ''
}

export function useBacklog(projectId: string, filters: BacklogFilters) {
  return useQuery({
    queryKey: ['todos', projectId, 'backlog', filters],
    queryFn: () =>
      listTodos(projectId, {
        sprintId: 'backlog',
        search: filters.search || undefined,
        priority: filters.priority || undefined,
        type: filters.type || undefined,
      }),
    placeholderData: keepPreviousData,
  })
}

export const useTodo = (id: string) => useQuery({ queryKey: ['todo', id], queryFn: () => getTodo(id) })

export function useCreateTodo(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateTodoRequest) => createTodo(projectId, body),
    onSuccess: () => invalidateWorkspace(qc),
  })
}

export function useUpdateTodo(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateTodoRequest) => updateTodo(id, body),
    onSuccess: () => invalidateWorkspace(qc),
  })
}

export function useDeleteTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: () => invalidateWorkspace(qc),
  })
}
