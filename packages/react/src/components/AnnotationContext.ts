import { createContext, useContext } from 'react'
import type { AnnotationEngine, ToolType } from '@labelflow/core'

export interface AnnotationContextValue {
  engine: AnnotationEngine
  setActiveTool: (tool: ToolType | null) => void
  setColor: (color: string | null) => void
  deleteSelected: () => void
  clearAll: () => void
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
}

export const AnnotationCtx = createContext<AnnotationContextValue | null>(null)

export function useAnnotation(): AnnotationContextValue {
  const ctx = useContext(AnnotationCtx)
  if (!ctx) {
    throw new Error('useAnnotation must be used within <AnnotationProvider>')
  }
  return ctx
}
