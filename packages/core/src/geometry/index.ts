import type { Point, Rect, Size, Handle, HandlePosition, BoundingBox } from '../types'
import { DEFAULTS } from '../types'

// ─── Coordinate Transforms ──────────────────────────────

export function imageToCanvas(point: Point, zoom: number, offset: Point): Point {
  return {
    x: point.x * zoom + offset.x,
    y: point.y * zoom + offset.y,
  }
}

export function canvasToImage(point: Point, zoom: number, offset: Point): Point {
  return {
    x: (point.x - offset.x) / zoom,
    y: (point.y - offset.y) / zoom,
  }
}

export function rectImageToCanvas(rect: Rect, zoom: number, offset: Point): Rect {
  const tl = imageToCanvas({ x: rect.x, y: rect.y }, zoom, offset)
  return {
    x: tl.x,
    y: tl.y,
    width: rect.width * zoom,
    height: rect.height * zoom,
  }
}

export function rectCanvasToImage(rect: Rect, zoom: number, offset: Point): Rect {
  const tl = canvasToImage({ x: rect.x, y: rect.y }, zoom, offset)
  return {
    x: tl.x,
    y: tl.y,
    width: rect.width / zoom,
    height: rect.height / zoom,
  }
}

// ─── BBox Geometry ──────────────────────────────────────

export function normalizeBbox(startPos: Point, endPos: Point): Rect {
  const x = Math.min(startPos.x, endPos.x)
  const y = Math.min(startPos.y, endPos.y)
  const width = Math.abs(endPos.x - startPos.x)
  const height = Math.abs(endPos.y - startPos.y)
  return { x, y, width, height }
}

export function isPointInsideBbox(point: Point, bbox: Rect): boolean {
  return (
    point.x >= bbox.x &&
    point.x <= bbox.x + bbox.width &&
    point.y >= bbox.y &&
    point.y <= bbox.y + bbox.height
  )
}

export function getBboxArea(bbox: Rect): number {
  return bbox.width * bbox.height
}

export function getBboxCenter(bbox: Rect): Point {
  return {
    x: bbox.x + bbox.width / 2,
    y: bbox.y + bbox.height / 2,
  }
}

export function clampBboxToImage(bbox: Rect, imageSize: Size): Rect {
  const x = Math.max(0, Math.min(bbox.x, imageSize.width - bbox.width))
  const y = Math.max(0, Math.min(bbox.y, imageSize.height - bbox.height))
  return { x, y, width: bbox.width, height: bbox.height }
}

export function clampPointToImage(point: Point, imageSize: Size): Point {
  return {
    x: Math.max(0, Math.min(point.x, imageSize.width)),
    y: Math.max(0, Math.min(point.y, imageSize.height)),
  }
}

export function isBboxValid(rect: Rect, minSize: number = DEFAULTS.MIN_BBOX_SIZE): boolean {
  return rect.width >= minSize && rect.height >= minSize
}

// ─── Handle (Resize Anchors) Geometry ───────────────────

export function getBboxHandles(bbox: Rect, handleSize: number = DEFAULTS.HANDLE_SIZE): Handle[] {
  const hs = handleSize / 2
  const { x, y, width: w, height: h } = bbox

  return [
    { position: 'top-left', x: x - hs, y: y - hs, cursor: 'nwse-resize' },
    { position: 'top', x: x + w / 2 - hs, y: y - hs, cursor: 'ns-resize' },
    { position: 'top-right', x: x + w - hs, y: y - hs, cursor: 'nesw-resize' },
    { position: 'right', x: x + w - hs, y: y + h / 2 - hs, cursor: 'ew-resize' },
    { position: 'bottom-right', x: x + w - hs, y: y + h - hs, cursor: 'nwse-resize' },
    { position: 'bottom', x: x + w / 2 - hs, y: y + h - hs, cursor: 'ns-resize' },
    { position: 'bottom-left', x: x - hs, y: y + h - hs, cursor: 'nesw-resize' },
    { position: 'left', x: x - hs, y: y + h / 2 - hs, cursor: 'ew-resize' },
  ]
}

export function getHandleAtPoint(
  point: Point,
  bbox: Rect,
  zoom: number,
  handleSize: number = DEFAULTS.HANDLE_SIZE
): HandlePosition | null {
  const scaledSize = handleSize / zoom
  const handles = getBboxHandles(bbox, scaledSize)
  for (const handle of handles) {
    if (
      point.x >= handle.x &&
      point.x <= handle.x + scaledSize &&
      point.y >= handle.y &&
      point.y <= handle.y + scaledSize
    ) {
      return handle.position
    }
  }
  return null
}

export function resizeBboxByHandle(
  bbox: Rect,
  handle: HandlePosition,
  delta: Point,
  imageSize: Size
): Rect {
  let { x, y, width, height } = bbox

  switch (handle) {
    case 'top-left':
      x += delta.x; y += delta.y; width -= delta.x; height -= delta.y; break
    case 'top':
      y += delta.y; height -= delta.y; break
    case 'top-right':
      y += delta.y; width += delta.x; height -= delta.y; break
    case 'right':
      width += delta.x; break
    case 'bottom-right':
      width += delta.x; height += delta.y; break
    case 'bottom':
      height += delta.y; break
    case 'bottom-left':
      x += delta.x; width -= delta.x; height += delta.y; break
    case 'left':
      x += delta.x; width -= delta.x; break
  }

  // Flip agar width/height manfiy bo'lsa
  if (width < 0) { x += width; width = Math.abs(width) }
  if (height < 0) { y += height; height = Math.abs(height) }

  // Clamp to image
  x = Math.max(0, x)
  y = Math.max(0, y)
  width = Math.min(width, imageSize.width - x)
  height = Math.min(height, imageSize.height - y)

  return { x, y, width, height }
}

// ─── Hit Detection ──────────────────────────────────────

export function getTopAnnotationAtPoint(
  point: Point,
  annotations: BoundingBox[]
): BoundingBox | null {
  // Eng kichik area'li annotationni qaytaramiz (eng aniq target)
  const hits = annotations
    .filter(a => isPointInsideBbox(point, a))
    .sort((a, b) => getBboxArea(a) - getBboxArea(b))
  return hits[0] ?? null
}
