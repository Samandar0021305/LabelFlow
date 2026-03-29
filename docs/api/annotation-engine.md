# AnnotationEngine

The core state machine. Framework-agnostic. Manages all annotations, tools, viewport, and interactions.

> Most users interact with the engine via [`useAnnotation()`](/api/use-annotation). This page documents the engine class directly for advanced use or vanilla JS.

## Constructor

```ts
import { AnnotationEngine } from '@labelflow-core/engine'

const engine = new AnnotationEngine()
```

## Image & Canvas

| Method | Description |
|--------|-------------|
| `setImage(img: HTMLImageElement)` | Load an image. Calculates fit zoom automatically. |
| `setCanvasSize({ width, height })` | Set canvas display dimensions. Image re-fits. |

## Tools

| Method / Property | Description |
|-------------------|-------------|
| `setActiveTool(tool: 'bbox' \| null)` | Activate a tool or switch to select mode. |
| `activeTool` | Current active tool (getter). |

## Color

| Method / Property | Description |
|-------------------|-------------|
| `setColor(color: string \| null)` | Set drawing color. `null` = random. |
| `color` | Current active color (getter). |

## Annotations

| Method / Property | Description |
|-------------------|-------------|
| `annotations` | `BoundingBox[]` — all annotations (getter). |
| `setAnnotations(list)` | Replace all annotations (import). |
| `addAnnotation(bbox)` | Add one annotation. Returns the created BoundingBox with generated ID. |
| `updateAnnotation(id, updates)` | Partially update a specific annotation. |
| `deleteAnnotation(id)` | Remove a specific annotation. |
| `clearAnnotations()` | Remove all annotations. |

## Selection

| Method / Property | Description |
|-------------------|-------------|
| `select(id)` | Select an annotation. |
| `deselect()` | Clear selection. |
| `selectedId` | Selected annotation ID (getter). |
| `selectedAnnotation` | Selected BoundingBox object (getter). |

## Viewport

| Method / Property | Description |
|-------------------|-------------|
| `zoom` | Current zoom level (getter). |
| `offset` | Current pan offset `{ x, y }` (getter). |
| `zoomIn(focalPoint?)` | Zoom in. Optional canvas-space focal point. |
| `zoomOut(focalPoint?)` | Zoom out. |
| `setZoom(level, focalPoint?)` | Set exact zoom level. |
| `resetZoom()` | Fit image to canvas. |
| `canvasToImage(point)` | Convert canvas coordinates to image coordinates. |

## Pointer Events

Call these from your event handlers. All points are in **canvas coordinates** (clientX - rect.left).

| Method | Description |
|--------|-------------|
| `onPointerDown(point, button)` | button: 0=left, 1=middle, 2=right |
| `onPointerMove(point)` | |
| `onPointerUp(point)` | |
| `onWheel(point, deltaY)` | |
| `onKeyDown(key)` | Supports 'Escape', 'Delete', 'Backspace' |

## Events

Subscribe to state changes with `engine.on()`. Returns an unsubscribe function.

```ts
const unsub = engine.on('annotations:change', (list) => {
  console.log('Changed:', list)
})

// Later:
unsub()
```

| Event | Payload | When |
|-------|---------|------|
| `annotations:change` | `BoundingBox[]` | Any annotation added, moved, resized, or deleted |
| `annotation:create` | `BoundingBox` | New annotation drawn |
| `annotation:update` | `BoundingBox` | Annotation moved or resized |
| `annotation:delete` | `string` | Annotation deleted (payload is ID) |
| `annotation:select` | `string \| null` | Selection changed |
| `tool:change` | `ToolType \| null` | Active tool changed |
| `mode:change` | `InteractionMode` | Interaction mode changed |
| `viewport:change` | `ViewportState` | Zoom or pan changed |
| `drawing:start` | `Point` | Drawing started |
| `drawing:update` | `Rect` | Drawing preview updated |
| `drawing:end` | `BoundingBox \| null` | Drawing finished (null if cancelled) |
| `drawing:cancel` | `void` | Drawing cancelled |

## Export / Import

```ts
// Export as pixel coordinates
engine.exportJSON('pixel')
// { format: 'pixel', imageWidth: 1920, imageHeight: 1080, annotations: [...] }

// Export as normalized 0-1
engine.exportJSON('normalized')
// { format: 'normalized', annotations: [{ x: 0.078, ... }] }

// Import either format
engine.importJSON(data)
```

## Cleanup

```ts
engine.destroy()  // Removes all event listeners
```
