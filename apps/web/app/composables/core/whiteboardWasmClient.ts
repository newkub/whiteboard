export type GpuClient = {
  draw(): unknown
  resize(width: number, height: number): unknown
  free?: () => unknown
  reset?: () => unknown
  setAutoRotate?: (enabled: boolean) => unknown
}

export type WhiteboardMode = '2d' | '3d'
export type WhiteboardEngine = 'wasm-2d' | 'wasm-3d'

const resetCanvasContextForWebGpu = (canvas: HTMLCanvasElement) => {
  const w = canvas.width
  const h = canvas.height
  canvas.width = 1
  canvas.height = 1
  canvas.width = w
  canvas.height = h
}

export const createWasmGpuClient = async (canvas: HTMLCanvasElement, mode: WhiteboardMode) => {
  if (!(globalThis.navigator && 'gpu' in globalThis.navigator)) return null

  resetCanvasContextForWebGpu(canvas)

  const mod = await import('canvas')
  await mod.default()

  const client: GpuClient = mode === '3d'
    ? await mod.createClient3d(canvas)
    : await mod.createClient(canvas)

  const engine: WhiteboardEngine = mode === '3d' ? 'wasm-3d' : 'wasm-2d'

  return { client, engine }
}
