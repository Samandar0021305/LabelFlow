import { ref, shallowRef, watch, onUnmounted, type Ref } from 'vue'
import { AnnotationEngine } from '@labelflow/core'
import type { BoundingBox, AnnotationClass, ToolType, InteractionMode, RenderState } from '@labelflow/core'

export interface UseAnnotationEngineOptions {
  annotations?: Ref<BoundingBox[]>
  classes?: Ref<AnnotationClass[]>
  onChange?: (annotations: BoundingBox[]) => void
  onSelect?: (id: string | null) => void
  onCreate?: (bbox: BoundingBox) => void
  onUpdate?: (bbox: BoundingBox) => void
  onDelete?: (id: string) => void
}

export function useAnnotationEngine(options?: UseAnnotationEngineOptions) {
  const engine = new AnnotationEngine()

  const annotations = ref<BoundingBox[]>([])
  const selectedId = ref<string | null>(null)
  const activeTool = ref<ToolType | null>(null)
  const mode = ref<InteractionMode>('idle')
  const zoom = ref(1)

  // Sync external annotations → engine
  if (options?.annotations) {
    watch(options.annotations, (newAnns) => {
      engine.setAnnotations(newAnns)
    }, { immediate: true })
  }

  if (options?.classes) {
    watch(options.classes, (newClasses) => {
      engine.setClasses(newClasses)
    }, { immediate: true })
  }

  // Subscribe to engine events
  const unsubs: (() => void)[] = []

  unsubs.push(engine.on('annotations:change', (anns) => {
    annotations.value = [...anns]
    options?.onChange?.(anns)
  }))

  unsubs.push(engine.on('annotation:select', (id) => {
    selectedId.value = id
    options?.onSelect?.(id)
  }))

  unsubs.push(engine.on('annotation:create', (bbox) => {
    options?.onCreate?.(bbox)
  }))

  unsubs.push(engine.on('annotation:update', (bbox) => {
    options?.onUpdate?.(bbox)
  }))

  unsubs.push(engine.on('annotation:delete', (id) => {
    options?.onDelete?.(id)
  }))

  unsubs.push(engine.on('tool:change', (tool) => {
    activeTool.value = tool
  }))

  unsubs.push(engine.on('mode:change', (m) => {
    mode.value = m
  }))

  unsubs.push(engine.on('viewport:change', (v) => {
    zoom.value = v.zoom
  }))

  onUnmounted(() => {
    unsubs.forEach(fn => fn())
    engine.destroy()
  })

  // Actions
  function setActiveTool(tool: ToolType | null) {
    engine.setActiveTool(tool)
  }

  function setActiveClass(classId: string | null) {
    engine.setActiveClass(classId)
  }

  function deleteSelected() {
    if (engine.selectedId) engine.deleteAnnotation(engine.selectedId)
  }

  function clearAll() {
    engine.clearAnnotations()
  }

  return {
    engine,
    annotations,
    selectedId,
    activeTool,
    mode,
    zoom,
    setActiveTool,
    setActiveClass,
    deleteSelected,
    clearAll,
    zoomIn: () => engine.zoomIn(),
    zoomOut: () => engine.zoomOut(),
    resetZoom: () => engine.resetZoom(),
  }
}
