# AnnotationProvider

The root component that manages annotation state and provides context to all child components.

## Usage

::: code-group

```tsx [React]
import { AnnotationProvider } from '@labelflow-core/react'

<AnnotationProvider
  annotations={annotations}
  color="#FF6B6B"
  onChange={setAnnotations}
  onSelect={(id) => {}}
  onCreate={(bbox) => {}}
  onUpdate={(bbox) => {}}
  onDelete={(id) => {}}
>
  {children}
</AnnotationProvider>
```

```vue [Vue]
import { AnnotationProvider } from '@labelflow-core/vue'

<AnnotationProvider
  :annotations="annotations"
  color="#FF6B6B"
  @change="annotations = $event"
  @select="handleSelect"
  @create="handleCreate"
  @update="handleUpdate"
  @delete="handleDelete"
>
  <slot />
</AnnotationProvider>
```

:::

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `annotations` | `BoundingBox[]` | `[]` | The annotation array. This is the controlled state — you own it. |
| `color` | `string \| null` | `null` | Drawing color for new annotations. `null` = random color per box. |

## Events

### React (callback props)

| Prop | Type | Description |
|------|------|-------------|
| `onChange` | `(annotations: BoundingBox[]) => void` | Called when the annotations array changes. This is the primary way to sync state. |
| `onSelect` | `(id: string \| null) => void` | Called when a box is selected or deselected. |
| `onCreate` | `(bbox: BoundingBox) => void` | Called when a new box is drawn. |
| `onUpdate` | `(bbox: BoundingBox) => void` | Called when a box is moved or resized. |
| `onDelete` | `(id: string) => void` | Called when a box is deleted. |

### Vue (emits)

| Event | Payload | Description |
|-------|---------|-------------|
| `@change` | `BoundingBox[]` | Annotations array changed. |
| `@select` | `string \| null` | Selection changed. |
| `@create` | `BoundingBox` | New box drawn. |
| `@update` | `BoundingBox` | Box moved or resized. |
| `@delete` | `string` | Box deleted. |

## Notes

- Must wrap all annotation components (`AnnotationCanvas`, any component using `useAnnotation()`).
- Only one `AnnotationProvider` should exist per annotation canvas.
- The `annotations` prop is the single source of truth. The engine syncs from it.
