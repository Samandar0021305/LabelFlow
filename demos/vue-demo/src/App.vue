<script setup lang="ts">
import { ref } from 'vue'
import {
  AnnotationProvider,
  AnnotationCanvas,
  ToolButton,
  useAnnotation,
} from '@labelflow/vue'
import type { BoundingBox, AnnotationClass } from '@labelflow/vue'

const CLASSES: AnnotationClass[] = [
  { id: '1', name: 'Car', color: '#FF6B6B' },
  { id: '2', name: 'Person', color: '#4ECDC4' },
  { id: '3', name: 'Tree', color: '#45B7D1' },
]

const SAMPLE_IMAGE = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80'

const annotations = ref<BoundingBox[]>([])

function handleChange(anns: BoundingBox[]) {
  annotations.value = anns
}
</script>

<template>
  <div class="root">
    <AnnotationProvider
      :annotations="annotations"
      :classes="CLASSES"
      @change="handleChange"
    >
      <ToolbarPanel :classes="CLASSES" />
      <div class="main-area">
        <AnnotationCanvas
          :src="SAMPLE_IMAGE"
          :style="{ flex: 1, backgroundColor: '#1a1a2e' }"
        />
        <SidebarPanel :annotations="annotations" />
      </div>
    </AnnotationProvider>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

const ToolbarPanel = defineComponent({
  name: 'ToolbarPanel',
  props: {
    classes: { type: Array as () => AnnotationClass[], required: true },
  },
  setup(props) {
    const { engine, setActiveClass, deleteSelected, clearAll, zoomIn, zoomOut, resetZoom } = useAnnotation()
    return { engine, setActiveClass, deleteSelected, clearAll, zoomIn, zoomOut, resetZoom }
  },
  template: `
    <div class="toolbar">
      <div class="tool-group">
        <span class="group-label">Tools</span>
        <ToolButton :tool="null" class="btn">↖ Select</ToolButton>
        <ToolButton tool="bbox" class="btn">▢ BBox</ToolButton>
      </div>
      <div class="tool-group">
        <span class="group-label">Class</span>
        <button
          v-for="cls in classes"
          :key="cls.id"
          class="class-btn"
          :style="{
            borderColor: cls.color,
            backgroundColor: engine.activeClassId === cls.id ? cls.color : 'transparent',
            color: engine.activeClassId === cls.id ? '#fff' : cls.color,
          }"
          @click="setActiveClass(cls.id)"
        >
          {{ cls.name }}
        </button>
      </div>
      <div class="tool-group">
        <span class="group-label">Zoom</span>
        <button class="btn" @click="zoomIn">+</button>
        <button class="btn" @click="zoomOut">−</button>
        <button class="btn" @click="resetZoom">Fit</button>
      </div>
      <div class="tool-group">
        <button class="btn btn-danger" @click="deleteSelected">Delete</button>
        <button class="btn btn-danger" @click="clearAll">Clear All</button>
      </div>
    </div>
  `,
  components: { ToolButton },
})

const SidebarPanel = defineComponent({
  name: 'SidebarPanel',
  props: {
    annotations: { type: Array as () => BoundingBox[], required: true },
  },
  setup() {
    const { engine } = useAnnotation()
    return { engine }
  },
  template: `
    <div class="sidebar">
      <h3 class="sidebar-title">Annotations ({{ annotations.length }})</h3>
      <div
        v-for="ann in annotations"
        :key="ann.id"
        class="ann-item"
        :style="{
          borderLeftColor: ann.color,
          backgroundColor: ann.id === engine.selectedId ? '#f0f0f0' : 'transparent',
        }"
        @click="engine.select(ann.id)"
      >
        <span :style="{ color: ann.color, fontWeight: 600 }">
          {{ ann.label ?? 'Unlabeled' }}
        </span>
        <span class="ann-coords">
          {{ Math.round(ann.x) }}, {{ Math.round(ann.y) }} — {{ Math.round(ann.width) }}×{{ Math.round(ann.height) }}
        </span>
      </div>
      <p v-if="annotations.length === 0" class="empty-text">
        Select BBox tool and draw on the image
      </p>
    </div>
  `,
})

export default defineComponent({
  components: { AnnotationProvider, AnnotationCanvas, ToolbarPanel, SidebarPanel },
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

.root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: Inter, system-ui, sans-serif;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  flex-wrap: wrap;
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.group-label {
  font-size: 11px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  margin-right: 4px;
}

.btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
}

.btn-danger { color: #FF6B6B; }

.lf-tool-active {
  background-color: #2563eb !important;
  color: #fff !important;
  border-color: #2563eb !important;
}

.class-btn {
  padding: 4px 10px;
  border: 2px solid;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.15s;
  background: transparent;
}

.main-area {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 260px;
  border-left: 1px solid #e0e0e0;
  background: #fafafa;
  overflow-y: auto;
  padding: 12px;
}

.sidebar-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.ann-item {
  padding: 8px 10px;
  border-left: 3px solid;
  border-radius: 0 6px 6px 0;
  margin-bottom: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: background-color 0.15s;
}

.ann-coords {
  font-size: 11px;
  color: #999;
}

.empty-text {
  color: #aaa;
  font-size: 13px;
  text-align: center;
  margin-top: 40px;
}
</style>
