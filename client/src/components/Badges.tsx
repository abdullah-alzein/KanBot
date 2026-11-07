import { ArrowDown, ArrowUp, Bookmark, Bug, Check, Flame, Minus } from 'lucide-react'
import type { ReactNode } from 'react'
import { PRIORITY_LABELS, TYPE_LABELS } from '../lib/constants'
import type { StoryPoints, TodoPriority, TodoType } from '../types/api'

const PRIORITY_ICON: Record<TodoPriority, ReactNode> = {
  low: <ArrowDown size={13} aria-hidden="true" />,
  medium: <Minus size={13} aria-hidden="true" />,
  high: <ArrowUp size={13} aria-hidden="true" />,
  urgent: <Flame size={13} aria-hidden="true" />,
}
const TYPE_ICON: Record<TodoType, ReactNode> = {
  task: <Check size={13} aria-hidden="true" />,
  story: <Bookmark size={13} aria-hidden="true" />,
  bug: <Bug size={13} aria-hidden="true" />,
}

/** Icon + text, so priority is never communicated by colour alone. */
export function PriorityBadge({ priority }: { priority: TodoPriority }) {
  return (
    <span className={`badge badge-priority-${priority}`}>
      {PRIORITY_ICON[priority]}
      {PRIORITY_LABELS[priority]}
    </span>
  )
}

export function TypeBadge({ type }: { type: TodoType }) {
  return (
    <span className={`badge badge-type-${type}`} title={TYPE_LABELS[type]}>
      {TYPE_ICON[type]}
      {TYPE_LABELS[type]}
    </span>
  )
}

export function PointsBadge({ points }: { points: StoryPoints | null }) {
  return (
    <span className="badge badge-points" title={points === null ? 'Not estimated' : `${points} story points`}>
      {points === null ? '– pts' : `${points} pts`}
    </span>
  )
}
