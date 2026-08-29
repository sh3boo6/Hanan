<script setup lang="ts">
import { ref, watch } from 'vue'

const searchQuery = ref('')
const suggestions = ref<string[]>([])
const isOpen = ref(false)

watch(searchQuery, async (newQuery) => {
  if (!newQuery || newQuery.trim().length === 0) {
    suggestions.value = []
    isOpen.value = false
    return
  }

  const query = newQuery.trim()
  suggestions.value = [
    query,
    `${query} 2026`,
    `${query} في السعودية`,
    `موقع ${query}`,
    `أفضل ${query}`
  ]
  isOpen.value = true
})

const handleFocus = () => {
  if (suggestions.value.length > 0) {
    isOpen.value = true
  }
}

const selectSuggestion = (item: string) => {
  searchQuery.value = item
  isOpen.value = false
  window.open(`https://www.google.com/search?q=${encodeURIComponent(item)}`, '_blank')
}

const onSearchSubmit = () => {
  if (!searchQuery.value.trim()) return
  isOpen.value = false
  window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery.value)}`, '_blank')
}
</script>

<template>
  <div class="relative w-full">
    <form
      class="flex w-full items-center gap-3 bg-white dark:bg-zinc-900 border border-default rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow"
      @submit.prevent="onSearchSubmit"
    >
      <UIcon
        name="i-simple-icons-google"
        class="w-5 h-5 text-muted shrink-0"
      />
      <UInput
        v-model="searchQuery"
        placeholder="ابحث في Google"
        variant="none"
        class="w-full block border-0 p-0 focus:ring-0"
        @focus="handleFocus"
      />
      <UButton
        type="submit"
        icon="i-lucide-search"
        color="neutral"
        variant="ghost"
        size="xs"
      />
    </form>

    <div
      v-if="isOpen && suggestions.length > 0"
      class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-default rounded-2xl shadow-lg overflow-hidden z-50 py-2"
    >
      <ul>
        <li
          v-for="(suggestion, index) in suggestions"
          :key="index"
          class="flex items-center gap-3 px-4 py-2 hover:bg-muted/10 cursor-pointer text-sm"
          @click="selectSuggestion(suggestion)"
        >
          <UIcon
            name="i-lucide-search"
            class="w-4 h-4 text-muted shrink-0"
          />
          <span class="truncate">{{ suggestion }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
