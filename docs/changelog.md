# Changelog

## v0.2.0

- **Polygon annotation tool** — click to place vertices, auto-close near first point, double-click to close
- Polygon vertex editing — drag individual vertices in select mode
- Polygon drag — move entire polygon in select mode
- Ray casting hit detection for polygon clicks
- `Annotation` union type (`BoundingBox | Polygon`) replaces standalone `BoundingBox`
- All annotations now have a `type` field: `'bbox'` or `'polygon'`
- `onDoubleClick` event support in AnnotationCanvas
- Updated README and docs for all packages

## v0.1.4

- Fix GitHub repository URL in package metadata

## v0.1.3

- Remove `ToolButton` component — use `useAnnotation()` + your own buttons instead
- Update README documentation

## v0.1.2

- Add keywords for npm search discoverability
- Add `author`, `homepage`, `repository` fields

## v0.1.1

- Update README with full documentation

## v0.1.0

Initial release.

- BBox annotation tool — draw, select, drag, resize
- Zoom & Pan — mouse wheel, right-click drag
- Color control — fixed or random per annotation
- Import/Export — plain arrays + normalized format
- Canvas sizing — fixed, fill parent, or dynamic
- Keyboard shortcuts — Escape, Delete
- HiDPI support
- React adapter — AnnotationProvider, AnnotationCanvas, useAnnotation
- Vue adapter — AnnotationProvider, AnnotationCanvas, useAnnotation
- Core engine — AnnotationEngine, Canvas2DRenderer
- TypeScript types included
- ESM + CJS dual format
