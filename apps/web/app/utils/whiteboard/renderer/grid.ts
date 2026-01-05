import type { Camera } from '../../../../shared/types/whiteboard'

export function renderGrid(ctx: CanvasRenderingContext2D, camera: Camera, width: number, height: number) {
  const gridSize = 50
  const invZoom = 1 / camera.zoom
  const left = -camera.x * invZoom
  const top = -camera.y * invZoom
  const right = left + width * invZoom
  const bottom = top + height * invZoom

  const startX = Math.floor(left / gridSize) * gridSize
  const startY = Math.floor(top / gridSize) * gridSize

  ctx.save()
  ctx.strokeStyle = 'rgba(0,0,0,0.06)'
  ctx.lineWidth = 1

  for (let x = startX; x <= right; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, top)
    ctx.lineTo(x, bottom)
    ctx.stroke()
  }

  for (let y = startY; y <= bottom; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(left, y)
    ctx.lineTo(right, y)
    ctx.stroke()
  }

  ctx.restore()
}
