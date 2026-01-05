import { useWhiteboardStore } from '~/stores/whiteboard'
import type { UseWhiteboardApi } from '~/composables/useWhiteboard'

export function useContextMenu(store: ReturnType<typeof useWhiteboardStore>, whiteboardApi: UseWhiteboardApi) {
  const { setTool, removeShape, clearSelection, zoomAt } = whiteboardApi

  const ctxMenuOpen = ref(false)
  const ctxMenuX = ref(0)
  const ctxMenuY = ref(0)

  const closeContextMenu = () => {
    ctxMenuOpen.value = false
  }

  const deleteSelected = () => {
    const ids = Array.from(store.state.ui.selectedIds)
    for (const id of ids) removeShape(id as string)
    clearSelection()
  }

  const contextMenuItems = computed(() => {
    const hasSelection = store.state.ui.selectedIds.size > 0
    return [
      {
        id: 'select',
        label: 'Select tool',
        icon: 'mdi:cursor-default',
        shortcut: 'V',
        onSelect: () => setTool('select'),
      },
      {
        id: 'zoom-in',
        label: 'Zoom in',
        icon: 'mdi:magnify-plus-outline',
        shortcut: 'Ctrl + +',
        onSelect: () => zoomAt({ x: ctxMenuX.value, y: ctxMenuY.value }, 1.15),
      },
      {
        id: 'zoom-out',
        label: 'Zoom out',
        icon: 'mdi:magnify-minus-outline',
        shortcut: 'Ctrl + -',
        onSelect: () => zoomAt({ x: ctxMenuX.value, y: ctxMenuY.value }, 0.87),
      },
      {
        id: 'delete',
        label: 'Delete selected',
        icon: 'mdi:trash-can-outline',
        shortcut: 'Del',
        disabled: !hasSelection,
        onSelect: deleteSelected,
      },
    ]
  })

  const onCanvasContextMenu = (e: MouseEvent) => {
    e.preventDefault()
    ctxMenuX.value = e.clientX
    ctxMenuY.value = e.clientY
    ctxMenuOpen.value = true
  }

  return {
    ctxMenuOpen,
    ctxMenuX,
    ctxMenuY,
    contextMenuItems,
    onCanvasContextMenu,
    closeContextMenu,
    deleteSelected, // also used by command palette
  }
}
