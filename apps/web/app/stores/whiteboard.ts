import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type { Point, Shape, ShapeId, ToolId, WhiteboardState, UiSettings } from '../../shared/types/whiteboard'
import { rectFromPoints } from '../utils/whiteboard/geometry'

type WhiteboardPage = {
  id: string
  name: string
  doc: WhiteboardState['doc']
  camera: WhiteboardState['camera']
}

const createEmptyDoc = (): WhiteboardState['doc'] => ({
  shapes: {},
  order: [],
})

const createDefaultCamera = (): WhiteboardState['camera'] => ({
  x: 0,
  y: 0,
  zoom: 1,
})

const clone = <T>(value: T): T => {
  if (typeof structuredClone === 'function') return structuredClone(value)
  return JSON.parse(JSON.stringify(value)) as T
}

export const useWhiteboardStore = defineStore('whiteboard', () => {
  const firstPageId = 'page-1'

  const state = reactive<WhiteboardState & { pages: WhiteboardPage[]; activePageId: string }>({
    doc: createEmptyDoc(),
    ui: {
      tool: 'select',
      selectedIds: new Set(),
      settings: {
        stroke: '#111827',
        fill: '#3b82f6',
        strokeWidth: 2,
        fontSize: 24,
        background: '#ffffff',
        showGrid: true,
      },
    },
    camera: createDefaultCamera(),
    pages: [
      {
        id: firstPageId,
        name: 'Page 1',
        doc: createEmptyDoc(),
        camera: createDefaultCamera(),
      },
    ],
    activePageId: firstPageId,
  })

  function setTool(tool: ToolId) {
    state.ui.tool = tool
    if (tool !== 'select') state.ui.selectedIds.clear()
  }

  function setUiSettings(patch: Partial<UiSettings>) {
    state.ui.settings = {
      ...state.ui.settings,
      ...patch,
    }
  }

  function addShape(shape: Shape) {
    state.doc.shapes[shape.id] = shape
    state.doc.order.push(shape.id)
  }

  function removeShape(id: ShapeId) {
    delete state.doc.shapes[id]
    state.doc.order = state.doc.order.filter((x: ShapeId) => x !== id)
    state.ui.selectedIds.delete(id)
  }

  function clearSelection() {
    state.ui.selectedIds.clear()
  }

  function saveActivePageSnapshot() {
    const idx = state.pages.findIndex((p) => p.id === state.activePageId)
    if (idx < 0) return
    state.pages[idx] = {
      ...state.pages[idx]!,
      doc: clone(state.doc),
      camera: clone(state.camera),
    }
  }

  function switchToPage(pageId: string) {
    if (pageId === state.activePageId) return
    saveActivePageSnapshot()

    const next = state.pages.find((p) => p.id === pageId)
    if (!next) return

    state.activePageId = pageId
    state.doc = clone(next.doc)
    state.camera = clone(next.camera)
    state.ui.selectedIds.clear()
  }

  function addPage(pageId: string) {
    saveActivePageSnapshot()

    const next: WhiteboardPage = {
      id: pageId,
      name: `Page ${state.pages.length + 1}`,
      doc: createEmptyDoc(),
      camera: createDefaultCamera(),
    }

    state.pages.push(next)
    state.activePageId = next.id
    state.doc = clone(next.doc)
    state.camera = clone(next.camera)
    state.ui.selectedIds.clear()
  }

  function renameActivePage(title: string) {
    const idx = state.pages.findIndex((p) => p.id === state.activePageId)
    if (idx < 0) return
    state.pages[idx] = {
      ...state.pages[idx]!,
      name: title,
    }
  }

  function selectOnly(id: ShapeId | null) {
    state.ui.selectedIds.clear()
    if (id) state.ui.selectedIds.add(id)
  }

  function panBy(dx: number, dy: number) {
    state.camera.x += dx
    state.camera.y += dy
  }

  function zoomAt(screen: Point, delta: number) {
    const prev = state.camera.zoom
    const next = Math.max(0.2, Math.min(4, prev * delta))
    const scale = next / prev
    state.camera.x = screen.x - (screen.x - state.camera.x) * scale
    state.camera.y = screen.y - (screen.y - state.camera.y) * scale
    state.camera.zoom = next
  }

  function updateRect(id: ShapeId, a: Point, b: Point) {
    const shape = state.doc.shapes[id]
    if (!shape) return
    if (shape.type !== 'rectangle' && shape.type !== 'ellipse') return
    const r = rectFromPoints(a, b)
    shape.x = r.x
    shape.y = r.y
    shape.w = r.w
    shape.h = r.h
  }

  function updateLineLike(id: ShapeId, a: Point, b: Point) {
    const shape = state.doc.shapes[id]
    if (!shape) return
    if (shape.type !== 'line' && shape.type !== 'arrow') return
    shape.a = a
    shape.b = b
  }

  return {
    state,
    setTool,
    setUiSettings,
    addShape,
    removeShape,
    clearSelection,
    selectOnly,
    panBy,
    zoomAt,
    updateRect,
    updateLineLike,
    saveActivePageSnapshot,
    switchToPage,
    addPage,
    renameActivePage,
  }
})
