<script setup lang="ts">
import { computed, ref } from 'vue'

const shareOpen = ref(false)
const shareTab = ref<'invite' | 'export' | 'publish'>('invite')
const shareEnabled = ref(true)
const permission = ref<'viewer' | 'editor'>('editor')
const copied = ref(false)

const shareUrl = computed(() => {
  const base = globalThis.location?.href ?? ''
  if (!shareEnabled.value) return ''
  const url = new URL(base)
  url.searchParams.set('share', '1')
  url.searchParams.set('role', permission.value)
  return url.toString()
})

const copyLink = async () => {
  if (!shareUrl.value) return
  if (globalThis.navigator?.clipboard?.writeText) {
    await globalThis.navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1200)
  }
}
</script>

<template>
  <div class="relative">
    <button
      class="h-9 px-3 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
      type="button"
      @click="shareOpen = !shareOpen"
    >
      Share
    </button>

    <div
      v-if="shareOpen"
      class="absolute right-0 top-11 w-[360px] rounded-xl border border-gray-200 bg-white shadow-xl"
    >
      <div class="flex items-center gap-3 px-4 pt-3">
        <button
          class="pb-2 text-sm"
          :class="shareTab === 'invite' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500'"
          type="button"
          @click="shareTab = 'invite'"
        >
          Invite
        </button>
        <button
          class="pb-2 text-sm"
          :class="shareTab === 'export' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500'"
          type="button"
          @click="shareTab = 'export'"
        >
          Export
        </button>
        <button
          class="pb-2 text-sm"
          :class="shareTab === 'publish' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500'"
          type="button"
          @click="shareTab = 'publish'"
        >
          Publish
        </button>
        <div class="flex-1" />
        <button class="text-gray-400 hover:text-gray-600" type="button" @click="shareOpen = false">
          <Icon name="mdi:close" class="w-5 h-5" />
        </button>
      </div>

      <div class="px-4 pb-4 pt-3">
        <div v-if="shareTab === 'invite'" class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="text-sm font-medium text-gray-900">Share this file</div>
            <label class="inline-flex items-center gap-2">
              <span class="text-xs text-gray-500">Link</span>
              <input v-model="shareEnabled" type="checkbox" class="h-4 w-4" />
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">Anyone with the link</div>
            <select v-model="permission" class="h-9 px-2 rounded-lg border border-gray-300 bg-white text-sm">
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
          </div>

          <button
            class="h-10 w-full rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:bg-gray-300"
            type="button"
            :disabled="!shareUrl"
            @click="copyLink"
          >
            {{ copied ? 'Copied' : 'Copy link' }}
          </button>

          <div class="text-xs text-gray-500 break-all" v-if="shareUrl">
            {{ shareUrl }}
          </div>
        </div>

        <div v-else class="text-sm text-gray-600">
          Coming soon
        </div>
      </div>
    </div>
  </div>
</template>
