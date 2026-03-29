// Types
export type {
  Point, Size, Rect,
  BoundingBox,
  ToolType, InteractionMode, HandlePosition,
  EngineEvents, ViewportState, RenderState,
  ToolConfig, Handle,
  ExportData, ExportDataPixel, ExportDataNormalized, NormalizedBoundingBox,
} from './types'
export { DEFAULTS } from './types'

// Engine
export { AnnotationEngine } from './state'
export { EventEmitter } from './state'

// Geometry
export {
  imageToCanvas, canvasToImage,
  rectImageToCanvas, rectCanvasToImage,
  normalizeBbox, isPointInsideBbox,
  getBboxArea, getBboxCenter,
  clampBboxToImage, clampPointToImage,
  isBboxValid,
  getBboxHandles, getHandleAtPoint, resizeBboxByHandle,
  getTopAnnotationAtPoint,
} from './geometry'

// Renderer
export { Canvas2DRenderer } from './renderer'
