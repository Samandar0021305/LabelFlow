# Color Control

Each annotation has a `color` property. Control the color of new annotations via `color` prop or `setColor()`.

## Random (default)

`color={null}` — each new annotation gets a unique color from the built-in 15-color palette:

::: code-group
```tsx [React]
<AnnotationProvider color={null} ...>
```
```vue [Vue]
<AnnotationProvider :color="null" ...>
```
:::

## Fixed

Set a hex string — all new annotations use that color:

::: code-group
```tsx [React]
<AnnotationProvider color="#FF6B6B" ...>
```
```vue [Vue]
<AnnotationProvider color="#FF6B6B" ...>
```
:::

## Dynamic

Let the user pick at runtime:

::: code-group

```tsx [React]
const [color, setColor] = useState<string | null>(null)

<AnnotationProvider color={color} ...>
  <button onClick={() => setColor('#FF6B6B')}>Red</button>
  <button onClick={() => setColor('#4ECDC4')}>Teal</button>
  <button onClick={() => setColor(null)}>Random</button>
  <AnnotationCanvas src="/photo.jpg" />
</AnnotationProvider>
```

```vue [Vue]
const color = ref(null)

<AnnotationProvider :color="color" ...>
  <button @click="color = '#FF6B6B'">Red</button>
  <button @click="color = '#4ECDC4'">Teal</button>
  <button @click="color = null">Random</button>
  <AnnotationCanvas src="/photo.jpg" />
</AnnotationProvider>
```

:::

## Via useAnnotation()

```ts
const { setColor, engine } = useAnnotation()

setColor('#FF6B6B')  // fixed
setColor(null)        // random
engine.color          // read current color
```
