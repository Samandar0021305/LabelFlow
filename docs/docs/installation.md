# Installation

## React

```bash
npm install @labelflow-core/react
```

Automatically installs `@labelflow-core/engine`. **Requirements:** React 18+.

## Vue 3

```bash
npm install @labelflow-core/vue
```

Automatically installs `@labelflow-core/engine`. **Requirements:** Vue 3.3+.

## Vanilla JavaScript

```bash
npm install @labelflow-core/engine
```

You wire up events and rendering yourself. See [Vanilla JS example](/examples/vanilla-js).

## Package Sizes

| Package | Size | Contents |
|---------|------|----------|
| `@labelflow-core/engine` | ~25KB | AnnotationEngine, Canvas2DRenderer, geometry, types |
| `@labelflow-core/react` | ~8KB | AnnotationProvider, AnnotationCanvas, useAnnotation |
| `@labelflow-core/vue` | ~8KB | AnnotationProvider, AnnotationCanvas, useAnnotation |

All packages ship ESM + CJS with full TypeScript types.
