# Vanilla JS Example

No framework needed — just the core engine and a canvas element.

## Code

```html
<!DOCTYPE html>
<html>
<head>
  <title>LabelFlow - Vanilla JS</title>
  <style>
    body { margin: 0; font-family: system-ui; display: flex; flex-direction: column; height: 100vh; }
    .toolbar { display: flex; gap: 8px; padding: 8px; background: #fff; border-bottom: 1px solid #eee; }
    .toolbar button { padding: 6px 12px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; background: #fff; }
    .toolbar button.active { background: #2563eb; color: #fff; border-color: #2563eb; }
    canvas { flex: 1; background: #1a1a2e; display: block; }
  </style>
</head>
<body>
  <div class="toolbar">
    <button id="btn-select" class="active">Select</button>
    <button id="btn-bbox">BBox</button>
    <button id="btn-delete">Delete</button>
    <button id="btn-clear">Clear All</button>
    <button id="btn-zoom-in">+</button>
    <button id="btn-zoom-out">-</button>
    <button id="btn-fit">Fit</button>
    <span id="status" style="margin-left: auto; color: #888; font-size: 12px"></span>
  </div>
  <canvas id="canvas"></canvas>

  <script type="module">
    import { AnnotationEngine, Canvas2DRenderer } from '@labelflow-core/engine'

    const canvas = document.getElementById('canvas')
    const engine = new AnnotationEngine()
    const renderer = new Canvas2DRenderer(canvas)

    // Resize to fill
    function resize() {
      const w = window.innerWidth
      const h = window.innerHeight - 42
      renderer.resize(w, h)
      engine.setCanvasSize({ width: w, height: h })
      render()
    }
    window.addEventListener('resize', resize)

    // Load image
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      engine.setImage(img)
      resize()
    }
    img.src = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80'

    // Render
    function render() {
      renderer.render(engine.renderState)
      document.getElementById('status').textContent =
        `${engine.annotations.length} boxes | ${Math.round(engine.zoom * 100)}%`
    }

    // Pointer events
    function pt(e) {
      const r = canvas.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }

    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault()
      canvas.setPointerCapture(e.pointerId)
      engine.onPointerDown(pt(e), e.button)
      render()
    })
    canvas.addEventListener('pointermove', (e) => { engine.onPointerMove(pt(e)); render() })
    canvas.addEventListener('pointerup', (e) => {
      canvas.releasePointerCapture(e.pointerId)
      engine.onPointerUp(pt(e))
      render()
    })
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault()
      engine.onWheel(pt(e), e.deltaY)
      render()
    }, { passive: false })
    canvas.addEventListener('contextmenu', (e) => e.preventDefault())
    window.addEventListener('keydown', (e) => { engine.onKeyDown(e.key); render() })

    // Toolbar
    function setActive(id) {
      document.querySelectorAll('.toolbar button').forEach(b => b.classList.remove('active'))
      document.getElementById(id).classList.add('active')
    }

    document.getElementById('btn-select').onclick = () => { engine.setActiveTool(null); setActive('btn-select') }
    document.getElementById('btn-bbox').onclick = () => { engine.setActiveTool('bbox'); setActive('btn-bbox') }
    document.getElementById('btn-delete').onclick = () => {
      if (engine.selectedId) engine.deleteAnnotation(engine.selectedId)
      render()
    }
    document.getElementById('btn-clear').onclick = () => { engine.clearAnnotations(); render() }
    document.getElementById('btn-zoom-in').onclick = () => { engine.zoomIn(); render() }
    document.getElementById('btn-zoom-out').onclick = () => { engine.zoomOut(); render() }
    document.getElementById('btn-fit').onclick = () => { engine.resetZoom(); render() }
  </script>
</body>
</html>
```
