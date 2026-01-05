import type { Ref } from 'vue'
import { createRenderLoop } from '~/composables/core/whiteboardRuntime'
import type { GpuClient } from '~/composables/core/whiteboardRuntime'
import type { WhiteboardState } from '../../../shared/types/whiteboard'
import type { WhiteboardMode } from '~/types/whiteboard'

export type UseWhiteboardRenderDeps = {
  ctx: Ref<CanvasRenderingContext2D | null>
  gpuClient: Ref<GpuClient | null>
  state: Ref<WhiteboardState>
  mode: Ref<WhiteboardMode>
  onEnsure2dReady: () => void
}

export function useWhiteboardRender(deps: UseWhiteboardRenderDeps) {
  const { ctx, gpuClient, state, mode, onEnsure2dReady } = deps
  let hasLoggedFirstFrame = false

  const renderLoop = createRenderLoop({
    getCtx: () => ctx.value,
    getGpuClient: () => gpuClient.value,
    getState: () => state.value,
    onBeforeFrame: () => {
      if (mode.value !== '2d') return
      if (gpuClient.value) return
      if (ctx.value) return
      onEnsure2dReady()
    },
    onStarted: (info) => {
      if (import.meta.dev && !hasLoggedFirstFrame) {
        hasLoggedFirstFrame = true
        console.log('[whiteboard] renderLoop started', info)
      }
    },
  })

  return {
    startRenderLoop: renderLoop.start,
    stopRenderLoop: renderLoop.stop,
  }
}
