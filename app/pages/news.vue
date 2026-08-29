<template>
  <UContainer
    class="py-8"
    dir="rtl"
  >
    <UTabs
      v-model="currentTab"
      :items="tabs"
      class="w-full"
    >
      <template #aawsat>
        <AppAawsatNews />
      </template>
      <template #okaz>
        <AppOkazNews />
      </template>
      <template #aljazeera>
        <AppAljazeeraNews />
      </template>
    </UTabs>
  </UContainer>
</template>

<script setup>
const currentTab = ref('aawsat')

const tabs = [
  { value: 'aawsat', label: 'الشرق الأوسط', slot: 'aawsat' },
  { value: 'okaz', label: 'عكاظ', slot: 'okaz' },
  { value: 'aljazeera', label: 'الجزيرة', slot: 'aljazeera' }
]
</script>
