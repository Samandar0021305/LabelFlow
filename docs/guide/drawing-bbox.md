# Drawing BBox

## Two Modes

LabelFlow has two interaction modes, controlled by `setActiveTool()`:

| Mode | Activate | What you can do |
|------|----------|----------------|
| **Select** | `setActiveTool(null)` | Click to select, drag to move, handles to resize |
| **BBox** | `setActiveTool('bbox')` | Click and drag to draw new bounding boxes |

## Drawing Flow

```
1. setActiveTool('bbox')      → cursor becomes crosshair
2. Mouse down on image        → start point recorded
3. Drag                       → dashed preview rectangle appears
4. Mouse up                   → BoundingBox created with current color
5. Box auto-selected          → ready for immediate editing
```

## Editing Flow

```
1. setActiveTool(null)        → select mode
2. Click on a box             → selected (highlighted, handles appear)
3. Drag the box               → moves within image bounds
4. Drag a handle              → resizes (8-point: corners + edges)
5. Click empty area           → deselects
```

## Handles

When a box is selected, 8 resize handles appear:

```
  ●─────────●─────────●
  │                     │
  ●      BBox          ●
  │                     │
  ●─────────●─────────●
```

Each handle resizes in its respective direction. The box is clamped to image bounds.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Escape` | Cancel current drawing, or deselect |
| `Delete` / `Backspace` | Delete selected box |

## Example: Tool Switching

::: code-group

```tsx [React]
function Toolbar() {
  const { engine, setActiveTool } = useAnnotation()

  return (
    <div>
      <button
        onClick={() => setActiveTool(null)}
        style={{ background: engine.activeTool === null ? '#2563eb' : '#fff',
                 color: engine.activeTool === null ? '#fff' : '#000' }}
      >
        Select
      </button>
      <button
        onClick={() => setActiveTool('bbox')}
        style={{ background: engine.activeTool === 'bbox' ? '#2563eb' : '#fff',
                 color: engine.activeTool === 'bbox' ? '#fff' : '#000' }}
      >
        Draw BBox
      </button>
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
  <button @click="setActiveTool(null)"
    :style="{ background: engine.activeTool === null ? '#2563eb' : '#fff' }">
    Select
  </button>
  <button @click="setActiveTool('bbox')"
    :style="{ background: engine.activeTool === 'bbox' ? '#2563eb' : '#fff' }">
    Draw BBox
  </button>
</template>
```

:::
