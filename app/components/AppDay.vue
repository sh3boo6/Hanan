<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  locale?: string
  hijriLocale?: string
}

const props = withDefaults(defineProps<Props>(), {
  locale: 'en-GB',
  hijriLocale: 'ar-SA-u-ca-islamic-umalqura'
})

const dayName = ref('')
const hijriDate = ref('')
const gregorianDate = ref('')

let timer: NodeJS.Timeout | null = null

function updateDates() {
  const now = new Date()

  dayName.value = new Intl.DateTimeFormat(props.hijriLocale, { weekday: 'long' }).format(now)

  // التعديل هنا: فرض التقويم الهجري وتنسيق الأرقام صراحة ليتوافق مع انظمة ايفون
  hijriDate.value = new Intl.DateTimeFormat('ar-SA', {
    calendar: 'islamic-umalqura',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now)

  gregorianDate.value = new Intl.DateTimeFormat(props.locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now)
}

onMounted(() => {
  updateDates()
  timer = setInterval(updateDates, 60000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="flex flex-col gap-1 text-right">
    <div class="text-2xl font-semibold">
      {{ dayName }}
    </div>
    <p class="text-lg font-semibold">
      {{ hijriDate }}
    </p>
    <p
      dir="ltr"
      class="text-lg font-semibold"
    >
      {{ gregorianDate }}
    </p>
  </div>
</template>
