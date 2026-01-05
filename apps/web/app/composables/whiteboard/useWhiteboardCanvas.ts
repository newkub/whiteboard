import type { Ref } from 'vue'
import { ensure2dContext } from '~/composables/core/whiteboardCanvas2d'
import { resizeCanvasToElement } from '~/composables/core/whiteboardCanvasResize'

export type UseWhiteboardCanvasDeps = {
  canvasRef: Ref<HTMLCanvasElement | null>
  onRebindCanvas: (prevCanvas: HTMLCanvasElement, nextCanvas: HTMLCanvasElement) => void
}

export function useWhiteboardCanvas(deps: UseWhiteboardCanvasDeps) {
  const { canvasRef, onRebindCanvas } = deps
  const canvasCssSize = ref({ width: 0, height: 0 })
  const ctx = ref<CanvasRenderingContext2D | null>(null)

  const ensure2dCanvasContext = () => {
    const canvas = canvasRef.value
    if (!canvas) return
    ctx.value = ensure2dContext(canvas)
  }

  const resizeCanvas = () => {
    const canvas = canvasRef.value
    if (!canvas) return { cssSize: { width: 0, height: 0 }, dpr: 1 }

    const result = resizeCanvasToElement(canvas)
    canvasCssSize.value = result.cssSize

    if (import.meta.dev) {
      console.log('[whiteboard] resizeCanvas', {
        rect: { width: result.cssSize.width, height: result.cssSize.height },
        dpr: result.dpr,
      })
    }
    return result
  }

  const recreateCanvasElement = (): HTMLCanvasElement | null => {
    const canvas = canvasRef.value
    if (!canvas) return null

    const parent = canvas.parentElement
    if (!parent) return null

    const nextCanvas = canvas.cloneNode(false) as HTMLCanvasElement
    nextCanvas.width = canvas.width
    nextCanvas.height = canvas.height

    canvas.replaceWith(nextCanvas)
    canvasRef.value = nextCanvas

    onRebindCanvas(canvas, nextCanvas)

    // A fresh canvas is required for WebGPU after a 2D context has been created.
    ctx.value = null
    return nextCanvas
  }

  const ensure2dReady = () => {
    ensure2dCanvasContext()
    if (ctx.value) return

    // If 2D context creation still fails (can happen after WebGPU), retry with a fresh canvas.
    recreateCanvasElement()
    resizeCanvas()
    ensure2dCanvasContext()
  }

  const initCanvas = async () => {
    const canvas = canvasRef.value
    if (!canvas) return

    canvas.style.touchAction = 'none'

    await nextTick()
    await new Promise<undefined>((resolve) => requestAnimationFrame(() => resolve(undefined)))
    resizeCanvas()
  }

  return {
    canvasCssSize,
    ctx,
    ensure2dCanvasContext,
    resizeCanvas,
    recreateCanvasElement,
    ensure2dReady,
    initCanvas,
  }
}
