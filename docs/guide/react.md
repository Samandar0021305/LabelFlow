# React Guide

## Setup

```bash
npm install @labelflow-core/react
```

## Architecture

```
<AnnotationProvider>          ← Context provider (wraps everything)
  ├── Your components         ← Use useAnnotation() to read/control
  └── <AnnotationCanvas>      ← Renders image + annotations
```

## useAnnotation() Hook

This is the main API. Call it in any component inside `<AnnotationProvider>`:

```tsx
import { useAnnotation } from '@labelflow-core/react'

function MyComponent() {
  const {
    engine,           // AnnotationEngine instance
    setActiveTool,    // Switch between 'bbox' and null (select)
    setColor,         // Set drawing color or null for random
    deleteSelected,   // Delete currently selected box
    clearAll,         // Remove all annotations
    zoomIn,           // Zoom in
    zoomOut,          // Zoom out
    resetZoom,        // Fit image to canvas
  } = useAnnotation()
}
```

## Building a Custom Toolbar

You have full control over the UI. Use any design system:

### With plain HTML

```tsx
function Toolbar() {
  const { engine, setActiveTool, setColor, deleteSelected } = useAnnotation()

  return (
    <div>
      <button onClick={() => setActiveTool(null)}>Select</button>
      <button onClick={() => setActiveTool('bbox')}>Draw</button>
      <input type="color" onChange={e => setColor(e.target.value)} />
      <button onClick={deleteSelected}>Delete</button>
    </div>
  )
}
```

### With Ant Design

```tsx
import { Button, Space, ColorPicker } from 'antd'

function Toolbar() {
  const { engine, setActiveTool, setColor, deleteSelected } = useAnnotation()

  return (
    <Space>
      <Button type={engine.activeTool === null ? 'primary' : 'default'}
        onClick={() => setActiveTool(null)}>Select</Button>
      <Button type={engine.activeTool === 'bbox' ? 'primary' : 'default'}
        onClick={() => setActiveTool('bbox')}>Draw</Button>
      <ColorPicker onChange={(_, hex) => setColor(hex)} />
      <Button danger onClick={deleteSelected}>Delete</Button>
    </Space>
  )
}
```

### With Tailwind CSS

```tsx
function Toolbar() {
  const { engine, setActiveTool } = useAnnotation()

  const btnClass = (active: boolean) =>
    `px-3 py-1.5 rounded text-sm font-medium transition ${
      active ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'
    }`

  return (
    <div className="flex gap-2 p-2">
      <button className={btnClass(engine.activeTool === null)}
        onClick={() => setActiveTool(null)}>Select</button>
      <button className={btnClass(engine.activeTool === 'bbox')}
        onClick={() => setActiveTool('bbox')}>Draw BBox</button>
    </div>
  )
}
```

## Annotation List Sidebar

```tsx
function Sidebar() {
  const { engine } = useAnnotation()

  return (
    <div>
      <h3>{engine.annotations.length} Annotations</h3>
      {engine.annotations.map(ann => (
        <div key={ann.id} onClick={() => engine.select(ann.id)}
          style={{
            borderLeft: `3px solid ${ann.color}`,
            padding: 8,
            background: ann.id === engine.selectedId ? '#f0f0f0' : 'transparent',
            cursor: 'pointer',
          }}>
          <strong>{ann.label || ann.id.slice(0, 10)}</strong>
          <div style={{ fontSize: 11, color: '#999' }}>
            {Math.round(ann.x)}, {Math.round(ann.y)} — {Math.round(ann.width)}x{Math.round(ann.height)}
          </div>
        </div>
      ))}
    </div>
  )
}
```

## Listening to Events

```tsx
<AnnotationProvider
  annotations={annotations}
  onChange={setAnnotations}
  onSelect={(id) => console.log('Selected:', id)}
  onCreate={(bbox) => console.log('Created:', bbox)}
  onUpdate={(bbox) => console.log('Updated:', bbox)}
  onDelete={(id) => console.log('Deleted:', id)}
>
```
