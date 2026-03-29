import React from 'react'
import type { ToolType } from '@labelflow-core/engine'
import { useAnnotation } from './AnnotationContext'

export interface ToolButtonProps {
  tool: ToolType | null
  children?: React.ReactNode
  className?: string
  activeClassName?: string
  style?: React.CSSProperties
  activeStyle?: React.CSSProperties
  title?: string
}

export function ToolButton({
  tool,
  children,
  className,
  activeClassName,
  style,
  activeStyle,
  title,
}: ToolButtonProps) {
  const { engine, setActiveTool } = useAnnotation()
  const isActive = engine.activeTool === tool

  // Merge styles cleanly — active completely overrides base border props to avoid conflicts
  const mergedStyle: React.CSSProperties = isActive
    ? { ...style, borderColor: undefined, ...activeStyle }
    : { ...style }

  return (
    <button
      type="button"
      onClick={() => setActiveTool(tool)}
      className={`${className ?? ''} ${isActive ? (activeClassName ?? '') : ''}`.trim() || undefined}
      style={mergedStyle}
      title={title}
      data-active={isActive || undefined}
    >
      {children ?? (tool === null ? 'Select' : tool.charAt(0).toUpperCase() + tool.slice(1))}
    </button>
  )
}
