import { differenceInCalendarDays, format, parseISO } from 'date-fns'

export const formatDate = (d: string | null) => (d ? format(parseISO(d), 'MMM d') : '')

export function formatRange(start: string | null, end: string | null) {
  if (!start && !end) return 'No dates'
  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`
  return start ? `From ${formatDate(start)}` : `Until ${formatDate(end)}`
}

export const formatDateTime = (iso: string) => format(parseISO(iso), 'MMM d, HH:mm')

export const daysLeft = (end: string | null) => (end ? differenceInCalendarDays(parseISO(end), new Date()) : null)
