# Zoom & Pan

LabelFlow has built-in zoom and pan support for working with large or detailed images.

## Mouse Controls

| Action | What it does |
|--------|-------------|
| **Mouse wheel** | Zoom in/out at cursor position |
| **Right-click + drag** | Pan the viewport |
| **Middle-click + drag** | Pan the viewport |

## Programmatic Control

Use `useAnnotation()` to control zoom from your own buttons:

::: code-group

```tsx [React]
function ZoomControls() {
  const { engine, zoomIn, zoomOut, resetZoom } = useAnnotation()

  return (
    <div>
      <button onClick={zoomIn}>Zoom In</button>
      <button onClick={zoomOut}>Zoom Out</button>
      <button onClick={resetZoom}>Fit to Canvas</button>
      <span>{Math.round(engine.zoom * 100)}%</span>
    </div>
  )
}
```

```vue [Vue]
<script setup>
const { engine, zoomIn, zoomOut, resetZoom } = useAnnotation()
</script>

<template>
  <button @click="zoomIn">Zoom In</button>
  <button @click="zoomOut">Zoom Out</button>
  <button @click="resetZoom">Fit to Canvas</button>
  <span>{{ Math.round(engine.zoom * 100) }}%</span>
</template>
```

:::

## Zoom Behavior

- **Focal point zoom:** When using the mouse wheel, the point under the cursor stays in place. This lets you zoom into specific areas naturally.
- **Button zoom:** `zoomIn()` and `zoomOut()` zoom toward the canvas center.
- **Reset:** `resetZoom()` fits the entire image into the canvas.
- **Range:** 10% to 2000% (configurable via engine constants)
- **Step:** Each zoom step multiplies/divides by 1.1x

## Annotations During Zoom

Annotations stay in their correct image positions at any zoom level. Visual properties like stroke width and handle size automatically scale to remain usable:

| Zoom | Stroke width | Handle size |
|------|-------------|-------------|
| 0.2x | thicker | 8px (constant) |
| 1.0x | normal | 8px (constant) |
| 5.0x | thinner | 8px (constant) |
