# useAnnotation()

The primary hook (React) / composable (Vue) for controlling annotations from any child component. Returns actions and access to the engine.

## Usage

::: code-group

```tsx [React]
import { useAnnotation } from '@labelflow-core/react'

function MyComponent() {
  const { engine, setActiveTool, setColor, deleteSelected, clearAll, zoomIn, zoomOut, resetZoom } = useAnnotation()
}
```

```vue [Vue]
import { useAnnotation } from '@labelflow-core/vue'

const { engine, setActiveTool, setColor, deleteSelected, clearAll, zoomIn, zoomOut, resetZoom } = useAnnotation()
```

:::

::: warning
Must be called inside `<AnnotationProvider>`. Throws an error if used outside.
:::

## Return Value

### Actions

| Method | Type | Description |
|--------|------|-------------|
| `setActiveTool(tool)` | `(tool: 'bbox' \| null) => void` | Set the active tool. `'bbox'` = draw mode, `null` = select mode. |
| `setColor(color)` | `(color: string \| null) => void` | Set drawing color. `null` = random color per annotation. |
| `deleteSelected()` | `() => void` | Delete the currently selected annotation. No-op if nothing selected. |
| `clearAll()` | `() => void` | Remove all annotations. |
| `zoomIn()` | `() => void` | Zoom in toward center. |
| `zoomOut()` | `() => void` | Zoom out from center. |
| `resetZoom()` | `() => void` | Fit the image to the canvas. |

### Engine

| Property | Type | Description |
|----------|------|-------------|
| `engine` | `AnnotationEngine` | Direct access to the core engine. See below. |

## Engine Properties

Read these to display state in your UI:

| Property | Type | Description |
|----------|------|-------------|
| `engine.annotations` | `BoundingBox[]` | All current annotations. |
| `engine.selectedId` | `string \| null` | ID of the selected annotation. |
| `engine.selectedAnnotation` | `BoundingBox \| null` | The selected annotation object. |
| `engine.activeTool` | `'bbox' \| null` | Current tool. |
| `engine.color` | `string` | Current drawing color. |
| `engine.zoom` | `number` | Current zoom level (1 = 100%). |
| `engine.mode` | `InteractionMode` | Current interaction state. |
| `engine.imageSize` | `{ width, height }` | Original image dimensions. |
| `engine.canvasSize` | `{ width, height }` | Canvas display dimensions. |

## Engine Methods

Call these for programmatic control:

| Method | Description |
|--------|-------------|
| `engine.select(id)` | Select an annotation by ID. |
| `engine.deselect()` | Clear the selection. |
| `engine.addAnnotation(bbox)` | Add a new annotation. `id` is auto-generated. |
| `engine.updateAnnotation(id, updates)` | Partially update an annotation. |
| `engine.deleteAnnotation(id)` | Delete an annotation by ID. |
| `engine.setAnnotations(list)` | Replace all annotations. |
| `engine.clearAnnotations()` | Remove all annotations. |
| `engine.exportJSON('pixel')` | Export with image dimensions. |
| `engine.exportJSON('normalized')` | Export in 0-1 format. |
| `engine.importJSON(data)` | Import from either format. |

## InteractionMode

The `engine.mode` property tells you what the user is currently doing:

| Mode | Description |
|------|-------------|
| `'idle'` | Nothing happening. |
| `'drawing'` | User is drawing a new bbox. |
| `'selecting'` | A box is selected but not being moved. |
| `'dragging'` | User is moving a selected box. |
| `'resizing'` | User is resizing via a handle. |

## Example: Status Bar

::: code-group

```tsx [React]
function StatusBar() {
  const { engine } = useAnnotation()

  return (
    <div style={{ display: 'flex', gap: 16, padding: 8, fontSize: 12, color: '#666' }}>
      <span>Tool: {engine.activeTool ?? 'select'}</span>
      <span>Mode: {engine.mode}</span>
      <span>Zoom: {Math.round(engine.zoom * 100)}%</span>
      <span>Boxes: {engine.annotations.length}</span>
      <span>Selected: {engine.selectedId ?? 'none'}</span>
      <span>Image: {engine.imageSize.width}×{engine.imageSize.height}</span>
    </div>
  )
}
```

```vue [Vue]
<template>
  <div style="display: flex; gap: 16px; padding: 8px; font-size: 12px; color: #666">
    <span>Tool: {{ engine.activeTool ?? 'select' }}</span>
    <span>Mode: {{ engine.mode }}</span>
    <span>Zoom: {{ Math.round(engine.zoom * 100) }}%</span>
    <span>Boxes: {{ engine.annotations.length }}</span>
    <span>Selected: {{ engine.selectedId ?? 'none' }}</span>
    <span>Image: {{ engine.imageSize.width }}×{{ engine.imageSize.height }}</span>
  </div>
</template>
```

:::
