import type { ShapePencil } from '../../../../shared/types/whiteboard'

export function renderPencil(ctx: CanvasRenderingContext2D, shape: ShapePencil) {
  ctx.beginPath()
  const p0 = shape.points[0]
  if (!p0) return
  ctx.moveTo(p0.x, p0.y)
  for (let i = 1; i < shape.points.length; i++) {
    const p = shape.points[i]!
    ctx.lineTo(p.x, p.y)
  }
  ctx.stroke()
}
