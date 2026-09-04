<template>
  <div
    dir="rtl"
    class="inline-flex items-center gap-2"
  >
    <!-- بطاقة التنبيه المصغرة للـ Header -->
    <div
      v-if="!isGeolocationEnabled"
      class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-50/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs"
    >
      <UIcon
        name="i-heroicons-exclamation-triangle-20-solid"
        color="warning"
        class="size-4 shrink-0 text-amber-500"
      />
      <span>تحديد الموقع معطل</span>
      <UButton
        color="primary"
        variant="ghost"
        size="xs"
        icon="i-heroicons-arrow-path-20-solid"
        class="p-0.5"
        @click="requestLocation"
      />
    </div>

    <!-- بطاقة الطقس الأفقية للملف الشخصي/الهيدر (Inline Header Card) -->
    <UCard
      v-else
      class="group cursor-pointer transition-all duration-200 hover:border-primary-500/50"
      :ui="{ body: 'px-3 py-1.5 sm:px-3 sm:py-1.5' }"
      @click="isOpen = true"
    >
      <div class="flex items-center gap-3">
        <!-- الأيقونة ودرجة الحرارة -->
        <div class="flex items-center gap-1.5">
          <UIcon
            :name="weather.icon"
            class="size-5 text-primary-500 transition-transform group-hover:scale-110"
          />
          <span class="text-sm font-extrabold text-gray-900 dark:text-white leading-none">
            {{ weather.temp }}°
          </span>
        </div>

        <!-- معلومات المدينة والحالة -->
        <div class="flex items-center gap-1.5 text-xs">
          <span class="font-bold text-gray-800 dark:text-gray-200">
            {{ weather.city }}
          </span>
          <span class="text-gray-400 dark:text-gray-500">•</span>
          <span class="text-gray-500 dark:text-gray-400 hidden sm:inline">
            {{ weather.condition }}
          </span>
        </div>

        <!-- إحصائيات سريعة مختصرة -->
        <div class="hidden 2xl:flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 pr-3">
          <span>💧 ٪{{ weather.humidity }}</span>
          <span>💨 {{ weather.windSpeed }} كم/س</span>
        </div>
      </div>
    </UCard>

    <!-- Modal التفاصيل كما هو عند النقر -->
    <UModal
      v-model:open="isOpen"
      :title="`تفاصيل الطقس في ${weather.city}`"
    >
      <template #content>
        <div
          dir="rtl"
          class="p-6 space-y-6"
        >
          <div class="flex items-center justify-between bg-primary-50 dark:bg-primary-950/40 p-4 rounded-xl border border-primary-200/50 dark:border-primary-800/50">
            <div>
              <p class="text-xs font-semibold text-primary-600 dark:text-primary-400">
                الحالة الحالية
              </p>
              <h2 class="text-2xl font-black text-gray-900 dark:text-white">
                {{ weather.temp }}°م
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                تُشعر وكأنها {{ weather.feelsLike }}°م • {{ weather.condition }}
              </p>
            </div>
            <UIcon
              :name="weather.icon"
              class="size-16 text-primary-500"
            />
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div
              v-for="metric in metrics"
              :key="metric.label"
              class="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800"
            >
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
                <UIcon
                  :name="metric.icon"
                  class="size-4 text-primary-500"
                />
                <span>{{ metric.label }}</span>
              </div>
              <p class="text-base font-bold text-gray-900 dark:text-white">
                {{ metric.value }}
              </p>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">
              توقعات 5 أيام
            </h4>
            <div class="space-y-2">
              <div
                v-for="day in weather.forecast"
                :key="day.day"
                class="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900/60 text-sm"
              >
                <span class="w-20 font-medium text-gray-700 dark:text-gray-300">{{ day.day }}</span>
                <UIcon
                  :name="day.icon"
                  class="size-5 text-primary-500"
                />
                <div class="w-24 text-left">
                  <span class="font-bold text-gray-900 dark:text-white">{{ day.high }}°</span>
                  <span class="text-gray-400 mr-2">{{ day.low }}°</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGeolocation, usePermission } from '@vueuse/core'

const isOpen = ref(false)

const { coords, error, resume } = useGeolocation({
  enableHighAccuracy: true,
  immediate: true
})

const geolocationPermission = usePermission('geolocation')

const isGeolocationEnabled = computed(() => {
  if (error.value || geolocationPermission.value === 'denied') {
    return false
  }
  return coords.value.latitude !== Infinity && coords.value.longitude !== Infinity
})

const requestLocation = () => {
  resume()
}

const weather = ref({
  city: 'الرياض',
  country: 'السعودية',
  temp: 34,
  feelsLike: 37,
  condition: 'مشمس غالباً',
  icon: 'i-heroicons-sun-20-solid',
  humidity: 22,
  windSpeed: 14,
  pressure: 1012,
  uvIndex: '8 (مرتفع جداً)',
  visibility: '10 كم',
  dewPoint: '11°م',
  forecast: [
    { day: 'اليوم', high: 34, low: 22, icon: 'i-heroicons-sun-20-solid' },
    { day: 'السبت', high: 35, low: 23, icon: 'i-heroicons-sun-20-solid' },
    { day: 'الأحد', high: 33, low: 21, icon: 'i-heroicons-cloud-sun-20-solid' },
    { day: 'الإثنين', high: 31, low: 20, icon: 'i-heroicons-cloud-20-solid' },
    { day: 'الثلاثاء', high: 32, low: 20, icon: 'i-heroicons-sun-20-solid' }
  ]
})

const metrics = computed(() => [
  { label: 'الرطوبة', value: `٪${weather.value.humidity}`, icon: 'i-heroicons-swatch' },
  { label: 'سرعة الرياح', value: `${weather.value.windSpeed} كم/س`, icon: 'i-heroicons-arrow-path-20-solid' },
  { label: 'الضغط الجوي', value: `${weather.value.pressure} هكتوباسكال`, icon: 'i-heroicons-variable' },
  { label: 'مؤشر الأشعة فوق البنفسجية', value: weather.value.uvIndex, icon: 'i-heroicons-sparkles' },
  { label: 'مدى الرؤية', value: weather.value.visibility, icon: 'i-heroicons-eye' },
  { label: 'نقطة الندى', value: weather.value.dewPoint, icon: 'i-heroicons-beaker' }
])
</script>
