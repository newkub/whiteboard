// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../app/app.vue'
import { ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

// Mock the composables used in App.vue
vi.mock('~/composables/useWhiteboard', () => ({
  useWhiteboard: () => ({
    state: ref({
      ui: {
        selectedIds: new Set(),
        settings: {},
      },
      doc: {},
      camera: {},
    }),
    setTool: vi.fn(),
    setUiSettings: vi.fn(),
    canvasCssSize: ref({ width: 800, height: 600 }),
    engine: ref('2d'),
    mode: ref('select'),
    setMode: vi.fn(),
    autoRotate3d: ref(false),
    reset3d: vi.fn(),
    toggleAutoRotate3d: vi.fn(),
  }),
}))

vi.mock('~/composables/facade/useCommandPaletteToggle', () => ({
  useCommandPaletteToggle: () => ({
    open: ref(false),
    close: vi.fn(),
  }),
}))

vi.mock('~/composables/facade/useChatbot', () => ({
  useChatbot: () => ({
    chatbotOpen: ref(false),
    toggleChatbot: vi.fn(),
    closeChatbot: vi.fn(),
  }),
}))

vi.mock('~/composables/facade/useContextMenu', () => ({
  useContextMenu: () => ({
    ctxMenuOpen: ref(false),
    ctxMenuX: ref(0),
    ctxMenuY: ref(0),
    contextMenuItems: ref([]),
    onCanvasContextMenu: vi.fn(),
    closeContextMenu: vi.fn(),
    deleteSelected: vi.fn(),
  }),
}))

vi.mock('~/composables/facade/useAppCommands', () => ({
  useAppCommands: () => ({
    commandItems: ref([]),
  }),
}))

vi.mock('~/composables/facade/useWhiteboardPages', () => ({
  useWhiteboardPages: () => ({
    pages: ref([]),
    activePageId: ref(''),
    activeTitle: ref(''),
    switchToPage: vi.fn(),
    addPage: vi.fn(),
    renameActivePage: vi.fn(),
  }),
}))

describe('App', () => {
  it('renders the main canvas element', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
        stubs: {
          NuxtLayout: {
            template: '<div><slot /></div>',
          },
          TopBar: true,
          PagesSidebar: true,
          CanvasContextMenu: true,
          CommandPalette: true,
          ToolBar: true,
          Minimap: true,
          ChatbotPanel: true,
        },
      },
    });

    expect(wrapper.find('#whiteboard-canvas').exists()).toBe(true)
  })
})
