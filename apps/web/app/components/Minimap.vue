<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { Camera, Point, Shape, WhiteboardDoc } from '../../shared/types/whiteboard'

const props = defineProps<{
  doc: WhiteboardDoc
  camera: Camera
  canvasSize: { width: number; height: number }
}>()

const miniCanvas = ref<HTMLCanvasElement | null>(null)
let raf = -1

const hasContent = computed(() => props.doc.order.length > 0)

const bounds = computed(() => {
  const ids = props.doc.order
  if (ids.length === 0) return null

  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (const id of ids) {
    const s = props.doc.shapes[id]
    if (!s) continue
    const b = getShapeBounds(s)
    minX = Math.min(minX, b.x)
    minY = Math.min(minY, b.y)
    maxX = Math.max(maxX, b.x + b.w)
    maxY = Math.max(maxY, b.y + b.h)
  }

  if (!Number.isFinite(minX)) return null

  const pad = 80
  return {
    x: minX - pad,
    y: minY - pad,
    w: (maxX - minX) + pad * 2,
    h: (maxY - minY) + pad * 2,
  }
})

const viewport = computed(() => {
  const cssWidth = props.canvasSize.width
  const cssHeight = props.canvasSize.height
  const invZoom = 1 / props.camera.zoom
  return {
    x: (-props.camera.x) * invZoom,
    y: (-props.camera.y) * invZoom,
    w: cssWidth * invZoom,
    h: cssHeight * invZoom,
  }
})

const draw = () => {
  const canvas = miniCanvas.value
  if (!canvas) return

  const b = bounds.value
  if (!b) {
    raf = -1
    return
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = globalThis.devicePixelRatio || 1
  const cssW = 180
  const cssH = 120
  canvas.width = Math.floor(cssW * dpr)
  canvas.height = Math.floor(cssH * dpr)
  canvas.style.width = `${cssW}px`
  canvas.style.height = `${cssH}px`

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, cssW, cssH)

  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.fillRect(0, 0, cssW, cssH)

  ctx.strokeStyle = 'rgba(0,0,0,0.12)'
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, cssW - 1, cssH - 1)

  const scale = Math.min(cssW / b.w, cssH / b.h)
  const ox = (cssW - b.w * scale) / 2
  const oy = (cssH - b.h * scale) / 2

  ctx.save()
  ctx.translate(ox, oy)
  ctx.scale(scale, scale)
  ctx.translate(-b.x, -b.y)

  ctx.strokeStyle = 'rgba(17,24,39,0.35)'
  ctx.lineWidth = 1 / scale

  for (const id of props.doc.order) {
    const s = props.doc.shapes[id]
    if (!s) continue
    drawShapeOutline(ctx, s)
  }

  const v = viewport.value
  ctx.strokeStyle = 'rgba(37,99,235,0.9)'
  ctx.lineWidth = 2 / scale
  ctx.strokeRect(v.x, v.y, v.w, v.h)

  ctx.restore()

  raf = requestAnimationFrame(draw)
}

onMounted(() => {
  if (hasContent.value) raf = requestAnimationFrame(draw)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
})

watch(() => props.camera, () => {
  if (raf === -1) raf = requestAnimationFrame(draw)
}, { deep: true })

watch(() => props.doc, () => {
  if (raf === -1) raf = requestAnimationFrame(draw)
}, { deep: true })

watch(hasContent, (value) => {
  if (!value) {
    if (raf !== -1) cancelAnimationFrame(raf)
    raf = -1
    return
  }

  if (raf === -1) raf = requestAnimationFrame(draw)
})

function getShapeBounds(shape: Shape): { x: number; y: number; w: number; h: number } {
  switch (shape.type) {
    case 'rectangle':
    case 'ellipse':
      return { x: shape.x, y: shape.y, w: shape.w, h: shape.h }
    case 'line':
    case 'arrow': {
      const x1 = Math.min(shape.a.x, shape.b.x)
      const y1 = Math.min(shape.a.y, shape.b.y)
      const x2 = Math.max(shape.a.x, shape.b.x)
      const y2 = Math.max(shape.a.y, shape.b.y)
      return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }
    }
    case 'pencil': {
      let minX = Number.POSITIVE_INFINITY
      let minY = Number.POSITIVE_INFINITY
      let maxX = Number.NEGATIVE_INFINITY
      let maxY = Number.NEGATIVE_INFINITY
      for (const p of shape.points) {
        minX = Math.min(minX, p.x)
        minY = Math.min(minY, p.y)
        maxX = Math.max(maxX, p.x)
        maxY = Math.max(maxY, p.y)
      }
      if (!Number.isFinite(minX)) return { x: 0, y: 0, w: 0, h: 0 }
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
    }
    case 'text':
      return { x: shape.x, y: shape.y - shape.fontSize, w: shape.text.length * (shape.fontSize * 0.6), h: shape.fontSize * 1.2 }
  }

  return { x: 0, y: 0, w: 0, h: 0 }
}

function drawShapeOutline(ctx: CanvasRenderingContext2D, shape: Shape) {
  switch (shape.type) {
    case 'rectangle':
    case 'ellipse':
      ctx.strokeRect(shape.x, shape.y, shape.w, shape.h)
      return
    case 'line':
    case 'arrow':
      ctx.beginPath()
      ctx.moveTo(shape.a.x, shape.a.y)
      ctx.lineTo(shape.b.x, shape.b.y)
      ctx.stroke()
      return
    case 'pencil': {
      const p0 = shape.points[0]
      if (!p0) return
      ctx.beginPath()
      ctx.moveTo(p0.x, p0.y)
      for (let i = 1; i < shape.points.length; i++) {
        const p = shape.points[i]!
        ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
      return
    }
    case 'text':
      ctx.strokeRect(shape.x, shape.y - shape.fontSize, shape.text.length * (shape.fontSize * 0.6), shape.fontSize * 1.2)
      return
  }
}
</script>

<template>
  <div v-if="hasContent" class="pointer-events-none select-none">
    <canvas ref="miniCanvas" class="rounded-lg shadow-lg border border-gray-200" />
  </div>
</template>
