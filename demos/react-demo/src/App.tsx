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

// Serverdan kelgan tayyor annotationlar misoli
const DEMO_ANNOTATIONS: BoundingBox[] = [
  { id: 'demo_1', x: 180, y: 120, width: 200, height: 150, rotation: 0, color: '#FF6B6B', label: 'Building' },
  { id: 'demo_2', x: 500, y: 300, width: 120, height: 180, rotation: 0, color: '#4ECDC4', label: 'Tower' },
  { id: 'demo_3', x: 750, y: 200, width: 160, height: 100, rotation: 0, color: '#45B7D1', label: 'Bridge' },
]

function Toolbar({ onExport, onImport }: {
  onExport: () => void
  onImport: () => void
}) {
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
        <span style={styles.groupLabel}>Data</span>
        <button style={{ ...styles.btn, color: '#4ECDC4' }} onClick={onImport}>
          Import Demo
        </button>
        <button style={{ ...styles.btn, color: '#45B7D1' }} onClick={onExport}>
          Export JSON
        </button>
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

function Sidebar({ exportedJSON }: { exportedJSON: string | null }) {
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

      {exportedJSON && (
        <div style={styles.jsonPanel}>
          <h3 style={styles.sidebarTitle}>Exported JSON</h3>
          <pre style={styles.jsonPre}>{exportedJSON}</pre>
        </div>
      )}
    </div>
  )
}

function CanvasSizeControls({
  canvasWidth,
  canvasHeight,
  onWidthChange,
  onHeightChange,
}: {
  canvasWidth: number
  canvasHeight: number
  onWidthChange: (w: number) => void
  onHeightChange: (h: number) => void
}) {
  return (
    <div style={styles.sizeControls}>
      <span style={styles.groupLabel}>Canvas Size</span>
      <div style={styles.sliderRow}>
        <label style={styles.sliderLabel}>W: {canvasWidth}px</label>
        <input
          type="range"
          min={300}
          max={1400}
          value={canvasWidth}
          onChange={e => onWidthChange(Number(e.target.value))}
          style={styles.slider}
        />
      </div>
      <div style={styles.sliderRow}>
        <label style={styles.sliderLabel}>H: {canvasHeight}px</label>
        <input
          type="range"
          min={200}
          max={900}
          value={canvasHeight}
          onChange={e => onHeightChange(Number(e.target.value))}
          style={styles.slider}
        />
      </div>
    </div>
  )
}

export default function App() {
  const [annotations, setAnnotations] = useState<BoundingBox[]>([])
  const [color, setColor] = useState<string | null>(null)
  const [canvasWidth, setCanvasWidth] = useState(900)
  const [canvasHeight, setCanvasHeight] = useState(600)
  const [exportedJSON, setExportedJSON] = useState<string | null>(null)

  // ─── Import: tashqaridan list yuklash ──────────
  function handleImport() {
    // Serverdan kelgandek — shunchaki array berish
    setAnnotations(DEMO_ANNOTATIONS)
  }

  // ─── Export: hozirgi annotationlarni olish ─────
  function handleExport() {
    // annotations — hozirgi rasmda qanday bo'lsa shunday
    const json = JSON.stringify(annotations, null, 2)
    setExportedJSON(json)

    // Serverga saqlash misoli:
    // await fetch('/api/annotations', {
    //   method: 'POST',
    //   body: JSON.stringify(annotations),
    // })
  }

  return (
    <div style={styles.root}>
      <AnnotationProvider
        annotations={annotations}
        color={color}
        onChange={setAnnotations}
      >
        <Toolbar onExport={handleExport} onImport={handleImport} />
        <div style={styles.mainArea}>
          <div style={styles.canvasArea}>
            <CanvasSizeControls
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              onWidthChange={setCanvasWidth}
              onHeightChange={setCanvasHeight}
            />
            <div style={styles.canvasWrapper}>
              <AnnotationCanvas
                src={SAMPLE_IMAGE}
                width={canvasWidth}
                height={canvasHeight}
              />
            </div>
          </div>
          <Sidebar exportedJSON={exportedJSON} />
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
  canvasArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#1a1a2e',
    overflow: 'auto',
  },
  sizeControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 16px',
    backgroundColor: '#16213e',
    borderBottom: '1px solid #0f3460',
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  sliderLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#8892b0',
    minWidth: 75,
    fontFamily: 'monospace',
  },
  slider: {
    width: 120,
    accentColor: '#2563eb',
  },
  canvasWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  sidebar: {
    width: 280,
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
  jsonPanel: {
    marginTop: 16,
    borderTop: '1px solid #e0e0e0',
    paddingTop: 12,
  },
  jsonPre: {
    fontSize: 10,
    lineHeight: 1.4,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 6,
    overflow: 'auto',
    maxHeight: 300,
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-all' as const,
  },
}
