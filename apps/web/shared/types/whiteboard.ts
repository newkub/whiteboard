export type Point = {
  x: number
  y: number
}

export type Camera = {
  x: number
  y: number
  zoom: number
}

export type ToolId =
  | 'select'
  | 'pan'
  | 'pencil'
  | 'line'
  | 'rectangle'
  | 'ellipse'
  | 'arrow'
  | 'text'
  | 'eraser'
  | 'zoom'

export type ShapeId = string

export type ShapeBase = {
  id: ShapeId
  type: string
  stroke: string
  fill: string | null
  strokeWidth: number
}

export type ShapePencil = ShapeBase & {
  type: 'pencil'
  points: Point[]
}

export type ShapeLine = ShapeBase & {
  type: 'line'
  a: Point
  b: Point
}

export type ShapeRect = ShapeBase & {
  type: 'rectangle'
  x: number
  y: number
  w: number
  h: number
}

export type ShapeEllipse = ShapeBase & {
  type: 'ellipse'
  x: number
  y: number
  w: number
  h: number
}

export type ShapeArrow = ShapeBase & {
  type: 'arrow'
  a: Point
  b: Point
}

export type ShapeText = ShapeBase & {
  type: 'text'
  x: number
  y: number
  text: string
  fontSize: number
}

export type Shape =
  | ShapePencil
  | ShapeLine
  | ShapeRect
  | ShapeEllipse
  | ShapeArrow
  | ShapeText

export type WhiteboardDoc = {
  shapes: Record<ShapeId, Shape>
  order: ShapeId[]
}

export type WhiteboardUi = {
  tool: ToolId
  selectedIds: Set<ShapeId>
  settings: UiSettings
}

export type UiSettings = {
  stroke: string
  fill: string | null
  strokeWidth: number
  fontSize: number
  background: string
  showGrid: boolean
}

export type WhiteboardState = {
  doc: WhiteboardDoc
  ui: WhiteboardUi
  camera: Camera
}
