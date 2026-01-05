import type { ShapeText } from '../../../../shared/types/whiteboard'

export function renderText(ctx: CanvasRenderingContext2D, shape: ShapeText) {
  ctx.fillStyle = shape.stroke
  ctx.font = `${shape.fontSize}px ui-sans-serif, system-ui, sans-serif`
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(shape.text, shape.x, shape.y)
}
