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
  type: 'bbox'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  label?: string
  color: string
}

export interface Polygon {
  id: string
  type: 'polygon'
  points: Point[]
  label?: string
  color: string
}

/** Union of all annotation types */
export type Annotation = BoundingBox | Polygon

// ─── Tool Types ─────────────────────────────────────────

export type ToolType = 'bbox' | 'polygon' | 'polyline' | 'point' | 'skeleton'

export type InteractionMode =
  | 'idle'
  | 'drawing'          // bbox: drag; polygon: clicking points
  | 'selecting'        // annotation selected, not moving
  | 'editing'          // polygon: editing vertices
  | 'dragging'         // moving annotation
  | 'resizing'         // bbox: handle resize
  | 'dragging-vertex'  // polygon: dragging a single vertex

export interface ToolConfig {
  type: ToolType
  label: string
  cursor: string
}

// ─── Handle (bbox resize anchors) ───────────────────────

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
  'annotation:create': Annotation
  'annotation:update': Annotation
  'annotation:delete': string
  'annotation:select': string | null
  'annotations:change': Annotation[]
  'tool:change': ToolType | null
  'mode:change': InteractionMode
  'drawing:start': Point
  'drawing:update': Point[]     // polygon: current points; bbox: [topLeft, bottomRight]
  'drawing:end': Annotation | null
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
  annotations: Annotation[]
  selectedId: string | null
  hoveredId: string | null
  // BBox specific
  activeHandlePosition: HandlePosition | null
  drawingPreview: Rect | null
  // Polygon specific
  polygonDrawingPoints: Point[]
  polygonMousePosition: Point | null
  draggingVertexIndex: number | null
  // Shared
  drawingColor: string
  activeTool: ToolType | null
  viewport: ViewportState
}

// ─── Export / Import Formats ────────────────────────────

export interface ExportDataPixel {
  format: 'pixel'
  imageWidth: number
  imageHeight: number
  annotations: Annotation[]
}

export interface NormalizedAnnotation {
  id: string
  type: 'bbox' | 'polygon'
  // bbox fields (normalized 0-1)
  x?: number
  y?: number
  width?: number
  height?: number
  rotation?: number
  // polygon fields (normalized 0-1)
  points?: Point[]
  label?: string
  color: string
}

export interface ExportDataNormalized {
  format: 'normalized'
  annotations: NormalizedAnnotation[]
}

export type ExportData = ExportDataPixel | ExportDataNormalized

// ─── Constants ──────────────────────────────────────────

export const DEFAULTS = {
  // BBox
  MIN_BBOX_SIZE: 5,
  HANDLE_SIZE: 8,
  // Polygon
  CLOSE_POLYGON_THRESHOLD: 15,
  MIN_POLYGON_POINTS: 3,
  VERTEX_SIZE: 8,
  // Shared
  STROKE_WIDTH: 2,
  LABEL_FONT_SIZE: 12,
  LABEL_PADDING: 4,
  SELECTED_FILL_OPACITY: 0.2,
  HOVERED_FILL_OPACITY: 0.1,
  DEFAULT_COLOR: '#00ff00',
  ZOOM_STEP: 1.1,
  ZOOM_MIN: 0.1,
  ZOOM_MAX: 20,
} as const
