# AnnotationProvider

The root component that manages state and provides context to all children. Must wrap `<AnnotationCanvas>` and any component using `useAnnotation()`.

## Usage

::: code-group

```tsx [React]
<AnnotationProvider
  annotations={annotations}
  color="#FF6B6B"
  onChange={setAnnotations}
  onSelect={(id) => {}}
  onCreate={(ann) => {}}
  onUpdate={(ann) => {}}
  onDelete={(id) => {}}
>
  {children}
</AnnotationProvider>
```

```vue [Vue]
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
| `annotations` | `Annotation[]` | `[]` | Controlled annotation state — you own this array |
| `color` | `string \| null` | `null` | Drawing color. `null` = random color per annotation |

## Events

### React (callback props)

| Prop | Type | When |
|------|------|------|
| `onChange` | `(list: Annotation[]) => void` | Any annotation added, moved, resized, or deleted |
| `onSelect` | `(id: string \| null) => void` | Selection changed |
| `onCreate` | `(ann: Annotation) => void` | New annotation drawn |
| `onUpdate` | `(ann: Annotation) => void` | Annotation moved or resized |
| `onDelete` | `(id: string) => void` | Annotation deleted |

### Vue (emits)

| Event | Payload | When |
|-------|---------|------|
| `@change` | `Annotation[]` | Any change |
| `@select` | `string \| null` | Selection changed |
| `@create` | `Annotation` | New drawn |
| `@update` | `Annotation` | Moved/resized |
| `@delete` | `string` | Deleted |
