import React from 'react'
import type { Annotation } from '@labelflow-core/engine'
import { useAnnotationEngine } from '../hooks/useAnnotationEngine'
import { AnnotationCtx } from './AnnotationContext'

export interface AnnotationProviderProps {
  children: React.ReactNode
  annotations?: Annotation[]
  /** Active drawing color. null = random color per annotation */
  color?: string | null
  onChange?: (annotations: Annotation[]) => void
  onSelect?: (id: string | null) => void
  onCreate?: (bbox: Annotation) => void
  onUpdate?: (bbox: Annotation) => void
  onDelete?: (id: string) => void
}

export function AnnotationProvider({
  children,
  annotations,
  color,
  onChange,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
}: AnnotationProviderProps) {
  const {
    engine,
    setActiveTool,
    setColor,
    deleteSelected,
    clearAll,
    zoomIn,
    zoomOut,
    resetZoom,
  } = useAnnotationEngine({
    annotations, color, onChange, onSelect, onCreate, onUpdate, onDelete,
  })

  return (
    <AnnotationCtx.Provider value={{
      engine,
      setActiveTool,
      setColor,
      deleteSelected,
      clearAll,
      zoomIn,
      zoomOut,
      resetZoom,
    }}>
      {children}
    </AnnotationCtx.Provider>
  )
}
