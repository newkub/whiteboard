<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): unknown
}>()
</script>

<template>
  <aside
    v-if="open"
    class="pointer-events-auto h-full w-[360px] bg-white/90 backdrop-blur border-l border-gray-200 flex flex-col"
  >
    <div class="h-14 px-3 flex items-center justify-between border-b border-gray-200">
      <div class="flex items-center gap-2">
        <Icon name="mdi:robot-outline" class="w-5 h-5 text-gray-700" />
        <div class="text-sm font-medium text-gray-900">AI Chatbot</div>
      </div>
      <button
        class="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100"
        type="button"
        title="Close"
        @click="emit('close')"
      >
        <Icon name="mdi:close" class="w-5 h-5 text-gray-700" />
      </button>
    </div>

    <div class="flex-1 p-3 overflow-auto">
      <div class="rounded-xl border border-gray-200 bg-white p-3">
        <div class="text-sm text-gray-900">Mockup</div>
        <div class="mt-1 text-xs text-gray-500">
          This panel will host AI-assisted actions (summarize, generate shapes, clean up, export).
        </div>
      </div>

      <div class="mt-3 space-y-2">
        <button class="w-full h-10 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 hover:bg-gray-50" type="button">
          Suggest layout improvements
        </button>
        <button class="w-full h-10 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 hover:bg-gray-50" type="button">
          Turn sketch into shapes
        </button>
        <button class="w-full h-10 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 hover:bg-gray-50" type="button">
          Generate slides outline
        </button>
      </div>
    </div>

    <div class="p-3 border-t border-gray-200">
      <div class="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
        <input
          class="h-8 flex-1 bg-transparent outline-none text-sm text-gray-900"
          type="text"
          placeholder="Ask AI… (mock)"
          disabled
        >
        <button class="h-8 px-3 rounded-lg bg-gray-200 text-gray-600 text-sm" type="button" disabled>
          Send
        </button>
      </div>
    </div>
  </aside>
</template>
