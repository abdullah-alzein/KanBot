import { Link, Outlet, useParams } from 'react-router'
import { ApiError } from '../api/client'
import { ErrorState, LoadingState } from '../components/states'
import { TodoDetailsHost } from '../features/todos/TodoDetailsHost'
import { useProject } from '../hooks/useProjects'

export function ProjectLayout() {
  const { projectId = '' } = useParams()
  const project = useProject(projectId)

  if (project.isPending) return <LoadingState label="Loading project…" />
  if (project.isError) {
    const notFound = project.error instanceof ApiError && project.error.status === 404
    return notFound ? (
      <ErrorState title="Project not found" message="This project doesn't exist or belongs to another account.">
        <Link to="/projects" className="btn btn-secondary btn-md">
          Back to projects
        </Link>
      </ErrorState>
    ) : (
      <ErrorState message={project.error.message} onRetry={() => project.refetch()} />
    )
  }

  return (
    <>
      <Outlet />
      <TodoDetailsHost projectId={projectId} />
    </>
  )
}
