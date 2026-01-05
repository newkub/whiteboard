import type { Ref } from 'vue'
import type { Point, WhiteboardState } from '../../../shared/types/whiteboard'
import { createSession } from '~/utils/whiteboard/tools'
import { getScreenPoint as getCanvasScreenPoint } from '~/composables/core/whiteboardCanvas2d'
import { createCanvasBindings } from '~/composables/core/whiteboardCanvasBindings'
import { createInputHandlers } from '~/composables/core/whiteboardRuntime'
import { useWhiteboardStore } from '~/stores/whiteboard'

type WhiteboardStore = ReturnType<typeof useWhiteboardStore>

export type UseWhiteboardInputDeps = {
  canvasRef: Ref<HTMLCanvasElement | null>
  state: Ref<WhiteboardState>
  actions: WhiteboardStore
  onResize: () => void
}

export function useWhiteboardInput(deps: UseWhiteboardInputDeps) {
  const { canvasRef, state, actions, onResize } = deps
  const session = createSession()

  const getScreenPoint = (event: PointerEvent | WheelEvent): Point => {
    const canvas = canvasRef.value
    if (!canvas) return { x: 0, y: 0 }
    return getCanvasScreenPoint(canvas, event)
  }

  const inputHandlers = createInputHandlers({
    getCanvas: () => canvasRef.value,
    getState: () => state.value,
    actions,
    session,
    getScreenPoint,
    onDevPointerDownLog: import.meta.dev
      ? (data) => {
          console.log('[whiteboard] pointerdown', data)
        }
      : undefined,
  })

  const canvasBindings = createCanvasBindings({
    inputHandlers,
    onResize,
  })

  const rebindCanvas = (prevCanvas: HTMLCanvasElement, nextCanvas: HTMLCanvasElement) => {
    canvasBindings.unbindCanvas(prevCanvas)
    canvasBindings.bindCanvas(nextCanvas)
  }

  const bindInputEvents = () => {
    const canvas = canvasRef.value
    if (!canvas) return
    canvasBindings.bindCanvas(canvas)
    if (process.client) {
      window.addEventListener('resize', onResize)
    }
  }

  const unbindInputEvents = () => {
    const canvas = canvasRef.value
    if (canvas) {
      canvasBindings.unbindCanvas(canvas)
    }
    if (process.client) {
      window.removeEventListener('resize', onResize)
    }
    canvasBindings.dispose()
  }

  return {
    rebindCanvas,
    bindInputEvents,
    unbindInputEvents,
  }
}
