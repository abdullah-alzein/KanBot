import { useCallback } from 'react'
import { useSearchParams } from 'react-router'

/** Todo details live in the URL (?todo=<id>) so they work over any project page and survive refresh. */
export function useOpenTodo() {
  const [, setParams] = useSearchParams()
  return useCallback(
    (id: string) =>
      setParams((p) => {
        const next = new URLSearchParams(p)
        next.set('todo', id)
        return next
      }),
    [setParams],
  )
}
