import { render } from '../../utils/whiteboard/renderer'
import type { Point, WhiteboardState, ToolId } from '../../../shared/types/whiteboard'
import type { Session } from '../../utils/whiteboard/tools'
import type { WhiteboardActions } from '../../utils/whiteboard/tools'
import { onPointerDown, onPointerMove, onPointerUp, onWheel } from '../../utils/whiteboard/tools'

export type GpuClient = {
  draw(): unknown
  resize(width: number, height: number): unknown
  free?: () => unknown
  reset?: () => unknown
  setAutoRotate?: (enabled: boolean) => unknown
}

export type RenderLoopDeps = {
  getCtx: () => CanvasRenderingContext2D | null
  getGpuClient: () => GpuClient | null
  getState: () => WhiteboardState
  onBeforeFrame?: () => unknown
  onStarted?: (info: { hasCtx: boolean; hasGpuClient: boolean }) => unknown
}

export const createRenderLoop = (deps: RenderLoopDeps) => {
  let animationFrameId = -1

  const loop = () => {
    deps.onBeforeFrame?.()
    const gpuClient = deps.getGpuClient()
    if (gpuClient) {
      gpuClient.draw()
    } else {
      const ctx = deps.getCtx()
      if (ctx) {
        const state = deps.getState()
        render(
          ctx,
          state.doc,
          state.camera,
          {
            background: state.ui.settings.background,
            showGrid: state.ui.settings.showGrid,
          },
          state.ui.selectedIds,
        )
      }
    }
    animationFrameId = requestAnimationFrame(loop)
  }

  const start = () => {
    deps.onStarted?.({
      hasCtx: Boolean(deps.getCtx()),
      hasGpuClient: Boolean(deps.getGpuClient()),
    })
    loop()
  }

  const stop = () => {
    cancelAnimationFrame(animationFrameId)
  }

  return {
    start,
    stop,
  }
}

export type InputHandlersDeps = {
  getCanvas: () => HTMLCanvasElement | null
  getState: () => WhiteboardState
  actions: WhiteboardActions
  session: Session
  getScreenPoint: (event: PointerEvent | WheelEvent) => Point
  onDevPointerDownLog?: (data: { tool: ToolId; point: Point }) => unknown
}

export const createInputHandlers = (deps: InputHandlersDeps) => {
  let isMiddlePanning = false
  let lastMiddlePanPoint: Point | null = null

  const safeSetPointerCapture = (canvas: HTMLCanvasElement, pointerId: number) => {
    try {
      if (!canvas.isConnected) return
      canvas.setPointerCapture(pointerId)
    } catch {
      // ignore: canvas may have been replaced/disconnected during mode switch
    }
  }

  const handlePointerDown = (event: PointerEvent) => {
    const canvas = deps.getCanvas()
    if (!canvas) return

    if (event.button === 1) {
      event.preventDefault()
      isMiddlePanning = true
      lastMiddlePanPoint = deps.getScreenPoint(event)
      safeSetPointerCapture(canvas, event.pointerId)
      return
    }

    const state = deps.getState()
    deps.onDevPointerDownLog?.({ tool: state.ui.tool, point: deps.getScreenPoint(event) })

    safeSetPointerCapture(canvas, event.pointerId)
    onPointerDown(state, deps.session, deps.getScreenPoint(event), event, deps.actions)
  }

  const handlePointerMove = (event: PointerEvent) => {
    const state = deps.getState()

    if (isMiddlePanning) {
      const next = deps.getScreenPoint(event)
      const prev = lastMiddlePanPoint
      lastMiddlePanPoint = next
      if (prev) deps.actions.panBy(next.x - prev.x, next.y - prev.y)
      return
    }

    onPointerMove(state, deps.session, deps.getScreenPoint(event), deps.actions)
  }

  const handlePointerUp = () => {
    if (isMiddlePanning) {
      isMiddlePanning = false
      lastMiddlePanPoint = null
      return
    }

    onPointerUp(deps.session)
  }

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault()
    const state = deps.getState()
    onWheel(state, event, deps.getScreenPoint(event), deps.actions)
  }

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
  }
}
