import { inject, provide, type InjectionKey } from 'vue'
import type { AnnotationEngine, ToolType } from '@labelflow-core/engine'

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

export const ANNOTATION_KEY: InjectionKey<AnnotationContextValue> = Symbol('labelflow-annotation')

export function provideAnnotation(value: AnnotationContextValue): void {
  provide(ANNOTATION_KEY, value)
}

export function useAnnotation(): AnnotationContextValue {
  const ctx = inject(ANNOTATION_KEY)
  if (!ctx) {
    throw new Error('useAnnotation must be used within <AnnotationProvider>')
  }
  return ctx
}
