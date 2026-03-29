# Types

All types are exported from every package:

```ts
import type { BoundingBox, ToolType, InteractionMode, Point, Size, Rect } from '@labelflow-core/react'
// or
import type { BoundingBox, ToolType, InteractionMode, Point, Size, Rect } from '@labelflow-core/vue'
// or
import type { BoundingBox, ToolType, InteractionMode, Point, Size, Rect } from '@labelflow-core/engine'
```

## BoundingBox

The core annotation type.

```ts
interface BoundingBox {
  id: string        // Auto-generated unique ID (e.g. "bbox_1_m5abc")
  x: number         // Left edge in original image pixels
  y: number         // Top edge in original image pixels
  width: number     // Width in original image pixels
  height: number    // Height in original image pixels
  rotation: number  // Rotation in degrees (currently always 0)
  label?: string    // Optional text label (rendered above the box)
  color: string     // Hex color string (e.g. "#FF6B6B")
}
```

### Coordinate System

Coordinates are in **original image pixels**, not canvas pixels:

```
Image: 1920×1080
Canvas: 800×600

BBox { x: 960, y: 540 }  →  center of the image
                              (regardless of canvas size)
```

## ToolType

```ts
type ToolType = 'bbox' | 'polygon' | 'polyline' | 'point' | 'skeleton'
```

Currently only `'bbox'` is implemented. Others are reserved for future use.

## InteractionMode

```ts
type InteractionMode = 'idle' | 'drawing' | 'selecting' | 'editing' | 'dragging' | 'resizing'
```

| Mode | Description |
|------|-------------|
| `idle` | Nothing happening |
| `drawing` | User is drawing a new bbox (mouse down + drag) |
| `selecting` | A box is selected but not being manipulated |
| `dragging` | User is moving a selected box |
| `resizing` | User is resizing via a handle |

## Point

```ts
interface Point {
  x: number
  y: number
}
```

## Size

```ts
interface Size {
  width: number
  height: number
}
```

## Rect

```ts
interface Rect {
  x: number
  y: number
  width: number
  height: number
}
```

## ViewportState

```ts
interface ViewportState {
  zoom: number          // Current zoom level (e.g. 0.5 = 50%)
  offset: Point         // Pan offset in canvas pixels
  imageSize: Size       // Original image dimensions
  canvasSize: Size      // Canvas display dimensions
}
```

## HandlePosition

```ts
type HandlePosition =
  | 'top-left' | 'top' | 'top-right'
  | 'left'              | 'right'
  | 'bottom-left' | 'bottom' | 'bottom-right'
```

## Export Types

```ts
interface ExportDataPixel {
  format: 'pixel'
  imageWidth: number
  imageHeight: number
  annotations: BoundingBox[]
}

interface NormalizedBoundingBox {
  id: string
  x: number       // 0-1
  y: number       // 0-1
  width: number   // 0-1
  height: number  // 0-1
  rotation: number
  label?: string
  color: string
}

interface ExportDataNormalized {
  format: 'normalized'
  annotations: NormalizedBoundingBox[]
}

type ExportData = ExportDataPixel | ExportDataNormalized
```
