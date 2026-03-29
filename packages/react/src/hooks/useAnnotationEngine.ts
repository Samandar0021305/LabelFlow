import { useRef, useCallback, useEffect, useState } from 'react'
import { AnnotationEngine } from '@labelflow/core'
import type { BoundingBox, AnnotationClass, ToolType } from '@labelflow/core'

export function useAnnotationEngine(options?: {
  annotations?: BoundingBox[]
  classes?: AnnotationClass[]
  onChange?: (annotations: BoundingBox[]) => void
  onSelect?: (id: string | null) => void
  onCreate?: (bbox: BoundingBox) => void
  onUpdate?: (bbox: BoundingBox) => void
  onDelete?: (id: string) => void
}) {
  const engineRef = useRef<AnnotationEngine | null>(null)
  if (!engineRef.current) {
    engineRef.current = new AnnotationEngine()
  }
  const engine = engineRef.current

  // Simple version counter to trigger re-renders
  const [, setVersion] = useState(0)
  const rerender = useCallback(() => setVersion(v => v + 1), [])

  // Sync external annotations → engine (only when reference changes)
  const prevAnnotationsRef = useRef<BoundingBox[] | undefined>()
  if (options?.annotations && options.annotations !== prevAnnotationsRef.current) {
    prevAnnotationsRef.current = options.annotations
    engine.setAnnotations(options.annotations)
  }

  // Sync classes
  const prevClassesRef = useRef<AnnotationClass[] | undefined>()
  if (options?.classes && options.classes !== prevClassesRef.current) {
    prevClassesRef.current = options.classes
    engine.setClasses(options.classes)
  }

  // Store callbacks in refs to avoid re-subscribing
  const callbacksRef = useRef(options)
  callbacksRef.current = options

  // Subscribe to engine events once
  useEffect(() => {
    const unsubs = [
      engine.on('annotations:change', (anns) => {
        callbacksRef.current?.onChange?.(anns)
        rerender()
      }),
      engine.on('annotation:select', (id) => {
        callbacksRef.current?.onSelect?.(id)
        rerender()
      }),
      engine.on('annotation:create', (bbox) => {
        callbacksRef.current?.onCreate?.(bbox)
      }),
      engine.on('annotation:update', (bbox) => {
        callbacksRef.current?.onUpdate?.(bbox)
      }),
      engine.on('annotation:delete', (id) => {
        callbacksRef.current?.onDelete?.(id)
      }),
      engine.on('mode:change', rerender),
      engine.on('tool:change', rerender),
      engine.on('viewport:change', rerender),
    ]

    return () => unsubs.forEach(fn => fn())
  }, [engine, rerender])

  // Action helpers
  const setActiveTool = useCallback((tool: ToolType | null) => {
    engine.setActiveTool(tool)
  }, [engine])

  const setActiveClass = useCallback((classId: string | null) => {
    engine.setActiveClass(classId)
  }, [engine])

  const deleteSelected = useCallback(() => {
    if (engine.selectedId) engine.deleteAnnotation(engine.selectedId)
  }, [engine])

  const clearAll = useCallback(() => {
    engine.clearAnnotations()
  }, [engine])

  return {
    engine,
    annotations: engine.annotations,
    selectedId: engine.selectedId,
    activeTool: engine.activeTool,
    mode: engine.mode,
    zoom: engine.zoom,
    setActiveTool,
    setActiveClass,
    deleteSelected,
    clearAll,
    zoomIn: () => engine.zoomIn(),
    zoomOut: () => engine.zoomOut(),
    resetZoom: () => engine.resetZoom(),
  }
}
