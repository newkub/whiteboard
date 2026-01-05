import type { Point } from '../../../shared/types/whiteboard'

export const getScreenPoint = (canvas: HTMLCanvasElement, event: PointerEvent | WheelEvent): Point => {
  const rect = canvas.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

export const ensure2dContext = (canvas: HTMLCanvasElement): CanvasRenderingContext2D | null => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  return ctx
}
