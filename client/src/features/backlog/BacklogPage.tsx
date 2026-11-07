import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, Search, Sparkles, Wand2 } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router'
import { Button } from '../../components/Button'
import { useAi } from '../ai/useAi'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { RowMenu, type MenuItem } from '../../components/RowMenu'
import { EmptyState, ErrorState, LoadingState } from '../../components/states'
import { useToast } from '../../components/toast/useToast'
import { useDebounce } from '../../hooks/useDebounce'
import { useMoveTodo } from '../../hooks/useMoveTodo'
import { useOpenTodo } from '../../hooks/useOpenTodo'
import { useProject } from '../../hooks/useProjects'
import { useDeleteSprint, useSprints } from '../../hooks/useSprints'
import { useBacklog } from '../../hooks/useTodos'
import { PRIORITY_LABELS, TYPE_LABELS } from '../../lib/constants'
import { TODO_PRIORITIES, TODO_TYPES, type Sprint, type TodoPriority, type TodoType } from '../../types/api'
import { SprintFormDialog } from '../sprints/SprintFormDialog'
import { SprintSection } from '../sprints/SprintSection'
import { StartSprintDialog } from '../sprints/StartSprintDialog'
import { sprintMoveItems } from './moveItems'
import { QuickCreate } from './QuickCreate'
import { SortableTodoItem } from './TodoRow'

export function BacklogPage() {
  const { projectId = '' } = useParams()
  const project = useProject(projectId)
  const sprints = useSprints(projectId)
  const openTodo = useOpenTodo()
  const move = useMoveTodo(projectId)
  const del = useDeleteSprint()
  const toast = useToast()
  const ai = useAi()

  const [query, setQuery] = useState('')
  const [priority, setPriority] = useState<TodoPriority | ''>('')
  const [type, setType] = useState<TodoType | ''>('')
  const search = useDebounce(query.trim(), 350)
  const filtered = !!(search || priority || type)

  const [creatingSprint, setCreatingSprint] = useState(false)
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null)
  const [deletingSprint, setDeletingSprint] = useState<Sprint | null>(null)
  const [startingSprint, setStartingSprint] = useState<Sprint | null>(null)

  const backlog = useBacklog(projectId, { search, priority, type })
  const todos = backlog.data ?? []
  const points = todos.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0)
  const totalInBacklog = project.data?.stats.backlogCount ?? 0
  const allSprints = sprints.data ?? []
  const planned = allSprints.filter((s) => s.status === 'planned')
  const activeSprintName = project.data?.stats.activeSprint?.name ?? null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = todos.findIndex((t) => t.id === active.id)
    const to = todos.findIndex((t) => t.id === over.id)
    const todo = todos[from]
    if (todo && to >= 0) move.mutate({ todo, position: to })
  }

  const clearFilters = () => {
    setQuery('')
    setPriority('')
    setType('')
  }

  const confirmDeleteSprint = () => {
    if (!deletingSprint) return
    del.mutate(deletingSprint.id, {
      onSuccess: () => {
        toast(`Deleted ${deletingSprint.name}. Its todos are back in the backlog.`)
        setDeletingSprint(null)
      },
      onError: (err) => {
        toast(err.message, 'error')
        setDeletingSprint(null)
      },
    })
  }

  const backlogMenu = (index: number): MenuItem[] => {
    const todo = todos[index]
    if (!todo) return []
    const order: MenuItem[] = filtered
      ? []
      : [
          { label: 'Move to top', disabled: index === 0, onSelect: () => move.mutate({ todo, position: 0 }) },
          { label: 'Move to bottom', disabled: index === todos.length - 1, onSelect: () => move.mutate({ todo, position: todos.length - 1 }) },
        ]
    return [...order, ...sprintMoveItems(todo, allSprints, move.mutate)]
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Backlog</h1>
          <p className="muted">Plan sprints above, prioritise the backlog below.</p>
        </div>
        <div className="header-actions">
          <Button onClick={ai.openGenerate}>
            <Sparkles size={16} aria-hidden="true" /> Generate todos
          </Button>
          <Button onClick={ai.openPlan}>
            <Wand2 size={16} aria-hidden="true" /> Plan sprint
          </Button>
          <Button variant="primary" onClick={() => setCreatingSprint(true)}>
            <Plus size={16} aria-hidden="true" /> Create sprint
          </Button>
        </div>
      </header>

      {sprints.isError && <ErrorState message={sprints.error.message} onRetry={() => sprints.refetch()} />}
      {planned.map((s) => (
        <SprintSection
          key={s.id}
          sprint={s}
          projectId={projectId}
          allSprints={allSprints}
          activeSprintName={activeSprintName}
          onOpen={openTodo}
          onMove={move.mutate}
          onEdit={setEditingSprint}
          onDelete={setDeletingSprint}
          onStart={setStartingSprint}
        />
      ))}

      <div className="section-head">
        <h2>Backlog</h2>
        <p className="muted" aria-live="polite">
          {backlog.data
            ? filtered
              ? `${todos.length} of ${totalInBacklog} todos match · ${points} pts`
              : `${todos.length} ${todos.length === 1 ? 'todo' : 'todos'} · ${points} pts`
            : 'Loading…'}
        </p>
      </div>

      <div className="toolbar" role="search">
        <div className="search-box">
          <Search size={16} aria-hidden="true" />
          <input type="search" aria-label="Search backlog" placeholder="Search key, title, description or label" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="input toolbar-select" aria-label="Filter by priority" value={priority} onChange={(e) => setPriority(e.target.value as TodoPriority | '')}>
          <option value="">All priorities</option>
          {TODO_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
        <select className="input toolbar-select" aria-label="Filter by type" value={type} onChange={(e) => setType(e.target.value as TodoType | '')}>
          <option value="">All types</option>
          {TODO_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        {filtered && (
          <Button variant="ghost" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>
      {filtered && <p className="muted filter-note">Reordering is paused while a filter is active, so positions stay correct.</p>}

      {backlog.isPending && <LoadingState label="Loading backlog…" />}
      {backlog.isError && <ErrorState message={backlog.error.message} onRetry={() => backlog.refetch()} />}

      {backlog.data && todos.length === 0 && !filtered && (
        <EmptyState title="Your backlog is empty" description="Add the first todo below, then plan a sprint from it.">
          <Button variant="primary" onClick={() => document.getElementById('quick-create')?.focus()}>
            Create todo
          </Button>
          <Button onClick={ai.openGenerate}>
            <Sparkles size={16} aria-hidden="true" /> Generate todos with AI
          </Button>
        </EmptyState>
      )}
      {backlog.data && todos.length === 0 && filtered && (
        <EmptyState title="No todos match your filters" description="Try a different search or clear the filters.">
          <Button onClick={clearFilters}>Clear filters</Button>
        </EmptyState>
      )}
      {todos.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <ul className="todo-list">
              {todos.map((t, i) => (
                <SortableTodoItem
                  key={t.id}
                  todo={t}
                  onOpen={openTodo}
                  dragDisabled={filtered}
                  menu={<RowMenu label={`Actions for ${t.key}`} items={backlogMenu(i)} />}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <QuickCreate projectId={projectId} />

      {creatingSprint && <SprintFormDialog projectId={projectId} onClose={() => setCreatingSprint(false)} />}
      {editingSprint && <SprintFormDialog projectId={projectId} sprint={editingSprint} onClose={() => setEditingSprint(null)} />}
      {startingSprint && <StartSprintDialog sprint={startingSprint} projectId={projectId} onClose={() => setStartingSprint(null)} />}
      {deletingSprint && (
        <ConfirmDialog
          title={`Delete ${deletingSprint.name}?`}
          message={`The sprint is removed and its ${deletingSprint.stats.totalTodos} todos return to the backlog.`}
          confirmLabel="Delete sprint"
          danger
          pending={del.isPending}
          onConfirm={confirmDeleteSprint}
          onCancel={() => setDeletingSprint(null)}
        />
      )}
    </div>
  )
}
