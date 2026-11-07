import { useQuery } from '@tanstack/react-query'
import { getAiStatus } from '../api/ai'

/** Fetched once per session: tells the UI whether answers come from the mock or a real model. */
export const useAiStatus = () =>
  useQuery({ queryKey: ['ai-status'], queryFn: getAiStatus, staleTime: Infinity, gcTime: Infinity })
