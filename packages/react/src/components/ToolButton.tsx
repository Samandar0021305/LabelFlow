import React from 'react'
import type { ToolType } from '@labelflow/core'
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

  return (
    <button
      type="button"
      onClick={() => setActiveTool(tool)}
      className={`${className ?? ''} ${isActive ? (activeClassName ?? '') : ''}`}
      style={{
        ...style,
        ...(isActive ? activeStyle : undefined),
      }}
      title={title}
      data-active={isActive}
    >
      {children ?? (tool === null ? 'Select' : tool.charAt(0).toUpperCase() + tool.slice(1))}
    </button>
  )
}
