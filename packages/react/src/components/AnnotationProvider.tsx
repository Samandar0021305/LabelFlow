import React from 'react'
import type { BoundingBox } from '@labelflow-core/engine'
import { useAnnotationEngine } from '../hooks/useAnnotationEngine'
import { AnnotationCtx } from './AnnotationContext'

export interface AnnotationProviderProps {
  children: React.ReactNode
  annotations?: BoundingBox[]
  /** Active drawing color. null = random color per annotation */
  color?: string | null
  onChange?: (annotations: BoundingBox[]) => void
  onSelect?: (id: string | null) => void
  onCreate?: (bbox: BoundingBox) => void
  onUpdate?: (bbox: BoundingBox) => void
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
