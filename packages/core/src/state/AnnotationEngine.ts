import type {
  Point, Size, Rect, BoundingBox, Polygon, Annotation,
  ToolType, InteractionMode, HandlePosition, EngineEvents,
  ViewportState, RenderState,
  ExportData, ExportDataPixel, ExportDataNormalized, NormalizedAnnotation,
} from '../types'
import { DEFAULTS } from '../types'
import { EventEmitter } from './EventEmitter'
import {
  canvasToImage, normalizeBbox, isBboxValid,
  getHandleAtPoint, resizeBboxByHandle,
  clampBboxToImage, clampPointToImage, getTopAnnotationAtPoint,
  isNearFirstPoint, getVertexAtPoint, translatePolygonPoints,
  getPolygonBounds,
} from '../geometry'

// ─── Helpers ────────────────────────────────────────────

const PALETTE = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85929E', '#73C6B6',
]
let colorIndex = 0
function nextColor(): string {
  return PALETTE[colorIndex++ % PALETTE.length]
}

let nextId = 1
function generateId(prefix: string = 'ann'): string {
  return `${prefix}_${nextId++}_${Date.now().toString(36)}`
}

export class AnnotationEngine extends EventEmitter<EngineEvents> {
  // ─── State ──────────────────────────────────────
  private _annotations: Annotation[] = []
  private _selectedId: string | null = null
  private _hoveredId: string | null = null
  private _activeTool: ToolType | null = null
  private _mode: InteractionMode = 'idle'
  private _color: string | null = null

  // BBox drawing
  private _bboxDrawStart: Point | null = null
  private _bboxDrawCurrent: Point | null = null
  private _drawingPreview: Rect | null = null

  // Polygon drawing
  private _polygonPoints: Point[] = []
  private _polygonMousePos: Point | null = null

  // Dragging (both bbox and polygon)
  private _dragStart: Point | null = null
  private _dragBboxOrigin: Rect | null = null
  private _dragPolygonOrigin: Point[] | null = null

  // BBox resizing
  private _activeHandle: HandlePosition | null = null
  private _resizeStart: Point | null = null

  // Polygon vertex dragging
  private _draggingVertexIndex: number | null = null
  private _vertexDragStart: Point | null = null

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

  get annotations(): Annotation[] { return this._annotations }
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
  get color(): string { return this._color ?? PALETTE[colorIndex % PALETTE.length] }

  get selectedAnnotation(): Annotation | null {
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
      polygonDrawingPoints: this._polygonPoints,
      polygonMousePosition: this._polygonMousePos,
      draggingVertexIndex: this._draggingVertexIndex,
      drawingColor: this.color,
      activeTool: this._activeTool,
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

  setColor(color: string | null): void {
    this._color = color
  }

  setAnnotations(annotations: Annotation[]): void {
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

  // ─── Viewport ───────────────────────────────────

  private fitImageToCanvas(): void {
    const { width: cw, height: ch } = this._canvasSize
    const { width: iw, height: ih } = this._imageSize
    if (!cw || !ch || !iw || !ih) return
    const scale = Math.min(cw / iw, ch / ih)
    this._zoom = scale
    this._offset = { x: (cw - iw * scale) / 2, y: (ch - ih * scale) / 2 }
    this.emitViewportChange()
  }

  setZoom(zoom: number, focalPoint?: Point): void {
    const clamped = Math.max(DEFAULTS.ZOOM_MIN, Math.min(DEFAULTS.ZOOM_MAX, zoom))
    const focal = focalPoint ?? { x: this._canvasSize.width / 2, y: this._canvasSize.height / 2 }
    const imgPoint = this.canvasToImage(focal)
    this._zoom = clamped
    this._offset = { x: focal.x - imgPoint.x * clamped, y: focal.y - imgPoint.y * clamped }
    this.emitViewportChange()
  }

  zoomIn(fp?: Point): void { this.setZoom(this._zoom * DEFAULTS.ZOOM_STEP, fp) }
  zoomOut(fp?: Point): void { this.setZoom(this._zoom / DEFAULTS.ZOOM_STEP, fp) }
  resetZoom(): void { this.fitImageToCanvas() }
  private emitViewportChange(): void { this.emit('viewport:change', this.viewport) }

  canvasToImage(canvasPoint: Point): Point {
    return canvasToImage(canvasPoint, this._zoom, this._offset)
  }

  // ─── Pointer Events ─────────────────────────────

  onPointerDown(canvasPoint: Point, button: number = 0): void {
    // Pan
    if (button === 1 || button === 2) {
      this._isPanning = true
      this._panStart = canvasPoint
      this._panOffsetStart = { ...this._offset }
      return
    }

    const imagePoint = this.canvasToImage(canvasPoint)

    if (this._activeTool === 'bbox') {
      this.handleBboxPointerDown(imagePoint)
    } else if (this._activeTool === 'polygon') {
      this.handlePolygonClick(imagePoint)
    } else if (this._activeTool === null) {
      this.handleSelectPointerDown(imagePoint)
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

    if (this._activeTool === 'bbox' && this._mode === 'drawing') {
      this.handleBboxDrawingMove(imagePoint)
    } else if (this._activeTool === 'polygon' && this._mode === 'drawing') {
      this._polygonMousePos = clampPointToImage(imagePoint, this._imageSize)
      this.emit('drawing:update', this._polygonPoints)
    } else if (this._mode === 'dragging') {
      this.handleDraggingMove(imagePoint)
    } else if (this._mode === 'resizing') {
      this.handleResizingMove(imagePoint)
    } else if (this._mode === 'dragging-vertex') {
      this.handleVertexDraggingMove(imagePoint)
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

    // BBox drawing finishes on pointer up
    if (this._activeTool === 'bbox' && this._mode === 'drawing') {
      this.finishBboxDrawing()
    } else if (this._mode === 'dragging') {
      this.finishDragging()
    } else if (this._mode === 'resizing') {
      this.finishResizing()
    } else if (this._mode === 'dragging-vertex') {
      this.finishVertexDragging()
    }
    // Polygon drawing does NOT finish on pointer up — it finishes on close/dblclick
  }

  onDoubleClick(canvasPoint: Point): void {
    // Double click finishes polygon
    if (this._activeTool === 'polygon' && this._mode === 'drawing') {
      this.finishPolygonDrawing()
    }
  }

  onWheel(canvasPoint: Point, deltaY: number): void {
    if (deltaY < 0) this.zoomIn(canvasPoint)
    else this.zoomOut(canvasPoint)
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
    this._bboxDrawStart = clamped
    this._bboxDrawCurrent = clamped
    this._drawingPreview = { x: clamped.x, y: clamped.y, width: 0, height: 0 }
    this._mode = 'drawing'
    this.emit('mode:change', 'drawing')
    this.emit('drawing:start', clamped)
  }

  private handleBboxDrawingMove(imagePoint: Point): void {
    if (!this._bboxDrawStart) return
    const clamped = clampPointToImage(imagePoint, this._imageSize)
    this._bboxDrawCurrent = clamped
    this._drawingPreview = normalizeBbox(this._bboxDrawStart, clamped)
    this.emit('drawing:update', [this._bboxDrawStart, clamped])
  }

  private finishBboxDrawing(): void {
    if (!this._bboxDrawStart || !this._bboxDrawCurrent) {
      this.cancelDrawing(); return
    }
    const rect = normalizeBbox(this._bboxDrawStart, this._bboxDrawCurrent)
    if (!isBboxValid(rect)) { this.cancelDrawing(); return }

    const bbox: BoundingBox = {
      id: generateId('bbox'), type: 'bbox', ...rect,
      rotation: 0, color: this._color ?? nextColor(),
    }

    this._annotations.push(bbox)
    this._bboxDrawStart = null
    this._bboxDrawCurrent = null
    this._drawingPreview = null
    this._selectedId = bbox.id
    this._mode = 'idle'

    this.emit('drawing:end', bbox)
    this.emit('annotation:create', bbox)
    this.emit('annotation:select', bbox.id)
    this.emit('annotations:change', this._annotations)
    this.emit('mode:change', 'idle')
  }

  // ─── Polygon Drawing ───────────────────────────

  private handlePolygonClick(imagePoint: Point): void {
    const clamped = clampPointToImage(imagePoint, this._imageSize)

    if (this._mode !== 'drawing') {
      // First click — start polygon
      this._polygonPoints = [clamped]
      this._polygonMousePos = clamped
      this._mode = 'drawing'
      this.emit('mode:change', 'drawing')
      this.emit('drawing:start', clamped)
      return
    }

    // Subsequent clicks — add point or close
    if (this._polygonPoints.length >= DEFAULTS.MIN_POLYGON_POINTS) {
      if (isNearFirstPoint(clamped, this._polygonPoints[0], DEFAULTS.CLOSE_POLYGON_THRESHOLD, this._zoom)) {
        this.finishPolygonDrawing()
        return
      }
    }

    this._polygonPoints.push(clamped)
    this.emit('drawing:update', this._polygonPoints)
  }

  private finishPolygonDrawing(): void {
    if (this._polygonPoints.length < DEFAULTS.MIN_POLYGON_POINTS) {
      this.cancelDrawing(); return
    }

    const polygon: Polygon = {
      id: generateId('poly'),
      type: 'polygon',
      points: [...this._polygonPoints],
      color: this._color ?? nextColor(),
    }

    this._annotations.push(polygon)
    this._polygonPoints = []
    this._polygonMousePos = null
    this._selectedId = polygon.id
    this._mode = 'idle'

    this.emit('drawing:end', polygon)
    this.emit('annotation:create', polygon)
    this.emit('annotation:select', polygon.id)
    this.emit('annotations:change', this._annotations)
    this.emit('mode:change', 'idle')
  }

  // ─── Cancel Drawing (both) ─────────────────────

  cancelDrawing(): void {
    this._bboxDrawStart = null
    this._bboxDrawCurrent = null
    this._drawingPreview = null
    this._polygonPoints = []
    this._polygonMousePos = null
    this._mode = 'idle'
    this.emit('drawing:cancel', undefined)
    this.emit('mode:change', 'idle')
  }

  // ─── Selection & Editing ────────────────────────

  private handleSelectPointerDown(imagePoint: Point): void {
    const selected = this.selectedAnnotation

    // 1. BBox handle resize
    if (selected?.type === 'bbox') {
      const handle = getHandleAtPoint(imagePoint, selected, this._zoom)
      if (handle) {
        this._activeHandle = handle
        this._resizeStart = imagePoint
        this._mode = 'resizing'
        this.emit('mode:change', 'resizing')
        return
      }
    }

    // 2. Polygon vertex drag
    if (selected?.type === 'polygon') {
      const vertexIdx = getVertexAtPoint(imagePoint, selected.points, this._zoom)
      if (vertexIdx !== null) {
        this._draggingVertexIndex = vertexIdx
        this._vertexDragStart = imagePoint
        this._mode = 'dragging-vertex'
        this.emit('mode:change', 'dragging-vertex')
        return
      }
    }

    // 3. Hit test — click on any annotation
    const hit = getTopAnnotationAtPoint(imagePoint, this._annotations)
    if (hit) {
      this.select(hit.id)
      this._dragStart = imagePoint

      if (hit.type === 'bbox') {
        this._dragBboxOrigin = { x: hit.x, y: hit.y, width: hit.width, height: hit.height }
      } else if (hit.type === 'polygon') {
        this._dragPolygonOrigin = hit.points.map(p => ({ ...p }))
      }

      this._mode = 'dragging'
      this.emit('mode:change', 'dragging')
      return
    }

    // 4. Empty area — deselect
    this.deselect()
  }

  // ─── Dragging (universal) ──────────────────────

  private handleDraggingMove(imagePoint: Point): void {
    if (!this._selectedId || !this._dragStart) return
    const dx = imagePoint.x - this._dragStart.x
    const dy = imagePoint.y - this._dragStart.y
    const selected = this.selectedAnnotation

    if (selected?.type === 'bbox' && this._dragBboxOrigin) {
      const newRect: Rect = {
        x: this._dragBboxOrigin.x + dx,
        y: this._dragBboxOrigin.y + dy,
        width: this._dragBboxOrigin.width,
        height: this._dragBboxOrigin.height,
      }
      const clamped = clampBboxToImage(newRect, this._imageSize)
      this.updateAnnotationFields(this._selectedId, clamped)
    } else if (selected?.type === 'polygon' && this._dragPolygonOrigin) {
      const newPoints = translatePolygonPoints(this._dragPolygonOrigin, dx, dy)
      this.updateAnnotationFields(this._selectedId, { points: newPoints })
    }
  }

  private finishDragging(): void {
    if (this._selectedId) {
      const ann = this.selectedAnnotation
      if (ann) this.emit('annotation:update', ann)
    }
    this._dragStart = null
    this._dragBboxOrigin = null
    this._dragPolygonOrigin = null
    this._mode = this._selectedId ? 'selecting' : 'idle'
    this.emit('mode:change', this._mode)
  }

  // ─── BBox Resizing ─────────────────────────────

  private handleResizingMove(imagePoint: Point): void {
    if (!this._selectedId || !this._activeHandle || !this._resizeStart) return
    const selected = this.selectedAnnotation
    if (!selected || selected.type !== 'bbox') return
    const delta: Point = { x: imagePoint.x - this._resizeStart.x, y: imagePoint.y - this._resizeStart.y }
    const newRect = resizeBboxByHandle(selected, this._activeHandle, delta, this._imageSize)
    this._resizeStart = imagePoint
    this.updateAnnotationFields(this._selectedId, newRect)
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

  // ─── Polygon Vertex Dragging ───────────────────

  private handleVertexDraggingMove(imagePoint: Point): void {
    if (this._draggingVertexIndex === null || !this._selectedId) return
    const selected = this.selectedAnnotation
    if (!selected || selected.type !== 'polygon') return

    const clamped = clampPointToImage(imagePoint, this._imageSize)
    const newPoints = [...selected.points]
    newPoints[this._draggingVertexIndex] = clamped
    this.updateAnnotationFields(this._selectedId, { points: newPoints })
  }

  private finishVertexDragging(): void {
    if (this._selectedId) {
      const ann = this.selectedAnnotation
      if (ann) this.emit('annotation:update', ann)
    }
    this._draggingVertexIndex = null
    this._vertexDragStart = null
    this._mode = this._selectedId ? 'selecting' : 'idle'
    this.emit('mode:change', this._mode)
  }

  // ─── Hover ─────────────────────────────────────

  private handleHoverMove(imagePoint: Point): void {
    const hit = getTopAnnotationAtPoint(imagePoint, this._annotations)
    const newId = hit?.id ?? null
    if (newId !== this._hoveredId) this._hoveredId = newId
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

  addAnnotation(ann: Omit<Annotation, 'id'>): Annotation {
    const annotation = { ...ann, id: generateId(ann.type) } as Annotation
    this._annotations.push(annotation)
    this.emit('annotation:create', annotation)
    this.emit('annotations:change', this._annotations)
    return annotation
  }

  updateAnnotation(id: string, updates: Partial<Annotation>): void {
    const idx = this._annotations.findIndex(a => a.id === id)
    if (idx === -1) return
    this._annotations[idx] = { ...this._annotations[idx], ...updates } as Annotation
    this.emit('annotation:update', this._annotations[idx])
    this.emit('annotations:change', this._annotations)
  }

  private updateAnnotationFields(id: string, fields: Record<string, any>): void {
    const idx = this._annotations.findIndex(a => a.id === id)
    if (idx === -1) return
    this._annotations[idx] = { ...this._annotations[idx], ...fields } as Annotation
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

  // ─── Export / Import ────────────────────────────

  exportJSON(format: 'pixel'): ExportDataPixel
  exportJSON(format: 'normalized'): ExportDataNormalized
  exportJSON(format: 'pixel' | 'normalized' = 'pixel'): ExportData {
    const { width: iw, height: ih } = this._imageSize

    if (format === 'normalized') {
      if (!iw || !ih) return { format: 'normalized', annotations: [] }

      const normalized: NormalizedAnnotation[] = this._annotations.map(a => {
        if (a.type === 'bbox') {
          return {
            id: a.id, type: 'bbox',
            x: a.x / iw, y: a.y / ih, width: a.width / iw, height: a.height / ih,
            rotation: a.rotation, label: a.label, color: a.color,
          }
        } else {
          return {
            id: a.id, type: 'polygon',
            points: a.points.map(p => ({ x: p.x / iw, y: p.y / ih })),
            label: a.label, color: a.color,
          }
        }
      })
      return { format: 'normalized', annotations: normalized }
    }

    return {
      format: 'pixel',
      imageWidth: iw, imageHeight: ih,
      annotations: this._annotations.map(a => ({ ...a, ...(a.type === 'polygon' ? { points: a.points.map(p => ({ ...p })) } : {}) })),
    }
  }

  importJSON(data: ExportData): void {
    if (data.format === 'normalized') {
      const { width: iw, height: ih } = this._imageSize
      if (!iw || !ih) { console.warn('Cannot import normalized: no image loaded'); return }

      this._annotations = data.annotations.map(a => {
        if (a.type === 'polygon' && a.points) {
          return { id: a.id, type: 'polygon' as const, points: a.points.map(p => ({ x: p.x * iw, y: p.y * ih })), label: a.label, color: a.color }
        } else {
          return { id: a.id, type: 'bbox' as const, x: (a.x ?? 0) * iw, y: (a.y ?? 0) * ih, width: (a.width ?? 0) * iw, height: (a.height ?? 0) * ih, rotation: a.rotation ?? 0, label: a.label, color: a.color }
        }
      })
    } else {
      this._annotations = data.annotations.map(a => ({ ...a })) as Annotation[]
    }

    this._selectedId = null
    this._hoveredId = null
    this.emit('annotations:change', this._annotations)
    this.emit('annotation:select', null)
  }

  // ─── Cleanup ────────────────────────────────────

  destroy(): void {
    this.cancelDrawing()
    this.removeAllListeners()
  }
}
