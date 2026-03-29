import type { RenderState, BoundingBox, Polygon, Annotation, Rect, Point, HandlePosition } from '../types'
import { DEFAULTS } from '../types'
import { imageToCanvas, rectImageToCanvas, getBboxHandles } from '../geometry'

export class Canvas2DRenderer {
  private ctx: CanvasRenderingContext2D
  private canvas: HTMLCanvasElement
  private _dpr: number

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get 2D context')
    this.ctx = ctx
    this._dpr = window.devicePixelRatio || 1
  }

  get dpr(): number { return this._dpr }

  resize(width: number, height: number): void {
    this._dpr = window.devicePixelRatio || 1
    this.canvas.width = width * this._dpr
    this.canvas.height = height * this._dpr
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    this.ctx.setTransform(this._dpr, 0, 0, this._dpr, 0, 0)
  }

  render(state: RenderState): void {
    const { ctx } = this
    const { zoom, offset } = state.viewport

    ctx.save()
    ctx.setTransform(this._dpr, 0, 0, this._dpr, 0, 0)
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw image
    if (state.image) {
      const { width: iw, height: ih } = state.viewport.imageSize
      ctx.drawImage(state.image, offset.x, offset.y, iw * zoom, ih * zoom)
    }

    // Draw annotations
    for (const ann of state.annotations) {
      const isSelected = ann.id === state.selectedId
      const isHovered = ann.id === state.hoveredId

      if (ann.type === 'bbox') {
        this.drawBbox(ann, zoom, offset, isSelected, isHovered)
      } else if (ann.type === 'polygon') {
        this.drawPolygon(ann, zoom, offset, isSelected, isHovered)
      }
    }

    // BBox handles
    if (state.selectedId) {
      const selected = state.annotations.find(a => a.id === state.selectedId)
      if (selected?.type === 'bbox') {
        this.drawHandles(selected as BoundingBox, zoom, offset, state.activeHandlePosition)
      }
    }

    // BBox preview
    if (state.drawingPreview && state.activeTool === 'bbox') {
      this.drawBboxPreview(state.drawingPreview, zoom, offset, state.drawingColor)
    }

    // Polygon drawing preview
    if (state.polygonDrawingPoints.length > 0 && state.activeTool === 'polygon') {
      this.drawPolygonPreview(
        state.polygonDrawingPoints,
        state.polygonMousePosition,
        zoom, offset, state.drawingColor
      )
    }

    ctx.restore()
  }

  // ─── BBox Rendering ─────────────────────────────

  private drawBbox(
    bbox: BoundingBox, zoom: number, offset: Point,
    isSelected: boolean, isHovered: boolean,
  ): void {
    const ctx = this.ctx
    const rect = rectImageToCanvas(bbox, zoom, offset)
    const sw = Math.max(1, DEFAULTS.STROKE_WIDTH / Math.sqrt(zoom))

    if (isSelected || isHovered) {
      ctx.fillStyle = bbox.color + (isSelected ? '33' : '1A')
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
    }

    ctx.strokeStyle = bbox.color
    ctx.lineWidth = isSelected ? sw * 1.5 : sw
    ctx.setLineDash([])
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)

    if (bbox.label) this.drawLabel(bbox.label, rect.x, rect.y, bbox.color, zoom)
  }

  private drawHandles(
    bbox: BoundingBox, zoom: number, offset: Point, activeHandle: HandlePosition | null,
  ): void {
    const ctx = this.ctx
    const canvasRect = rectImageToCanvas(bbox, zoom, offset)
    const hs = DEFAULTS.HANDLE_SIZE
    const handles = getBboxHandles(canvasRect, hs)

    for (const h of handles) {
      ctx.fillStyle = h.position === activeHandle ? bbox.color : '#ffffff'
      ctx.strokeStyle = bbox.color
      ctx.lineWidth = 1.5
      ctx.fillRect(h.x, h.y, hs, hs)
      ctx.strokeRect(h.x, h.y, hs, hs)
    }
  }

  private drawBboxPreview(rect: Rect, zoom: number, offset: Point, color: string): void {
    const ctx = this.ctx
    const cr = rectImageToCanvas(rect, zoom, offset)
    ctx.strokeStyle = color
    ctx.lineWidth = Math.max(1, DEFAULTS.STROKE_WIDTH / Math.sqrt(zoom))
    ctx.setLineDash([6, 4])
    ctx.strokeRect(cr.x, cr.y, cr.width, cr.height)
    ctx.setLineDash([])
    ctx.fillStyle = color + '1A'
    ctx.fillRect(cr.x, cr.y, cr.width, cr.height)
  }

  // ─── Polygon Rendering ──────────────────────────

  private drawPolygon(
    polygon: Polygon, zoom: number, offset: Point,
    isSelected: boolean, isHovered: boolean,
  ): void {
    const ctx = this.ctx
    const pts = polygon.points
    if (pts.length < 2) return

    const canvasPts = pts.map(p => imageToCanvas(p, zoom, offset))
    const sw = Math.max(1, DEFAULTS.STROKE_WIDTH / Math.sqrt(zoom))

    // Path
    ctx.beginPath()
    ctx.moveTo(canvasPts[0].x, canvasPts[0].y)
    for (let i = 1; i < canvasPts.length; i++) {
      ctx.lineTo(canvasPts[i].x, canvasPts[i].y)
    }
    ctx.closePath()

    // Fill
    if (isSelected || isHovered) {
      ctx.fillStyle = polygon.color + (isSelected ? '33' : '1A')
      ctx.fill()
    }

    // Stroke
    ctx.strokeStyle = polygon.color
    ctx.lineWidth = isSelected ? sw * 1.5 : sw
    ctx.setLineDash([])
    ctx.stroke()

    // Label
    if (polygon.label) {
      const bounds = this.getPolygonTopLeft(canvasPts)
      this.drawLabel(polygon.label, bounds.x, bounds.y, polygon.color, zoom)
    }

    // Vertices (only when selected)
    if (isSelected) {
      this.drawVertices(canvasPts, polygon.color, zoom)
    }
  }

  private drawVertices(canvasPts: Point[], color: string, zoom: number): void {
    const ctx = this.ctx
    const vs = DEFAULTS.VERTEX_SIZE
    const half = vs / 2

    for (const p of canvasPts) {
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.fillRect(p.x - half, p.y - half, vs, vs)
      ctx.strokeRect(p.x - half, p.y - half, vs, vs)
    }
  }

  private drawPolygonPreview(
    points: Point[], mousePos: Point | null,
    zoom: number, offset: Point, color: string,
  ): void {
    const ctx = this.ctx
    const canvasPts = points.map(p => imageToCanvas(p, zoom, offset))
    const sw = Math.max(1, DEFAULTS.STROKE_WIDTH / Math.sqrt(zoom))

    if (canvasPts.length === 0) return

    // Draw filled polygon preview (if 3+ points)
    if (canvasPts.length >= 3) {
      ctx.beginPath()
      ctx.moveTo(canvasPts[0].x, canvasPts[0].y)
      for (let i = 1; i < canvasPts.length; i++) ctx.lineTo(canvasPts[i].x, canvasPts[i].y)
      ctx.closePath()
      ctx.fillStyle = color + '1A'
      ctx.fill()
    }

    // Lines between placed points
    ctx.beginPath()
    ctx.moveTo(canvasPts[0].x, canvasPts[0].y)
    for (let i = 1; i < canvasPts.length; i++) ctx.lineTo(canvasPts[i].x, canvasPts[i].y)

    // Line to mouse position
    if (mousePos) {
      const mp = imageToCanvas(mousePos, zoom, offset)
      ctx.lineTo(mp.x, mp.y)
    }

    ctx.strokeStyle = color
    ctx.lineWidth = sw
    ctx.setLineDash([6, 4])
    ctx.stroke()
    ctx.setLineDash([])

    // Close indicator — dashed line from mouse to first point
    if (mousePos && canvasPts.length >= 2) {
      const mp = imageToCanvas(mousePos, zoom, offset)
      ctx.beginPath()
      ctx.moveTo(mp.x, mp.y)
      ctx.lineTo(canvasPts[0].x, canvasPts[0].y)
      ctx.strokeStyle = color + '80'
      ctx.lineWidth = sw * 0.5
      ctx.setLineDash([4, 4])
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Draw vertices
    const vs = DEFAULTS.VERTEX_SIZE
    const half = vs / 2
    for (let i = 0; i < canvasPts.length; i++) {
      const p = canvasPts[i]
      // First vertex — highlight (close target)
      if (i === 0 && canvasPts.length >= DEFAULTS.MIN_POLYGON_POINTS) {
        ctx.fillStyle = color
        ctx.strokeStyle = '#ffffff'
      } else {
        ctx.fillStyle = '#ffffff'
        ctx.strokeStyle = color
      }
      ctx.lineWidth = 2
      ctx.fillRect(p.x - half, p.y - half, vs, vs)
      ctx.strokeRect(p.x - half, p.y - half, vs, vs)
    }
  }

  // ─── Shared Helpers ─────────────────────────────

  private drawLabel(text: string, x: number, y: number, color: string, zoom: number): void {
    const ctx = this.ctx
    const fontSize = Math.max(10, DEFAULTS.LABEL_FONT_SIZE / Math.sqrt(zoom))
    const padding = DEFAULTS.LABEL_PADDING

    ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`
    const tw = ctx.measureText(text).width

    const bgX = x, bgY = y - fontSize - padding * 2
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.roundRect(bgX, bgY, tw + padding * 2, fontSize + padding * 2, 3)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.textBaseline = 'top'
    ctx.fillText(text, bgX + padding, bgY + padding)
  }

  private getPolygonTopLeft(canvasPts: Point[]): Point {
    let minX = Infinity, minY = Infinity
    for (const p of canvasPts) {
      if (p.x < minX) minX = p.x
      if (p.y < minY) minY = p.y
    }
    return { x: minX, y: minY }
  }

  destroy(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}
