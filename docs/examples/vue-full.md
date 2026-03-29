# Vue Full App

A complete annotation application with toolbar, annotation list, color picker, zoom controls.

## Code

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { AnnotationProvider, AnnotationCanvas, useAnnotation } from '@labelflow-core/vue'
import type { BoundingBox } from '@labelflow-core/vue'

const annotations = ref<BoundingBox[]>([])
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
</script>

<template>
  <div style="display: flex; flex-direction: column; height: 100vh; font-family: system-ui">
    <AnnotationProvider :annotations="annotations" @change="annotations = $event">
      <ToolbarSection :colors="COLORS" />
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
  props: { colors: { type: Array as () => string[], required: true } },
  setup() {
    const ctx = useAnnotation()
    return { ...ctx }
  },
  template: `
    <div style="display: flex; gap: 8px; padding: 8px; background: #fff; border-bottom: 1px solid #eee; flex-wrap: wrap; align-items: center">
      <button @click="setActiveTool(null)"
        :style="{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer',
          background: engine.activeTool === null ? '#2563eb' : '#fff',
          color: engine.activeTool === null ? '#fff' : '#000' }">
        Select
      </button>
      <button @click="setActiveTool('bbox')"
        :style="{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer',
          background: engine.activeTool === 'bbox' ? '#2563eb' : '#fff',
          color: engine.activeTool === 'bbox' ? '#fff' : '#000' }">
        BBox
      </button>

      <span style="border-left: 1px solid #ddd; height: 20px; margin: 0 4px" />

      <button v-for="c in colors" :key="c" @click="setColor(c)"
        :style="{ width: '24px', height: '24px', borderRadius: '4px', border: 'none',
          background: c, cursor: 'pointer',
          outline: engine.color === c ? '2px solid ' + c : 'none', outlineOffset: '2px' }" />
      <button @click="setColor(null)" style="font-size: 12px">Random</button>

      <span style="border-left: 1px solid #ddd; height: 20px; margin: 0 4px" />

      <button @click="zoomIn">+</button>
      <button @click="zoomOut">-</button>
      <button @click="resetZoom">Fit</button>
      <button @click="deleteSelected" style="color: red">Delete</button>
      <button @click="clearAll" style="color: red">Clear</button>

      <span style="margin-left: auto; color: #888; font-size: 12px">
        {{ engine.annotations.length }} boxes | {{ Math.round(engine.zoom * 100) }}%
      </span>
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
      <h3 style="margin: 0 0 12px; font-size: 14px">{{ engine.annotations.length }} Annotations</h3>
      <div v-for="ann in engine.annotations" :key="ann.id"
        @click="engine.select(ann.id)"
        :style="{
          padding: '8px', marginBottom: '4px', cursor: 'pointer', borderRadius: '4px',
          borderLeft: '3px solid ' + ann.color,
          background: ann.id === engine.selectedId ? '#f0f0f0' : 'transparent' }">
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
