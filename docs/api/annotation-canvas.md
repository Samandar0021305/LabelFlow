# AnnotationCanvas

The canvas component that renders the image and all annotations. Handles all pointer, wheel, and keyboard events internally.

## Usage

::: code-group

```tsx [React]
import { AnnotationCanvas } from '@labelflow-core/react'

<AnnotationCanvas
  src="/photo.jpg"
  width={800}
  height={600}
  style={{ background: '#1a1a2e' }}
  className="my-canvas"
/>
```

```vue [Vue]
import { AnnotationCanvas } from '@labelflow-core/vue'

<AnnotationCanvas
  src="/photo.jpg"
  :width="800"
  :height="600"
  :style="{ background: '#1a1a2e' }"
/>
```

:::

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | **required** | Image URL. Supports any format the browser can load (JPEG, PNG, WebP, etc). |
| `width` | `number \| string` | `'100%'` | Canvas width. Number = pixels, string = CSS value (e.g. `'100%'`). |
| `height` | `number \| string` | `'100%'` | Canvas height. Same as width. |
| `style` | `CSSProperties` | — | CSS styles applied to the container div. |
| `className` | `string` | — | CSS class applied to the container div. (React only) |

## Behavior

### Image Fitting

The image automatically fits inside the canvas while preserving aspect ratio:

```
Canvas: 800×600    Image: 1920×1080

Scale = Math.min(800/1920, 600/1080) = 0.416
Image rendered at: 800×450, centered vertically
```

When `width` or `height` changes, the image re-fits automatically.

### HiDPI

The canvas automatically scales for high-DPI displays (`window.devicePixelRatio`). No configuration needed.

### Events Handled

The canvas handles these events internally:

| Event | Action |
|-------|--------|
| `pointerdown` | Start drawing, selecting, or dragging |
| `pointermove` | Update preview, drag, or resize |
| `pointerup` | Finish drawing, dragging, or resizing |
| `wheel` | Zoom (non-passive, calls preventDefault) |
| `keydown` | Escape, Delete, Backspace (via window listener) |
| `contextmenu` | Prevented (right-click used for panning) |

### Cursor

The cursor changes automatically based on the current state:

| State | Cursor |
|-------|--------|
| Select mode, hovering a box | `pointer` |
| Select mode, idle | `default` |
| BBox tool | `crosshair` |
| Drawing | `crosshair` |
| Dragging a box | `move` |
| Resizing | `nwse-resize` (varies by handle) |
| Panning | `grabbing` |

## Notes

- Must be placed inside `<AnnotationProvider>`.
- Only one `AnnotationCanvas` per provider.
- The container div has `overflow: hidden` and `position: relative`.
