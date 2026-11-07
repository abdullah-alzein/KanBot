import { useContext } from 'react'
import { AiContext } from './ai-context'

export const useAi = () => useContext(AiContext)
