import type { TodoPriority, TodoStatus, TodoType } from '../types/api'

export const STATUS_LABELS: Record<TodoStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
}
export const PRIORITY_LABELS: Record<TodoPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}
export const TYPE_LABELS: Record<TodoType, string> = { task: 'Task', story: 'Story', bug: 'Bug' }

export function safeRedirect(value: string | null): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/projects'
}
