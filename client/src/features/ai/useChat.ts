import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { chat } from '../../api/ai'
import type { AiSource, ChatMessage } from '../../types/api'

/** Conversation kept in memory only (the server is stateless). The whole list is sent each time. */
export function useChat(projectId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [source, setSource] = useState<AiSource | null>(null)

  const mutation = useMutation({
    mutationFn: (msgs: ChatMessage[]) => chat(projectId, { messages: msgs.slice(-30) }),
    onSuccess: (res, msgs) => {
      setSource(res.source)
      // Ignore the reply if the user started a new chat while waiting.
      setMessages((prev) => (prev.length === msgs.length ? [...prev, res.message] : prev))
    },
  })

  const send = (text: string) => {
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    mutation.mutate(next)
  }
  /** Re-sends the current conversation (its last message is the unanswered user message). */
  const retry = () => mutation.mutate(messages)
  const reset = () => {
    mutation.reset()
    setMessages([])
  }

  return { messages, source, send, retry, reset, pending: mutation.isPending, error: mutation.isError ? mutation.error : null }
}
