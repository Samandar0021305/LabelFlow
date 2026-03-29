import type { RenderState, BoundingBox, Rect, HandlePosition } from '../types'
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

  /** Call this when canvas size changes */
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

    // Clear
    ctx.save()
    ctx.setTransform(this._dpr, 0, 0, this._dpr, 0, 0)
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw image
    if (state.image) {
      const { width: iw, height: ih } = state.viewport.imageSize
      ctx.drawImage(state.image, offset.x, offset.y, iw * zoom, ih * zoom)
    }

    // Draw annotations
    for (const bbox of state.annotations) {
      const isSelected = bbox.id === state.selectedId
      const isHovered = bbox.id === state.hoveredId
      this.drawBbox(bbox, zoom, offset, isSelected, isHovered)
    }

    // Draw resize handles for selected annotation
    if (state.selectedId) {
      const selected = state.annotations.find(a => a.id === state.selectedId)
      if (selected) {
        this.drawHandles(selected, zoom, offset, state.activeHandlePosition)
      }
    }

    // Draw preview
    if (state.drawingPreview) {
      this.drawPreview(state.drawingPreview, zoom, offset)
    }

    ctx.restore()
  }

  private drawBbox(
    bbox: BoundingBox,
    zoom: number,
    offset: { x: number; y: number },
    isSelected: boolean,
    isHovered: boolean,
  ): void {
    const ctx = this.ctx
    const rect = rectImageToCanvas(bbox, zoom, offset)
    const strokeWidth = Math.max(1, DEFAULTS.STROKE_WIDTH / Math.sqrt(zoom))

    // Fill
    if (isSelected || isHovered) {
      ctx.fillStyle = bbox.color + (isSelected ? '33' : '1A')
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
    }

    // Stroke
    ctx.strokeStyle = bbox.color
    ctx.lineWidth = isSelected ? strokeWidth * 1.5 : strokeWidth
    if (isSelected) ctx.setLineDash([])
    else ctx.setLineDash([])
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)

    // Label
    if (bbox.label) {
      this.drawLabel(bbox.label, rect.x, rect.y, bbox.color, zoom)
    }
  }

  private drawLabel(
    text: string,
    x: number,
    y: number,
    color: string,
    zoom: number,
  ): void {
    const ctx = this.ctx
    const fontSize = Math.max(10, DEFAULTS.LABEL_FONT_SIZE / Math.sqrt(zoom))
    const padding = DEFAULTS.LABEL_PADDING

    ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`
    const metrics = ctx.measureText(text)
    const textWidth = metrics.width
    const textHeight = fontSize

    const bgX = x
    const bgY = y - textHeight - padding * 2
    const bgW = textWidth + padding * 2
    const bgH = textHeight + padding * 2

    // Background
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.roundRect(bgX, bgY, bgW, bgH, 3)
    ctx.fill()

    // Text
    ctx.fillStyle = '#ffffff'
    ctx.textBaseline = 'top'
    ctx.fillText(text, bgX + padding, bgY + padding)
  }

  private drawHandles(
    bbox: BoundingBox,
    zoom: number,
    offset: { x: number; y: number },
    activeHandle: HandlePosition | null,
  ): void {
    const ctx = this.ctx
    const canvasRect = rectImageToCanvas(bbox, zoom, offset)
    const handleSize = DEFAULTS.HANDLE_SIZE
    const handles = getBboxHandles(canvasRect, handleSize)

    for (const handle of handles) {
      const isActive = handle.position === activeHandle

      ctx.fillStyle = isActive ? bbox.color : '#ffffff'
      ctx.strokeStyle = bbox.color
      ctx.lineWidth = 1.5
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize)
      ctx.strokeRect(handle.x, handle.y, handleSize, handleSize)
    }
  }

  private drawPreview(rect: Rect, zoom: number, offset: { x: number; y: number }): void {
    const ctx = this.ctx
    const canvasRect = rectImageToCanvas(rect, zoom, offset)

    ctx.strokeStyle = DEFAULTS.DEFAULT_COLOR
    ctx.lineWidth = Math.max(1, DEFAULTS.STROKE_WIDTH / Math.sqrt(zoom))
    ctx.setLineDash([6, 4])
    ctx.strokeRect(canvasRect.x, canvasRect.y, canvasRect.width, canvasRect.height)
    ctx.setLineDash([])

    // Semi-transparent fill
    ctx.fillStyle = DEFAULTS.DEFAULT_COLOR + '1A'
    ctx.fillRect(canvasRect.x, canvasRect.y, canvasRect.width, canvasRect.height)
  }

  destroy(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}
