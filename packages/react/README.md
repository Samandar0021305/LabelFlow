# @labelflow-core/react

React image annotation library. Draw, select, drag, and resize bounding boxes on any image. Built on [@labelflow-core/engine](https://www.npmjs.com/package/@labelflow-core/engine).

## Install

```bash
npm install @labelflow-core/react
```

> `@labelflow-core/engine` installs automatically as a dependency. You don't need to install it separately.

**Peer dependencies:** `react >= 18.0.0`, `react-dom >= 18.0.0`

---

## Basic Example

```tsx
import { useState } from 'react'
import {
  AnnotationProvider,
  AnnotationCanvas,
  ToolButton,
} from '@labelflow-core/react'
import type { BoundingBox } from '@labelflow-core/react'

function App() {
  const [annotations, setAnnotations] = useState<BoundingBox[]>([])

  return (
    <AnnotationProvider annotations={annotations} onChange={setAnnotations}>
      <div style={{ display: 'flex', gap: 8, padding: 8 }}>
        <ToolButton tool={null}>Select</ToolButton>
        <ToolButton tool="bbox">Draw BBox</ToolButton>
      </div>
      <AnnotationCanvas src="/photo.jpg" width={800} height={600} />
    </AnnotationProvider>
  )
}
```

That's it. Click "Draw BBox", then click and drag on the image to draw a bounding box. Click "Select" to switch to selection mode where you can click, drag, and resize existing boxes.

---

## Components

### `<AnnotationProvider>`

Wraps your UI and provides the annotation engine to all child components. This must be the outermost component.

```tsx
<AnnotationProvider
  annotations={annotations}    // BoundingBox[] — your state
  color="#FF6B6B"               // Drawing color. null = random color per box
  onChange={(list) => {}}       // Called when annotations array changes
  onSelect={(id) => {}}        // Called when user selects/deselects a box
  onCreate={(bbox) => {}}      // Called when a new box is drawn
  onUpdate={(bbox) => {}}      // Called when a box is moved or resized
  onDelete={(id) => {}}        // Called when a box is deleted
>
  {children}
</AnnotationProvider>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `annotations` | `BoundingBox[]` | `[]` | Controlled annotation state |
| `color` | `string \| null` | `null` | Active drawing color. `null` assigns a random color to each new box |
| `onChange` | `(list: BoundingBox[]) => void` | — | Fires when annotations change (draw, move, resize, delete) |
| `onSelect` | `(id: string \| null) => void` | — | Fires when selection changes |
| `onCreate` | `(bbox: BoundingBox) => void` | — | Fires when a new box is created |
| `onUpdate` | `(bbox: BoundingBox) => void` | — | Fires when a box is moved or resized |
| `onDelete` | `(id: string) => void` | — | Fires when a box is deleted |

### `<AnnotationCanvas>`

The canvas where the image is displayed and annotations are drawn. Place it inside `<AnnotationProvider>`.

```tsx
<AnnotationCanvas
  src="/photo.jpg"    // Image URL (required)
  width={800}         // Canvas width in pixels, or "100%" to fill parent
  height={600}        // Canvas height in pixels, or "100%" to fill parent
  style={{}}          // CSS styles for the container div
  className=""        // CSS class for the container div
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | *required* | Image URL |
| `width` | `number \| string` | `'100%'` | Canvas width. Number = pixels, string = CSS value |
| `height` | `number \| string` | `'100%'` | Canvas height |
| `style` | `CSSProperties` | — | Container styles |
| `className` | `string` | — | Container class |

The image automatically fits inside the canvas while preserving its aspect ratio. Changing `width` or `height` re-fits the image.

### `<ToolButton>`

A button that activates a tool. It automatically knows whether it's the active tool and applies active styles.

```tsx
<ToolButton
  tool="bbox"                            // Which tool this button activates
  style={{ padding: '8px 16px' }}        // Base styles
  activeStyle={{ background: '#2563eb', color: '#fff' }}  // Styles when active
  className="btn"                        // Base CSS class
  activeClassName="btn-active"           // CSS class when active
>
  Draw Box
</ToolButton>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tool` | `'bbox' \| null` | — | `'bbox'` = draw mode, `null` = select mode |
| `style` | `CSSProperties` | — | Base button styles |
| `activeStyle` | `CSSProperties` | — | Merged on top when this tool is active |
| `className` | `string` | — | Base CSS class |
| `activeClassName` | `string` | — | Added when active |
| `children` | `ReactNode` | tool name | Button content |

---

## Hooks

### `useAnnotation()`

Access the annotation engine and actions from any component inside `<AnnotationProvider>`.

```tsx
import { useAnnotation } from '@labelflow-core/react'

function MyToolbar() {
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

  return (
    <div>
      <button onClick={() => setActiveTool('bbox')}>Draw</button>
      <button onClick={() => setActiveTool(null)}>Select</button>
      <button onClick={() => setColor('#FF6B6B')}>Red</button>
      <button onClick={() => setColor(null)}>Random Color</button>
      <button onClick={deleteSelected}>Delete Selected</button>
      <button onClick={clearAll}>Clear All</button>
      <button onClick={zoomIn}>Zoom In</button>
      <button onClick={zoomOut}>Zoom Out</button>
      <button onClick={resetZoom}>Fit</button>
      <p>{engine.annotations.length} annotations</p>
    </div>
  )
}
```

**Reading state from `engine`:**

```tsx
const { engine } = useAnnotation()

engine.annotations      // BoundingBox[] — all annotations
engine.selectedId        // string | null — selected box ID
engine.selectedAnnotation // BoundingBox | null — selected box object
engine.activeTool        // 'bbox' | null
engine.color             // current drawing color
engine.zoom              // current zoom level
engine.mode              // 'idle' | 'drawing' | 'selecting' | 'dragging' | 'resizing'
```

---

## Import & Export

Annotations are plain arrays. Pass them in to render, read them out to save.

### Load annotations (e.g. from server)

```tsx
function App() {
  const [annotations, setAnnotations] = useState<BoundingBox[]>([])

  // Load from API
  useEffect(() => {
    fetch('/api/annotations')
      .then(res => res.json())
      .then(data => setAnnotations(data))
  }, [])

  return (
    <AnnotationProvider annotations={annotations} onChange={setAnnotations}>
      <AnnotationCanvas src="/photo.jpg" width={800} height={600} />
    </AnnotationProvider>
  )
}
```

### Save annotations (e.g. to server)

```tsx
function SaveButton() {
  const { engine } = useAnnotation()

  async function handleSave() {
    await fetch('/api/annotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(engine.annotations),
    })
  }

  return <button onClick={handleSave}>Save</button>
}
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

```tsx
// Fixed color — every new box is red
<AnnotationProvider color="#FF6B6B" ...>

// Random color — each box gets a different color from the built-in palette
<AnnotationProvider color={null} ...>

// User-selectable
function App() {
  const [color, setColor] = useState<string | null>(null)

  return (
    <AnnotationProvider color={color} onChange={setAnnotations} ...>
      <button onClick={() => setColor('#FF6B6B')}>Red</button>
      <button onClick={() => setColor('#4ECDC4')}>Teal</button>
      <button onClick={() => setColor('#45B7D1')}>Blue</button>
      <button onClick={() => setColor(null)}>Random</button>
      <AnnotationCanvas src="/photo.jpg" />
    </AnnotationProvider>
  )
}
```

---

## Canvas Sizing

```tsx
// Fixed size
<AnnotationCanvas src="/photo.jpg" width={1200} height={800} />

// Fill parent container
<AnnotationCanvas src="/photo.jpg" width="100%" height="100%" />

// Dynamic — resizable by the user
const [w, setW] = useState(800)
<AnnotationCanvas src="/photo.jpg" width={w} height={600} />
<input type="range" min={400} max={1400} value={w} onChange={e => setW(+e.target.value)} />
```

The image always fits within the canvas, centered, with correct aspect ratio. All annotations stay in the correct position regardless of canvas size.

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

```tsx
import { useState, useEffect } from 'react'
import {
  AnnotationProvider,
  AnnotationCanvas,
  ToolButton,
  useAnnotation,
} from '@labelflow-core/react'
import type { BoundingBox } from '@labelflow-core/react'

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']

function Toolbar() {
  const { engine, setColor, deleteSelected, clearAll, zoomIn, zoomOut, resetZoom } = useAnnotation()

  return (
    <div style={{ display: 'flex', gap: 8, padding: 8, background: '#fff', borderBottom: '1px solid #eee' }}>
      <ToolButton tool={null} style={{ padding: '6px 12px' }} activeStyle={{ background: '#2563eb', color: '#fff' }}>
        Select
      </ToolButton>
      <ToolButton tool="bbox" style={{ padding: '6px 12px' }} activeStyle={{ background: '#2563eb', color: '#fff' }}>
        BBox
      </ToolButton>

      <span style={{ borderLeft: '1px solid #ddd', margin: '0 4px' }} />

      {COLORS.map(c => (
        <button
          key={c}
          onClick={() => setColor(c)}
          style={{
            width: 24, height: 24, borderRadius: 4, border: 'none',
            background: c, cursor: 'pointer',
            outline: engine.color === c ? `2px solid ${c}` : 'none',
            outlineOffset: 2,
          }}
        />
      ))}
      <button onClick={() => setColor(null)}>Random</button>

      <span style={{ borderLeft: '1px solid #ddd', margin: '0 4px' }} />

      <button onClick={zoomIn}>+</button>
      <button onClick={zoomOut}>-</button>
      <button onClick={resetZoom}>Fit</button>
      <button onClick={deleteSelected} style={{ color: 'red' }}>Delete</button>
      <button onClick={clearAll} style={{ color: 'red' }}>Clear</button>

      <span style={{ marginLeft: 'auto', color: '#888' }}>
        {engine.annotations.length} boxes
      </span>
    </div>
  )
}

function AnnotationList() {
  const { engine } = useAnnotation()

  return (
    <div style={{ width: 250, padding: 12, borderLeft: '1px solid #eee', overflowY: 'auto' }}>
      <h3>{engine.annotations.length} Annotations</h3>
      {engine.annotations.map(ann => (
        <div
          key={ann.id}
          onClick={() => engine.select(ann.id)}
          style={{
            padding: 8, marginBottom: 4, cursor: 'pointer', borderRadius: 4,
            borderLeft: `3px solid ${ann.color}`,
            background: ann.id === engine.selectedId ? '#f0f0f0' : 'transparent',
          }}
        >
          <strong style={{ color: ann.color }}>{ann.label || ann.id.slice(0, 10)}</strong>
          <div style={{ fontSize: 11, color: '#999' }}>
            {Math.round(ann.x)}, {Math.round(ann.y)} — {Math.round(ann.width)}x{Math.round(ann.height)}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [annotations, setAnnotations] = useState<BoundingBox[]>([])

  // Example: load from server on mount
  // useEffect(() => {
  //   fetch('/api/annotations').then(r => r.json()).then(setAnnotations)
  // }, [])

  // Example: save to server on change
  // function handleChange(list: BoundingBox[]) {
  //   setAnnotations(list)
  //   fetch('/api/annotations', { method: 'POST', body: JSON.stringify(list) })
  // }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AnnotationProvider annotations={annotations} onChange={setAnnotations}>
        <Toolbar />
        <div style={{ display: 'flex', flex: 1 }}>
          <AnnotationCanvas
            src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80"
            style={{ flex: 1, background: '#1a1a2e' }}
          />
          <AnnotationList />
        </div>
      </AnnotationProvider>
    </div>
  )
}
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
