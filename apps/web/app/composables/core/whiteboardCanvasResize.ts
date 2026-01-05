export type CanvasCssSize = Readonly<{ width: number; height: number }>

type ResizeResult = {
  cssSize: CanvasCssSize
  pixelSize: Readonly<{ width: number; height: number }>
  dpr: number
}

export const resizeCanvasToElement = (canvas: HTMLCanvasElement): ResizeResult => {
  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1

  const width = Math.max(1, Math.floor(rect.width * dpr))
  const height = Math.max(1, Math.floor(rect.height * dpr))

  canvas.width = width
  canvas.height = height

  return {
    cssSize: { width: rect.width, height: rect.height },
    pixelSize: { width, height },
    dpr,
  }
}
