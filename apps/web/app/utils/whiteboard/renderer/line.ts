import type { ShapeLine } from '../../../../shared/types/whiteboard'

export function renderLine(ctx: CanvasRenderingContext2D, shape: ShapeLine) {
  ctx.beginPath()
  ctx.moveTo(shape.a.x, shape.a.y)
  ctx.lineTo(shape.b.x, shape.b.y)
  ctx.stroke()
}
