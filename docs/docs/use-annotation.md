# useAnnotation()

The main hook (React) / composable (Vue) for controlling annotations. Call it in any component inside `<AnnotationProvider>`.

## Usage

::: code-group

```tsx [React]
import { useAnnotation } from '@labelflow-core/react'

const { engine, setActiveTool, setColor, deleteSelected, clearAll, zoomIn, zoomOut, resetZoom } = useAnnotation()
```

```vue [Vue]
import { useAnnotation } from '@labelflow-core/vue'

const { engine, setActiveTool, setColor, deleteSelected, clearAll, zoomIn, zoomOut, resetZoom } = useAnnotation()
```

:::

## Actions

| Method | Type | Description |
|--------|------|-------------|
| `setActiveTool(tool)` | `('bbox' \| 'polygon' \| null) => void` | Switch tool. `null` = select mode |
| `setColor(color)` | `(string \| null) => void` | Set drawing color. `null` = random |
| `deleteSelected()` | `() => void` | Delete selected annotation |
| `clearAll()` | `() => void` | Remove all annotations |
| `zoomIn()` | `() => void` | Zoom in |
| `zoomOut()` | `() => void` | Zoom out |
| `resetZoom()` | `() => void` | Fit image to canvas |

## Reading State

Access via the `engine` object:

| Property | Type | Description |
|----------|------|-------------|
| `engine.annotations` | `Annotation[]` | All annotations |
| `engine.selectedId` | `string \| null` | Selected annotation ID |
| `engine.selectedAnnotation` | `Annotation \| null` | Selected object |
| `engine.activeTool` | `'bbox' \| 'polygon' \| null` | Current tool |
| `engine.color` | `string` | Current drawing color |
| `engine.zoom` | `number` | Zoom level (1 = 100%) |
| `engine.mode` | `InteractionMode` | Current interaction state |
| `engine.imageSize` | `{ width, height }` | Original image dimensions |
| `engine.canvasSize` | `{ width, height }` | Canvas dimensions |

## Engine Methods

For programmatic control:

| Method | Description |
|--------|-------------|
| `engine.select(id)` | Select annotation by ID |
| `engine.deselect()` | Clear selection |
| `engine.addAnnotation(ann)` | Add annotation (ID auto-generated) |
| `engine.updateAnnotation(id, updates)` | Partial update |
| `engine.deleteAnnotation(id)` | Delete by ID |
| `engine.setAnnotations(list)` | Replace all |
| `engine.clearAnnotations()` | Remove all |
| `engine.exportJSON('pixel')` | Export with image dimensions |
| `engine.exportJSON('normalized')` | Export in 0-1 format |
| `engine.importJSON(data)` | Import either format |

## Example: Custom Toolbar

::: code-group

```tsx [React]
function Toolbar() {
  const { engine, setActiveTool, setColor, deleteSelected, clearAll, zoomIn, zoomOut, resetZoom } = useAnnotation()

  return (
    <div style={{ display: 'flex', gap: 8, padding: 8 }}>
      <button onClick={() => setActiveTool(null)}>Select</button>
      <button onClick={() => setActiveTool('bbox')}>BBox</button>
      <button onClick={() => setActiveTool('polygon')}>Polygon</button>

      <input type="color" onChange={e => setColor(e.target.value)} />
      <button onClick={() => setColor(null)}>Random</button>

      <button onClick={zoomIn}>+</button>
      <button onClick={zoomOut}>-</button>
      <button onClick={resetZoom}>Fit</button>

      <button onClick={deleteSelected}>Delete</button>
      <button onClick={clearAll}>Clear</button>

      <span>{engine.annotations.length} annotations | {Math.round(engine.zoom * 100)}%</span>
    </div>
  )
}
```

```vue [Vue]
<script setup>
const { engine, setActiveTool, setColor, deleteSelected, clearAll, zoomIn, zoomOut, resetZoom } = useAnnotation()
</script>

<template>
  <div style="display: flex; gap: 8px; padding: 8px">
    <button @click="setActiveTool(null)">Select</button>
    <button @click="setActiveTool('bbox')">BBox</button>
    <button @click="setActiveTool('polygon')">Polygon</button>

    <input type="color" @input="setColor($event.target.value)" />
    <button @click="setColor(null)">Random</button>

    <button @click="zoomIn">+</button>
    <button @click="zoomOut">-</button>
    <button @click="resetZoom">Fit</button>

    <button @click="deleteSelected">Delete</button>
    <button @click="clearAll">Clear</button>

    <span>{{ engine.annotations.length }} annotations | {{ Math.round(engine.zoom * 100) }}%</span>
  </div>
</template>
```

:::

## Example: Status Bar

```tsx
function StatusBar() {
  const { engine } = useAnnotation()
  return (
    <div style={{ fontSize: 12, color: '#666', padding: 4, display: 'flex', gap: 16 }}>
      <span>Tool: {engine.activeTool ?? 'select'}</span>
      <span>Mode: {engine.mode}</span>
      <span>Zoom: {Math.round(engine.zoom * 100)}%</span>
      <span>Selected: {engine.selectedId ?? 'none'}</span>
      <span>Count: {engine.annotations.length}</span>
    </div>
  )
}
```
