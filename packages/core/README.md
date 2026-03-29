# @labelflow/core

Framework-agnostic image annotation engine. Draw bounding boxes on images with zoom, pan, resize, and drag support. Zero dependencies. ~23KB.

This is the core package — use it directly with vanilla JavaScript, or pair it with [`@labelflow/react`](https://www.npmjs.com/package/@labelflow/react) or [`@labelflow/vue`](https://www.npmjs.com/package/@labelflow/vue).

## Install

```bash
npm install @labelflow/core
```

## Usage

```js
import { AnnotationEngine, Canvas2DRenderer } from '@labelflow/core'

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

// Pointer events
canvas.addEventListener('pointerdown', (e) => {
  const r = canvas.getBoundingClientRect()
  engine.onPointerDown({ x: e.clientX - r.left, y: e.clientY - r.top }, e.button)
  renderer.render(engine.renderState)
})

// Import annotations
engine.setAnnotations([
  { id: '1', x: 100, y: 100, width: 200, height: 150, rotation: 0, color: '#FF6B6B' }
])

// Export annotations
console.log(engine.annotations)
```

See the [full documentation](https://github.com/user/labelflow#readme) for complete API reference.

## License

MIT
