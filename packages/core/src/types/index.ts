// ─── Base Types ─────────────────────────────────────────

export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

// ─── Annotation Types ───────────────────────────────────

export interface BoundingBox {
  id: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  label?: string
  color: string
  classId?: number
  className?: string
}

export interface AnnotationClass {
  id: string
  name: string
  color: string
}

// ─── Tool Types ─────────────────────────────────────────

export type ToolType = 'bbox' | 'polygon' | 'polyline' | 'point' | 'skeleton'

export type InteractionMode = 'idle' | 'drawing' | 'selecting' | 'editing' | 'dragging' | 'resizing'

export interface ToolConfig {
  type: ToolType
  label: string
  cursor: string
}

// ─── Handle (resize anchors) ────────────────────────────

export type HandlePosition =
  | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  | 'top' | 'right' | 'bottom' | 'left'

export interface Handle {
  position: HandlePosition
  x: number
  y: number
  cursor: string
}

// ─── Engine Events ──────────────────────────────────────

export interface EngineEvents {
  'annotation:create': BoundingBox
  'annotation:update': BoundingBox
  'annotation:delete': string
  'annotation:select': string | null
  'annotations:change': BoundingBox[]
  'tool:change': ToolType | null
  'mode:change': InteractionMode
  'drawing:start': Point
  'drawing:update': Rect
  'drawing:end': BoundingBox | null
  'drawing:cancel': void
  'viewport:change': ViewportState
}

export interface ViewportState {
  zoom: number
  offset: Point
  imageSize: Size
  canvasSize: Size
}

// ─── Render State (passed to renderer each frame) ───────

export interface RenderState {
  image: HTMLImageElement | null
  annotations: BoundingBox[]
  selectedId: string | null
  hoveredId: string | null
  activeHandlePosition: HandlePosition | null
  drawingPreview: Rect | null
  viewport: ViewportState
  classes: AnnotationClass[]
}

// ─── Constants ──────────────────────────────────────────

export const DEFAULTS = {
  MIN_BBOX_SIZE: 5,
  STROKE_WIDTH: 2,
  HANDLE_SIZE: 8,
  LABEL_FONT_SIZE: 12,
  LABEL_PADDING: 4,
  SELECTED_FILL_OPACITY: 0.2,
  HOVERED_FILL_OPACITY: 0.1,
  DEFAULT_COLOR: '#00ff00',
  ZOOM_STEP: 1.1,
  ZOOM_MIN: 0.1,
  ZOOM_MAX: 20,
} as const
