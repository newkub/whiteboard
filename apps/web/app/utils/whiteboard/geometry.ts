import type { Camera, Point, Shape, ShapeId } from '../../../shared/types/whiteboard'

export function screenToWorld(p: Point, camera: Camera): Point {
  return {
    x: (p.x - camera.x) / camera.zoom,
    y: (p.y - camera.y) / camera.zoom,
  }
}

export function worldToScreen(p: Point, camera: Camera): Point {
  return {
    x: p.x * camera.zoom + camera.x,
    y: p.y * camera.zoom + camera.y,
  }
}

export function distance(a: Point, b: Point): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.hypot(dx, dy)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function rectFromPoints(a: Point, b: Point): { x: number; y: number; w: number; h: number } {
  const x1 = Math.min(a.x, b.x)
  const y1 = Math.min(a.y, b.y)
  const x2 = Math.max(a.x, b.x)
  const y2 = Math.max(a.y, b.y)
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }
}

export function pointInRect(p: Point, r: { x: number; y: number; w: number; h: number }): boolean {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h
}

export function hitTestShape(shape: Shape, p: Point, tolerance = 6): boolean {
  switch (shape.type) {
    case 'rectangle': {
      const expanded = {
        x: shape.x - tolerance,
        y: shape.y - tolerance,
        w: shape.w + tolerance * 2,
        h: shape.h + tolerance * 2,
      }
      return pointInRect(p, expanded)
    }
    case 'ellipse': {
      const cx = shape.x + shape.w / 2
      const cy = shape.y + shape.h / 2
      const rx = Math.max(1, Math.abs(shape.w) / 2)
      const ry = Math.max(1, Math.abs(shape.h) / 2)
      const nx = (p.x - cx) / rx
      const ny = (p.y - cy) / ry
      return nx * nx + ny * ny <= 1 + tolerance / 100
    }
    case 'line':
    case 'arrow': {
      return distancePointToSegment(p, shape.a, shape.b) <= tolerance
    }
    case 'pencil': {
      for (let i = 1; i < shape.points.length; i++) {
        if (distancePointToSegment(p, shape.points[i - 1]!, shape.points[i]!) <= tolerance) return true
      }
      return false
    }
    case 'text': {
      const r = { x: shape.x, y: shape.y - shape.fontSize, w: shape.text.length * (shape.fontSize * 0.6), h: shape.fontSize * 1.2 }
      const expanded = {
        x: r.x - tolerance,
        y: r.y - tolerance,
        w: r.w + tolerance * 2,
        h: r.h + tolerance * 2,
      }
      return pointInRect(p, expanded)
    }
  }
}

export function hitTestTop(doc: { order: ShapeId[]; shapes: Record<ShapeId, Shape> }, p: Point): ShapeId | null {
  for (let i = doc.order.length - 1; i >= 0; i--) {
    const id = doc.order[i]!
    const shape = doc.shapes[id]
    if (!shape) continue
    if (hitTestShape(shape, p)) return id
  }
  return null
}

export function distancePointToSegment(p: Point, a: Point, b: Point): number {
  const vx = b.x - a.x
  const vy = b.y - a.y
  const wx = p.x - a.x
  const wy = p.y - a.y
  const c1 = vx * wx + vy * wy
  if (c1 <= 0) return distance(p, a)
  const c2 = vx * vx + vy * vy
  if (c2 <= c1) return distance(p, b)
  const t = c1 / c2
  return distance(p, { x: a.x + t * vx, y: a.y + t * vy })
}
