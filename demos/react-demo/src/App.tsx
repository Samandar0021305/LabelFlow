import { useState } from 'react'
import {
  AnnotationProvider,
  AnnotationCanvas,
  ToolButton,
  useAnnotation,
} from '@labelflow/react'
import type { BoundingBox, AnnotationClass } from '@labelflow/react'

const CLASSES: AnnotationClass[] = [
  { id: '1', name: 'Car', color: '#FF6B6B' },
  { id: '2', name: 'Person', color: '#4ECDC4' },
  { id: '3', name: 'Tree', color: '#45B7D1' },
]

const SAMPLE_IMAGE = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80'

function Toolbar() {
  const { engine, setActiveClass, deleteSelected, clearAll, zoomIn, zoomOut, resetZoom } = useAnnotation()

  return (
    <div style={styles.toolbar}>
      <div style={styles.toolGroup}>
        <span style={styles.groupLabel}>Tools</span>
        <ToolButton tool={null} style={styles.btn} activeStyle={styles.btnActive}>
          ↖ Select
        </ToolButton>
        <ToolButton tool="bbox" style={styles.btn} activeStyle={styles.btnActive}>
          ▢ BBox
        </ToolButton>
      </div>

      <div style={styles.toolGroup}>
        <span style={styles.groupLabel}>Class</span>
        {CLASSES.map(cls => (
          <button
            key={cls.id}
            style={{
              ...styles.classBtn,
              borderColor: cls.color,
              backgroundColor: engine.activeClassId === cls.id ? cls.color : 'transparent',
              color: engine.activeClassId === cls.id ? '#fff' : cls.color,
            }}
            onClick={() => setActiveClass(cls.id)}
          >
            {cls.name}
          </button>
        ))}
      </div>

      <div style={styles.toolGroup}>
        <span style={styles.groupLabel}>Zoom</span>
        <button style={styles.btn} onClick={zoomIn}>+</button>
        <button style={styles.btn} onClick={zoomOut}>−</button>
        <button style={styles.btn} onClick={resetZoom}>Fit</button>
      </div>

      <div style={styles.toolGroup}>
        <button style={{ ...styles.btn, color: '#FF6B6B' }} onClick={deleteSelected}>
          Delete
        </button>
        <button style={{ ...styles.btn, color: '#FF6B6B' }} onClick={clearAll}>
          Clear All
        </button>
      </div>
    </div>
  )
}

function AnnotationList() {
  const { engine } = useAnnotation()
  const annotations = engine.annotations

  return (
    <div style={styles.sidebar}>
      <h3 style={styles.sidebarTitle}>
        Annotations ({annotations.length})
      </h3>
      {annotations.map(ann => (
        <div
          key={ann.id}
          style={{
            ...styles.annItem,
            borderLeftColor: ann.color,
            backgroundColor: ann.id === engine.selectedId ? '#f0f0f0' : 'transparent',
          }}
          onClick={() => engine.select(ann.id)}
        >
          <span style={{ color: ann.color, fontWeight: 600 }}>
            {ann.label ?? 'Unlabeled'}
          </span>
          <span style={styles.annCoords}>
            {Math.round(ann.x)}, {Math.round(ann.y)} — {Math.round(ann.width)}×{Math.round(ann.height)}
          </span>
        </div>
      ))}
      {annotations.length === 0 && (
        <p style={styles.emptyText}>
          Select BBox tool and draw on the image
        </p>
      )}
    </div>
  )
}

export default function App() {
  const [annotations, setAnnotations] = useState<BoundingBox[]>([])

  return (
    <div style={styles.root}>
      <AnnotationProvider
        annotations={annotations}
        classes={CLASSES}
        onChange={setAnnotations}
      >
        <Toolbar />
        <div style={styles.mainArea}>
          <AnnotationCanvas
            src={SAMPLE_IMAGE}
            style={{ flex: 1, backgroundColor: '#1a1a2e' }}
          />
          <AnnotationList />
        </div>
      </AnnotationProvider>
    </div>
  )
}

// ─── Styles ─────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: 'Inter, system-ui, sans-serif',
    margin: 0,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e0e0e0',
    flexWrap: 'wrap',
  },
  toolGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase' as const,
    marginRight: 4,
  },
  btn: {
    padding: '6px 12px',
    border: '1px solid #ddd',
    borderRadius: 6,
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    transition: 'all 0.15s',
  },
  btnActive: {
    backgroundColor: '#2563eb',
    color: '#fff',
    borderColor: '#2563eb',
  },
  classBtn: {
    padding: '4px 10px',
    border: '2px solid',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    transition: 'all 0.15s',
  },
  mainArea: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    width: 260,
    borderLeft: '1px solid #e0e0e0',
    backgroundColor: '#fafafa',
    overflowY: 'auto' as const,
    padding: 12,
  },
  sidebarTitle: {
    margin: '0 0 12px',
    fontSize: 14,
    fontWeight: 600,
    color: '#333',
  },
  annItem: {
    padding: '8px 10px',
    borderLeft: '3px solid',
    borderRadius: '0 6px 6px 0',
    marginBottom: 6,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
    transition: 'background-color 0.15s',
  },
  annCoords: {
    fontSize: 11,
    color: '#999',
  },
  emptyText: {
    color: '#aaa',
    fontSize: 13,
    textAlign: 'center' as const,
    marginTop: 40,
  },
}
