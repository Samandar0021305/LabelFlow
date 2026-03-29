import type { Point, Rect, Size, Handle, HandlePosition, BoundingBox, Polygon, Annotation } from '../types'
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

// ─── Polygon Geometry ───────────────────────────────────

/** Ray casting algorithm — point polygon ichidami? */
export function isPointInsidePolygon(point: Point, polygon: Point[]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y
    const xj = polygon[j].x, yj = polygon[j].y
    if (((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }
  return inside
}

/** Polygon area (Shoelace formula) */
export function getPolygonArea(points: Point[]): number {
  let area = 0
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    area += points[j].x * points[i].y - points[i].x * points[j].y
  }
  return Math.abs(area / 2)
}

/** Polygon bounding box */
export function getPolygonBounds(points: Point[]): Rect {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

/** Polygon center (centroid) */
export function getPolygonCenter(points: Point[]): Point {
  let cx = 0, cy = 0
  for (const p of points) { cx += p.x; cy += p.y }
  return { x: cx / points.length, y: cy / points.length }
}

/** Yangi nuqta birinchi nuqtaga yaqinmi? (polygon yopish uchun) */
export function isNearFirstPoint(
  point: Point,
  firstPoint: Point,
  threshold: number = DEFAULTS.CLOSE_POLYGON_THRESHOLD,
  zoom: number = 1
): boolean {
  const scaledThreshold = threshold / zoom
  const dx = point.x - firstPoint.x
  const dy = point.y - firstPoint.y
  return Math.sqrt(dx * dx + dy * dy) < scaledThreshold
}

/** Polygon ning vertex'iga eng yaqin nuqtani top */
export function getVertexAtPoint(
  point: Point,
  vertices: Point[],
  zoom: number,
  vertexSize: number = DEFAULTS.VERTEX_SIZE
): number | null {
  const hitRadius = vertexSize / zoom / 2
  for (let i = 0; i < vertices.length; i++) {
    const dx = point.x - vertices[i].x
    const dy = point.y - vertices[i].y
    if (Math.sqrt(dx * dx + dy * dy) < hitRadius) {
      return i
    }
  }
  return null
}

/** Polygon barcha nuqtalarini delta bilan siljitish */
export function translatePolygonPoints(points: Point[], dx: number, dy: number): Point[] {
  return points.map(p => ({ x: p.x + dx, y: p.y + dy }))
}

/** Polygon nuqtalarini image bounds ichida clamp qilish */
export function clampPolygonToImage(points: Point[], imageSize: Size): Point[] {
  return points.map(p => ({
    x: Math.max(0, Math.min(p.x, imageSize.width)),
    y: Math.max(0, Math.min(p.y, imageSize.height)),
  }))
}

// ─── Universal Hit Detection ────────────────────────────

export function getTopAnnotationAtPoint(
  point: Point,
  annotations: Annotation[]
): Annotation | null {
  // Har bir annotation uchun hit test, eng kichik area birinchi
  const hits: { ann: Annotation; area: number }[] = []

  for (const ann of annotations) {
    if (ann.type === 'bbox') {
      if (isPointInsideBbox(point, ann)) {
        hits.push({ ann, area: getBboxArea(ann) })
      }
    } else if (ann.type === 'polygon') {
      if (isPointInsidePolygon(point, ann.points)) {
        hits.push({ ann, area: getPolygonArea(ann.points) })
      }
    }
  }

  hits.sort((a, b) => a.area - b.area)
  return hits[0]?.ann ?? null
}
