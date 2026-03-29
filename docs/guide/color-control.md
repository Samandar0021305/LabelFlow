# Color Control

Each bounding box has a `color` property. You control the color of new boxes via the `color` prop on `<AnnotationProvider>` or via `setColor()`.

## Random Color (default)

When `color` is `null`, each new box gets a unique color from the built-in 15-color palette:

::: code-group

```tsx [React]
<AnnotationProvider color={null} ...>
```

```vue [Vue]
<AnnotationProvider :color="null" ...>
```

:::

## Fixed Color

Set a hex color string — all new boxes use that color:

::: code-group

```tsx [React]
<AnnotationProvider color="#FF6B6B" ...>
```

```vue [Vue]
<AnnotationProvider color="#FF6B6B" ...>
```

:::

## Dynamic Color

Let the user pick a color at runtime:

::: code-group

```tsx [React]
function App() {
  const [color, setColor] = useState<string | null>(null)
  const [annotations, setAnnotations] = useState([])

  return (
    <AnnotationProvider color={color} annotations={annotations} onChange={setAnnotations}>
      <ColorPicker onColorChange={setColor} />
      <AnnotationCanvas src="/photo.jpg" width={800} height={600} />
    </AnnotationProvider>
  )
}

function ColorPicker({ onColorChange }) {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
  return (
    <div style={{ display: 'flex', gap: 4, padding: 8 }}>
      {colors.map(c => (
        <button
          key={c}
          onClick={() => onColorChange(c)}
          style={{ width: 28, height: 28, background: c, border: 'none', borderRadius: 4, cursor: 'pointer' }}
        />
      ))}
      <button onClick={() => onColorChange(null)}>Random</button>
    </div>
  )
}
```

```vue [Vue]
<script setup>
const color = ref(null)
const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
</script>

<template>
  <AnnotationProvider :color="color" ...>
    <div style="display: flex; gap: 4px; padding: 8px">
      <button v-for="c in colors" :key="c" @click="color = c"
        :style="{ width: '28px', height: '28px', background: c, border: 'none', borderRadius: '4px' }" />
      <button @click="color = null">Random</button>
    </div>
    <AnnotationCanvas src="/photo.jpg" :width="800" :height="600" />
  </AnnotationProvider>
</template>
```

:::

## Via useAnnotation()

You can also set color programmatically from any child component:

```ts
const { setColor } = useAnnotation()

setColor('#FF6B6B')  // fixed red
setColor(null)        // back to random
```

## Reading current color

```ts
const { engine } = useAnnotation()
engine.color  // current active color (string)
```

## Built-in Palette

When using random colors, the palette cycles through:

<div style="display: flex; gap: 4px; flex-wrap: wrap; margin: 12px 0;">
  <span v-for="c in ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA', '#F1948A', '#85929E', '#73C6B6']" :style="{ width: '28px', height: '28px', background: c, borderRadius: '4px', display: 'inline-block' }" />
</div>
