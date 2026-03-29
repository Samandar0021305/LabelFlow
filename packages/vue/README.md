# @labelflow-core/vue

Vue 3 image annotation library. Draw bounding boxes and polygons on any image with zoom, pan, resize, and drag support. Built on [@labelflow-core/engine](https://www.npmjs.com/package/@labelflow-core/engine).

## Install

```bash
npm install @labelflow-core/vue
```

> `@labelflow-core/engine` installs automatically. No separate install needed.

**Peer dependency:** `vue >= 3.3.0`

## Supported Tools

| Tool | Activate | How it works |
|------|----------|-------------|
| **BBox** | `setActiveTool('bbox')` | Click and drag to draw a rectangle |
| **Polygon** | `setActiveTool('polygon')` | Click to place vertices, click near first point or double-click to close |
| **Select** | `setActiveTool(null)` | Click to select, drag to move, drag handles/vertices to edit |

## Basic Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { AnnotationProvider, AnnotationCanvas, useAnnotation } from '@labelflow-core/vue'
import type { Annotation } from '@labelflow-core/vue'

const annotations = ref<Annotation[]>([])
</script>

<template>
  <AnnotationProvider :annotations="annotations" @change="annotations = $event">
    <Toolbar />
    <AnnotationCanvas src="/photo.jpg" :width="800" :height="600" />
  </AnnotationProvider>
</template>
```

```vue
<!-- Toolbar.vue -->
<script setup>
import { useAnnotation } from '@labelflow-core/vue'
const { engine, setActiveTool, deleteSelected } = useAnnotation()
</script>

<template>
  <div style="display: flex; gap: 8px; padding: 8px">
    <button @click="setActiveTool(null)" :style="{ fontWeight: engine.activeTool === null ? 'bold' : 'normal' }">Select</button>
    <button @click="setActiveTool('bbox')" :style="{ fontWeight: engine.activeTool === 'bbox' ? 'bold' : 'normal' }">BBox</button>
    <button @click="setActiveTool('polygon')" :style="{ fontWeight: engine.activeTool === 'polygon' ? 'bold' : 'normal' }">Polygon</button>
    <button @click="deleteSelected">Delete</button>
    <span>{{ engine.annotations.length }} annotations</span>
  </div>
</template>
```

## Components

### `<AnnotationProvider>`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `annotations` | `Annotation[]` | `[]` | Annotation state |
| `color` | `string \| null` | `null` | Drawing color. `null` = random |

**Events:** `@change`, `@select`, `@create`, `@update`, `@delete`

### `<AnnotationCanvas>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | *required* | Image URL |
| `width` | `number \| string` | `'100%'` | Canvas width |
| `height` | `number \| string` | `'100%'` | Canvas height |

## `useAnnotation()` Composable

```ts
const {
  engine,           // AnnotationEngine instance
  setActiveTool,    // (tool: 'bbox' | 'polygon' | null) => void
  setColor,         // (color: string | null) => void
  deleteSelected,   // () => void
  clearAll,         // () => void
  zoomIn, zoomOut, resetZoom,
} = useAnnotation()

// Read state
engine.annotations       // Annotation[]
engine.selectedId         // string | null
engine.activeTool         // 'bbox' | 'polygon' | null

// Programmatic
engine.select(id)
engine.addAnnotation({ type: 'polygon', points: [...], color: '#4ECDC4' })
engine.deleteAnnotation(id)
```

## Import & Export

```ts
// Import
annotations.value = [
  { id: '1', type: 'bbox', x: 100, y: 100, width: 200, height: 150, rotation: 0, color: '#FF6B6B' },
  { id: '2', type: 'polygon', points: [{ x: 300, y: 100 }, { x: 450, y: 80 }, { x: 400, y: 250 }], color: '#4ECDC4' },
]

// Export
await fetch('/api/save', { method: 'POST', body: JSON.stringify(annotations.value) })
```

## Types

```ts
type Annotation = BoundingBox | Polygon

interface BoundingBox {
  id: string; type: 'bbox'
  x: number; y: number; width: number; height: number
  rotation: number; label?: string; color: string
}

interface Polygon {
  id: string; type: 'polygon'
  points: { x: number; y: number }[]
  label?: string; color: string
}
```

## License

MIT
