<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { render } from '../utils/whiteboard/renderer'
import type { Camera, Shape, WhiteboardDoc } from '../../shared/types/whiteboard'

export type PageModel = {
  id: string
  name: string
  doc: WhiteboardDoc
  camera: Camera
}

const props = defineProps<{
  pages: ReadonlyArray<PageModel>
  activePageId: string
}>()

const emit = defineEmits<{
  (e: 'select', pageId: string): unknown
  (e: 'add'): unknown
}>()

const previewCanvasById = new Map<string, HTMLCanvasElement>()
let scheduled = -1

const activeIndex = computed(() => props.pages.findIndex((p) => p.id === props.activePageId))

const getShapeBounds = (shape: Shape): { x: number; y: number; w: number; h: number } => {
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

const getDocBounds = (doc: WhiteboardDoc) => {
  if (doc.order.length === 0) return null
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (const id of doc.order) {
    const s = doc.shapes[id]
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
}

const computePreviewCamera = (doc: WhiteboardDoc, cssW: number, cssH: number): Camera => {
  const b = getDocBounds(doc)
  if (!b) {
    return { x: cssW / 2, y: cssH / 2, zoom: 1 }
  }

  const zoom = Math.min(cssW / b.w, cssH / b.h)
  const centerX = b.x + b.w / 2
  const centerY = b.y + b.h / 2

  return {
    zoom,
    x: cssW / 2 - centerX * zoom,
    y: cssH / 2 - centerY * zoom,
  }
}

const drawPreviews = async () => {
  await nextTick()

  const dpr = globalThis.devicePixelRatio || 1
  const cssW = 160
  const cssH = 100

  for (const p of props.pages) {
    const canvas = previewCanvasById.get(p.id)
    if (!canvas) continue

    canvas.width = Math.floor(cssW * dpr)
    canvas.height = Math.floor(cssH * dpr)
    canvas.style.width = `${cssW}px`
    canvas.style.height = `${cssH}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) continue

    const cam = computePreviewCamera(p.doc, cssW, cssH)
    render(
      ctx,
      p.doc,
      cam,
      {
        background: '#ffffff',
        showGrid: false,
      },
      new Set(),
    )
  }
}

const scheduleDraw = () => {
  if (scheduled !== -1) return
  scheduled = requestAnimationFrame(() => {
    scheduled = -1
    drawPreviews().catch((error) => {
      console.error('[pages] preview draw failed', error)
    })
  })
}

onBeforeUnmount(() => {
  if (scheduled !== -1) cancelAnimationFrame(scheduled)
  scheduled = -1
})

watch(
  () => props.pages,
  () => {
    scheduleDraw()
  },
  { deep: true },
)

watch(
  () => props.activePageId,
  () => {
    scheduleDraw()
  },
)

const setPreviewRef = (pageId: string) => (el: Element | ComponentPublicInstance | null) => {
  if (!el) {
    previewCanvasById.delete(pageId)
    return
  }

  if (!(el instanceof HTMLCanvasElement)) return
  previewCanvasById.set(pageId, el)
  scheduleDraw()
}
</script>

<template>
  <aside class="pointer-events-auto h-full w-[240px] bg-white/90 backdrop-blur border-r border-gray-200 flex flex-col">
    <div class="h-14 px-3 flex items-center justify-between border-b border-gray-200">
      <div class="text-sm font-medium text-gray-900">Pages</div>
      <button
        class="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100"
        type="button"
        title="New page"
        @click="emit('add')"
      >
        <Icon name="mdi:plus" class="w-5 h-5 text-gray-700" />
      </button>
    </div>

    <div class="flex-1 overflow-auto p-2">
      <button
        v-for="(p, idx) in pages"
        :key="p.id"
        class="w-full mb-2 rounded-xl border text-left overflow-hidden"
        :class="p.id === activePageId ? 'border-blue-300 ring-2 ring-blue-100 bg-blue-50/40' : 'border-gray-200 hover:bg-gray-50'"
        type="button"
        @click="emit('select', p.id)"
      >
        <div class="p-2">
          <div class="flex items-center gap-2">
            <div class="text-xs text-gray-500 w-6 text-right">{{ idx + 1 }}</div>
            <div class="text-sm font-medium text-gray-900 truncate">{{ p.name }}</div>
            <div class="flex-1" />
            <div v-if="idx === activeIndex" class="text-[11px] text-blue-700">Active</div>
          </div>

          <div class="mt-2 rounded-lg border border-gray-200 bg-white">
            <canvas :ref="setPreviewRef(p.id)" class="block" />
          </div>
        </div>
      </button>
    </div>
  </aside>
</template>
