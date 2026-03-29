# Import & Export

Annotations are plain JavaScript arrays. Pass an array in to render, read it out to save.

## Format

Each annotation has a `type` field (`'bbox'` or `'polygon'`) with coordinates in **original image pixels**:

```json
[
  {
    "id": "bbox_1",
    "type": "bbox",
    "x": 150, "y": 200, "width": 300, "height": 180,
    "rotation": 0, "color": "#FF6B6B", "label": "Car"
  },
  {
    "id": "poly_2",
    "type": "polygon",
    "points": [{ "x": 500, "y": 100 }, { "x": 650, "y": 80 }, { "x": 700, "y": 250 }],
    "color": "#4ECDC4", "label": "Park"
  }
]
```

::: tip
Coordinates are always in original image pixels — they don't change when the canvas is resized or zoomed.
:::

## Import (Load)

::: code-group

```tsx [React]
// From server
useEffect(() => {
  fetch('/api/annotations').then(r => r.json()).then(setAnnotations)
}, [])

// From variable
setAnnotations([
  { id: '1', type: 'bbox', x: 100, y: 100, width: 200, height: 150, rotation: 0, color: '#FF6B6B' },
  { id: '2', type: 'polygon', points: [{ x: 300, y: 100 }, { x: 450, y: 80 }, { x: 400, y: 250 }], color: '#4ECDC4' },
])

// Via engine
engine.setAnnotations(data)
```

```vue [Vue]
// From server
onMounted(async () => {
  annotations.value = await fetch('/api/annotations').then(r => r.json())
})

// From variable
annotations.value = [
  { id: '1', type: 'bbox', x: 100, y: 100, width: 200, height: 150, rotation: 0, color: '#FF6B6B' },
  { id: '2', type: 'polygon', points: [{ x: 300, y: 100 }, { x: 450, y: 80 }, { x: 400, y: 250 }], color: '#4ECDC4' },
]
```

:::

## Export (Save)

::: code-group

```tsx [React]
// annotations state is always current
async function save() {
  await fetch('/api/annotations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(annotations),
  })
}

// Or from engine
const data = engine.annotations
```

```vue [Vue]
async function save() {
  await fetch('/api/annotations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(annotations.value),
  })
}
```

:::

## Auto-save

::: code-group

```tsx [React]
<AnnotationProvider
  annotations={annotations}
  onChange={(list) => {
    setAnnotations(list)
    fetch('/api/save', { method: 'POST', body: JSON.stringify(list) })
  }}
>
```

```vue [Vue]
<AnnotationProvider
  :annotations="annotations"
  @change="(list) => { annotations = list; fetch('/api/save', { method: 'POST', body: JSON.stringify(list) }) }"
>
```

:::

## Normalized Export (Advanced)

For cross-image compatibility, the engine supports 0-1 normalized coordinates:

```ts
// Pixel format (default)
engine.exportJSON('pixel')
// { format: 'pixel', imageWidth: 1920, imageHeight: 1080, annotations: [...] }

// Normalized 0-1
engine.exportJSON('normalized')
// { format: 'normalized', annotations: [{ x: 0.078, y: 0.185, ... }] }

// Import either format
engine.importJSON(data)
```
