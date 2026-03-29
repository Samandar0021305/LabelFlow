# Getting Started

LabelFlow lets you add image annotation to your app in under 5 minutes. Users can draw bounding boxes, select them, drag, resize, zoom, and pan.

## How it works

```
Your App
  │
  ├── <AnnotationProvider>     ← Manages state, provides context
  │     │
  │     ├── Your Toolbar       ← useAnnotation() to control tools, color, zoom
  │     │
  │     └── <AnnotationCanvas> ← Renders image + annotations on canvas
  │
  └── onChange callback        ← You get the annotation array, save it anywhere
```

1. Wrap your UI in `<AnnotationProvider>` with an annotations array
2. Place `<AnnotationCanvas>` with an image URL
3. Use `useAnnotation()` in any child component to control the tools
4. Listen to `onChange` to get the updated annotations

## Quick Start (React)

```bash
npm install @labelflow-core/react
```

```tsx
import { useState } from 'react'
import { AnnotationProvider, AnnotationCanvas, useAnnotation } from '@labelflow-core/react'
import type { BoundingBox } from '@labelflow-core/react'

function Toolbar() {
  const { engine, setActiveTool, deleteSelected } = useAnnotation()

  return (
    <div style={{ display: 'flex', gap: 8, padding: 8 }}>
      <button onClick={() => setActiveTool(null)}
        style={{ fontWeight: engine.activeTool === null ? 'bold' : 'normal' }}>
        Select
      </button>
      <button onClick={() => setActiveTool('bbox')}
        style={{ fontWeight: engine.activeTool === 'bbox' ? 'bold' : 'normal' }}>
        Draw BBox
      </button>
      <button onClick={deleteSelected}>Delete</button>
      <span>{engine.annotations.length} boxes</span>
    </div>
  )
}

export default function App() {
  const [annotations, setAnnotations] = useState<BoundingBox[]>([])

  return (
    <AnnotationProvider annotations={annotations} onChange={setAnnotations}>
      <Toolbar />
      <AnnotationCanvas src="/photo.jpg" width={800} height={600} />
    </AnnotationProvider>
  )
}
```

## Quick Start (Vue)

```bash
npm install @labelflow-core/vue
```

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

## What's next?

- [Installation](/guide/installation) — framework-specific install details
- [Drawing BBox](/guide/drawing-bbox) — how annotation works
- [Import & Export](/guide/import-export) — load/save annotations
- [API Reference](/api/annotation-provider) — every prop, method, and event
