import { ref } from 'vue'
import type { Ref } from 'vue'
import type { GpuClient } from '~/composables/core/whiteboardRuntime'
import { createWasmGpuClient } from '~/composables/core/whiteboardWasmClient'
import type { WhiteboardEngine, WhiteboardMode } from '~/types/whiteboard'

export type UseWasmGpuClientDeps = {
  canvasRef: Ref<HTMLCanvasElement | null>
  onFallback: () => void
}

export const useWasmGpuClient = (deps: UseWasmGpuClientDeps) => {
  const gpuClient = ref<GpuClient | null>(null)
  const engine = ref<WhiteboardEngine>('fallback-2d')
  let requestId = 0

  const initialize = async (mode: WhiteboardMode) => {
    const currentRequestId = ++requestId
    const canvas = deps.canvasRef.value
    if (!canvas) return

    if (mode === '2d' || !('gpu' in globalThis.navigator)) {
      if (gpuClient.value?.free) gpuClient.value.free()
      gpuClient.value = null
      engine.value = 'fallback-2d'
      deps.onFallback()
      return
    }

    try {
      const created = await createWasmGpuClient(canvas, mode)
      if (currentRequestId !== requestId) {
        created?.client?.free?.()
        return
      }

      if (!created) {
        gpuClient.value = null
        engine.value = 'fallback-2d'
        deps.onFallback()
        return
      }

      gpuClient.value = created.client
      engine.value = created.engine
    } catch (e) {
      console.error('Failed to initialize WebGPU client, falling back to 2D:', e)
      gpuClient.value = null
      engine.value = 'fallback-2d'
      deps.onFallback()
    }
  }

  const destroy = () => {
    requestId++
    if (gpuClient.value?.free) gpuClient.value.free()
    gpuClient.value = null
  }

  return {
    gpuClient,
    engine,
    initialize,
    destroy,
  }
}
