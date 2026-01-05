<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { WhiteboardState } from '../../../shared/types/whiteboard'

const props = defineProps<{
  settings: WhiteboardState['ui']['settings']
  chatbotOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'settings', patch: Partial<WhiteboardState['ui']['settings']>): unknown
  (e: 'toggleChatbot'): unknown
}>()

const open = ref(false)
const rootEl = ref<HTMLDivElement | null>(null)

const bg = computed(() => props.settings.background)
const showGrid = computed(() => props.settings.showGrid)

const onDocumentPointerDown = (e: PointerEvent) => {
  if (!open.value) return
  const el = rootEl.value
  if (!el) return
  if (e.target instanceof Node && el.contains(e.target)) return
  open.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})
</script>

<template>
  <div ref="rootEl" class="relative">
    <button
      class="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-100"
      type="button"
      title="Settings"
      @click="open = !open"
    >
      <Icon name="mdi:cog-outline" class="w-5 h-5 text-gray-700" />
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-11 w-[320px] rounded-xl border border-gray-200 bg-white shadow-xl"
    >
      <div class="flex items-center gap-3 px-4 pt-3">
        <div class="text-sm font-medium text-gray-900">Settings</div>
        <div class="flex-1" />
        <button class="text-gray-400 hover:text-gray-600" type="button" @click="open = false">
          <Icon name="mdi:close" class="w-5 h-5" />
        </button>
      </div>

      <div class="px-4 pb-4 pt-3 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-900">Grid</div>
            <div class="text-xs text-gray-500">Show background grid</div>
          </div>
          <input
            class="h-4 w-4"
            type="checkbox"
            :checked="showGrid"
            @change="emit('settings', { showGrid: ($event.target as HTMLInputElement).checked })"
          >
        </div>

        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-900">Background</div>
            <div class="text-xs text-gray-500">Canvas background color</div>
          </div>
          <input
            class="h-7 w-10 p-0 border border-gray-200 rounded"
            type="color"
            :value="bg"
            @input="emit('settings', { background: ($event.target as HTMLInputElement).value })"
          >
        </div>

        <div class="pt-2 border-t border-gray-200">
          <button
            class="h-10 w-full rounded-lg border border-gray-200 bg-white text-sm text-gray-900 hover:bg-gray-50"
            type="button"
            @click="open = false; emit('toggleChatbot')"
          >
            {{ chatbotOpen ? 'Hide AI Chatbot' : 'Show AI Chatbot' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
