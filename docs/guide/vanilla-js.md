# Vanilla JavaScript Guide

Use `@labelflow-core/engine` directly without any framework.

## Setup

```bash
npm install @labelflow-core/engine
```

## Full Example

```html
<canvas id="canvas" width="800" height="600"></canvas>
<button id="btn-select">Select</button>
<button id="btn-bbox">Draw BBox</button>
<button id="btn-delete">Delete</button>

<script type="module">
import { AnnotationEngine, Canvas2DRenderer } from '@labelflow-core/engine'

const canvas = document.getElementById('canvas')
const engine = new AnnotationEngine()
const renderer = new Canvas2DRenderer(canvas)

// Resize canvas for HiDPI
renderer.resize(800, 600)
engine.setCanvasSize({ width: 800, height: 600 })

// Load image
const img = new Image()
img.crossOrigin = 'anonymous'
img.onload = () => {
  engine.setImage(img)
  render()
}
img.src = '/photo.jpg'

// Render function
function render() {
  renderer.render(engine.renderState)
}

// Pointer events
function getPoint(e) {
  const r = canvas.getBoundingClientRect()
  return { x: e.clientX - r.left, y: e.clientY - r.top }
}

canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault()
  canvas.setPointerCapture(e.pointerId)
  engine.onPointerDown(getPoint(e), e.button)
  render()
})

canvas.addEventListener('pointermove', (e) => {
  engine.onPointerMove(getPoint(e))
  render()
})

canvas.addEventListener('pointerup', (e) => {
  canvas.releasePointerCapture(e.pointerId)
  engine.onPointerUp(getPoint(e))
  render()
})

canvas.addEventListener('wheel', (e) => {
  e.preventDefault()
  engine.onWheel(getPoint(e), e.deltaY)
  render()
}, { passive: false })

canvas.addEventListener('contextmenu', (e) => e.preventDefault())

window.addEventListener('keydown', (e) => {
  engine.onKeyDown(e.key)
  render()
})

// Tool buttons
document.getElementById('btn-select').onclick = () => {
  engine.setActiveTool(null)
}
document.getElementById('btn-bbox').onclick = () => {
  engine.setActiveTool('bbox')
}
document.getElementById('btn-delete').onclick = () => {
  if (engine.selectedId) engine.deleteAnnotation(engine.selectedId)
  render()
}

// Listen to changes
engine.on('annotations:change', (list) => {
  console.log('Annotations:', list)
  render()
})
</script>
```

## Key Differences from React/Vue

| | React/Vue | Vanilla JS |
|---|---|---|
| State sync | Automatic via Provider | Manual: call `render()` after each interaction |
| Event binding | Handled by AnnotationCanvas | You bind pointer/wheel/key events yourself |
| Resize | ResizeObserver built-in | Call `renderer.resize()` and `engine.setCanvasSize()` manually |
| Re-render | Automatic on state change | Call `renderer.render(engine.renderState)` yourself |
