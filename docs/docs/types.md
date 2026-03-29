# Types

All types exported from every package:

```ts
import type { Annotation, BoundingBox, Polygon, ToolType, Point, Size, Rect } from '@labelflow-core/react'
// or '@labelflow-core/vue' or '@labelflow-core/engine'
```

## Annotation

Union of all shapes. Use `type` field to discriminate:

```ts
type Annotation = BoundingBox | Polygon

if (ann.type === 'bbox') { /* ann.width, ann.height */ }
if (ann.type === 'polygon') { /* ann.points */ }
```

## BoundingBox

```ts
interface BoundingBox {
  id: string         // auto-generated
  type: 'bbox'       // discriminator
  x: number          // left edge (image pixels)
  y: number          // top edge (image pixels)
  width: number      // width (image pixels)
  height: number     // height (image pixels)
  rotation: number   // degrees
  label?: string     // shown above box
  color: string      // hex, e.g. '#FF6B6B'
}
```

## Polygon

```ts
interface Polygon {
  id: string         // auto-generated
  type: 'polygon'    // discriminator
  points: Point[]    // vertices (image pixels)
  label?: string     // shown at top-left
  color: string      // hex
}
```

## Point

```ts
interface Point { x: number; y: number }
```

## Size

```ts
interface Size { width: number; height: number }
```

## Rect

```ts
interface Rect { x: number; y: number; width: number; height: number }
```

## ToolType

```ts
type ToolType = 'bbox' | 'polygon' | 'polyline' | 'point' | 'skeleton'
// Currently 'bbox' and 'polygon' implemented
```

## InteractionMode

```ts
type InteractionMode =
  | 'idle'             // nothing happening
  | 'drawing'          // creating new annotation
  | 'selecting'        // annotation selected
  | 'dragging'         // moving annotation
  | 'resizing'         // bbox handle resize
  | 'dragging-vertex'  // polygon vertex drag
```

## ViewportState

```ts
interface ViewportState {
  zoom: number; offset: Point; imageSize: Size; canvasSize: Size
}
```

## HandlePosition

```ts
type HandlePosition =
  | 'top-left' | 'top' | 'top-right'
  | 'left' | 'right'
  | 'bottom-left' | 'bottom' | 'bottom-right'
```
