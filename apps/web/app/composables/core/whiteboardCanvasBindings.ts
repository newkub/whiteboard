export type CanvasInputHandlers = {
  handlePointerDown: (event: PointerEvent) => unknown
  handlePointerMove: (event: PointerEvent) => unknown
  handlePointerUp: (event: PointerEvent) => unknown
  handleWheel: (event: WheelEvent) => unknown
}

export type CanvasBindings = {
  resizeObserver: ResizeObserver | null
  bindCanvas: (canvas: HTMLCanvasElement) => void
  unbindCanvas: (canvas: HTMLCanvasElement) => void
  dispose: () => void
}

export const createCanvasBindings = (deps: {
  inputHandlers: CanvasInputHandlers
  onResize: () => void
}): CanvasBindings => {
  const resizeObserver =
    process.client && 'ResizeObserver' in globalThis
      ? new ResizeObserver(() => {
          deps.onResize()
        })
      : null

  const bindCanvas = (canvas: HTMLCanvasElement) => {
    canvas.addEventListener('pointerdown', deps.inputHandlers.handlePointerDown)
    canvas.addEventListener('pointermove', deps.inputHandlers.handlePointerMove)
    canvas.addEventListener('pointerup', deps.inputHandlers.handlePointerUp)
    canvas.addEventListener('pointercancel', deps.inputHandlers.handlePointerUp)
    canvas.addEventListener('wheel', deps.inputHandlers.handleWheel, { passive: false })

    resizeObserver?.observe(canvas)
  }

  const unbindCanvas = (canvas: HTMLCanvasElement) => {
    canvas.removeEventListener('pointerdown', deps.inputHandlers.handlePointerDown)
    canvas.removeEventListener('pointermove', deps.inputHandlers.handlePointerMove)
    canvas.removeEventListener('pointerup', deps.inputHandlers.handlePointerUp)
    canvas.removeEventListener('pointercancel', deps.inputHandlers.handlePointerUp)
    canvas.removeEventListener('wheel', deps.inputHandlers.handleWheel)

    resizeObserver?.unobserve(canvas)
  }

  const dispose = () => {
    resizeObserver?.disconnect()
  }

  return {
    resizeObserver,
    bindCanvas,
    unbindCanvas,
    dispose,
  }
}
