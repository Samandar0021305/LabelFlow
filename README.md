# LabelFlow

A framework-agnostic image annotation library for **React**, **Vue**, and **vanilla JavaScript**. Draw bounding boxes and polygons on images with zoom, pan, resize, drag, and full import/export support.

**Zero dependencies** in the core engine. Native Canvas 2D rendering. ~25KB core, ~8KB per framework adapter.

## Packages

| Package | Description | Size |
|---------|-------------|------|
| [`@labelflow/core`](#labelflowcore) | Framework-agnostic engine, renderer, geometry utils | ~23KB |
| [`@labelflow/react`](#labelflowreact) | React 18+ components and hooks | ~8KB |
| [`@labelflow/vue`](#labelflowvue) | Vue 3 components and composables | ~8KB |

## Features

- **BBox annotation** — draw, select, drag, resize with 8-point handles
- **Polygon annotation** — click to place vertices, auto-close, drag vertices to edit
- **Zoom & Pan** — mouse wheel zoom (focal point), right-click/middle-click pan
- **Configurable canvas size** — set width/height, image auto-fits
- **Color control** — set a fixed color or auto-assign random colors
- **Import/Export** — pass annotation arrays in, get them back out. Simple JSON.
- **Keyboard shortcuts** — `Escape` to cancel/deselect, `Delete` to remove
- **HiDPI support** — automatic devicePixelRatio scaling
- **TypeScript** — full type definitions included
- **Tree-shakeable** — ESM + CJS dual format

---

## Quick Start

### React

```bash
npm install @labelflow/core @labelflow/react
```

```tsx
import { useState } from 'react'
import { AnnotationProvider, AnnotationCanvas, ToolButton, useAnnotation } from '@labelflow/react'
import type { BoundingBox } from '@labelflow/react'

function App() {
  const [annotations, setAnnotations] = useState<BoundingBox[]>([])

  return (
    <AnnotationProvider annotations={annotations} onChange={setAnnotations}>
      <ToolButton tool={null}>Select</ToolButton>
      <ToolButton tool="bbox">BBox</ToolButton>
      <AnnotationCanvas src="/photo.jpg" width={800} height={600} />
    </AnnotationProvider>
  )
}
```

### Vue

```bash
npm install @labelflow/core @labelflow/vue
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { AnnotationProvider, AnnotationCanvas, ToolButton } from '@labelflow/vue'
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

### Vanilla JavaScript

```bash
npm install @labelflow/core
```

```js
import { AnnotationEngine, Canvas2DRenderer } from '@labelflow/core'

const canvas = document.getElementById('canvas')
const engine = new AnnotationEngine()
const renderer = new Canvas2DRenderer(canvas)

// Load image
const img = new Image()
img.onload = () => {
  engine.setImage(img)
  renderer.resize(800, 600)
  engine.setCanvasSize({ width: 800, height: 600 })
  renderer.render(engine.renderState)
}
img.src = '/photo.jpg'

// Activate bbox tool
engine.setActiveTool('bbox')

// Wire up pointer events
canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect()
  engine.onPointerDown({ x: e.clientX - rect.left, y: e.clientY - rect.top }, e.button)
  renderer.render(engine.renderState)
})

canvas.addEventListener('pointermove', (e) => {
  const rect = canvas.getBoundingClientRect()
  engine.onPointerMove({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  renderer.render(engine.renderState)
})

canvas.addEventListener('pointerup', (e) => {
  const rect = canvas.getBoundingClientRect()
  engine.onPointerUp({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  renderer.render(engine.renderState)
})

// Get annotations
console.log(engine.annotations)
```

---

## API Reference

### `@labelflow/core`

#### `AnnotationEngine`

The core state machine. Framework-agnostic. Manages annotations, tools, viewport, and all interactions.

```ts
const engine = new AnnotationEngine()
```

**Image & Canvas**

| Method | Description |
|--------|-------------|
| `setImage(img: HTMLImageElement)` | Load an image. Auto-calculates fit zoom. |
| `setCanvasSize({ width, height })` | Set the canvas display size. Image re-fits automatically. |

**Tools**

| Method | Description |
|--------|-------------|
| `setActiveTool(tool)` | Set active tool: `'bbox'` or `null` (select mode). |
| `activeTool` | Current active tool (getter). |

**Color**

| Method | Description |
|--------|-------------|
| `setColor(color)` | Set drawing color. Pass `null` for random color per annotation. |
| `color` | Current active color (getter). |

**Annotations (Import / Export)**

| Method | Description |
|--------|-------------|
| `annotations` | Current annotation array (getter). Use this to export. |
| `setAnnotations(list)` | Load an array of annotations. Use this to import. |
| `addAnnotation(bbox)` | Add a single annotation programmatically. |
| `updateAnnotation(id, updates)` | Update an annotation by ID. |
| `deleteAnnotation(id)` | Delete an annotation by ID. |
| `clearAnnotations()` | Remove all annotations. |

**Selection**

| Method | Description |
|--------|-------------|
| `select(id)` | Select an annotation by ID. |
| `deselect()` | Clear selection. |
| `selectedId` | Currently selected annotation ID (getter). |
| `selectedAnnotation` | Currently selected annotation object (getter). |

**Viewport**

| Method | Description |
|--------|-------------|
| `zoomIn(focalPoint?)` | Zoom in. Optional focal point in canvas coordinates. |
| `zoomOut(focalPoint?)` | Zoom out. |
| `setZoom(level, focalPoint?)` | Set exact zoom level. |
| `resetZoom()` | Fit image to canvas. |
| `zoom` | Current zoom level (getter). |

**Pointer Events** — call these from your event handlers:

| Method | Description |
|--------|-------------|
| `onPointerDown(point, button)` | Handle pointer down. `button`: 0=left, 1=middle, 2=right. |
| `onPointerMove(point)` | Handle pointer move. |
| `onPointerUp(point)` | Handle pointer up. |
| `onWheel(point, deltaY)` | Handle wheel zoom. |
| `onKeyDown(key)` | Handle keyboard. Supports `Escape`, `Delete`, `Backspace`. |

**Events** — subscribe to state changes:

```ts
engine.on('annotations:change', (annotations) => { /* save to server */ })
engine.on('annotation:create', (bbox) => { /* new bbox created */ })
engine.on('annotation:update', (bbox) => { /* bbox moved/resized */ })
engine.on('annotation:delete', (id) => { /* bbox removed */ })
engine.on('annotation:select', (id) => { /* selection changed */ })
engine.on('tool:change', (tool) => { /* active tool changed */ })
engine.on('mode:change', (mode) => { /* interaction mode changed */ })
engine.on('viewport:change', (viewport) => { /* zoom/pan changed */ })
```

**Advanced Export**

```ts
// Export with image dimensions (for same-image reload)
const pixelData = engine.exportJSON('pixel')
// { format: 'pixel', imageWidth: 3840, imageHeight: 2160, annotations: [...] }

// Export normalized 0-1 (portable across image sizes)
const normData = engine.exportJSON('normalized')
// { format: 'normalized', annotations: [{ x: 0.39, y: 0.41, ... }] }

// Import either format
engine.importJSON(data)
```

#### `Canvas2DRenderer`

Renders annotations on a `<canvas>` element using native Canvas 2D API.

```ts
const renderer = new Canvas2DRenderer(canvasElement)
renderer.resize(width, height)          // Call on container resize
renderer.render(engine.renderState)     // Call after any state change
renderer.destroy()                      // Cleanup
```

#### `BoundingBox` type

```ts
interface BoundingBox {
  id: string
  x: number          // Image pixels from left
  y: number          // Image pixels from top
  width: number      // Image pixels
  height: number     // Image pixels
  rotation: number   // Degrees
  label?: string     // Optional label text
  color: string      // Hex color, e.g. '#FF6B6B'
}
```

#### Geometry Utilities

All functions work with image-space coordinates:

```ts
import {
  imageToCanvas,          // Convert image coords → canvas coords
  canvasToImage,          // Convert canvas coords → image coords
  isPointInsideBbox,      // Hit test: is point inside bbox?
  getTopAnnotationAtPoint, // Find smallest bbox at a point
  clampBboxToImage,       // Clamp bbox within image bounds
  isBboxValid,            // Check minimum size
  getBboxArea,            // Calculate area
  getBboxCenter,          // Get center point
} from '@labelflow/core'
```

---

### `@labelflow/react`

#### `<AnnotationProvider>`

Wraps your annotation UI. Provides engine context to all children.

```tsx
<AnnotationProvider
  annotations={annotations}          // BoundingBox[] — controlled state
  color="#FF6B6B"                     // Active color (null = random)
  onChange={(anns) => set(anns)}       // Called when annotations change
  onSelect={(id) => {}}               // Called on selection change
  onCreate={(bbox) => {}}             // Called when new bbox drawn
  onUpdate={(bbox) => {}}             // Called when bbox moved/resized
  onDelete={(id) => {}}               // Called when bbox deleted
>
  {children}
</AnnotationProvider>
```

#### `<AnnotationCanvas>`

The canvas surface where annotations are drawn.

```tsx
<AnnotationCanvas
  src="/image.jpg"        // Image URL (required)
  width={800}             // Canvas width in px or '100%'
  height={600}            // Canvas height in px or '100%'
  style={{}}              // Additional CSS styles
  className=""            // CSS class
/>
```

#### `<ToolButton>`

Button that activates a tool. Automatically tracks active state.

```tsx
<ToolButton
  tool="bbox"                         // 'bbox' | null (select mode)
  style={{ padding: '8px 16px' }}     // Base styles
  activeStyle={{ background: 'blue' }} // Applied when this tool is active
  className="btn"
  activeClassName="btn-active"
>
  Draw Box
</ToolButton>
```

#### `useAnnotation()`

Access the engine and actions from any child component.

```tsx
function MyComponent() {
  const {
    engine,            // AnnotationEngine instance
    setActiveTool,     // (tool: ToolType | null) => void
    setColor,          // (color: string | null) => void
    deleteSelected,    // () => void
    clearAll,          // () => void
    zoomIn,            // () => void
    zoomOut,           // () => void
    resetZoom,         // () => void
  } = useAnnotation()

  // Read state directly from engine
  const count = engine.annotations.length
  const selected = engine.selectedId
  const currentTool = engine.activeTool
}
```

---

### `@labelflow/vue`

Same API as React, adapted for Vue 3:

#### Components

```vue
<AnnotationProvider :annotations="annotations" :color="color" @change="onAnnotationsChange">
  <ToolButton :tool="null">Select</ToolButton>
  <ToolButton tool="bbox">BBox</ToolButton>
  <AnnotationCanvas src="/image.jpg" :width="800" :height="600" />
</AnnotationProvider>
```

#### `useAnnotation()`

```ts
const {
  engine,
  setActiveTool,
  setColor,
  deleteSelected,
  clearAll,
  zoomIn, zoomOut, resetZoom,
} = useAnnotation()
```

---

## Import / Export

Annotations are plain JavaScript arrays. Pass them in to render, read them out to save.

### Import (load annotations)

```tsx
// React
const [annotations, setAnnotations] = useState<BoundingBox[]>([])

// Load from server
const data = await fetch('/api/annotations').then(r => r.json())
setAnnotations(data)  // Renders on canvas immediately

// Or directly via engine
engine.setAnnotations(data)
```

```vue
<!-- Vue -->
<script setup>
const annotations = ref([])

async function loadAnnotations() {
  annotations.value = await fetch('/api/annotations').then(r => r.json())
}
</script>
```

### Export (save annotations)

```tsx
// React — annotations state is always current
async function save() {
  await fetch('/api/annotations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(annotations),
  })
}

// Or read directly from engine
const currentAnnotations = engine.annotations
```

### Annotation Format

Coordinates are in **original image pixels** — independent of canvas size or zoom level:

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

A 4K image (3840x2160) displayed in a 900x600 canvas will produce coordinates in the 3840x2160 space. The same annotations render correctly at any canvas size.

---

## Interactions

| Action | Behavior |
|--------|----------|
| **Left-click drag** (BBox tool) | Draw new bounding box |
| **Left-click** (Select mode) | Select annotation, start drag |
| **Drag selected** | Move annotation |
| **Drag handle** | Resize annotation (8-point handles) |
| **Click empty area** | Deselect |
| **Mouse wheel** | Zoom in/out at cursor position |
| **Right-click drag** | Pan the viewport |
| **Middle-click drag** | Pan the viewport |
| **Escape** | Cancel drawing or deselect |
| **Delete / Backspace** | Delete selected annotation |

---

## Canvas Sizing

The canvas size is fully controllable. The image always fits within the canvas, centered with correct aspect ratio.

```tsx
// Fixed size
<AnnotationCanvas src="/image.jpg" width={1200} height={800} />

// Fill parent container
<AnnotationCanvas src="/image.jpg" width="100%" height="100%" />

// Dynamic resize
const [w, setW] = useState(800)
<AnnotationCanvas src="/image.jpg" width={w} height={600} />
<input type="range" min={400} max={1400} value={w} onChange={e => setW(+e.target.value)} />
```

---

## Color Control

```tsx
// Fixed color — all new annotations use this color
<AnnotationProvider color="#FF6B6B" ...>

// Random color — each annotation gets a unique color from built-in palette
<AnnotationProvider color={null} ...>

// Dynamic — user picks color
const [color, setColor] = useState(null)
<AnnotationProvider color={color} ...>
<button onClick={() => setColor('#FF6B6B')}>Red</button>
<button onClick={() => setColor('#4ECDC4')}>Teal</button>
<button onClick={() => setColor(null)}>Random</button>
```

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│  @labelflow/core (framework-agnostic)           │
│                                                  │
│  AnnotationEngine         Canvas2DRenderer       │
│  ├── State management     ├── Image rendering    │
│  ├── Tool logic           ├── BBox drawing       │
│  ├── Pointer events       ├── Handle rendering   │
│  ├── Zoom / Pan           ├── Preview drawing    │
│  ├── Hit detection        └── HiDPI support      │
│  ├── Import / Export                             │
│  └── EventEmitter                                │
│                                                  │
│  Geometry Utils                                  │
│  ├── Coordinate transforms (image ↔ canvas)      │
│  ├── Intersection tests                          │
│  ├── Clamping & validation                       │
│  └── Resize handle logic                         │
└──────────────────────┬──────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
   @labelflow/    @labelflow/    Vanilla JS
      react           vue        (direct use)
```

The core engine has **zero framework dependencies**. Framework packages are thin adapters (~8KB) that connect the engine to React/Vue reactivity systems.

---

## Development

```bash
# Clone and install
git clone https://github.com/user/labelflow.git
cd labelflow
pnpm install

# Build all packages
pnpm build

# Run React demo
pnpm dev:react-demo    # http://localhost:5173

# Run Vue demo
pnpm dev:vue-demo

# Build individual packages
pnpm build:core
pnpm build:react
pnpm build:vue
```

## Roadmap

- [x] Polygon annotation tool
- [ ] Polyline annotation tool
- [ ] Point annotation tool
- [ ] Skeleton (keypoint) annotation tool
- [ ] Undo / Redo
- [ ] Angular adapter
- [ ] Custom renderer support

## License

MIT
