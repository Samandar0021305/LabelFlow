import { defineComponent, computed, h, type PropType } from 'vue'
import type { ToolType } from '@labelflow-core/engine'
import { useAnnotation } from '../composables/useAnnotationContext'

export const ToolButton = defineComponent({
  name: 'ToolButton',
  props: {
    tool: {
      type: [String, null] as PropType<ToolType | null>,
      default: null,
    },
  },
  setup(props, { slots }) {
    const { engine, setActiveTool } = useAnnotation()

    const isActive = computed(() => engine.activeTool === props.tool)

    function onClick() {
      setActiveTool(props.tool)
    }

    return () => h('button', {
      type: 'button',
      onClick,
      'data-active': isActive.value,
      class: isActive.value ? 'lf-tool-active' : '',
    }, slots.default?.() ?? (props.tool === null ? 'Select' : props.tool))
  },
})
