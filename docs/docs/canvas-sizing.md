# Canvas Sizing

The canvas size is controllable. The image always fits inside, centered, with correct aspect ratio.

## Fixed Size

```tsx
<AnnotationCanvas src="/photo.jpg" width={800} height={600} />
```

## Fill Parent

```tsx
<div style={{ width: '100%', height: '500px' }}>
  <AnnotationCanvas src="/photo.jpg" width="100%" height="100%" />
</div>
```

A `ResizeObserver` detects size changes and re-fits the image automatically.

## Dynamic Resize

::: code-group

```tsx [React]
const [width, setWidth] = useState(800)

<AnnotationCanvas src="/photo.jpg" width={width} height={600} />
<input type="range" min={400} max={1400} value={width}
  onChange={e => setWidth(Number(e.target.value))} />
```

```vue [Vue]
const width = ref(800)

<AnnotationCanvas src="/photo.jpg" :width="width" :height="600" />
<input type="range" :min="400" :max="1400" v-model.number="width" />
```

:::

## How Fitting Works

```
Canvas: 800×600    Image: 1920×1080

Scale = Math.min(800/1920, 600/1080) = 0.416
Image on screen: 800×450, centered vertically (75px top/bottom)
```

Annotations are in original image pixels, so they stay correct at any canvas size.
