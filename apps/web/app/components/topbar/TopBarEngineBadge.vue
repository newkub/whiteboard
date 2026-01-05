<script setup lang="ts">
import { computed } from 'vue'
import type { WhiteboardEngine } from '~/types/whiteboard'

const props = defineProps<{
  engine: WhiteboardEngine
}>()

const engineLabel = computed(() => {
  switch (props.engine) {
    case 'wasm-2d':
      return 'WASM • 2D'
    case 'wasm-3d':
      return 'WASM • 3D'
    case 'fallback-2d':
      return 'Fallback • 2D'
  }
})

const engineClass = computed(() => {
  switch (props.engine) {
    case 'fallback-2d':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    default:
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }
})
</script>

<template>
  <div class="h-9 px-3 rounded-lg border text-sm flex items-center" :class="engineClass">
    {{ engineLabel }}
  </div>
</template>
