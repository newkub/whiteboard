import type { Ref } from 'vue'
import type { GpuClient } from '~/composables/core/whiteboardRuntime'
import type { WhiteboardEngine, WhiteboardMode } from '~/types/whiteboard'
import { useWasmGpuClient } from '~/composables/whiteboard/useWasmGpuClient'

export type WasmModeManagerDeps = {
  canvasRef: Ref<HTMLCanvasElement | null>
  mode: Ref<WhiteboardMode>
  engine: Ref<WhiteboardEngine>
  autoRotate3d: Ref<boolean>
  ctx: Ref<CanvasRenderingContext2D | null>
  gpuClient: Ref<GpuClient | null>
  ensure2dCanvasContext: () => void
  ensure2dReady: () => void
  resizeCanvas: () => void
  recreateCanvasElement: () => HTMLCanvasElement | null
}

export const createWasmModeManager = (deps: WasmModeManagerDeps) => {
  let isTryingWasm = true

  const wasmGpu = useWasmGpuClient({
    canvasRef: deps.canvasRef,
    onFallback: () => {
      deps.ensure2dCanvasContext()
    },
  })

  const setMode = async (nextMode: WhiteboardMode) => {
    if (deps.mode.value === nextMode) return

    const prevMode = deps.mode.value
    const hadGpuClient = deps.gpuClient.value !== null

    deps.mode.value = nextMode

    if (nextMode === '2d') {
      wasmGpu.destroy()
      isTryingWasm = false

      if (prevMode === '3d' || hadGpuClient) {
        deps.recreateCanvasElement()
      }

      deps.engine.value = 'fallback-2d'
      deps.resizeCanvas()
      deps.ensure2dReady()
      return
    }

    const params = new URLSearchParams(globalThis.location?.search ?? '')
    if (params.get('webgpu') === '0') {
      isTryingWasm = false
      deps.engine.value = 'fallback-2d'
      deps.ensure2dCanvasContext()
      return
    }

    isTryingWasm = true

    if (deps.ctx.value) {
      deps.recreateCanvasElement()
    }

    wasmGpu.destroy()
    deps.resizeCanvas()
    await wasmGpu.initialize(nextMode)

    deps.gpuClient.value = wasmGpu.gpuClient.value
    deps.engine.value = wasmGpu.engine.value
  }

  const reset3d = () => {
    if (deps.mode.value !== '3d') return
    deps.gpuClient.value?.reset?.()
  }

  const toggleAutoRotate3d = () => {
    deps.autoRotate3d.value = !deps.autoRotate3d.value
    if (deps.mode.value !== '3d') return
    deps.gpuClient.value?.setAutoRotate?.(deps.autoRotate3d.value)
  }

  const initWasmForInitialMode = async (initialMode: WhiteboardMode) => {
    isTryingWasm = true
    await wasmGpu.initialize(initialMode)
    deps.gpuClient.value = wasmGpu.gpuClient.value
    deps.engine.value = wasmGpu.engine.value
    isTryingWasm = deps.gpuClient.value !== null
  }

  return {
    setMode,
    reset3d,
    toggleAutoRotate3d,
    getIsTryingWasm: () => isTryingWasm,
    initWasmForInitialMode,
    markNotTryingWasm: () => {
      isTryingWasm = false
    },
  }
}

