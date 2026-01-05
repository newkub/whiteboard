<script setup lang="ts">
import { ref, watch } from 'vue'
import type { WhiteboardEngine, WhiteboardMode } from '~/types/whiteboard'
import type { WhiteboardState } from '../../shared/types/whiteboard'
import TopBarEngineBadge from './topbar/TopBarEngineBadge.vue'
import TopBarModeSwitch from './topbar/TopBarModeSwitch.vue'
import TopBarShareMenu from './topbar/TopBarShareMenu.vue'

const props = defineProps<{
  engine: WhiteboardEngine
  mode: WhiteboardMode
  title: string
  settings: WhiteboardState['ui']['settings']
  chatbotOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'mode', mode: WhiteboardMode): unknown
  (e: 'rename', title: string): unknown
  (e: 'settings', patch: Partial<WhiteboardState['ui']['settings']>): unknown
  (e: 'toggle-chatbot'): unknown
}>()

const isEditingName = ref(false)
const draftName = ref(props.title)

watch(
  () => props.title,
  (value) => {
    if (isEditingName.value) return
    draftName.value = value
  },
)

const beginEditName = () => {
  draftName.value = props.title
  isEditingName.value = true
}

const commitName = () => {
  emit('rename', draftName.value.trim() || 'Untitled')
  isEditingName.value = false
}

const cancelEditName = () => {
  isEditingName.value = false
  draftName.value = props.title
}
</script>

<template>
  <div class="h-14 w-full flex items-center gap-3 px-3 bg-white/90 backdrop-blur border-b border-gray-200">
    <TopBarEngineBadge :engine="engine" />

    <TopBarModeSwitch :mode="mode" @mode="emit('mode', $event)" />

    <div class="h-9 flex items-center">
      <button
        v-if="!isEditingName"
        class="h-9 max-w-[280px] px-2 rounded-lg text-sm text-gray-900 hover:bg-gray-100 truncate"
        type="button"
        title="Double click to rename"
        @dblclick="beginEditName"
      >
        {{ title }}
      </button>

      <input
        v-else
        v-model="draftName"
        class="h-9 w-[280px] px-3 rounded-lg border border-gray-300 bg-white text-sm"
        type="text"
        placeholder="Whiteboard name"
        @blur="commitName"
        @keydown.enter.prevent="commitName"
        @keydown.esc.prevent="cancelEditName"
      >
    </div>

    <div class="flex-1" />

    <TopBarShareMenu />

    <TopBarSettingsMenu
      :settings="settings"
      :chatbot-open="chatbotOpen"
      @settings="emit('settings', $event)"
      @toggle-chatbot="emit('toggle-chatbot')"
    />
  </div>
</template>
