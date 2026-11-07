import type { CreateProjectRequest, ProjectWithStats, UpdateProjectRequest } from '../types/api'
import { request } from './client'

export const listProjects = () =>
  request<{ projects: ProjectWithStats[] }>('GET', '/projects').then((r) => r.projects)
export const getProject = (id: string) =>
  request<{ project: ProjectWithStats }>('GET', `/projects/${id}`).then((r) => r.project)
export const createProject = (body: CreateProjectRequest) =>
  request<{ project: ProjectWithStats }>('POST', '/projects', body).then((r) => r.project)
export const updateProject = (id: string, body: UpdateProjectRequest) =>
  request<{ project: ProjectWithStats }>('PATCH', `/projects/${id}`, body).then((r) => r.project)
export const deleteProject = (id: string) => request<void>('DELETE', `/projects/${id}`)
