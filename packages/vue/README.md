# @labelflow/vue

Vue 3 components for image annotation. Draw bounding boxes on images with zoom, pan, resize, and drag support. Built on [`@labelflow/core`](https://www.npmjs.com/package/@labelflow/core).

## Install

```bash
npm install @labelflow/core @labelflow/vue
```

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { AnnotationProvider, AnnotationCanvas, ToolButton, useAnnotation } from '@labelflow/vue'
import type { BoundingBox } from '@labelflow/vue'

const annotations = ref<BoundingBox[]>([])
</script>

<template>
  <AnnotationProvider :annotations="annotations" @change="annotations = $event">
    <ToolButton :tool="null">Select</ToolButton>
    <ToolButton tool="bbox">BBox</ToolButton>
    <AnnotationCanvas src="/photo.jpg" :width="800" :height="600" />
  </AnnotationProvider>
</template>
```

### Import / Export

```ts
// Import — assign array, it renders
annotations.value = [
  { id: '1', x: 100, y: 100, width: 200, height: 150, rotation: 0, color: '#FF6B6B' }
]

// Export — read current state, save to server
await fetch('/api/save', { method: 'POST', body: JSON.stringify(annotations.value) })
```

### useAnnotation()

```ts
const { engine, setActiveTool, setColor, deleteSelected, zoomIn, zoomOut, resetZoom } = useAnnotation()
```

See the [full documentation](https://github.com/user/labelflow#readme) for complete API reference.

## License

MIT
