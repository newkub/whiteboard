import { onMounted, onUnmounted, ref } from 'vue'
import type { Ref } from 'vue'

export type UseCommandPaletteToggleApi = {
  open: Ref<boolean>
  close: () => unknown
  toggle: () => unknown
}

export const useCommandPaletteToggle = (): UseCommandPaletteToggleApi => {
  const open = ref(false)

  const close = () => {
    open.value = false
  }

  const toggle = () => {
    open.value = !open.value
  }

  const onWindowKeydown = (e: KeyboardEvent) => {
    if (e.ctrlKey && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault()
      toggle()
    }
  }

  onMounted(() => {
    globalThis.window?.addEventListener('keydown', onWindowKeydown)
  })

  onUnmounted(() => {
    globalThis.window?.removeEventListener('keydown', onWindowKeydown)
  })

  return { open, close, toggle }
}
