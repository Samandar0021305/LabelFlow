# AnnotationEngine

The core state machine. Framework-agnostic. Use directly in vanilla JS, or access via `useAnnotation().engine` in React/Vue.

## Constructor

```ts
import { AnnotationEngine } from '@labelflow-core/engine'
const engine = new AnnotationEngine()
```

## Image & Canvas

| Method | Description |
|--------|-------------|
| `setImage(img: HTMLImageElement)` | Load image, auto-fits |
| `setCanvasSize({ width, height })` | Set canvas dimensions, re-fits |

## Tools

| Method / Property | Description |
|-------------------|-------------|
| `setActiveTool('bbox' \| 'polygon' \| null)` | Activate tool or select mode |
| `activeTool` | Current tool (getter) |

## Color

| Method / Property | Description |
|-------------------|-------------|
| `setColor(color \| null)` | Set drawing color. `null` = random |
| `color` | Current color (getter) |

## Annotations

| Method / Property | Description |
|-------------------|-------------|
| `annotations` | `Annotation[]` (getter) |
| `setAnnotations(list)` | Replace all (import) |
| `addAnnotation(ann)` | Add one, returns with generated ID |
| `updateAnnotation(id, updates)` | Partial update |
| `deleteAnnotation(id)` | Remove one |
| `clearAnnotations()` | Remove all |

## Selection

| Method / Property | Description |
|-------------------|-------------|
| `select(id)` | Select by ID |
| `deselect()` | Clear selection |
| `selectedId` | Selected ID (getter) |
| `selectedAnnotation` | Selected object (getter) |

## Viewport

| Method / Property | Description |
|-------------------|-------------|
| `zoom` | Current zoom (getter) |
| `zoomIn(focalPoint?)` | Zoom in |
| `zoomOut(focalPoint?)` | Zoom out |
| `setZoom(level, focalPoint?)` | Set exact zoom |
| `resetZoom()` | Fit to canvas |
| `canvasToImage(point)` | Convert canvas → image coords |

## Pointer Events

Call from your event handlers. All points in canvas coordinates.

| Method | Description |
|--------|-------------|
| `onPointerDown(point, button)` | 0=left, 1=middle, 2=right |
| `onPointerMove(point)` | |
| `onPointerUp(point)` | |
| `onDoubleClick(point)` | Closes polygon |
| `onWheel(point, deltaY)` | |
| `onKeyDown(key)` | Escape, Delete, Backspace |

## Events

```ts
const unsub = engine.on('annotations:change', (list) => { ... })
unsub() // unsubscribe
```

| Event | Payload | When |
|-------|---------|------|
| `annotations:change` | `Annotation[]` | Any change |
| `annotation:create` | `Annotation` | New drawn |
| `annotation:update` | `Annotation` | Moved/resized |
| `annotation:delete` | `string` | Deleted (ID) |
| `annotation:select` | `string \| null` | Selection changed |
| `tool:change` | `ToolType \| null` | Tool switched |
| `mode:change` | `InteractionMode` | Mode changed |
| `viewport:change` | `ViewportState` | Zoom/pan changed |
| `drawing:start` | `Point` | Drawing started |
| `drawing:update` | `Point[]` | Drawing preview updated |
| `drawing:end` | `Annotation \| null` | Drawing finished |
| `drawing:cancel` | `void` | Drawing cancelled |

## Export / Import

```ts
engine.exportJSON('pixel')       // { format, imageWidth, imageHeight, annotations }
engine.exportJSON('normalized')  // { format, annotations: [{ x: 0-1, ... }] }
engine.importJSON(data)          // auto-detects format
```

## Cleanup

```ts
engine.destroy()
```
