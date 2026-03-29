# @labelflow-core/engine

Framework-agnostic image annotation engine. The core that powers [@labelflow-core/react](https://www.npmjs.com/package/@labelflow-core/react) and [@labelflow-core/vue](https://www.npmjs.com/package/@labelflow-core/vue). Zero dependencies. ~25KB.

> **Most users should install `@labelflow-core/react` or `@labelflow-core/vue` instead.** This package is for vanilla JavaScript usage or building custom framework adapters.

## Install

```bash
npm install @labelflow-core/engine
```

## Supported Tools

- **BBox** — click and drag to draw rectangles. Resize with 8-point handles.
- **Polygon** — click to place vertices, close by clicking near the first point or double-click. Drag vertices to edit.

## Usage

```js
import { AnnotationEngine, Canvas2DRenderer } from '@labelflow-core/engine'

const canvas = document.getElementById('canvas')
const engine = new AnnotationEngine()
const renderer = new Canvas2DRenderer(canvas)

// Load image
const img = new Image()
img.onload = () => {
  engine.setImage(img)
  renderer.resize(800, 600)
  engine.setCanvasSize({ width: 800, height: 600 })
  engine.setActiveTool('polygon') // or 'bbox'
  renderer.render(engine.renderState)
}
img.src = '/photo.jpg'

// Wire up events
canvas.addEventListener('pointerdown', (e) => {
  const r = canvas.getBoundingClientRect()
  engine.onPointerDown({ x: e.clientX - r.left, y: e.clientY - r.top }, e.button)
  renderer.render(engine.renderState)
})
canvas.addEventListener('pointermove', (e) => {
  const r = canvas.getBoundingClientRect()
  engine.onPointerMove({ x: e.clientX - r.left, y: e.clientY - r.top })
  renderer.render(engine.renderState)
})
canvas.addEventListener('pointerup', (e) => {
  const r = canvas.getBoundingClientRect()
  engine.onPointerUp({ x: e.clientX - r.left, y: e.clientY - r.top })
  renderer.render(engine.renderState)
})
canvas.addEventListener('dblclick', (e) => {
  const r = canvas.getBoundingClientRect()
  engine.onDoubleClick({ x: e.clientX - r.left, y: e.clientY - r.top })
  renderer.render(engine.renderState)
})

// Import/export
engine.setAnnotations([
  { id: '1', type: 'bbox', x: 100, y: 100, width: 200, height: 150, rotation: 0, color: '#FF6B6B' },
  { id: '2', type: 'polygon', points: [{ x: 300, y: 100 }, { x: 450, y: 80 }, { x: 400, y: 250 }], color: '#4ECDC4' },
])
console.log(engine.annotations)
```

See [@labelflow-core/react](https://www.npmjs.com/package/@labelflow-core/react) or [@labelflow-core/vue](https://www.npmjs.com/package/@labelflow-core/vue) for framework-specific usage.

## License

MIT
