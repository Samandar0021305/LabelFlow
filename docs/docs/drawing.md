# Drawing (BBox & Polygon)

LabelFlow supports two annotation tools. Switch between them with `setActiveTool()`.

## Tools

| Tool | Activate | How to draw | Editing |
|------|----------|------------|---------|
| **BBox** | `setActiveTool('bbox')` | Click + drag | 8 resize handles |
| **Polygon** | `setActiveTool('polygon')` | Click to add vertices | Drag individual vertices |
| **Select** | `setActiveTool(null)` | — | Click, drag, resize |

## BBox

**Draw:** click and hold, drag to size, release.

```
Mouse down → drag → mouse up → BoundingBox created
```

**Edit (select mode):** click to select, drag to move, drag handles to resize.

```
●─────────●─────────●
│                     │
●       BBox         ●
│                     │
●─────────●─────────●
```

## Polygon

**Draw:** click to place each vertex. Close by clicking near the first vertex (15px threshold) or double-clicking anywhere.

```
Click → click → click → click near first vertex → Polygon created
                         OR double-click
```

**Minimum 3 vertices** required. Press `Escape` to cancel.

**Edit (select mode):** click to select, drag the polygon to move, drag any vertex to reshape.

```
    ●          drag this vertex
   / \         to reshape
  /   \
 ●─────●
```

The first vertex highlights in color when you have 3+ points — click it to close.

## Tool Switching

::: code-group

```tsx [React]
function Toolbar() {
  const { engine, setActiveTool } = useAnnotation()

  const btn = (tool: string | null, label: string) => (
    <button
      onClick={() => setActiveTool(tool as any)}
      style={{
        padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
        border: '1px solid #ddd',
        background: engine.activeTool === tool ? '#2563eb' : '#fff',
        color: engine.activeTool === tool ? '#fff' : '#000',
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ display: 'flex', gap: 8, padding: 8 }}>
      {btn(null, 'Select')}
      {btn('bbox', 'BBox')}
      {btn('polygon', 'Polygon')}
    </div>
  )
}
```

```vue [Vue]
<script setup>
const { engine, setActiveTool } = useAnnotation()
</script>

<template>
  <div style="display: flex; gap: 8px; padding: 8px">
    <button v-for="[tool, label] in [[null, 'Select'], ['bbox', 'BBox'], ['polygon', 'Polygon']]"
      :key="String(tool)"
      @click="setActiveTool(tool)"
      :style="{
        padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
        border: '1px solid #ddd',
        background: engine.activeTool === tool ? '#2563eb' : '#fff',
        color: engine.activeTool === tool ? '#fff' : '#000',
      }">
      {{ label }}
    </button>
  </div>
</template>
```

:::

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Escape` | Cancel drawing or deselect |
| `Delete` / `Backspace` | Delete selected annotation |

## Mouse Controls

| Action | BBox mode | Polygon mode | Select mode |
|--------|-----------|-------------|-------------|
| **Left click + drag** | Draw rectangle | — | Move annotation |
| **Left click** | — | Place vertex | Select |
| **Near first vertex** | — | Close polygon | — |
| **Double click** | — | Close polygon | — |
| **Drag vertex** | — | — | Reshape polygon |
| **Drag handle** | — | — | Resize bbox |
| **Mouse wheel** | Zoom | Zoom | Zoom |
| **Right/middle drag** | Pan | Pan | Pan |
