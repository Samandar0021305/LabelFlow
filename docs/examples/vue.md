# Vue Example

Full annotation app with toolbar, annotation list, BBox + Polygon tools.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { AnnotationProvider, AnnotationCanvas, useAnnotation } from '@labelflow-core/vue'
import type { Annotation } from '@labelflow-core/vue'

const annotations = ref<Annotation[]>([])
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
</script>

<template>
  <div style="display: flex; flex-direction: column; height: 100vh; font-family: system-ui">
    <AnnotationProvider :annotations="annotations" @change="annotations = $event">
      <ToolbarSection :colors="COLORS" />
      <div style="display: flex; flex: 1">
        <AnnotationCanvas src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200" :style="{ flex: 1, background: '#1a1a2e' }" />
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
    return useAnnotation()
  },
  template: `
    <div style="display: flex; gap: 8px; padding: 8px; background: #fff; border-bottom: 1px solid #eee; flex-wrap: wrap; align-items: center">
      <button v-for="[tool, label] in [[null,'Select'],['bbox','BBox'],['polygon','Polygon']]" :key="String(tool)"
        @click="setActiveTool(tool)"
        :style="{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer',
          background: engine.activeTool === tool ? '#2563eb' : '#fff',
          color: engine.activeTool === tool ? '#fff' : '#000' }">
        {{ label }}
      </button>
      <span style="border-left: 1px solid #ddd; height: 20px; margin: 0 4px" />
      <button v-for="c in colors" :key="c" @click="setColor(c)"
        :style="{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: c, cursor: 'pointer',
          outline: engine.color === c ? '2px solid '+c : 'none', outlineOffset: '2px' }" />
      <button @click="setColor(null)">Random</button>
      <span style="border-left: 1px solid #ddd; height: 20px; margin: 0 4px" />
      <button @click="zoomIn">+</button>
      <button @click="zoomOut">-</button>
      <button @click="resetZoom">Fit</button>
      <button @click="deleteSelected" style="color: red">Delete</button>
      <button @click="clearAll" style="color: red">Clear</button>
      <span style="margin-left: auto; color: #888; font-size: 12px">{{ engine.annotations.length }} annotations</span>
    </div>
  `,
})

const ListSection = defineComponent({
  setup() { return { engine: useAnnotation().engine } },
  template: `
    <div style="width: 250px; padding: 12px; border-left: 1px solid #eee; overflow-y: auto">
      <h3 style="margin: 0 0 12px; font-size: 14px">{{ engine.annotations.length }} Annotations</h3>
      <div v-for="ann in engine.annotations" :key="ann.id" @click="engine.select(ann.id)"
        :style="{ padding: '8px', marginBottom: '4px', cursor: 'pointer', borderRadius: '4px',
          borderLeft: '3px solid '+ann.color,
          background: ann.id === engine.selectedId ? '#f0f0f0' : 'transparent' }">
        <strong :style="{ color: ann.color }">{{ ann.label || ann.type + ' ' + ann.id.slice(-5) }}</strong>
        <div style="font-size: 11px; color: #999">
          {{ ann.type === 'bbox' ? Math.round(ann.x)+', '+Math.round(ann.y)+' — '+Math.round(ann.width)+'×'+Math.round(ann.height) : ann.points.length+' vertices' }}
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
