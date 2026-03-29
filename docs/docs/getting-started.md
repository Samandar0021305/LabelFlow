# Getting Started

LabelFlow lets you add image annotation to your app in under 5 minutes. Users can draw bounding boxes and polygons, select them, drag, resize, zoom, and pan.

## How it works

```
<AnnotationProvider>           ← Manages state, provides context
  ├── Your Toolbar             ← useAnnotation() to control tools
  └── <AnnotationCanvas>       ← Renders image + annotations
```

1. Wrap your UI in `<AnnotationProvider>` with an annotations array
2. Place `<AnnotationCanvas>` with an image URL
3. Use `useAnnotation()` in any child component to control tools, color, zoom
4. Listen to `onChange` to get updated annotations

## Quick Start (React)

```bash
npm install @labelflow-core/react
```

```tsx
import { useState } from 'react'
import { AnnotationProvider, AnnotationCanvas, useAnnotation } from '@labelflow-core/react'
import type { Annotation } from '@labelflow-core/react'

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
        BBox
      </button>
      <button onClick={() => setActiveTool('polygon')}
        style={{ fontWeight: engine.activeTool === 'polygon' ? 'bold' : 'normal' }}>
        Polygon
      </button>
      <button onClick={deleteSelected}>Delete</button>
      <span>{engine.annotations.length} annotations</span>
    </div>
  )
}

export default function App() {
  const [annotations, setAnnotations] = useState<Annotation[]>([])

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

## What's next?

- [Installation](/docs/installation) — framework-specific details
- [Drawing](/docs/drawing) — how BBox and Polygon tools work
- [Import & Export](/docs/import-export) — load/save annotations
- [useAnnotation()](/docs/use-annotation) — full hook API
