import type {
  Point, Size, Rect, BoundingBox,
  ToolType, InteractionMode, HandlePosition, EngineEvents,
  ViewportState, RenderState,
} from '../types'
import { DEFAULTS } from '../types'
import { EventEmitter } from './EventEmitter'
import {
  canvasToImage, normalizeBbox, isBboxValid,
  isPointInsideBbox, getHandleAtPoint, resizeBboxByHandle,
  clampBboxToImage, clampPointToImage, getTopAnnotationAtPoint,
} from '../geometry'

// ─── Random Color Generator ─────────────────────────────

const PALETTE = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85929E', '#73C6B6',
]
let colorIndex = 0

function nextColor(): string {
  const color = PALETTE[colorIndex % PALETTE.length]
  colorIndex++
  return color
}

let nextId = 1
function generateId(): string {
  return `bbox_${nextId++}_${Date.now().toString(36)}`
}

export class AnnotationEngine extends EventEmitter<EngineEvents> {
  // ─── State ──────────────────────────────────────
  private _annotations: BoundingBox[] = []
  private _selectedId: string | null = null
  private _hoveredId: string | null = null
  private _activeTool: ToolType | null = null
  private _mode: InteractionMode = 'idle'

  // Color — user o'rnatadi yoki random
  private _color: string | null = null

  // Drawing state
  private _drawStart: Point | null = null
  private _drawCurrent: Point | null = null
  private _drawingPreview: Rect | null = null

  // Dragging state
  private _dragStart: Point | null = null
  private _dragBboxOrigin: Rect | null = null

  // Resizing state
  private _activeHandle: HandlePosition | null = null
  private _resizeStart: Point | null = null

  // Viewport
  private _zoom = 1
  private _offset: Point = { x: 0, y: 0 }
  private _imageSize: Size = { width: 0, height: 0 }
  private _canvasSize: Size = { width: 0, height: 0 }
  private _image: HTMLImageElement | null = null

  // Panning
  private _isPanning = false
  private _panStart: Point | null = null
  private _panOffsetStart: Point | null = null

  // ─── Getters ────────────────────────────────────

  get annotations(): BoundingBox[] { return this._annotations }
  get selectedId(): string | null { return this._selectedId }
  get hoveredId(): string | null { return this._hoveredId }
  get activeTool(): ToolType | null { return this._activeTool }
  get mode(): InteractionMode { return this._mode }
  get zoom(): number { return this._zoom }
  get offset(): Point { return this._offset }
  get imageSize(): Size { return this._imageSize }
  get canvasSize(): Size { return this._canvasSize }
  get image(): HTMLImageElement | null { return this._image }
  get drawingPreview(): Rect | null { return this._drawingPreview }
  get activeHandle(): HandlePosition | null { return this._activeHandle }
  get isPanning(): boolean { return this._isPanning }

  /** Hozirgi color — user bergan yoki keyingi random */
  get color(): string { return this._color ?? PALETTE[colorIndex % PALETTE.length] }

  get selectedAnnotation(): BoundingBox | null {
    return this._annotations.find(a => a.id === this._selectedId) ?? null
  }

  get viewport(): ViewportState {
    return {
      zoom: this._zoom,
      offset: this._offset,
      imageSize: this._imageSize,
      canvasSize: this._canvasSize,
    }
  }

  get renderState(): RenderState {
    return {
      image: this._image,
      annotations: this._annotations,
      selectedId: this._selectedId,
      hoveredId: this._hoveredId,
      activeHandlePosition: this._activeHandle,
      drawingPreview: this._drawingPreview,
      drawingColor: this.color,
      viewport: this.viewport,
    }
  }

  // ─── Configuration ──────────────────────────────

  setImage(image: HTMLImageElement): void {
    this._image = image
    this._imageSize = { width: image.naturalWidth, height: image.naturalHeight }
    this.fitImageToCanvas()
  }

  setCanvasSize(size: Size): void {
    this._canvasSize = size
    if (this._image) this.fitImageToCanvas()
  }

  /** User color o'rnatadi — null bo'lsa har safar random */
  setColor(color: string | null): void {
    this._color = color
  }

  setAnnotations(annotations: BoundingBox[]): void {
    this._annotations = [...annotations]
    this.emit('annotations:change', this._annotations)
  }

  // ─── Tool Management ────────────────────────────

  setActiveTool(tool: ToolType | null): void {
    if (this._mode === 'drawing') this.cancelDrawing()
    this._activeTool = tool
    this._selectedId = null
    this._hoveredId = null
    this._mode = 'idle'
    this.emit('tool:change', tool)
    this.emit('annotation:select', null)
    this.emit('mode:change', 'idle')
  }

  // ─── Viewport (zoom/pan) ────────────────────────

  private fitImageToCanvas(): void {
    const { width: cw, height: ch } = this._canvasSize
    const { width: iw, height: ih } = this._imageSize
    if (!cw || !ch || !iw || !ih) return

    const scale = Math.min(cw / iw, ch / ih)
    this._zoom = scale
    this._offset = {
      x: (cw - iw * scale) / 2,
      y: (ch - ih * scale) / 2,
    }
    this.emitViewportChange()
  }

  setZoom(zoom: number, focalPoint?: Point): void {
    const clamped = Math.max(DEFAULTS.ZOOM_MIN, Math.min(DEFAULTS.ZOOM_MAX, zoom))
    if (focalPoint) {
      const imgPoint = this.canvasToImage(focalPoint)
      this._zoom = clamped
      this._offset = {
        x: focalPoint.x - imgPoint.x * clamped,
        y: focalPoint.y - imgPoint.y * clamped,
      }
    } else {
      const center = { x: this._canvasSize.width / 2, y: this._canvasSize.height / 2 }
      const imgPoint = this.canvasToImage(center)
      this._zoom = clamped
      this._offset = {
        x: center.x - imgPoint.x * clamped,
        y: center.y - imgPoint.y * clamped,
      }
    }
    this.emitViewportChange()
  }

  zoomIn(focalPoint?: Point): void {
    this.setZoom(this._zoom * DEFAULTS.ZOOM_STEP, focalPoint)
  }

  zoomOut(focalPoint?: Point): void {
    this.setZoom(this._zoom / DEFAULTS.ZOOM_STEP, focalPoint)
  }

  resetZoom(): void {
    this.fitImageToCanvas()
  }

  private emitViewportChange(): void {
    this.emit('viewport:change', this.viewport)
  }

  // ─── Coordinate Helpers ─────────────────────────

  canvasToImage(canvasPoint: Point): Point {
    return canvasToImage(canvasPoint, this._zoom, this._offset)
  }

  // ─── Pointer Events (framework adapters call these) ───

  onPointerDown(canvasPoint: Point, button: number = 0): void {
    if (button === 1 || button === 2) {
      this._isPanning = true
      this._panStart = canvasPoint
      this._panOffsetStart = { ...this._offset }
      return
    }

    const imagePoint = this.canvasToImage(canvasPoint)

    if (this._activeTool === 'bbox') {
      this.handleBboxPointerDown(imagePoint)
    } else if (this._activeTool === null) {
      this.handleSelectPointerDown(imagePoint, canvasPoint)
    }
  }

  onPointerMove(canvasPoint: Point): void {
    if (this._isPanning && this._panStart && this._panOffsetStart) {
      this._offset = {
        x: this._panOffsetStart.x + (canvasPoint.x - this._panStart.x),
        y: this._panOffsetStart.y + (canvasPoint.y - this._panStart.y),
      }
      this.emitViewportChange()
      return
    }

    const imagePoint = this.canvasToImage(canvasPoint)

    if (this._mode === 'drawing') {
      this.handleBboxDrawingMove(imagePoint)
    } else if (this._mode === 'dragging') {
      this.handleDraggingMove(imagePoint)
    } else if (this._mode === 'resizing') {
      this.handleResizingMove(imagePoint)
    } else {
      this.handleHoverMove(imagePoint)
    }
  }

  onPointerUp(_canvasPoint: Point): void {
    if (this._isPanning) {
      this._isPanning = false
      this._panStart = null
      this._panOffsetStart = null
      return
    }

    if (this._mode === 'drawing') {
      this.finishDrawing()
    } else if (this._mode === 'dragging') {
      this.finishDragging()
    } else if (this._mode === 'resizing') {
      this.finishResizing()
    }
  }

  onWheel(canvasPoint: Point, deltaY: number): void {
    if (deltaY < 0) {
      this.zoomIn(canvasPoint)
    } else {
      this.zoomOut(canvasPoint)
    }
  }

  onKeyDown(key: string): void {
    if (key === 'Escape') {
      if (this._mode === 'drawing') this.cancelDrawing()
      else if (this._selectedId) this.deselect()
    }
    if (key === 'Delete' || key === 'Backspace') {
      if (this._selectedId) this.deleteAnnotation(this._selectedId)
    }
  }

  // ─── BBox Drawing ──────────────────────────────

  private handleBboxPointerDown(imagePoint: Point): void {
    const clamped = clampPointToImage(imagePoint, this._imageSize)
    this._drawStart = clamped
    this._drawCurrent = clamped
    this._drawingPreview = { x: clamped.x, y: clamped.y, width: 0, height: 0 }
    this._mode = 'drawing'
    this.emit('mode:change', 'drawing')
    this.emit('drawing:start', clamped)
  }

  private handleBboxDrawingMove(imagePoint: Point): void {
    if (!this._drawStart) return
    const clamped = clampPointToImage(imagePoint, this._imageSize)
    this._drawCurrent = clamped
    this._drawingPreview = normalizeBbox(this._drawStart, clamped)
    this.emit('drawing:update', this._drawingPreview)
  }

  private finishDrawing(): void {
    if (!this._drawStart || !this._drawCurrent) {
      this.cancelDrawing()
      return
    }

    const rect = normalizeBbox(this._drawStart, this._drawCurrent)

    if (!isBboxValid(rect)) {
      this.cancelDrawing()
      return
    }

    // Color: user bergan bo'lsa shu, aks holda random
    const drawColor = this._color ?? nextColor()

    const bbox: BoundingBox = {
      id: generateId(),
      ...rect,
      rotation: 0,
      color: drawColor,
    }

    this._annotations.push(bbox)
    this._drawStart = null
    this._drawCurrent = null
    this._drawingPreview = null
    this._mode = 'idle'
    this._selectedId = bbox.id

    this.emit('drawing:end', bbox)
    this.emit('annotation:create', bbox)
    this.emit('annotation:select', bbox.id)
    this.emit('annotations:change', this._annotations)
    this.emit('mode:change', 'idle')
  }

  cancelDrawing(): void {
    this._drawStart = null
    this._drawCurrent = null
    this._drawingPreview = null
    this._mode = 'idle'
    this.emit('drawing:cancel', undefined)
    this.emit('mode:change', 'idle')
  }

  // ─── Selection & Editing ────────────────────────

  private handleSelectPointerDown(imagePoint: Point, _canvasPoint: Point): void {
    if (this._selectedId) {
      const selected = this.selectedAnnotation
      if (selected) {
        const handle = getHandleAtPoint(imagePoint, selected, this._zoom)
        if (handle) {
          this._activeHandle = handle
          this._resizeStart = imagePoint
          this._mode = 'resizing'
          this.emit('mode:change', 'resizing')
          return
        }
      }
    }

    const hit = getTopAnnotationAtPoint(imagePoint, this._annotations)
    if (hit) {
      this.select(hit.id)
      this._dragStart = imagePoint
      this._dragBboxOrigin = { x: hit.x, y: hit.y, width: hit.width, height: hit.height }
      this._mode = 'dragging'
      this.emit('mode:change', 'dragging')
      return
    }

    this.deselect()
  }

  private handleDraggingMove(imagePoint: Point): void {
    if (!this._selectedId || !this._dragStart || !this._dragBboxOrigin) return

    const dx = imagePoint.x - this._dragStart.x
    const dy = imagePoint.y - this._dragStart.y

    const newRect: Rect = {
      x: this._dragBboxOrigin.x + dx,
      y: this._dragBboxOrigin.y + dy,
      width: this._dragBboxOrigin.width,
      height: this._dragBboxOrigin.height,
    }
    const clamped = clampBboxToImage(newRect, this._imageSize)
    this.updateAnnotationRect(this._selectedId, clamped)
  }

  private finishDragging(): void {
    if (this._selectedId) {
      const ann = this.selectedAnnotation
      if (ann) this.emit('annotation:update', ann)
    }
    this._dragStart = null
    this._dragBboxOrigin = null
    this._mode = this._selectedId ? 'selecting' : 'idle'
    this.emit('mode:change', this._mode)
  }

  private handleResizingMove(imagePoint: Point): void {
    if (!this._selectedId || !this._activeHandle || !this._resizeStart) return

    const selected = this.selectedAnnotation
    if (!selected) return

    const delta: Point = {
      x: imagePoint.x - this._resizeStart.x,
      y: imagePoint.y - this._resizeStart.y,
    }

    const newRect = resizeBboxByHandle(selected, this._activeHandle, delta, this._imageSize)
    this._resizeStart = imagePoint
    this.updateAnnotationRect(this._selectedId, newRect)
  }

  private finishResizing(): void {
    if (this._selectedId) {
      const ann = this.selectedAnnotation
      if (ann) this.emit('annotation:update', ann)
    }
    this._activeHandle = null
    this._resizeStart = null
    this._mode = this._selectedId ? 'selecting' : 'idle'
    this.emit('mode:change', this._mode)
  }

  private handleHoverMove(imagePoint: Point): void {
    const hit = getTopAnnotationAtPoint(imagePoint, this._annotations)
    const newHoveredId = hit?.id ?? null
    if (newHoveredId !== this._hoveredId) {
      this._hoveredId = newHoveredId
    }
  }

  // ─── CRUD Operations ───────────────────────────

  select(id: string): void {
    this._selectedId = id
    this._mode = 'selecting'
    this.emit('annotation:select', id)
    this.emit('mode:change', 'selecting')
  }

  deselect(): void {
    this._selectedId = null
    this._mode = 'idle'
    this.emit('annotation:select', null)
    this.emit('mode:change', 'idle')
  }

  addAnnotation(bbox: Omit<BoundingBox, 'id'>): BoundingBox {
    const annotation: BoundingBox = { ...bbox, id: generateId() }
    this._annotations.push(annotation)
    this.emit('annotation:create', annotation)
    this.emit('annotations:change', this._annotations)
    return annotation
  }

  updateAnnotation(id: string, updates: Partial<BoundingBox>): void {
    const idx = this._annotations.findIndex(a => a.id === id)
    if (idx === -1) return
    this._annotations[idx] = { ...this._annotations[idx], ...updates }
    this.emit('annotation:update', this._annotations[idx])
    this.emit('annotations:change', this._annotations)
  }

  private updateAnnotationRect(id: string, rect: Rect): void {
    const idx = this._annotations.findIndex(a => a.id === id)
    if (idx === -1) return
    this._annotations[idx] = { ...this._annotations[idx], ...rect }
  }

  deleteAnnotation(id: string): void {
    this._annotations = this._annotations.filter(a => a.id !== id)
    if (this._selectedId === id) {
      this._selectedId = null
      this.emit('annotation:select', null)
    }
    this.emit('annotation:delete', id)
    this.emit('annotations:change', this._annotations)
    this._mode = 'idle'
    this.emit('mode:change', 'idle')
  }

  clearAnnotations(): void {
    this._annotations = []
    this._selectedId = null
    this._hoveredId = null
    this.emit('annotations:change', [])
    this.emit('annotation:select', null)
  }

  // ─── Cleanup ────────────────────────────────────

  destroy(): void {
    this.cancelDrawing()
    this.removeAllListeners()
  }
}
