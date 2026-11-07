import type {
  CompleteSprintRequest,
  CreateSprintRequest,
  Sprint,
  SprintBoardResponse,
  StartSprintRequest,
  UpdateSprintRequest,
} from '../types/api'
import { request } from './client'

export const listSprints = (projectId: string) =>
  request<{ sprints: Sprint[] }>('GET', `/projects/${projectId}/sprints`).then((r) => r.sprints)
export const getSprint = (id: string) => request<{ sprint: Sprint }>('GET', `/sprints/${id}`).then((r) => r.sprint)
export const getBoard = (id: string) => request<SprintBoardResponse>('GET', `/sprints/${id}/todos`)
export const createSprint = (projectId: string, body: CreateSprintRequest) =>
  request<{ sprint: Sprint }>('POST', `/projects/${projectId}/sprints`, body).then((r) => r.sprint)
export const updateSprint = (id: string, body: UpdateSprintRequest) =>
  request<{ sprint: Sprint }>('PATCH', `/sprints/${id}`, body).then((r) => r.sprint)
export const deleteSprint = (id: string) => request<void>('DELETE', `/sprints/${id}`)
export const startSprint = (id: string, body: StartSprintRequest) =>
  request<{ sprint: Sprint }>('POST', `/sprints/${id}/start`, body).then((r) => r.sprint)
export const completeSprint = (id: string, body: CompleteSprintRequest) =>
  request<{ sprint: Sprint }>('POST', `/sprints/${id}/complete`, body).then((r) => r.sprint)
