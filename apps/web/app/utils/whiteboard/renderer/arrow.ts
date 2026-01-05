import type { ShapeArrow } from '../../../../shared/types/whiteboard'

function drawArrowHead(ctx: CanvasRenderingContext2D, a: { x: number; y: number }, b: { x: number; y: number }) {
  const angle = Math.atan2(b.y - a.y, b.x - a.x)
  const size = 10
  ctx.beginPath()
  ctx.moveTo(b.x, b.y)
  ctx.lineTo(b.x - size * Math.cos(angle - Math.PI / 6), b.y - size * Math.sin(angle - Math.PI / 6))
  ctx.lineTo(b.x - size * Math.cos(angle + Math.PI / 6), b.y - size * Math.sin(angle + Math.PI / 6))
  ctx.closePath()
  ctx.fillStyle = ctx.strokeStyle
  ctx.fill()
}

export function renderArrow(ctx: CanvasRenderingContext2D, shape: ShapeArrow) {
  ctx.beginPath()
  ctx.moveTo(shape.a.x, shape.a.y)
  ctx.lineTo(shape.b.x, shape.b.y)
  ctx.stroke()
  drawArrowHead(ctx, shape.a, shape.b)
}
