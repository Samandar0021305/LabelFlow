# Installation

## React

```bash
npm install @labelflow-core/react
```

This automatically installs `@labelflow-core/engine` as a dependency.

**Requirements:** React 18.0 or higher.

## Vue 3

```bash
npm install @labelflow-core/vue
```

This automatically installs `@labelflow-core/engine` as a dependency.

**Requirements:** Vue 3.3 or higher.

## Vanilla JavaScript

If you're not using React or Vue, install the core engine directly:

```bash
npm install @labelflow-core/engine
```

You'll need to wire up the canvas, events, and render loop yourself. See [Vanilla JS Guide](/guide/vanilla-js).

## Package Overview

| Package | Size | What's inside |
|---------|------|---------------|
| `@labelflow-core/engine` | ~23KB | AnnotationEngine, Canvas2DRenderer, geometry utils, types |
| `@labelflow-core/react` | ~8KB | AnnotationProvider, AnnotationCanvas, useAnnotation hook |
| `@labelflow-core/vue` | ~8KB | AnnotationProvider, AnnotationCanvas, useAnnotation composable |

All packages ship with:
- ESM and CJS dual format
- Full TypeScript type definitions
- Source maps
