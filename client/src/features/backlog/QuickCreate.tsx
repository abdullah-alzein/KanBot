import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '../../components/toast/useToast'
import { useCreateTodo } from '../../hooks/useTodos'

/** Enter saves a title-only todo and keeps focus for the next one. Escape cancels. */
export function QuickCreate({ projectId }: { projectId: string }) {
  const [title, setTitle] = useState('')
  const create = useCreateTodo(projectId)
  const toast = useToast()

  const submit = () => {
    const t = title.trim()
    if (!t) return
    setTitle('')
    create.mutate(
      { title: t },
      {
        onError: (err) => {
          setTitle(t)
          toast(err.message, 'error')
        },
      },
    )
  }

  return (
    <div className="quick-create">
      <Plus size={16} aria-hidden="true" />
      <input
        id="quick-create"
        className="quick-input"
        value={title}
        placeholder="Create todo — type a title and press Enter"
        aria-label="Create todo"
        maxLength={200}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
            e.preventDefault()
            submit()
          } else if (e.key === 'Escape') {
            setTitle('')
            e.currentTarget.blur()
          }
        }}
      />
    </div>
  )
}
