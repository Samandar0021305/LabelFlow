---
layout: home

hero:
  name: LabelFlow
  text: Image Annotation Library
  tagline: Draw bounding boxes and polygons on any image. Select, drag, resize, zoom, and pan. Works with React, Vue, and vanilla JavaScript.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /api/annotation-provider
    - theme: alt
      text: GitHub
      link: https://github.com/Samandar0021305/LabelFlow
  image:
    src: /logo.svg
    alt: LabelFlow

features:
  - icon: 🖼️
    title: BBox & Polygon Annotation
    details: Draw bounding boxes with click and drag, or place polygon vertices with click-to-add. Select, move, resize handles, drag vertices. Keyboard shortcuts for fast workflows.

  - icon: 🔍
    title: Zoom & Pan
    details: Mouse wheel zoom with focal point tracking. Right-click or middle-click to pan. Fits any image size — from thumbnails to 4K.

  - icon: 🎨
    title: Color Control
    details: Set a fixed drawing color or let each annotation get a unique random color from the built-in palette.

  - icon: 📦
    title: Import & Export
    details: Annotations are plain JSON arrays in original image pixel coordinates. Load from server, save to server — just arrays in, arrays out.

  - icon: ⚡
    title: Zero Dependencies
    details: Core engine is framework-agnostic with zero dependencies. ~23KB core, ~8KB per adapter. Native Canvas 2D rendering.

  - icon: 🛠️
    title: Full Control
    details: No opinionated UI. Use useAnnotation() hook to build your own toolbar with any design system — Ant Design, MUI, Tailwind, or plain HTML.
---

## Quick Install

::: code-group

```bash [React]
npm install @labelflow-core/react
```

```bash [Vue]
npm install @labelflow-core/vue
```

```bash [Vanilla JS]
npm install @labelflow-core/engine
```

:::

## Minimal Example

::: code-group

```tsx [React]
import { useState } from 'react'
import { AnnotationProvider, AnnotationCanvas, useAnnotation } from '@labelflow-core/react'

function Toolbar() {
  const { setActiveTool } = useAnnotation()
  return (
    <div>
      <button onClick={() => setActiveTool(null)}>Select</button>
      <button onClick={() => setActiveTool('bbox')}>BBox</button>
      <button onClick={() => setActiveTool('polygon')}>Polygon</button>
    </div>
  )
}

function App() {
  const [annotations, setAnnotations] = useState([])
  return (
    <AnnotationProvider annotations={annotations} onChange={setAnnotations}>
      <Toolbar />
      <AnnotationCanvas src="/photo.jpg" width={800} height={600} />
    </AnnotationProvider>
  )
}
```

```vue [Vue]
<script setup>
import { ref } from 'vue'
import { AnnotationProvider, AnnotationCanvas, useAnnotation } from '@labelflow-core/vue'

const annotations = ref([])
const { setActiveTool } = useAnnotation()
</script>

<template>
  <AnnotationProvider :annotations="annotations" @change="annotations = $event">
    <button @click="setActiveTool(null)">Select</button>
    <button @click="setActiveTool('bbox')">BBox</button>
    <button @click="setActiveTool('polygon')">Polygon</button>
    <AnnotationCanvas src="/photo.jpg" :width="800" :height="600" />
  </AnnotationProvider>
</template>
```

:::
