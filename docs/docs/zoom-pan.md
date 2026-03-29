# Zoom & Pan

## Mouse Controls

| Action | What it does |
|--------|-------------|
| **Mouse wheel** | Zoom in/out at cursor position |
| **Right-click + drag** | Pan the viewport |
| **Middle-click + drag** | Pan the viewport |

## Programmatic

::: code-group

```tsx [React]
const { engine, zoomIn, zoomOut, resetZoom } = useAnnotation()

<button onClick={zoomIn}>+</button>
<button onClick={zoomOut}>-</button>
<button onClick={resetZoom}>Fit</button>
<span>{Math.round(engine.zoom * 100)}%</span>
```

```vue [Vue]
const { engine, zoomIn, zoomOut, resetZoom } = useAnnotation()

<button @click="zoomIn">+</button>
<button @click="zoomOut">-</button>
<button @click="resetZoom">Fit</button>
<span>{{ Math.round(engine.zoom * 100) }}%</span>
```

:::

## Behavior

- **Focal point zoom:** wheel zoom keeps the point under cursor in place
- **Button zoom:** `zoomIn()`/`zoomOut()` zoom toward canvas center
- **Reset:** `resetZoom()` fits image to canvas
- **Range:** 10% to 2000%
- **Step:** 1.1x per increment

Annotations stay in correct positions at any zoom level. Stroke widths and handle sizes scale to remain usable.
