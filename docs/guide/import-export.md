# Import & Export

Annotations are plain JavaScript arrays. No special format, no conversion needed. Pass an array in to render, read it out to save.

## Annotation Format

Each annotation is a `BoundingBox` object with coordinates in **original image pixels**:

```json
[
  {
    "id": "bbox_1_m5abc",
    "x": 150,
    "y": 200,
    "width": 300,
    "height": 180,
    "rotation": 0,
    "color": "#FF6B6B",
    "label": "Car"
  }
]
```

::: tip Coordinates are stable
A box at `x: 150, y: 200` stays at that position regardless of canvas size, zoom level, or screen resolution. The coordinates always refer to the original image pixels.
:::

## Import (Load)

### From server

::: code-group

```tsx [React]
const [annotations, setAnnotations] = useState<BoundingBox[]>([])

useEffect(() => {
  fetch('/api/annotations')
    .then(res => res.json())
    .then(data => setAnnotations(data))   // renders immediately
}, [])
```

```vue [Vue]
const annotations = ref<BoundingBox[]>([])

onMounted(async () => {
  const res = await fetch('/api/annotations')
  annotations.value = await res.json()   // renders immediately
})
```

:::

### From a variable

::: code-group

```tsx [React]
const preloaded: BoundingBox[] = [
  { id: '1', x: 100, y: 100, width: 200, height: 150, rotation: 0, color: '#FF6B6B' },
  { id: '2', x: 400, y: 300, width: 150, height: 100, rotation: 0, color: '#4ECDC4' },
]

setAnnotations(preloaded)
```

```vue [Vue]
annotations.value = [
  { id: '1', x: 100, y: 100, width: 200, height: 150, rotation: 0, color: '#FF6B6B' },
  { id: '2', x: 400, y: 300, width: 150, height: 100, rotation: 0, color: '#4ECDC4' },
]
```

:::

### Via engine directly

```ts
const { engine } = useAnnotation()
engine.setAnnotations(myAnnotations)
```

## Export (Save)

### Read from state

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

### Read from engine

```ts
const { engine } = useAnnotation()
const currentAnnotations = engine.annotations  // BoundingBox[]
```

### Auto-save on change

::: code-group

```tsx [React]
<AnnotationProvider
  annotations={annotations}
  onChange={(list) => {
    setAnnotations(list)
    // Auto-save every change
    fetch('/api/annotations', { method: 'POST', body: JSON.stringify(list) })
  }}
>
```

```vue [Vue]
<AnnotationProvider
  :annotations="annotations"
  @change="(list) => {
    annotations = list
    fetch('/api/annotations', { method: 'POST', body: JSON.stringify(list) })
  }"
>
```

:::

## Advanced: Normalized Export

The engine also supports exporting in normalized (0-1) format for cross-image compatibility:

```ts
const { engine } = useAnnotation()

// Absolute pixels (default)
const pixelData = engine.exportJSON('pixel')
// { format: 'pixel', imageWidth: 1920, imageHeight: 1080, annotations: [...] }

// Normalized 0-1 (portable)
const normData = engine.exportJSON('normalized')
// { format: 'normalized', annotations: [{ x: 0.078, y: 0.185, ... }] }

// Import either format
engine.importJSON(data)
```
