import type { Camera, Shape, WhiteboardDoc } from '../../../shared/types/whiteboard'
import { renderGrid } from './renderer/grid'
import { renderPencil } from './renderer/pencil'
import { renderRectangle } from './renderer/rectangle'
import { renderEllipse } from './renderer/ellipse'
import { renderLine } from './renderer/line'
import { renderArrow } from './renderer/arrow'
import { renderText } from './renderer/text'
import { renderSelection } from './renderer/selection'

export type RenderOptions = {
  background: string
  showGrid: boolean
}

export function render(ctx: CanvasRenderingContext2D, doc: WhiteboardDoc, camera: Camera, options: RenderOptions, selected: Set<string>) {
  const dpr = globalThis.devicePixelRatio || 1
  const { width, height } = ctx.canvas
  const cssWidth = width / dpr
  const cssHeight = height / dpr
  ctx.save()
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, cssWidth, cssHeight)
  ctx.fillStyle = options.background
  ctx.fillRect(0, 0, cssWidth, cssHeight)

  ctx.translate(camera.x, camera.y)
  ctx.scale(camera.zoom, camera.zoom)

  if (options.showGrid) {
    renderGrid(ctx, camera, cssWidth, cssHeight)
  }

  for (const id of doc.order) {
    const shape = doc.shapes[id]
    if (!shape) continue
    drawShape(ctx, shape, selected.has(id))
  }

  ctx.restore()
}

function drawShape(ctx: CanvasRenderingContext2D, shape: Shape, isSelected: boolean) {
  ctx.save()
  ctx.lineWidth = shape.strokeWidth
  ctx.strokeStyle = shape.stroke
  ctx.fillStyle = shape.fill ?? 'transparent'

  switch (shape.type) {
    case 'pencil':
      renderPencil(ctx, shape)
      break
    case 'rectangle':
      renderRectangle(ctx, shape)
      break
    case 'ellipse':
      renderEllipse(ctx, shape)
      break
    case 'line':
      renderLine(ctx, shape)
      break
    case 'arrow':
      renderArrow(ctx, shape)
      break
    case 'text':
      renderText(ctx, shape)
      break
  }

  if (isSelected) {
    renderSelection(ctx, shape)
  }

  ctx.restore()
}

