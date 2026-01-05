<script setup lang="ts">
import { computed } from 'vue'
import type { WhiteboardMode } from '~/types/whiteboard'
import type { ToolId, WhiteboardState } from '../../shared/types/whiteboard'

const props = defineProps<{
  state: WhiteboardState
  mode: WhiteboardMode
  autoRotate3d: boolean
}>()

const emit = defineEmits<{
  (e: 'tool', tool: ToolId): unknown
  (e: 'reset3d'): unknown
  (e: 'toggleAutoRotate3d'): unknown
  (e: 'settings', patch: Partial<WhiteboardState['ui']['settings']>): unknown
}>()

const tools = [
  { id: 'select', icon: 'mdi:cursor-default', label: 'Select' },
  { id: 'pan', icon: 'mdi:hand', label: 'Pan' },
  { id: 'pencil', icon: 'mdi:pencil', label: 'Pencil' },
  { id: 'line', icon: 'mdi:minus', label: 'Line' },
  { id: 'rectangle', icon: 'mdi:rectangle-outline', label: 'Rectangle' },
  { id: 'ellipse', icon: 'mdi:ellipse-outline', label: 'Ellipse' },
  { id: 'arrow', icon: 'mdi:arrow-top-right', label: 'Arrow' },
  { id: 'text', icon: 'mdi:format-text', label: 'Text' },
  { id: 'eraser', icon: 'mdi:eraser', label: 'Eraser' },
  { id: 'zoom', icon: 'mdi:magnify-plus-outline', label: 'Zoom' },
] satisfies ReadonlyArray<{ id: ToolId; icon: string; label: string }>

const activeTool = computed(() => props.state.ui.tool)
const settings = computed(() => props.state.ui.settings)

const showOptions = computed(() => {
  return activeTool.value !== 'select' && activeTool.value !== 'pan' && activeTool.value !== 'eraser' && activeTool.value !== 'zoom'
})

const showFill = computed(() => activeTool.value === 'rectangle' || activeTool.value === 'ellipse')
const showFont = computed(() => activeTool.value === 'text')
</script>

<template>
  <div class="pointer-events-auto bg-white/90 rounded-xl shadow-lg border border-gray-200">
    <template v-if="props.mode === '2d'">
      <div class="flex items-center gap-1 p-2">
        <button
          v-for="t in tools"
          :key="t.id"
          class="p-2 rounded-lg hover:bg-gray-100"
          :class="props.state.ui.tool === t.id ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : 'text-gray-700'"
          type="button"
          :title="t.label"
          @click="emit('tool', t.id)"
        >
          <Icon :name="t.icon" class="w-6 h-6" />
        </button>
      </div>

      <div v-if="showOptions" class="px-3 pb-3 pt-0 border-t border-gray-200">
        <div class="pt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 items-center">
          <div class="text-xs text-gray-500">Stroke</div>
          <div class="flex items-center gap-2">
            <input
              class="h-7 w-10 p-0 border border-gray-200 rounded"
              type="color"
              :value="settings.stroke"
              @input="emit('settings', { stroke: ($event.target as HTMLInputElement).value })"
            >
            <input
              class="h-7 w-full"
              type="range"
              min="1"
              max="16"
              step="1"
              :value="settings.strokeWidth"
              @input="emit('settings', { strokeWidth: Number(($event.target as HTMLInputElement).value) })"
            >
            <div class="text-xs tabular-nums text-gray-600 w-6 text-right">{{ settings.strokeWidth }}</div>
          </div>

          <template v-if="showFill">
            <div class="text-xs text-gray-500">Fill</div>
            <div class="flex items-center gap-2">
              <label class="inline-flex items-center gap-2">
                <input
                  class="h-4 w-4"
                  type="checkbox"
                  :checked="Boolean(settings.fill)"
                  @change="emit('settings', { fill: ($event.target as HTMLInputElement).checked ? (settings.fill ?? '#3b82f6') : null })"
                >
                <span class="text-xs text-gray-700">Enable</span>
              </label>

              <input
                v-if="settings.fill"
                class="h-7 w-10 p-0 border border-gray-200 rounded"
                type="color"
                :value="settings.fill"
                @input="emit('settings', { fill: ($event.target as HTMLInputElement).value })"
              >
            </div>
          </template>

          <template v-if="showFont">
            <div class="text-xs text-gray-500">Font</div>
            <div class="flex items-center gap-2">
              <input
                class="h-7 w-full"
                type="range"
                min="10"
                max="72"
                step="1"
                :value="settings.fontSize"
                @input="emit('settings', { fontSize: Number(($event.target as HTMLInputElement).value) })"
              >
              <div class="text-xs tabular-nums text-gray-600 w-8 text-right">{{ settings.fontSize }}</div>
            </div>
          </template>
        </div>
      </div>
    </template>

    <template v-else>
      <button
        class="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
        type="button"
        title="Reset view"
        @click="emit('reset3d')"
      >
        <Icon name="mdi:restore" class="w-6 h-6" />
      </button>

      <button
        class="p-2 rounded-lg hover:bg-gray-100"
        :class="props.autoRotate3d ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'text-gray-700'"
        type="button"
        title="Toggle auto rotate"
        @click="emit('toggleAutoRotate3d')"
      >
        <Icon name="mdi:rotate-3d-variant" class="w-6 h-6" />
      </button>
    </template>
  </div>
</template>
