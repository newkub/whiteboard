<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export type CommandPaletteItem = {
  id: string
  label: string
  icon: string
  group: string
  shortcut?: string
  keywords?: ReadonlyArray<string>
  disabled?: boolean
  onSelect: () => unknown
}

const props = defineProps<{
  open: boolean
  items: ReadonlyArray<CommandPaletteItem>
}>()

const emit = defineEmits<{
  (e: 'close'): unknown
}>()

const rootEl = ref<HTMLDivElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)
const query = ref('')
const activeIndex = ref(0)

const normalizedQuery = computed(() => query.value.trim().toLowerCase())

const filteredItems = computed(() => {
  const q = normalizedQuery.value
  if (!q) return props.items

  return props.items.filter((it) => {
    const hay = [it.label, it.group, ...(it.keywords ?? [])].join(' ').toLowerCase()
    return hay.includes(q)
  })
})

type Row =
  | { type: 'header'; id: string; label: string }
  | { type: 'item'; id: string; item: CommandPaletteItem }

const rows = computed<ReadonlyArray<Row>>(() => {
  const grouped = new Map<string, CommandPaletteItem[]>()
  for (const it of filteredItems.value) {
    const list = grouped.get(it.group) ?? []
    list.push(it)
    grouped.set(it.group, list)
  }

  const next: Row[] = []
  for (const [group, list] of grouped) {
    next.push({ type: 'header', id: `h-${group}`, label: group })
    for (const it of list) next.push({ type: 'item', id: it.id, item: it })
  }
  return next
})

const enabledRowIndices = computed(() => {
  const idxs: number[] = []
  for (let i = 0; i < rows.value.length; i += 1) {
    const r = rows.value[i]
    if (!r) continue
    if (r.type !== 'item') continue
    if (r.item.disabled) continue
    idxs.push(i)
  }
  return idxs
})

const hasEnabledItems = computed(() => enabledRowIndices.value.length > 0)

const clampActive = () => {
  if (!hasEnabledItems.value) {
    activeIndex.value = 0
    return
  }

  const r = rows.value[activeIndex.value]
  if (r && r.type === 'item' && !r.item.disabled) return
  activeIndex.value = enabledRowIndices.value[0] ?? 0
}

const getNextEnabledRowIndex = (from: number, dir: -1 | 1) => {
  if (!hasEnabledItems.value) return 0
  const idxs = enabledRowIndices.value
  const currentPos = Math.max(0, idxs.indexOf(from))
  const nextPos = (currentPos + dir + idxs.length) % idxs.length
  return idxs[nextPos] ?? idxs[0] ?? 0
}

const focusInput = async () => {
  await nextTick()
  inputEl.value?.focus()
  inputEl.value?.select()
}

const close = () => {
  emit('close')
}

const onKeydown = (e: KeyboardEvent) => {
  if (!props.open) return

  if (e.key === 'Escape') {
    e.preventDefault()
    close()
    return
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = getNextEnabledRowIndex(activeIndex.value, 1)
    return
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = getNextEnabledRowIndex(activeIndex.value, -1)
    return
  }

  if (e.key === 'Enter') {
    e.preventDefault()
    const r = rows.value[activeIndex.value]
    if (!r || r.type !== 'item') return
    if (r.item.disabled) return
    r.item.onSelect()
    close()
  }
}

const onDocumentPointerDown = (e: PointerEvent) => {
  if (!props.open) return
  const el = rootEl.value
  if (!el) return
  if (e.target instanceof Node && el.contains(e.target)) return
  close()
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      query.value = ''
      activeIndex.value = enabledRowIndices.value[0] ?? 0
      focusInput()
    }
  },
)

watch(rows, () => {
  clampActive()
})

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/20" />

    <div
      ref="rootEl"
      class="absolute left-1/2 top-[12vh] w-[720px] max-w-[calc(100vw-24px)] -translate-x-1/2 rounded-2xl border border-gray-200 bg-white shadow-2xl"
      role="dialog"
      aria-modal="true"
      @keydown="onKeydown"
    >
      <div class="px-4 pt-4">
        <div class="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2">
          <Icon name="mdi:magnify" class="w-5 h-5 text-gray-400" />
          <input
            ref="inputEl"
            v-model="query"
            class="h-8 flex-1 bg-transparent outline-none text-sm text-gray-900"
            type="text"
            placeholder="Search commands…"
            autocomplete="off"
            spellcheck="false"
          >
          <div class="text-xs text-gray-400">Esc</div>
        </div>
      </div>

      <div class="px-2 pb-2 pt-3 max-h-[50vh] overflow-auto">
        <div v-if="!hasEnabledItems" class="px-4 py-8 text-sm text-gray-500">
          No results
        </div>

        <template v-else>
          <div v-for="(row, idx) in rows" :key="row.id" class="">
            <div v-if="row.type === 'header'" class="px-3 py-2 text-xs font-medium text-gray-500">
              {{ row.label }}
            </div>

            <button
              v-else
              class="w-full px-3 py-2 rounded-lg flex items-center gap-3 text-sm text-left"
              :class="[
                idx === activeIndex ? 'bg-gray-100' : 'hover:bg-gray-50',
                row.item.disabled ? 'opacity-50 cursor-not-allowed' : '',
              ]"
              type="button"
              :disabled="row.item.disabled"
              @mouseenter="activeIndex = row.item.disabled ? activeIndex : idx"
              @click="row.item.disabled ? null : (row.item.onSelect(), close())"
            >
              <Icon :name="row.item.icon" class="w-5 h-5 text-gray-600" />
              <div class="flex-1 text-gray-900">
                {{ row.item.label }}
              </div>
              <div v-if="row.item.shortcut" class="text-xs text-gray-400">
                {{ row.item.shortcut }}
              </div>
            </button>
          </div>
        </template>
      </div>

      <div class="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <div class="flex items-center gap-3">
          <span>↑↓ Navigate</span>
          <span>Enter Select</span>
          <span>Esc Close</span>
        </div>
        <div>Ctrl + K</div>
      </div>
    </div>
  </div>
</template>
