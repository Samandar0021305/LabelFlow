# Canvas2DRenderer

Renders annotations on a `<canvas>` element using the native Canvas 2D API. Used internally by `AnnotationCanvas`, or directly in vanilla JS.

## Constructor

```ts
import { Canvas2DRenderer } from '@labelflow-core/engine'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const renderer = new Canvas2DRenderer(canvas)
```

Throws if the canvas doesn't support 2D context.

## Methods

| Method | Description |
|--------|-------------|
| `resize(width, height)` | Set the canvas display size. Handles HiDPI scaling automatically. Call this when the container resizes. |
| `render(state: RenderState)` | Draw everything: image, annotations, handles, preview. Call after any state change. |
| `destroy()` | Clear the canvas. |

## Usage

```ts
const engine = new AnnotationEngine()
const renderer = new Canvas2DRenderer(canvas)

// Initial setup
renderer.resize(800, 600)
engine.setCanvasSize({ width: 800, height: 600 })

// After any interaction
engine.onPointerDown(point, button)
renderer.render(engine.renderState)   // ← must call manually

// On container resize
renderer.resize(newWidth, newHeight)
engine.setCanvasSize({ width: newWidth, height: newHeight })
renderer.render(engine.renderState)
```

## RenderState

The `engine.renderState` property returns everything the renderer needs:

```ts
interface RenderState {
  image: HTMLImageElement | null
  annotations: BoundingBox[]
  selectedId: string | null
  hoveredId: string | null
  activeHandlePosition: HandlePosition | null
  drawingPreview: Rect | null
  drawingColor: string
  viewport: {
    zoom: number
    offset: { x: number; y: number }
    imageSize: { width: number; height: number }
    canvasSize: { width: number; height: number }
  }
}
```

## HiDPI

The renderer automatically handles `window.devicePixelRatio`:

```
Display size: 800×600 CSS pixels
devicePixelRatio: 2
Actual canvas buffer: 1600×1200 pixels
```

This ensures sharp rendering on Retina/HiDPI displays.
