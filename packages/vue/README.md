# @labelflow-core/vue

Vue 3 image annotation library. Draw, select, drag, and resize bounding boxes on any image. Built on [@labelflow-core/engine](https://www.npmjs.com/package/@labelflow-core/engine).

## Install

```bash
npm install @labelflow-core/vue
```

> `@labelflow-core/engine` installs automatically as a dependency. You don't need to install it separately.

**Peer dependency:** `vue >= 3.3.0`

---

## Basic Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { AnnotationProvider, AnnotationCanvas, useAnnotation } from '@labelflow-core/vue'
import type { BoundingBox } from '@labelflow-core/vue'

const annotations = ref<BoundingBox[]>([])
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
<script setup lang="ts">
import { useAnnotation } from '@labelflow-core/vue'

const { engine, setActiveTool } = useAnnotation()
</script>

<template>
  <div style="display: flex; gap: 8px; padding: 8px">
    <button
      @click="setActiveTool(null)"
      :style="{ background: engine.activeTool === null ? '#2563eb' : '#fff', color: engine.activeTool === null ? '#fff' : '#000' }"
    >
      Select
    </button>
    <button
      @click="setActiveTool('bbox')"
      :style="{ background: engine.activeTool === 'bbox' ? '#2563eb' : '#fff', color: engine.activeTool === 'bbox' ? '#fff' : '#000' }"
    >
      Draw BBox
    </button>
  </div>
</template>
```

Click "Draw BBox", then click and drag on the image to draw a bounding box. Click "Select" to switch to selection mode where you can click, drag, and resize existing boxes.

---

## Components

### `<AnnotationProvider>`

Wraps your UI and provides the annotation engine to all child components. This must be the outermost component.

```vue
<AnnotationProvider
  :annotations="annotations"
  color="#FF6B6B"
  @change="onAnnotationsChange"
  @select="onSelectionChange"
  @create="onBoxCreated"
  @update="onBoxUpdated"
  @delete="onBoxDeleted"
>
  <!-- your components here -->
</AnnotationProvider>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `annotations` | `BoundingBox[]` | `[]` | Annotation state |
| `color` | `string \| null` | `null` | Active drawing color. `null` assigns a random color to each new box |

**Events:**

| Event | Payload | Description |
|-------|---------|-------------|
| `@change` | `BoundingBox[]` | Fires when annotations change (draw, move, resize, delete) |
| `@select` | `string \| null` | Fires when selection changes |
| `@create` | `BoundingBox` | Fires when a new box is created |
| `@update` | `BoundingBox` | Fires when a box is moved or resized |
| `@delete` | `string` | Fires when a box is deleted |

### `<AnnotationCanvas>`

The canvas where the image is displayed and annotations are drawn. Place it inside `<AnnotationProvider>`.

```vue
<AnnotationCanvas
  src="/photo.jpg"
  :width="800"
  :height="600"
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | *required* | Image URL |
| `width` | `number \| string` | `'100%'` | Canvas width. Number = pixels, string = CSS value |
| `height` | `number \| string` | `'100%'` | Canvas height |

The image automatically fits inside the canvas while preserving its aspect ratio.

---

## Composables

### `useAnnotation()`

Access the annotation engine and actions from any component inside `<AnnotationProvider>`. This is the primary way to build your own toolbar, sidebar, or any custom UI.

```vue
<script setup lang="ts">
import { useAnnotation } from '@labelflow-core/vue'

const {
  engine,           // The core AnnotationEngine instance
  setActiveTool,    // (tool: 'bbox' | null) => void
  setColor,         // (color: string | null) => void
  deleteSelected,   // () => void — delete the currently selected box
  clearAll,         // () => void — remove all annotations
  zoomIn,           // () => void
  zoomOut,          // () => void
  resetZoom,        // () => void — fit image to canvas
} = useAnnotation()
</script>

<template>
  <!-- Tool switching — use your own buttons, any UI library -->
  <button @click="setActiveTool('bbox')">Draw</button>
  <button @click="setActiveTool(null)">Select</button>

  <!-- Color -->
  <button @click="setColor('#FF6B6B')">Red</button>
  <button @click="setColor(null)">Random</button>

  <!-- Actions -->
  <button @click="deleteSelected">Delete</button>
  <button @click="clearAll">Clear All</button>

  <!-- Zoom -->
  <button @click="zoomIn">+</button>
  <button @click="zoomOut">-</button>
  <button @click="resetZoom">Fit</button>

  <!-- Read state directly -->
  <p>{{ engine.annotations.length }} annotations</p>
  <p>Tool: {{ engine.activeTool ?? 'select' }}</p>
  <p>Selected: {{ engine.selectedId ?? 'none' }}</p>
</template>
```

**Reading state from `engine`:**

| Property | Type | Description |
|----------|------|-------------|
| `engine.annotations` | `BoundingBox[]` | All annotations |
| `engine.selectedId` | `string \| null` | Selected box ID |
| `engine.selectedAnnotation` | `BoundingBox \| null` | Selected box object |
| `engine.activeTool` | `'bbox' \| null` | Current tool (`null` = select mode) |
| `engine.color` | `string` | Current drawing color |
| `engine.zoom` | `number` | Current zoom level |
| `engine.mode` | `InteractionMode` | `'idle'` \| `'drawing'` \| `'selecting'` \| `'dragging'` \| `'resizing'` |

**Programmatic actions on `engine`:**

| Method | Description |
|--------|-------------|
| `engine.select(id)` | Select a box by ID |
| `engine.deselect()` | Clear selection |
| `engine.addAnnotation(bbox)` | Add a box programmatically |
| `engine.updateAnnotation(id, updates)` | Update a box |
| `engine.deleteAnnotation(id)` | Delete a box |

---

## Import & Export

Annotations are plain arrays. Pass them in to render, read them out to save.

### Load annotations (e.g. from server)

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AnnotationProvider, AnnotationCanvas } from '@labelflow-core/vue'
import type { BoundingBox } from '@labelflow-core/vue'

const annotations = ref<BoundingBox[]>([])

onMounted(async () => {
  const res = await fetch('/api/annotations')
  annotations.value = await res.json()
})
</script>

<template>
  <AnnotationProvider :annotations="annotations" @change="annotations = $event">
    <AnnotationCanvas src="/photo.jpg" :width="800" :height="600" />
  </AnnotationProvider>
</template>
```

### Save annotations (e.g. to server)

```vue
<script setup>
import { useAnnotation } from '@labelflow-core/vue'

const { engine } = useAnnotation()

async function save() {
  await fetch('/api/annotations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(engine.annotations),
  })
}
</script>

<template>
  <button @click="save">Save</button>
</template>
```

### Annotation format

Coordinates are in **original image pixels** — they don't change when the canvas is resized or zoomed:

```json
[
  {
    "id": "bbox_1_m5abc",
    "x": 150,
    "y": 200,
    "width": 300,
    "height": 180,
    "rotation": 0,
    "color": "#FF6B6B",
    "label": "Car"
  }
]
```

---

## Color Control

```vue
<script setup>
import { ref } from 'vue'

const color = ref<string | null>(null)
</script>

<template>
  <AnnotationProvider :color="color" ...>
    <!-- Fixed color -->
    <button @click="color = '#FF6B6B'">Red</button>
    <button @click="color = '#4ECDC4'">Teal</button>

    <!-- Random color — each box gets a unique color -->
    <button @click="color = null">Random</button>

    <AnnotationCanvas src="/photo.jpg" />
  </AnnotationProvider>
</template>
```

---

## Canvas Sizing

```vue
<!-- Fixed size -->
<AnnotationCanvas src="/photo.jpg" :width="1200" :height="800" />

<!-- Fill parent -->
<AnnotationCanvas src="/photo.jpg" width="100%" height="100%" />

<!-- Dynamic with v-model -->
<script setup>
const w = ref(800)
</script>
<template>
  <AnnotationCanvas src="/photo.jpg" :width="w" :height="600" />
  <input type="range" :min="400" :max="1400" v-model.number="w" />
</template>
```

The image always fits inside the canvas, centered, with correct aspect ratio.

---

## Mouse & Keyboard Controls

| Action | What it does |
|--------|-------------|
| **Left-click + drag** (BBox mode) | Draw a new bounding box |
| **Left-click** (Select mode) | Select a box, start dragging |
| **Drag a selected box** | Move it |
| **Drag a corner/edge handle** | Resize it |
| **Click empty area** | Deselect |
| **Mouse wheel** | Zoom in/out (follows cursor) |
| **Right-click + drag** | Pan the view |
| **Middle-click + drag** | Pan the view |
| **Escape** | Cancel drawing or deselect |
| **Delete / Backspace** | Delete selected box |

---

## Full Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { AnnotationProvider, AnnotationCanvas, useAnnotation } from '@labelflow-core/vue'
import type { BoundingBox } from '@labelflow-core/vue'

const annotations = ref<BoundingBox[]>([])
const color = ref<string | null>(null)
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
</script>

<template>
  <div style="display: flex; flex-direction: column; height: 100vh">
    <AnnotationProvider :annotations="annotations" :color="color" @change="annotations = $event">
      <ToolbarSection :colors="COLORS" v-model:color="color" />
      <div style="display: flex; flex: 1">
        <AnnotationCanvas
          src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80"
          :style="{ flex: 1, background: '#1a1a2e' }"
        />
        <ListSection />
      </div>
    </AnnotationProvider>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

const ToolbarSection = defineComponent({
  props: { colors: Array, color: [String, null] },
  emits: ['update:color'],
  setup(props, { emit }) {
    const { engine, setActiveTool, setColor, deleteSelected, clearAll, zoomIn, zoomOut, resetZoom } = useAnnotation()
    return { engine, setActiveTool, setColor: (c: string | null) => { setColor(c); emit('update:color', c) }, deleteSelected, clearAll, zoomIn, zoomOut, resetZoom }
  },
  template: `
    <div style="display: flex; gap: 8px; padding: 8px; background: #fff; border-bottom: 1px solid #eee; flex-wrap: wrap; align-items: center">
      <button @click="setActiveTool(null)"
        :style="{ padding: '6px 12px', background: engine.activeTool === null ? '#2563eb' : '#fff', color: engine.activeTool === null ? '#fff' : '#000', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }">
        Select
      </button>
      <button @click="setActiveTool('bbox')"
        :style="{ padding: '6px 12px', background: engine.activeTool === 'bbox' ? '#2563eb' : '#fff', color: engine.activeTool === 'bbox' ? '#fff' : '#000', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }">
        BBox
      </button>

      <span style="border-left: 1px solid #ddd; height: 20px; margin: 0 4px" />

      <button v-for="c in colors" :key="c" @click="setColor(c)"
        :style="{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: c, cursor: 'pointer', outline: engine.color === c ? '2px solid ' + c : 'none', outlineOffset: '2px' }" />
      <button @click="setColor(null)">Random</button>

      <span style="border-left: 1px solid #ddd; height: 20px; margin: 0 4px" />

      <button @click="zoomIn">+</button>
      <button @click="zoomOut">-</button>
      <button @click="resetZoom">Fit</button>
      <button @click="deleteSelected" style="color: red">Delete</button>
      <button @click="clearAll" style="color: red">Clear</button>

      <span style="margin-left: auto; color: #888">{{ engine.annotations.length }} boxes</span>
    </div>
  `,
})

const ListSection = defineComponent({
  setup() {
    const { engine } = useAnnotation()
    return { engine }
  },
  template: `
    <div style="width: 250px; padding: 12px; border-left: 1px solid #eee; overflow-y: auto">
      <h3>{{ engine.annotations.length }} Annotations</h3>
      <div v-for="ann in engine.annotations" :key="ann.id"
        @click="engine.select(ann.id)"
        :style="{
          padding: '8px', marginBottom: '4px', cursor: 'pointer', borderRadius: '4px',
          borderLeft: '3px solid ' + ann.color,
          background: ann.id === engine.selectedId ? '#f0f0f0' : 'transparent',
        }">
        <strong :style="{ color: ann.color }">{{ ann.label || ann.id.slice(0, 10) }}</strong>
        <div style="font-size: 11px; color: #999">
          {{ Math.round(ann.x) }}, {{ Math.round(ann.y) }} — {{ Math.round(ann.width) }}x{{ Math.round(ann.height) }}
        </div>
      </div>
    </div>
  `,
})

export default defineComponent({
  components: { AnnotationProvider, AnnotationCanvas, ToolbarSection, ListSection },
})
</script>
```

---

## Types

```ts
interface BoundingBox {
  id: string        // Unique identifier
  x: number         // Left edge in image pixels
  y: number         // Top edge in image pixels
  width: number     // Width in image pixels
  height: number    // Height in image pixels
  rotation: number  // Rotation in degrees
  label?: string    // Optional text label (shown above the box)
  color: string     // Hex color string, e.g. '#FF6B6B'
}

type ToolType = 'bbox' | 'polygon' | 'polyline' | 'point' | 'skeleton'

type InteractionMode = 'idle' | 'drawing' | 'selecting' | 'editing' | 'dragging' | 'resizing'
```

---

## License

MIT
