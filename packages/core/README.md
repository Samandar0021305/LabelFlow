# @labelflow-core/engine

Framework-agnostic image annotation engine. The core that powers [@labelflow-core/react](https://www.npmjs.com/package/@labelflow-core/react) and [@labelflow-core/vue](https://www.npmjs.com/package/@labelflow-core/vue). Zero dependencies. ~23KB.

> **Most users should install `@labelflow-core/react` or `@labelflow-core/vue` instead.** This package is for vanilla JavaScript usage or building custom framework adapters.

## Install

```bash
npm install @labelflow-core/engine
```

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
  engine.setActiveTool('bbox')
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

// Listen for changes
engine.on('annotations:change', (list) => {
  console.log('Annotations:', list)
})

// Import/export
engine.setAnnotations([
  { id: '1', x: 100, y: 100, width: 200, height: 150, rotation: 0, color: '#FF6B6B' }
])
console.log(engine.annotations)
```

See [@labelflow-core/react](https://www.npmjs.com/package/@labelflow-core/react) or [@labelflow-core/vue](https://www.npmjs.com/package/@labelflow-core/vue) for framework-specific usage.

## License

MIT
