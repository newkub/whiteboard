import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import type { Camera, WhiteboardDoc, ShapeId } from '../../../shared/types/whiteboard'
import { useWhiteboardStore } from '../../stores/whiteboard'

function createId(): ShapeId {
  return crypto.randomUUID()
}

export type PageModel = {
  id: string
  name: string
  doc: WhiteboardDoc
  camera: Camera
}

export type UseWhiteboardPagesApi = {
  pages: ComputedRef<ReadonlyArray<PageModel>>
  activePageId: ComputedRef<string>
  activeTitle: ComputedRef<string>
  switchToPage: (pageId: string) => unknown
  addPage: () => unknown
  renameActivePage: (title: string) => unknown
  saveActivePageSnapshot: () => unknown
}

export const useWhiteboardPages = (store: ReturnType<typeof useWhiteboardStore>): UseWhiteboardPagesApi => {
  const pages = computed(() => store.state.pages)
  const activePageId = computed(() => store.state.activePageId)
  const activePage = computed(() => pages.value.find((p: PageModel) => p.id === activePageId.value) ?? null)
  const activeTitle = computed(() => activePage.value?.name ?? 'Untitled')

  const saveActivePageSnapshot = () => {
    store.saveActivePageSnapshot()
  }

  const switchToPage = (pageId: string) => {
    store.switchToPage(pageId)
  }

  const addPage = () => {
    const nextId = `page-${pages.value.length + 1}-${createId().slice(0, 6)}`
    store.addPage(nextId)
  }

  const renameActivePage = (title: string) => {
    store.renameActivePage(title)
  }

  return {
    pages,
    activePageId,
    activeTitle,
    switchToPage,
    addPage,
    renameActivePage,
    saveActivePageSnapshot,
  }
}
