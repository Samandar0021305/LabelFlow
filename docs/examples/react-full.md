# React Full App

A complete annotation application with toolbar, annotation list, color picker, zoom controls, and import/export.

## Code

```tsx
import { useState } from 'react'
import { AnnotationProvider, AnnotationCanvas, useAnnotation } from '@labelflow-core/react'
import type { BoundingBox } from '@labelflow-core/react'

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']

function Toolbar() {
  const { engine, setActiveTool, setColor, deleteSelected, clearAll, zoomIn, zoomOut, resetZoom } = useAnnotation()

  return (
    <div style={{ display: 'flex', gap: 8, padding: 8, background: '#fff', borderBottom: '1px solid #eee', flexWrap: 'wrap', alignItems: 'center' }}>
      {/* Tool buttons */}
      <button
        onClick={() => setActiveTool(null)}
        style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer',
          background: engine.activeTool === null ? '#2563eb' : '#fff',
          color: engine.activeTool === null ? '#fff' : '#000' }}
      >
        Select
      </button>
      <button
        onClick={() => setActiveTool('bbox')}
        style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer',
          background: engine.activeTool === 'bbox' ? '#2563eb' : '#fff',
          color: engine.activeTool === 'bbox' ? '#fff' : '#000' }}
      >
        BBox
      </button>

      <span style={{ borderLeft: '1px solid #ddd', height: 20, margin: '0 4px' }} />

      {/* Color picker */}
      {COLORS.map(c => (
        <button key={c} onClick={() => setColor(c)}
          style={{ width: 24, height: 24, borderRadius: 4, border: 'none', background: c, cursor: 'pointer',
            outline: engine.color === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }} />
      ))}
      <button onClick={() => setColor(null)} style={{ fontSize: 12 }}>Random</button>

      <span style={{ borderLeft: '1px solid #ddd', height: 20, margin: '0 4px' }} />

      {/* Zoom */}
      <button onClick={zoomIn}>+</button>
      <button onClick={zoomOut}>-</button>
      <button onClick={resetZoom}>Fit</button>

      <span style={{ borderLeft: '1px solid #ddd', height: 20, margin: '0 4px' }} />

      <button onClick={deleteSelected} style={{ color: 'red' }}>Delete</button>
      <button onClick={clearAll} style={{ color: 'red' }}>Clear</button>

      <span style={{ marginLeft: 'auto', color: '#888', fontSize: 12 }}>
        {engine.annotations.length} boxes | {Math.round(engine.zoom * 100)}%
      </span>
    </div>
  )
}

function AnnotationList() {
  const { engine } = useAnnotation()

  return (
    <div style={{ width: 250, padding: 12, borderLeft: '1px solid #eee', overflowY: 'auto' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 14 }}>
        {engine.annotations.length} Annotations
      </h3>
      {engine.annotations.map(ann => (
        <div key={ann.id} onClick={() => engine.select(ann.id)}
          style={{
            padding: 8, marginBottom: 4, cursor: 'pointer', borderRadius: 4,
            borderLeft: `3px solid ${ann.color}`,
            background: ann.id === engine.selectedId ? '#f0f0f0' : 'transparent',
          }}>
          <strong style={{ color: ann.color }}>{ann.label || ann.id.slice(0, 10)}</strong>
          <div style={{ fontSize: 11, color: '#999' }}>
            {Math.round(ann.x)}, {Math.round(ann.y)} — {Math.round(ann.width)}x{Math.round(ann.height)}
          </div>
        </div>
      ))}
    </div>
  )
}

function SaveLoadButtons() {
  const { engine } = useAnnotation()

  function handleExport() {
    const json = JSON.stringify(engine.annotations, null, 2)
    console.log('Export:', json)
    navigator.clipboard.writeText(json)
    alert('Copied to clipboard!')
  }

  function handleImport() {
    const json = prompt('Paste annotations JSON:')
    if (json) {
      try {
        engine.setAnnotations(JSON.parse(json))
      } catch { alert('Invalid JSON') }
    }
  }

  return (
    <div style={{ padding: 8, borderTop: '1px solid #eee' }}>
      <button onClick={handleExport} style={{ marginRight: 4 }}>Export</button>
      <button onClick={handleImport}>Import</button>
    </div>
  )
}

export default function App() {
  const [annotations, setAnnotations] = useState<BoundingBox[]>([])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'system-ui' }}>
      <AnnotationProvider annotations={annotations} onChange={setAnnotations}>
        <Toolbar />
        <div style={{ display: 'flex', flex: 1 }}>
          <AnnotationCanvas
            src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80"
            style={{ flex: 1, background: '#1a1a2e' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <AnnotationList />
            <SaveLoadButtons />
          </div>
        </div>
      </AnnotationProvider>
    </div>
  )
}
```
