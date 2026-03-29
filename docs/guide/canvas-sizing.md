# Canvas Sizing

The canvas size is fully controllable. The image always fits inside the canvas, centered, with correct aspect ratio.

## Fixed Size

```tsx
<AnnotationCanvas src="/photo.jpg" width={800} height={600} />
```

The image scales to fit within 800x600, centered horizontally and vertically.

## Fill Parent

```tsx
<div style={{ width: '100%', height: '500px' }}>
  <AnnotationCanvas src="/photo.jpg" width="100%" height="100%" />
</div>
```

The canvas fills the parent container. A `ResizeObserver` automatically detects size changes and re-fits the image.

## Dynamic Resize

::: code-group

```tsx [React]
function App() {
  const [width, setWidth] = useState(800)

  return (
    <AnnotationProvider ...>
      <input
        type="range" min={400} max={1400} value={width}
        onChange={e => setWidth(Number(e.target.value))}
      />
      <span>{width}px</span>
      <AnnotationCanvas src="/photo.jpg" width={width} height={600} />
    </AnnotationProvider>
  )
}
```

```vue [Vue]
<script setup>
const width = ref(800)
</script>

<template>
  <AnnotationProvider ...>
    <input type="range" :min="400" :max="1400" v-model.number="width" />
    <span>{{ width }}px</span>
    <AnnotationCanvas src="/photo.jpg" :width="width" :height="600" />
  </AnnotationProvider>
</template>
```

:::

## How Fitting Works

When the canvas size changes:

```
1. Canvas size: 800×600
2. Image size:  1920×1080 (original)
3. Fit scale:   Math.min(800/1920, 600/1080) = 0.416
4. Image on screen: 800×450
5. Offset: centered vertically (75px top/bottom padding)
```

```
┌─────────────────────────┐
│      75px padding        │
│  ┌───────────────────┐  │
│  │                   │  │
│  │   Image (800×450) │  │
│  │                   │  │
│  └───────────────────┘  │
│      75px padding        │
└─────────────────────────┘
        Canvas 800×600
```

Annotations are stored in original image pixels, so they remain accurate regardless of canvas size.
