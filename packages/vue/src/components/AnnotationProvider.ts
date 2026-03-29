import { defineComponent, type PropType, toRef, h, type SlotsType } from 'vue'
import type { BoundingBox, AnnotationClass } from '@labelflow/core'
import { useAnnotationEngine } from '../composables/useAnnotationEngine'
import { provideAnnotation } from '../composables/useAnnotationContext'

export const AnnotationProvider = defineComponent({
  name: 'AnnotationProvider',
  props: {
    annotations: {
      type: Array as PropType<BoundingBox[]>,
      default: () => [],
    },
    classes: {
      type: Array as PropType<AnnotationClass[]>,
      default: () => [],
    },
  },
  emits: ['change', 'select', 'create', 'update', 'delete'],
  setup(props, { slots, emit }) {
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
      annotations: toRef(props, 'annotations'),
      classes: toRef(props, 'classes'),
      onChange: (anns) => emit('change', anns),
      onSelect: (id) => emit('select', id),
      onCreate: (bbox) => emit('create', bbox),
      onUpdate: (bbox) => emit('update', bbox),
      onDelete: (id) => emit('delete', id),
    })

    provideAnnotation({
      engine,
      setActiveTool,
      setActiveClass,
      deleteSelected,
      clearAll,
      zoomIn,
      zoomOut,
      resetZoom,
    })

    return () => slots.default?.()
  },
})
