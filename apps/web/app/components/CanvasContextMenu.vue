<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export type CanvasContextMenuItem = {
  id: string
  label: string
  icon: string
  shortcut?: string
  disabled?: boolean
  onSelect: () => unknown
}

const props = defineProps<{
  open: boolean
  x: number
  y: number
  items: ReadonlyArray<CanvasContextMenuItem>
}>()

const emit = defineEmits<{
  (e: 'close'): unknown
}>()

const rootEl = ref<HTMLDivElement | null>(null)
const activeIndex = ref(0)

const enabledIndices = computed(() => {
  const result: number[] = []
  for (let i = 0; i < props.items.length; i += 1) {
    const it = props.items[i]
    if (!it) continue
    if (it.disabled) continue
    result.push(i)
  }
  return result
})

const hasEnabledItems = computed(() => enabledIndices.value.length > 0)

const getNextEnabledIndex = (from: number, dir: -1 | 1) => {
  if (!hasEnabledItems.value) return 0
  const idxs = enabledIndices.value
  const currentPos = Math.max(0, idxs.indexOf(from))
  const nextPos = (currentPos + dir + idxs.length) % idxs.length
  return idxs[nextPos] ?? idxs[0] ?? 0
}

const clampActive = () => {
  if (!hasEnabledItems.value) {
    activeIndex.value = 0
    return
  }

  const current = props.items[activeIndex.value]
  if (current && !current.disabled) return
  activeIndex.value = enabledIndices.value[0] ?? 0
}

const focusMenu = async () => {
  await nextTick()
  rootEl.value?.focus()
}

const onKeydown = (e: KeyboardEvent) => {
  if (!props.open) return

  if (e.key === 'Escape') {
    e.preventDefault()
    emit('close')
    return
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = getNextEnabledIndex(activeIndex.value, 1)
    return
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = getNextEnabledIndex(activeIndex.value, -1)
    return
  }

  if (e.key === 'Enter') {
    e.preventDefault()
    const it = props.items[activeIndex.value]
    if (!it) return
    if (it.disabled) return
    it.onSelect()
    emit('close')
  }
}

const onDocumentPointerDown = (e: PointerEvent) => {
  if (!props.open) return
  const el = rootEl.value
  if (!el) return
  if (e.target instanceof Node && el.contains(e.target)) return
  emit('close')
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      activeIndex.value = enabledIndices.value[0] ?? 0
      focusMenu()
    }
  },
)

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})
</script>

<template>
  <div
    v-if="open"
    ref="rootEl"
    class="fixed z-50 min-w-[240px] rounded-xl border border-gray-200 bg-white shadow-xl outline-none"
    :style="{ left: `${x}px`, top: `${y}px` }"
    role="menu"
    tabindex="0"
    @keydown="onKeydown"
  >
    <div class="py-2">
      <button
        v-for="(it, idx) in items"
        :key="it.id"
        class="w-full px-3 py-2 flex items-center gap-3 text-sm text-left"
        :class="[
          idx === activeIndex ? 'bg-gray-100' : 'hover:bg-gray-50',
          it.disabled ? 'opacity-50 cursor-not-allowed' : '',
        ]"
        type="button"
        role="menuitem"
        :disabled="it.disabled"
        @mouseenter="activeIndex = it.disabled ? activeIndex : idx"
        @click="it.disabled ? null : (it.onSelect(), emit('close'))"
      >
        <Icon :name="it.icon" class="w-5 h-5 text-gray-600" />
        <div class="flex-1 text-gray-900">
          {{ it.label }}
        </div>
        <div v-if="it.shortcut" class="text-xs text-gray-400">
          {{ it.shortcut }}
        </div>
      </button>
    </div>
  </div>
</template>
