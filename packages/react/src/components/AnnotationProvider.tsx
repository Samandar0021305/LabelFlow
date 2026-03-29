import React from 'react'
import type { BoundingBox, AnnotationClass, ToolType } from '@labelflow/core'
import { useAnnotationEngine } from '../hooks/useAnnotationEngine'
import { AnnotationCtx } from './AnnotationContext'

export interface AnnotationProviderProps {
  children: React.ReactNode
  annotations?: BoundingBox[]
  classes?: AnnotationClass[]
  onChange?: (annotations: BoundingBox[]) => void
  onSelect?: (id: string | null) => void
  onCreate?: (bbox: BoundingBox) => void
  onUpdate?: (bbox: BoundingBox) => void
  onDelete?: (id: string) => void
}

export function AnnotationProvider({
  children,
  annotations,
  classes,
  onChange,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
}: AnnotationProviderProps) {
  const {
    engine,
    setActiveTool,
    setActiveClass,
    deleteSelected,
    clearAll,
    zoomIn,
    zoomOut,
    resetZoom,
  } = useAnnotationEngine({
    annotations, classes, onChange, onSelect, onCreate, onUpdate, onDelete,
  })

  return (
    <AnnotationCtx.Provider value={{
      engine,
      setActiveTool,
      setActiveClass,
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
