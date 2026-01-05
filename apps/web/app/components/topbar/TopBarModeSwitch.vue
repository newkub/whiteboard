<script setup lang="ts">
import type { WhiteboardMode } from '~/composables/useWhiteboard'

const props = defineProps<{
  mode: WhiteboardMode
}>()

const emit = defineEmits<{
  (e: 'mode', mode: WhiteboardMode): unknown
}>()

const modeButtonClass = (value: WhiteboardMode) => {
  return props.mode === value
    ? 'bg-gray-900 text-white'
    : 'bg-white text-gray-700 hover:bg-gray-100'
}
</script>

<template>
  <div class="h-9 rounded-lg border border-gray-200 bg-white p-1 flex items-center gap-1">
    <button
      class="h-7 px-3 rounded-md text-sm"
      :class="modeButtonClass('2d')"
      type="button"
      @click="emit('mode', '2d')"
    >
      2D
    </button>
    <button
      class="h-7 px-3 rounded-md text-sm"
      :class="modeButtonClass('3d')"
      type="button"
      @click="emit('mode', '3d')"
    >
      3D
    </button>
  </div>
</template>
