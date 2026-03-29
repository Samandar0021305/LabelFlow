import { defineComponent, type PropType, toRef } from 'vue'
import type { Annotation } from '@labelflow-core/engine'
import { useAnnotationEngine } from '../composables/useAnnotationEngine'
import { provideAnnotation } from '../composables/useAnnotationContext'

export const AnnotationProvider = defineComponent({
  name: 'AnnotationProvider',
  props: {
    annotations: {
      type: Array as PropType<Annotation[]>,
      default: () => [],
    },
    color: {
      type: [String, null] as PropType<string | null>,
      default: null,
    },
  },
  emits: ['change', 'select', 'create', 'update', 'delete'],
  setup(props, { slots, emit }) {
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
      annotations: toRef(props, 'annotations'),
      color: toRef(props, 'color'),
      onChange: (anns) => emit('change', anns),
      onSelect: (id) => emit('select', id),
      onCreate: (bbox) => emit('create', bbox),
      onUpdate: (bbox) => emit('update', bbox),
      onDelete: (id) => emit('delete', id),
    })

    provideAnnotation({
      engine,
      setActiveTool,
      setColor,
      deleteSelected,
      clearAll,
      zoomIn,
      zoomOut,
      resetZoom,
    })

    return () => slots.default?.()
  },
})
