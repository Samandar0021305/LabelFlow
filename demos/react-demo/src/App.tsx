import { useState } from 'react'
import {
  AnnotationProvider,
  AnnotationCanvas,
  ToolButton,
  useAnnotation,
} from '@labelflow/react'
import type { BoundingBox } from '@labelflow/react'

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#F7DC6F', '#BB8FCE']

const SAMPLE_IMAGE = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80'

function Toolbar() {
  const { engine, setColor, deleteSelected, clearAll, zoomIn, zoomOut, resetZoom } = useAnnotation()

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
        <span style={styles.groupLabel}>Color</span>
        {COLORS.map(c => (
          <button
            key={c}
            style={{
              ...styles.colorBtn,
              backgroundColor: c,
              outline: engine.color === c ? `2px solid ${c}` : '2px solid transparent',
              outlineOffset: 2,
            }}
            onClick={() => setColor(c)}
          />
        ))}
        <button
          style={{ ...styles.btn, fontSize: 11 }}
          onClick={() => setColor(null)}
          title="Random color per annotation"
        >
          Random
        </button>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 10, height: 10, borderRadius: 2,
              backgroundColor: ann.color, flexShrink: 0,
            }} />
            <span style={{ fontWeight: 600, fontSize: 13 }}>
              {ann.label ?? ann.id.slice(0, 12)}
            </span>
          </div>
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
  const [color, setColor] = useState<string | null>(null)

  return (
    <div style={styles.root}>
      <AnnotationProvider
        annotations={annotations}
        color={color}
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
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#ddd',
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
  colorBtn: {
    width: 22,
    height: 22,
    borderRadius: 4,
    border: 'none',
    cursor: 'pointer',
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
