// Components
export { AnnotationProvider } from './components/AnnotationProvider'
export { AnnotationCanvas } from './components/AnnotationCanvas'
export { ToolButton } from './components/ToolButton'

// Composables
export { useAnnotation } from './composables/useAnnotationContext'
export { useAnnotationEngine } from './composables/useAnnotationEngine'

// Re-export core types
export type {
  BoundingBox, ToolType,
  InteractionMode, Point, Size, Rect,
} from '@labelflow/core'
