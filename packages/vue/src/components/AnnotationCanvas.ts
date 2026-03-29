import {
  defineComponent, ref, onMounted, onUnmounted, watch, computed, h,
  type PropType,
} from 'vue'
import { Canvas2DRenderer } from '@labelflow-core/engine'
import { useAnnotation } from '../composables/useAnnotationContext'

export const AnnotationCanvas = defineComponent({
  name: 'AnnotationCanvas',
  props: {
    src: { type: String, required: true },
    width: { type: [Number, String] as PropType<number | string>, default: '100%' },
    height: { type: [Number, String] as PropType<number | string>, default: '100%' },
  },
  setup(props) {
    const { engine } = useAnnotation()
    const containerRef = ref<HTMLDivElement | null>(null)
    const canvasRef = ref<HTMLCanvasElement | null>(null)
    let renderer: Canvas2DRenderer | null = null
    let rafId = 0
    let observer: ResizeObserver | null = null

    function requestRender() {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        renderer?.render(engine.renderState)
      })
    }

    // Mount
    onMounted(() => {
      const canvas = canvasRef.value!
      renderer = new Canvas2DRenderer(canvas)

      // Resize observer
      observer = new ResizeObserver(entries => {
        for (const entry of entries) {
          const { width: w, height: h } = entry.contentRect
          renderer?.resize(w, h)
          engine.setCanvasSize({ width: w, height: h })
          requestRender()
        }
      })
      observer.observe(containerRef.value!)

      // Subscribe to engine
      const unsubs = [
        engine.on('annotations:change', requestRender),
        engine.on('annotation:select', requestRender),
        engine.on('mode:change', requestRender),
        engine.on('viewport:change', requestRender),
        engine.on('drawing:update', requestRender),
        engine.on('drawing:cancel', requestRender),
        engine.on('drawing:end', requestRender),
      ]

      onUnmounted(() => {
        unsubs.forEach(fn => fn())
        observer?.disconnect()
        renderer?.destroy()
        cancelAnimationFrame(rafId)
      })
    })

    // Load image
    watch(() => props.src, (src) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        engine.setImage(img)
        requestRender()
      }
      img.src = src
    }, { immediate: true })

    // Cursor
    const cursor = computed(() => {
      if (engine.isPanning) return 'grabbing'
      if (engine.mode === 'drawing') return 'crosshair'
      if (engine.mode === 'dragging') return 'move'
      if (engine.mode === 'resizing') return 'nwse-resize'
      if (engine.activeTool === 'bbox') return 'crosshair'
      if (engine.hoveredId) return 'pointer'
      return 'default'
    })

    // Events
    function getCanvasPoint(e: MouseEvent) {
      const rect = canvasRef.value!.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    function onPointerDown(e: PointerEvent) {
      e.preventDefault()
      canvasRef.value?.setPointerCapture(e.pointerId)
      engine.onPointerDown(getCanvasPoint(e), e.button)
      requestRender()
    }

    function onPointerMove(e: PointerEvent) {
      engine.onPointerMove(getCanvasPoint(e))
      requestRender()
    }

    function onPointerUp(e: PointerEvent) {
      canvasRef.value?.releasePointerCapture(e.pointerId)
      engine.onPointerUp(getCanvasPoint(e))
      requestRender()
    }

    function onDblClick(e: MouseEvent) {
      engine.onDoubleClick(getCanvasPoint(e))
      requestRender()
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      engine.onWheel(getCanvasPoint(e), e.deltaY)
      requestRender()
    }

    function onKeyDown(e: KeyboardEvent) {
      engine.onKeyDown(e.key)
      requestRender()
    }

    onMounted(() => {
      window.addEventListener('keydown', onKeyDown)
      onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
    })

    return () => h('div', {
      ref: containerRef,
      style: {
        position: 'relative',
        width: typeof props.width === 'number' ? `${props.width}px` : props.width,
        height: typeof props.height === 'number' ? `${props.height}px` : props.height,
        overflow: 'hidden',
      },
    }, [
      h('canvas', {
        ref: canvasRef,
        style: {
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: cursor.value,
        },
        onPointerdown: onPointerDown,
        onPointermove: onPointerMove,
        onPointerup: onPointerUp,
        onDblclick: onDblClick,
        onWheel: onWheel,
        onContextmenu: (e: Event) => e.preventDefault(),
      }),
    ])
  },
})
