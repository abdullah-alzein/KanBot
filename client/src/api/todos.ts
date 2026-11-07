import type {
  BulkCreateTodosRequest,
  CreateTodoRequest,
  MoveTodoRequest,
  Todo,
  TodoListQuery,
  UpdateTodoRequest,
} from '../types/api'
import { request } from './client'

export function listTodos(projectId: string, query: TodoListQuery = {}) {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) if (v) qs.set(k, v)
  const s = qs.toString()
  return request<{ todos: Todo[] }>('GET', `/projects/${projectId}/todos${s ? `?${s}` : ''}`).then((r) => r.todos)
}
export const getTodo = (id: string) => request<{ todo: Todo }>('GET', `/todos/${id}`).then((r) => r.todo)
export const createTodo = (projectId: string, body: CreateTodoRequest) =>
  request<{ todo: Todo }>('POST', `/projects/${projectId}/todos`, body).then((r) => r.todo)
export const bulkCreateTodos = (projectId: string, body: BulkCreateTodosRequest) =>
  request<{ todos: Todo[] }>('POST', `/projects/${projectId}/todos/bulk`, body).then((r) => r.todos)
export const updateTodo = (id: string, body: UpdateTodoRequest) =>
  request<{ todo: Todo }>('PATCH', `/todos/${id}`, body).then((r) => r.todo)
export const moveTodo = (id: string, body: MoveTodoRequest) =>
  request<{ todo: Todo }>('POST', `/todos/${id}/move`, body).then((r) => r.todo)
export const deleteTodo = (id: string) => request<void>('DELETE', `/todos/${id}`)
