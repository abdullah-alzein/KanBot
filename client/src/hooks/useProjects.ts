import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProject, deleteProject, getProject, listProjects, updateProject } from '../api/projects'
import { invalidateWorkspace } from '../lib/queryClient'
import type { CreateProjectRequest, UpdateProjectRequest } from '../types/api'

export const useProjects = () => useQuery({ queryKey: ['projects'], queryFn: listProjects })

export const useProject = (id: string | undefined) =>
  useQuery({ queryKey: ['project', id], queryFn: () => getProject(id!), enabled: !!id })

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateProjectRequest) => createProject(body),
    onSuccess: () => invalidateWorkspace(qc),
  })
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateProjectRequest) => updateProject(id, body),
    onSuccess: () => invalidateWorkspace(qc),
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => invalidateWorkspace(qc),
  })
}
