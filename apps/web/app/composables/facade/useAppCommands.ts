import { useWhiteboardStore } from '~/stores/whiteboard'
import type { UseWhiteboardApi } from '~/composables/useWhiteboard'

export function useAppCommands(
  store: ReturnType<typeof useWhiteboardStore>,
  whiteboardApi: UseWhiteboardApi,
  actions: { deleteSelected: () => void },
) {
  const { setTool, zoomAt, canvasCssSize, clearSelection } = whiteboardApi

  const commandItems = computed(() => {
    const hasSelection = store.state.ui.selectedIds.size > 0
    return [
      {
        id: 'cmd-tool-select',
        label: 'Tool: Select',
        icon: 'mdi:cursor-default',
        group: 'Tools',
        shortcut: 'V',
        keywords: ['tool', 'select'],
        onSelect: () => setTool('select'),
      },
      {
        id: 'cmd-tool-pan',
        label: 'Tool: Pan',
        icon: 'mdi:hand',
        group: 'Tools',
        shortcut: 'H',
        keywords: ['tool', 'pan'],
        onSelect: () => setTool('pan'),
      },
      {
        id: 'cmd-tool-pencil',
        label: 'Tool: Pencil',
        icon: 'mdi:pencil',
        group: 'Tools',
        shortcut: 'P',
        keywords: ['tool', 'pencil', 'draw'],
        onSelect: () => setTool('pencil'),
      },
      {
        id: 'cmd-tool-rect',
        label: 'Tool: Rectangle',
        icon: 'mdi:rectangle-outline',
        group: 'Tools',
        keywords: ['tool', 'rectangle', 'shape'],
        onSelect: () => setTool('rectangle'),
      },
      {
        id: 'cmd-tool-ellipse',
        label: 'Tool: Ellipse',
        icon: 'mdi:ellipse-outline',
        group: 'Tools',
        keywords: ['tool', 'ellipse', 'shape'],
        onSelect: () => setTool('ellipse'),
      },
      {
        id: 'cmd-tool-text',
        label: 'Tool: Text',
        icon: 'mdi:format-text',
        group: 'Tools',
        keywords: ['tool', 'text'],
        onSelect: () => setTool('text'),
      },
      {
        id: 'cmd-view-zoom-in',
        label: 'View: Zoom in',
        icon: 'mdi:magnify-plus-outline',
        group: 'View',
        shortcut: 'Ctrl + +',
        keywords: ['zoom', 'in'],
        onSelect: () => zoomAt({ x: canvasCssSize.value.width / 2, y: canvasCssSize.value.height / 2 }, 1.15),
      },
      {
        id: 'cmd-view-zoom-out',
        label: 'View: Zoom out',
        icon: 'mdi:magnify-minus-outline',
        group: 'View',
        shortcut: 'Ctrl + -',
        keywords: ['zoom', 'out'],
        onSelect: () => zoomAt({ x: canvasCssSize.value.width / 2, y: canvasCssSize.value.height / 2 }, 0.87),
      },
      {
        id: 'cmd-edit-delete',
        label: 'Edit: Delete selected',
        icon: 'mdi:trash-can-outline',
        group: 'Edit',
        shortcut: 'Del',
        disabled: !hasSelection,
        keywords: ['delete', 'remove'],
        onSelect: actions.deleteSelected,
      },
      {
        id: 'cmd-edit-clear-selection',
        label: 'Edit: Clear selection',
        icon: 'mdi:selection-off',
        group: 'Edit',
        shortcut: 'Esc',
        disabled: !hasSelection,
        keywords: ['clear', 'selection'],
        onSelect: () => clearSelection(),
      },
    ]
  })

  return {
    commandItems,
  }
}
