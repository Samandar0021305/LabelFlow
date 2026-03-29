# AnnotationCanvas

The canvas that renders the image and annotations. Handles all pointer, wheel, and keyboard events internally.

## Usage

::: code-group

```tsx [React]
<AnnotationCanvas src="/photo.jpg" width={800} height={600} />
```

```vue [Vue]
<AnnotationCanvas src="/photo.jpg" :width="800" :height="600" />
```

:::

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | **required** | Image URL (JPEG, PNG, WebP, etc.) |
| `width` | `number \| string` | `'100%'` | Canvas width. Number = pixels, string = CSS value |
| `height` | `number \| string` | `'100%'` | Canvas height |
| `style` | `CSSProperties` | — | Container div styles |
| `className` | `string` | — | Container div class (React only) |

## Image Fitting

The image fits inside the canvas preserving aspect ratio, centered:

```
Canvas: 800×600    Image: 1920×1080
→ Displayed at 800×450, centered vertically
```

Changing `width`/`height` re-fits automatically (ResizeObserver).

## HiDPI

Automatic `devicePixelRatio` scaling — sharp on Retina displays.

## Cursor

Changes automatically based on state:

| State | Cursor |
|-------|--------|
| Select mode, hovering | `pointer` |
| BBox/Polygon tool | `crosshair` |
| Drawing | `crosshair` |
| Dragging | `move` |
| Resizing | `nwse-resize` |
| Panning | `grabbing` |

## Events Handled

Pointer, wheel, double-click, keyboard (via window), and context menu (prevented for right-click panning) — all handled internally.
