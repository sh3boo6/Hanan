<!-- components/AppUpdate.vue -->
<template>
  <div
    v-if="$pwa?.needRefresh"
    class="fixed bottom-4 right-4 z-50 max-w-sm p-4 bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-700 flex flex-col gap-3"
  >
    <div class="flex items-center gap-3">
      <span class="relative flex h-3 w-3">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
      </span>
      <p class="text-sm font-medium">
        يتوفر تحديث جديد للتطبيق!
      </p>
    </div>

    <div class="flex items-center justify-end gap-2 mt-1">
      <button
        class="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        @click="$pwa.cancelPrompt()"
      >
        تجاهل
      </button>
      <button
        class="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow"
        @click="handleUpdate"
      >
        تحديث الآن
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $pwa } = useNuxtApp()

const handleUpdate = async () => {
  if (!$pwa) return

  $pwa.cancelPrompt()

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      const waiting = registration?.waiting

      if (waiting) {
        waiting.postMessage({ type: 'SKIP_WAITING' })
      } else if (registration?.active) {
        await registration.update()
      }

      await navigator.serviceWorker.ready

      await new Promise(resolve => setTimeout(resolve, 300))

      window.location.reload()
    } catch {
      window.location.reload()
    }
  } else {
    window.location.reload()
  }
}
</script>
