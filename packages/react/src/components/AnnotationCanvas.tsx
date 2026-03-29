import React, { useRef, useEffect, useCallback } from 'react'
import { Canvas2DRenderer } from '@labelflow-core/engine'
import { useAnnotation } from './AnnotationContext'

export interface AnnotationCanvasProps {
  src: string
  width?: number
  height?: number
  style?: React.CSSProperties
  className?: string
}

export function AnnotationCanvas({
  src,
  width,
  height,
  style,
  className,
}: AnnotationCanvasProps) {
  const { engine } = useAnnotation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<Canvas2DRenderer | null>(null)
  const rafRef = useRef<number>(0)
  const imageRef = useRef<HTMLImageElement | null>(null)

  // ─── Initialize renderer ─────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    rendererRef.current = new Canvas2DRenderer(canvas)

    return () => {
      rendererRef.current?.destroy()
      rendererRef.current = null
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // ─── Load image ───────────────────────────────
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageRef.current = img
      engine.setImage(img)
      requestRender()
    }
    img.src = src
  }, [src, engine])

  // ─── Resize handling ──────────────────────────
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect
        rendererRef.current?.resize(w, h)
        engine.setCanvasSize({ width: w, height: h })
        requestRender()
      }
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [engine])

  // ─── Render loop ──────────────────────────────
  const requestRender = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      rendererRef.current?.render(engine.renderState)
    })
  }, [engine])

  // Subscribe to engine changes for re-rendering
  useEffect(() => {
    const unsubs = [
      engine.on('annotations:change', requestRender),
      engine.on('annotation:select', requestRender),
      engine.on('mode:change', requestRender),
      engine.on('viewport:change', requestRender),
      engine.on('drawing:update', requestRender),
      engine.on('drawing:cancel', requestRender),
      engine.on('drawing:end', requestRender),
    ]
    return () => unsubs.forEach(fn => fn())
  }, [engine, requestRender])

  // ─── Cursor management ────────────────────────
  const getCursor = (): string => {
    if (engine.isPanning) return 'grabbing'
    if (engine.mode === 'drawing') return 'crosshair'
    if (engine.mode === 'dragging') return 'move'
    if (engine.mode === 'resizing') return 'nwse-resize'
    if (engine.activeTool === 'bbox') return 'crosshair'
    if (engine.hoveredId) return 'pointer'
    return 'default'
  }

  // ─── Event handlers ───────────────────────────
  const getCanvasPoint = (e: React.MouseEvent): { x: number; y: number } => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    canvasRef.current?.setPointerCapture(e.pointerId)
    engine.onPointerDown(getCanvasPoint(e), e.button)
    requestRender()
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    engine.onPointerMove(getCanvasPoint(e))
    requestRender()
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    canvasRef.current?.releasePointerCapture(e.pointerId)
    engine.onPointerUp(getCanvasPoint(e))
    requestRender()
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    engine.onKeyDown(e.key)
    requestRender()
  }, [engine, requestRender])

  // Wheel: must be non-passive to allow preventDefault
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      engine.onWheel({ x: e.clientX - rect.left, y: e.clientY - rect.top }, e.deltaY)
      requestRender()
    }

    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', onWheel)
  }, [engine, requestRender])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Prevent context menu on canvas
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: width ?? '100%',
        height: height ?? '100%',
        overflow: 'hidden',
        ...style,
      }}
      className={className}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: getCursor(),
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onContextMenu={handleContextMenu}
      />
    </div>
  )
}
