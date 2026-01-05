import type { Point, ShapeId, ToolId, WhiteboardState } from '../../../shared/types/whiteboard'
import { hitTestTop, rectFromPoints, screenToWorld } from './geometry'
import type { Shape } from '../../../shared/types/whiteboard'

function createId(): ShapeId {
  return crypto.randomUUID()
}

type WhiteboardActions = {
  addShape: (shape: Shape) => void
  clearSelection: () => void
  panBy: (dx: number, dy: number) => void
  removeShape: (id: ShapeId) => void
  selectOnly: (id: ShapeId | null) => void
  updateLineLike: (id: ShapeId, a: Point, b: Point) => void
  updateRect: (id: ShapeId, a: Point, b: Point) => void
  zoomAt: (screen: Point, delta: number) => void
}

export type { WhiteboardActions }

type PointerPhase = 'idle' | 'dragging'

export type Session = {
  phase: PointerPhase
  startScreen: Point | null
  startWorld: Point | null
  lastScreen: Point | null
  activeShapeId: ShapeId | null
}

export function createSession(): Session {
  return {
    phase: 'idle',
    startScreen: null,
    startWorld: null,
    lastScreen: null,
    activeShapeId: null,
  }
}

export function onPointerDown(state: WhiteboardState, session: Session, screen: Point, event: PointerEvent, actions: WhiteboardActions) {
  session.phase = 'dragging'
  session.startScreen = screen
  session.lastScreen = screen
  session.startWorld = screenToWorld(screen, state.camera)

  const tool = state.ui.tool

  if (tool === 'pan') {
    return
  }

  if (tool === 'zoom') {
    const factor = event.shiftKey ? 0.9 : 1.1
    actions.zoomAt(screen, factor)
    session.phase = 'idle'
    return
  }

  if (tool === 'select') {
    const hit = hitTestTop(state.doc, session.startWorld)
    actions.selectOnly(hit)
    return
  }

  if (tool === 'eraser') {
    const hit = hitTestTop(state.doc, session.startWorld)
    if (hit) actions.removeShape(hit)
    session.phase = 'idle'
    return
  }

  const id = createId()
  session.activeShapeId = id

  const settings = state.ui.settings

  if (tool === 'pencil') {
    actions.addShape({
      id,
      type: 'pencil',
      points: [session.startWorld],
      stroke: settings.stroke,
      fill: null,
      strokeWidth: settings.strokeWidth,
    })
    actions.clearSelection()
    return
  }

  if (tool === 'line') {
    actions.addShape({
      id,
      type: 'line',
      a: session.startWorld,
      b: session.startWorld,
      stroke: settings.stroke,
      fill: null,
      strokeWidth: settings.strokeWidth,
    })
    actions.clearSelection()
    return
  }

  if (tool === 'arrow') {
    actions.addShape({
      id,
      type: 'arrow',
      a: session.startWorld,
      b: session.startWorld,
      stroke: settings.stroke,
      fill: null,
      strokeWidth: settings.strokeWidth,
    })
    actions.clearSelection()
    return
  }

  if (tool === 'rectangle') {
    const r = rectFromPoints(session.startWorld, session.startWorld)
    actions.addShape({
      id,
      type: 'rectangle',
      ...r,
      stroke: settings.stroke,
      fill: settings.fill,
      strokeWidth: settings.strokeWidth,
    })
    actions.clearSelection()
    return
  }

  if (tool === 'ellipse') {
    const r = rectFromPoints(session.startWorld, session.startWorld)
    actions.addShape({
      id,
      type: 'ellipse',
      ...r,
      stroke: settings.stroke,
      fill: settings.fill,
      strokeWidth: settings.strokeWidth,
    })
    actions.clearSelection()
    return
  }

  if (tool === 'text') {
    actions.addShape({
      id,
      type: 'text',
      x: session.startWorld.x,
      y: session.startWorld.y,
      text: 'Text',
      fontSize: settings.fontSize,
      stroke: settings.stroke,
      fill: null,
      strokeWidth: 1,
    })
    actions.selectOnly(id)
    session.phase = 'idle'
    return
  }
}

export function onPointerMove(state: WhiteboardState, session: Session, screen: Point, actions: WhiteboardActions) {
  if (session.phase !== 'dragging') return
  const tool: ToolId = state.ui.tool
  const prev = session.lastScreen
  session.lastScreen = screen

  if (tool === 'pan') {
    if (!prev) return
    actions.panBy(screen.x - prev.x, screen.y - prev.y)
    return
  }

  const world = screenToWorld(screen, state.camera)

  if (tool === 'pencil') {
    const id = session.activeShapeId
    if (!id) return
    const shape = state.doc.shapes[id]
    if (!shape || shape.type !== 'pencil') return
    shape.points.push(world)
    return
  }

  if (tool === 'line' || tool === 'arrow') {
    const id = session.activeShapeId
    if (!id || !session.startWorld) return
    actions.updateLineLike(id, session.startWorld, world)
    return
  }

  if (tool === 'rectangle' || tool === 'ellipse') {
    const id = session.activeShapeId
    if (!id || !session.startWorld) return
    actions.updateRect(id, session.startWorld, world)
    return
  }
}

export function onPointerUp(session: Session) {
  session.phase = 'idle'
  session.startScreen = null
  session.startWorld = null
  session.lastScreen = null
  session.activeShapeId = null
}

export function onWheel(state: WhiteboardState, event: WheelEvent, screen: Point, actions: WhiteboardActions) {
  if (event.ctrlKey) {
    const delta = event.deltaY < 0 ? 1.08 : 0.92
    actions.zoomAt(screen, delta)
  } else {
    actions.panBy(-event.deltaX, -event.deltaY)
  }
}
