# Vue 3 Guide

## Setup

```bash
npm install @labelflow-core/vue
```

## Architecture

```
<AnnotationProvider>          ← Provide/inject context
  ├── Your components         ← Use useAnnotation() to read/control
  └── <AnnotationCanvas>      ← Renders image + annotations
```

## useAnnotation() Composable

Call it in any component inside `<AnnotationProvider>`:

```vue
<script setup>
import { useAnnotation } from '@labelflow-core/vue'

const {
  engine,           // AnnotationEngine instance
  setActiveTool,    // Switch between 'bbox' and null (select)
  setColor,         // Set drawing color or null for random
  deleteSelected,   // Delete currently selected box
  clearAll,         // Remove all annotations
  zoomIn,           // Zoom in
  zoomOut,          // Zoom out
  resetZoom,        // Fit image to canvas
} = useAnnotation()
</script>
```

## Building a Custom Toolbar

### With plain HTML

```vue
<script setup>
import { useAnnotation } from '@labelflow-core/vue'
const { engine, setActiveTool, setColor, deleteSelected } = useAnnotation()
</script>

<template>
  <div style="display: flex; gap: 8px; padding: 8px">
    <button @click="setActiveTool(null)">Select</button>
    <button @click="setActiveTool('bbox')">Draw</button>
    <input type="color" @input="setColor($event.target.value)" />
    <button @click="deleteSelected">Delete</button>
    <span>{{ engine.annotations.length }} boxes</span>
  </div>
</template>
```

### With Element Plus

```vue
<script setup>
import { ElButton, ElButtonGroup, ElColorPicker } from 'element-plus'
import { useAnnotation } from '@labelflow-core/vue'

const { engine, setActiveTool, setColor, deleteSelected } = useAnnotation()
</script>

<template>
  <ElButtonGroup>
    <ElButton :type="engine.activeTool === null ? 'primary' : ''"
      @click="setActiveTool(null)">Select</ElButton>
    <ElButton :type="engine.activeTool === 'bbox' ? 'primary' : ''"
      @click="setActiveTool('bbox')">Draw</ElButton>
  </ElButtonGroup>
  <ElColorPicker @change="setColor" />
  <ElButton type="danger" @click="deleteSelected">Delete</ElButton>
</template>
```

## Annotation List Sidebar

```vue
<script setup>
import { useAnnotation } from '@labelflow-core/vue'
const { engine } = useAnnotation()
</script>

<template>
  <div>
    <h3>{{ engine.annotations.length }} Annotations</h3>
    <div v-for="ann in engine.annotations" :key="ann.id"
      @click="engine.select(ann.id)"
      :style="{
        borderLeft: '3px solid ' + ann.color,
        padding: '8px',
        background: ann.id === engine.selectedId ? '#f0f0f0' : 'transparent',
        cursor: 'pointer',
      }">
      <strong :style="{ color: ann.color }">{{ ann.label || ann.id.slice(0, 10) }}</strong>
      <div style="font-size: 11px; color: #999">
        {{ Math.round(ann.x) }}, {{ Math.round(ann.y) }} — {{ Math.round(ann.width) }}x{{ Math.round(ann.height) }}
      </div>
    </div>
  </div>
</template>
```

## Listening to Events

```vue
<AnnotationProvider
  :annotations="annotations"
  @change="annotations = $event"
  @select="(id) => console.log('Selected:', id)"
  @create="(bbox) => console.log('Created:', bbox)"
  @update="(bbox) => console.log('Updated:', bbox)"
  @delete="(id) => console.log('Deleted:', id)"
>
```
