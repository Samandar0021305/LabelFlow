// Types
export type {
  Point, Size, Rect,
  BoundingBox, AnnotationClass,
  ToolType, InteractionMode, HandlePosition,
  EngineEvents, ViewportState, RenderState,
  ToolConfig, Handle,
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
