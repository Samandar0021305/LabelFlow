# Types

All types are exported from every package:

```ts
import type { Annotation, BoundingBox, Polygon, ToolType, Point } from '@labelflow-core/react'
// or from '@labelflow-core/vue' or '@labelflow-core/engine'
```

## Annotation

Union type of all annotation shapes:

```ts
type Annotation = BoundingBox | Polygon
```

Use `annotation.type` to discriminate:

```ts
if (annotation.type === 'bbox') {
  console.log(annotation.width, annotation.height)
} else if (annotation.type === 'polygon') {
  console.log(annotation.points.length, 'vertices')
}
```

## BoundingBox

```ts
interface BoundingBox {
  id: string        // Auto-generated unique ID
  type: 'bbox'      // Discriminator
  x: number         // Left edge in image pixels
  y: number         // Top edge in image pixels
  width: number     // Width in image pixels
  height: number    // Height in image pixels
  rotation: number  // Degrees (currently always 0)
  label?: string    // Optional label text (shown above the box)
  color: string     // Hex color, e.g. '#FF6B6B'
}
```

## Polygon

```ts
interface Polygon {
  id: string        // Auto-generated unique ID
  type: 'polygon'   // Discriminator
  points: Point[]   // Array of vertices in image pixels
  label?: string    // Optional label text (shown at top-left)
  color: string     // Hex color, e.g. '#4ECDC4'
}
```

### Coordinate System

All coordinates are in **original image pixels**:

```
Image: 1920×1080
Canvas: 800×600

BBox { x: 960, y: 540 }                    → center of image
Polygon { points: [{ x: 960, y: 540 }] }   → center of image
```

Coordinates don't change when the canvas is resized or zoomed.

## Point

```ts
interface Point {
  x: number
  y: number
}
```

## ToolType

```ts
type ToolType = 'bbox' | 'polygon' | 'polyline' | 'point' | 'skeleton'
```

Currently `'bbox'` and `'polygon'` are implemented. Others are reserved for future use.

## InteractionMode

```ts
type InteractionMode =
  | 'idle'             // Nothing happening
  | 'drawing'          // Drawing a new annotation (bbox drag or polygon clicks)
  | 'selecting'        // Annotation selected, not moving
  | 'dragging'         // Moving an annotation
  | 'resizing'         // Resizing bbox via handle
  | 'dragging-vertex'  // Dragging a polygon vertex
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
  zoom: number
  offset: Point
  imageSize: Size
  canvasSize: Size
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
  annotations: Annotation[]
}

interface ExportDataNormalized {
  format: 'normalized'
  annotations: NormalizedAnnotation[]
}

interface NormalizedAnnotation {
  id: string
  type: 'bbox' | 'polygon'
  // bbox (0-1)
  x?: number; y?: number; width?: number; height?: number; rotation?: number
  // polygon (0-1)
  points?: Point[]
  label?: string
  color: string
}
```
