<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useCommandPaletteToggle } from './composables/facade/useCommandPaletteToggle'
import { useContextMenu } from './composables/facade/useContextMenu'
import { useAppCommands } from './composables/facade/useAppCommands'
import { useChatbot } from './composables/facade/useChatbot'
import { useWhiteboardPages } from './composables/facade/useWhiteboardPages'
import { useWhiteboard } from '~/composables/useWhiteboard'
import { useWhiteboardStore } from '~/stores/whiteboard'

const canvas = ref<globalThis.HTMLCanvasElement | null>(null)
const store = useWhiteboardStore()
const { state } = storeToRefs(store)
const whiteboardApi = useWhiteboard(canvas)
const { setTool, setUiSettings, canvasCssSize, engine, mode, setMode, autoRotate3d, reset3d, toggleAutoRotate3d, zoomAt } = whiteboardApi

const { pages, activePageId, activeTitle, switchToPage, addPage, renameActivePage } = useWhiteboardPages(store)

const { chatbotOpen, toggleChatbot, closeChatbot } = useChatbot()

const { ctxMenuOpen, ctxMenuX, ctxMenuY, contextMenuItems, onCanvasContextMenu, closeContextMenu, deleteSelected } =
  useContextMenu(store, whiteboardApi)

const onCanvasDoubleClick = (e: MouseEvent) => {
  const el = canvas.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  zoomAt({ x, y }, 1.25)
}

const canvasCursor =
  'url("data:image/svg+xml,%3Csvg%20xmlns=\'http://www.w3.org/2000/svg\'%20width=\'10\'%20height=\'10\'%20viewBox=\'0%200%2010%2010\'%3E%3Ccircle%20cx=\'5\'%20cy=\'5\'%20r=\'2.2\'%20fill=\'%23111827\'/%3E%3Ccircle%20cx=\'5\'%20cy=\'5\'%20r=\'3.6\'%20fill=\'none\'%20stroke=\'white\'%20stroke-width=\'1\'/%3E%3C/svg%3E") 5 5, auto'

const cmd = useCommandPaletteToggle()

const cmdOpen = computed(() => cmd.open.value)
const closeCommandPalette = cmd.close

const { commandItems } = useAppCommands(store, whiteboardApi, { deleteSelected })
</script>

<template>
  <NuxtLayout name="fullscreen">
    <div class="h-full w-full overflow-hidden bg-gray-50">
      <TopBar
        :engine="engine"
        :mode="mode"
        :title="activeTitle"
        :settings="state.ui.settings"
        :chatbot-open="chatbotOpen"
        class="absolute top-0 left-0 right-0 z-20"
        @mode="setMode"
        @rename="renameActivePage"
        @settings="setUiSettings"
        @toggle-chatbot="toggleChatbot"
      />

      <div class="absolute inset-0 pt-14">
        <div class="absolute inset-0 flex">
          <PagesSidebar
            class="h-full"
            :pages="pages"
            :active-page-id="activePageId"
            @select="switchToPage"
            @add="addPage"
          />

          <div class="relative flex-1">
            <canvas
              ref="canvas"
              id="whiteboard-canvas"
              class="absolute inset-0 w-full h-full touch-none"
              :style="{ cursor: canvasCursor }"
              @contextmenu="onCanvasContextMenu"
              @dblclick="onCanvasDoubleClick"
            />

            <CanvasContextMenu
              :open="ctxMenuOpen"
              :x="ctxMenuX"
              :y="ctxMenuY"
              :items="contextMenuItems"
              @close="closeContextMenu"
            />

            <CommandPalette
              :open="cmdOpen"
              :items="commandItems"
              @close="closeCommandPalette"
            />

            <div class="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
              <ToolBar
                :state="state"
                :mode="mode"
                :auto-rotate3d="autoRotate3d"
                @tool="setTool"
                @settings="setUiSettings"
                @reset3d="reset3d"
                @toggleAutoRotate3d="toggleAutoRotate3d"
              />
            </div>

            <div class="absolute bottom-5 right-5 z-20">
              <Minimap :doc="state.doc" :camera="state.camera" :canvas-size="canvasCssSize" />
            </div>
          </div>

          <ChatbotPanel :open="chatbotOpen" @close="closeChatbot" />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>