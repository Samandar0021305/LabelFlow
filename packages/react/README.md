# @labelflow/react

React components for image annotation. Draw bounding boxes on images with zoom, pan, resize, and drag support. Built on [`@labelflow/core`](https://www.npmjs.com/package/@labelflow/core).

## Install

```bash
npm install @labelflow/core @labelflow/react
```

## Usage

```tsx
import { useState } from 'react'
import { AnnotationProvider, AnnotationCanvas, ToolButton, useAnnotation } from '@labelflow/react'
import type { BoundingBox } from '@labelflow/react'

function App() {
  const [annotations, setAnnotations] = useState<BoundingBox[]>([])

  return (
    <AnnotationProvider annotations={annotations} onChange={setAnnotations}>
      <Toolbar />
      <AnnotationCanvas src="/photo.jpg" width={800} height={600} />
    </AnnotationProvider>
  )
}

function Toolbar() {
  const { engine, setColor, deleteSelected, zoomIn, zoomOut } = useAnnotation()

  return (
    <div>
      <ToolButton tool={null}>Select</ToolButton>
      <ToolButton tool="bbox">BBox</ToolButton>
      <button onClick={() => setColor('#FF6B6B')}>Red</button>
      <button onClick={() => setColor(null)}>Random</button>
      <button onClick={deleteSelected}>Delete</button>
      <button onClick={zoomIn}>Zoom In</button>
      <button onClick={zoomOut}>Zoom Out</button>
      <span>{engine.annotations.length} annotations</span>
    </div>
  )
}
```

### Import / Export

```tsx
// Import — pass array, it renders
setAnnotations([
  { id: '1', x: 100, y: 100, width: 200, height: 150, rotation: 0, color: '#FF6B6B' }
])

// Export — read current state, save to server
await fetch('/api/save', { method: 'POST', body: JSON.stringify(annotations) })
```

See the [full documentation](https://github.com/user/labelflow#readme) for complete API reference.

## License

MIT
