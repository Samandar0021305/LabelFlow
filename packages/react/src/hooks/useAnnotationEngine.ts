import { useRef, useCallback, useEffect, useState } from 'react'
import { AnnotationEngine } from '@labelflow/core'
import type { BoundingBox, ToolType } from '@labelflow/core'

export function useAnnotationEngine(options?: {
  annotations?: BoundingBox[]
  color?: string | null
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

  const [, setVersion] = useState(0)
  const rerender = useCallback(() => setVersion(v => v + 1), [])

  // Track whether this sync came from us to avoid echo loops
  const isSyncingRef = useRef(false)

  // Sync external annotations → engine via useEffect (not during render)
  const annotationsRef = useRef(options?.annotations)
  annotationsRef.current = options?.annotations

  useEffect(() => {
    if (options?.annotations) {
      isSyncingRef.current = true
      engine.setAnnotations(options.annotations)
      isSyncingRef.current = false
    }
  }, [options?.annotations, engine])

  // Sync color via useEffect
  useEffect(() => {
    engine.setColor(options?.color ?? null)
  }, [options?.color, engine])

  // Store callbacks in refs
  const callbacksRef = useRef(options)
  callbacksRef.current = options

  // Subscribe to engine events once
  useEffect(() => {
    const unsubs = [
      engine.on('annotations:change', (anns) => {
        // Don't echo back when we're syncing from props
        if (!isSyncingRef.current) {
          callbacksRef.current?.onChange?.(anns)
        }
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

  const setActiveTool = useCallback((tool: ToolType | null) => {
    engine.setActiveTool(tool)
  }, [engine])

  const setColor = useCallback((color: string | null) => {
    engine.setColor(color)
    rerender()
  }, [engine, rerender])

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
    color: engine.color,
    setActiveTool,
    setColor,
    deleteSelected,
    clearAll,
    zoomIn: () => engine.zoomIn(),
    zoomOut: () => engine.zoomOut(),
    resetZoom: () => engine.resetZoom(),
  }
}
