# Drawing Annotations

LabelFlow supports two annotation tools: **BBox** (bounding box) and **Polygon**.

## Tools Overview

| Tool | Activate | Drawing method | Editing |
|------|----------|---------------|---------|
| **BBox** | `setActiveTool('bbox')` | Click + drag | 8-point handles to resize |
| **Polygon** | `setActiveTool('polygon')` | Click to place vertices | Drag individual vertices |
| **Select** | `setActiveTool(null)` | — | Click to select, drag to move |

## BBox Drawing

```
1. setActiveTool('bbox')       → cursor becomes crosshair
2. Mouse down on image         → start point recorded
3. Drag                        → dashed preview rectangle
4. Mouse up                    → BoundingBox created
5. Auto-selected               → ready for editing
```

When selected, 8 resize handles appear:

```
  ●─────────●─────────●
  │                     │
  ●      BBox          ●
  │                     │
  ●─────────●─────────●
```

## Polygon Drawing

```
1. setActiveTool('polygon')    → cursor becomes crosshair
2. Click on image              → first vertex placed
3. Click again                 → second vertex, line appears
4. Click again                 → third vertex, area preview appears
5. Click near first vertex     → polygon auto-closes (15px threshold)
   OR double-click             → polygon closes at current position
6. Auto-selected               → vertices visible for editing
```

When selected, vertices appear as squares you can drag:

```
    ●
   / \
  /   \
 ●─────●
  \   /
   \ /
    ●
```

### Close Detection

When you have 3+ points, the first vertex highlights in color. Click within 15 pixels of it to auto-close the polygon. Alternatively, double-click anywhere to force-close.

### Minimum Points

A polygon needs at least 3 vertices. If you press Escape or try to close with fewer than 3 points, the drawing is cancelled.

## Editing

In **Select mode** (`setActiveTool(null)`):

| Action | BBox | Polygon |
|--------|------|---------|
| Click on annotation | Select it | Select it |
| Drag annotation | Move it | Move it |
| Drag handle | Resize | — |
| Drag vertex | — | Move that vertex |
| Click empty area | Deselect | Deselect |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Escape` | Cancel current drawing, or deselect |
| `Delete` / `Backspace` | Delete selected annotation |

## Example: Tool Switching

::: code-group

```tsx [React]
function Toolbar() {
  const { engine, setActiveTool } = useAnnotation()

  const btnStyle = (tool: string | null) => ({
    padding: '6px 12px',
    background: engine.activeTool === tool ? '#2563eb' : '#fff',
    color: engine.activeTool === tool ? '#fff' : '#000',
    border: '1px solid #ddd',
    borderRadius: 6,
    cursor: 'pointer',
  })

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={() => setActiveTool(null)} style={btnStyle(null)}>Select</button>
      <button onClick={() => setActiveTool('bbox')} style={btnStyle('bbox')}>BBox</button>
      <button onClick={() => setActiveTool('polygon')} style={btnStyle('polygon')}>Polygon</button>
    </div>
  )
}
```

```vue [Vue]
<script setup>
import { useAnnotation } from '@labelflow-core/vue'
const { engine, setActiveTool } = useAnnotation()
</script>

<template>
  <div style="display: flex; gap: 8px">
    <button @click="setActiveTool(null)"
      :style="{ background: engine.activeTool === null ? '#2563eb' : '#fff', color: engine.activeTool === null ? '#fff' : '#000' }">
      Select
    </button>
    <button @click="setActiveTool('bbox')"
      :style="{ background: engine.activeTool === 'bbox' ? '#2563eb' : '#fff', color: engine.activeTool === 'bbox' ? '#fff' : '#000' }">
      BBox
    </button>
    <button @click="setActiveTool('polygon')"
      :style="{ background: engine.activeTool === 'polygon' ? '#2563eb' : '#fff', color: engine.activeTool === 'polygon' ? '#fff' : '#000' }">
      Polygon
    </button>
  </div>
</template>
```

:::
