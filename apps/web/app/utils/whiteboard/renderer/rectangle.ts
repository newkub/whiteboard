import type { ShapeRect } from '../../../../shared/types/whiteboard'

export function renderRectangle(ctx: CanvasRenderingContext2D, shape: ShapeRect) {
  ctx.beginPath()
  ctx.rect(shape.x, shape.y, shape.w, shape.h)
  if (shape.fill) ctx.fill()
  ctx.stroke()
}
