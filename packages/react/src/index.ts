// Components
export { AnnotationProvider } from './components/AnnotationProvider'
export type { AnnotationProviderProps } from './components/AnnotationProvider'

export { AnnotationCanvas } from './components/AnnotationCanvas'
export type { AnnotationCanvasProps } from './components/AnnotationCanvas'

// Hooks
export { useAnnotation } from './components/AnnotationContext'
export { useAnnotationEngine } from './hooks/useAnnotationEngine'

// Re-export core types for convenience
export type {
  BoundingBox, Polygon, Annotation, ToolType,
  InteractionMode, Point, Size, Rect,
} from '@labelflow-core/engine'
