# @labelflow-core/react

React image annotation library. Draw bounding boxes and polygons on any image with zoom, pan, resize, and drag support. Built on [@labelflow-core/engine](https://www.npmjs.com/package/@labelflow-core/engine).

## Install

```bash
npm install @labelflow-core/react
```

> `@labelflow-core/engine` installs automatically. No separate install needed.

**Peer dependencies:** `react >= 18.0.0`, `react-dom >= 18.0.0`

## Supported Tools

| Tool | Activate | How it works |
|------|----------|-------------|
| **BBox** | `setActiveTool('bbox')` | Click and drag to draw a rectangle |
| **Polygon** | `setActiveTool('polygon')` | Click to place vertices, click near first point or double-click to close |
| **Select** | `setActiveTool(null)` | Click to select, drag to move, drag handles/vertices to edit |

## Basic Example

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

## Components

### `<AnnotationProvider>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `annotations` | `Annotation[]` | `[]` | Controlled annotation state |
| `color` | `string \| null` | `null` | Drawing color. `null` = random per annotation |
| `onChange` | `(list: Annotation[]) => void` | — | Annotations changed |
| `onSelect` | `(id: string \| null) => void` | — | Selection changed |
| `onCreate` | `(ann: Annotation) => void` | — | New annotation created |
| `onUpdate` | `(ann: Annotation) => void` | — | Annotation moved/resized |
| `onDelete` | `(id: string) => void` | — | Annotation deleted |

### `<AnnotationCanvas>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | *required* | Image URL |
| `width` | `number \| string` | `'100%'` | Canvas width |
| `height` | `number \| string` | `'100%'` | Canvas height |

## `useAnnotation()` Hook

```tsx
const {
  engine,           // AnnotationEngine instance
  setActiveTool,    // (tool: 'bbox' | 'polygon' | null) => void
  setColor,         // (color: string | null) => void
  deleteSelected,   // () => void
  clearAll,         // () => void
  zoomIn, zoomOut, resetZoom,
} = useAnnotation()

// Read state
engine.annotations       // Annotation[] — all annotations
engine.selectedId         // string | null
engine.activeTool         // 'bbox' | 'polygon' | null
engine.mode               // 'idle' | 'drawing' | 'selecting' | 'dragging' | ...

// Programmatic
engine.select(id)
engine.deselect()
engine.addAnnotation({ type: 'bbox', x: 10, y: 10, width: 100, height: 80, rotation: 0, color: '#FF6B6B' })
engine.addAnnotation({ type: 'polygon', points: [{x:10,y:10},{x:100,y:10},{x:50,y:80}], color: '#4ECDC4' })
engine.deleteAnnotation(id)
```

## Import & Export

```tsx
// Import — just pass an array
setAnnotations([
  { id: '1', type: 'bbox', x: 100, y: 100, width: 200, height: 150, rotation: 0, color: '#FF6B6B' },
  { id: '2', type: 'polygon', points: [{ x: 300, y: 100 }, { x: 450, y: 80 }, { x: 400, y: 250 }], color: '#4ECDC4' },
])

// Export — read the array, save anywhere
await fetch('/api/save', { method: 'POST', body: JSON.stringify(annotations) })
```

## Types

```ts
type Annotation = BoundingBox | Polygon

interface BoundingBox {
  id: string; type: 'bbox'
  x: number; y: number; width: number; height: number
  rotation: number; label?: string; color: string
}

interface Polygon {
  id: string; type: 'polygon'
  points: { x: number; y: number }[]
  label?: string; color: string
}
```

## Mouse & Keyboard

| Action | BBox mode | Polygon mode | Select mode |
|--------|-----------|-------------|-------------|
| **Left click + drag** | Draw rectangle | — | Move annotation |
| **Left click** | — | Place vertex | Select annotation |
| **Click near first vertex** | — | Close polygon | — |
| **Double click** | — | Close polygon | — |
| **Drag vertex** | — | — | Edit polygon vertex |
| **Drag handle** | — | — | Resize bbox |
| **Mouse wheel** | Zoom | Zoom | Zoom |
| **Right/middle drag** | Pan | Pan | Pan |
| **Escape** | — | Cancel drawing | Deselect |
| **Delete** | — | — | Delete selected |

## License

MIT
