import type { ShapeEllipse } from '../../../../shared/types/whiteboard'

export function renderEllipse(ctx: CanvasRenderingContext2D, shape: ShapeEllipse) {
  const cx = shape.x + shape.w / 2
  const cy = shape.y + shape.h / 2
  const rx = Math.abs(shape.w) / 2
  const ry = Math.abs(shape.h) / 2
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  if (shape.fill) ctx.fill()
  ctx.stroke()
}
