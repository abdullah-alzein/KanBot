import { QueryClient, type QueryClient as QC } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false, staleTime: 15_000 },
  },
})

const WORKSPACE_KEYS = ['projects', 'project', 'todos', 'todo', 'sprints', 'sprint', 'board'] as const

/** After any mutation, mark everything derived from project data as stale. */
export function invalidateWorkspace(qc: QC) {
  return Promise.all(WORKSPACE_KEYS.map((key) => qc.invalidateQueries({ queryKey: [key] })))
}
