import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '../../components/Button'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { EmptyState, ErrorState, LoadingState } from '../../components/states'
import { useToast } from '../../components/toast/useToast'
import { useDeleteProject, useProjects } from '../../hooks/useProjects'
import type { ProjectWithStats } from '../../types/api'
import { ProjectFormDialog } from './ProjectFormDialog'

export function ProjectsPage() {
  const projects = useProjects()
  const del = useDeleteProject()
  const toast = useToast()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<ProjectWithStats | null>(null)
  const [deleting, setDeleting] = useState<ProjectWithStats | null>(null)

  const confirmDelete = () => {
    if (!deleting) return
    del.mutate(deleting.id, {
      onSuccess: () => {
        toast(`Deleted ${deleting.name}`)
        setDeleting(null)
      },
      onError: (err) => {
        toast(err.message, 'error')
        setDeleting(null)
      },
    })
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Projects</h1>
          <p className="muted">Each project has its own backlog and sprints.</p>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          <Plus size={16} aria-hidden="true" /> New project
        </Button>
      </header>

      {projects.isPending && <LoadingState label="Loading projects…" />}
      {projects.isError && <ErrorState message={projects.error.message} onRetry={() => projects.refetch()} />}
      {projects.data && projects.data.length === 0 && (
        <EmptyState title="Create your first project" description="A project holds a backlog, its sprints and a short key for todo IDs.">
          <Button variant="primary" onClick={() => setCreating(true)}>
            Create your first project
          </Button>
        </EmptyState>
      )}
      {projects.data && projects.data.length > 0 && (
        <ul className="project-grid">
          {projects.data.map((p, i) => (
            <li key={p.id} className={`project-card tint-${i % 6}`}>
              <div className="project-card-head">
                <span className="key-chip">{p.key}</span>
                <div className="project-card-actions">
                  <button type="button" className="icon-btn" aria-label={`Edit ${p.name}`} onClick={() => setEditing(p)}>
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button type="button" className="icon-btn" aria-label={`Delete ${p.name}`} onClick={() => setDeleting(p)}>
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <h2>
                <Link to={`/projects/${p.id}/backlog`} className="project-link">
                  {p.name}
                </Link>
              </h2>
              <p className="project-desc">{p.description || 'No description'}</p>
              <p className="project-meta">
                <span>{p.stats.backlogCount} in backlog</span>
                <span>{p.stats.activeSprint ? `Active: ${p.stats.activeSprint.name}` : 'No active sprint'}</span>
              </p>
            </li>
          ))}
        </ul>
      )}

      {creating && <ProjectFormDialog onClose={() => setCreating(false)} />}
      {editing && <ProjectFormDialog project={editing} onClose={() => setEditing(null)} />}
      {deleting && (
        <ConfirmDialog
          title={`Delete ${deleting.name}?`}
          message={`This permanently deletes "${deleting.name}" with all of its todos and sprints. This can't be undone.`}
          confirmLabel="Delete project"
          danger
          pending={del.isPending}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  )
}
