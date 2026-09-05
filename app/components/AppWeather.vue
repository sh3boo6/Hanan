<template>
  <div
    dir="rtl"
    class="inline-flex items-center gap-2"
  >
    <!-- حالة جاري جلب الموقع أو الطقس -->
    <div
      v-if="isLoading"
      class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-default bg-accented/50 text-accented text-xs"
    >
      <UIcon
        name="i-lucide-loader-2"
        class="size-4 animate-spin text-primary-500"
      />
      <span>جاري تحديد الموقع والطقس...</span>
    </div>

    <!-- بطاقة التنبيه عند تعطيل الموقع أو رفض الصلاحية -->
    <div
      v-else-if="!isGeolocationEnabled || locationError"
      class="inline-flex items-center gap-2 px-3 py-1.5 text-default text-xs"
    >
      <UIcon
        name="i-heroicons-exclamation-triangle-20-solid"
        class="size-4 shrink-0 text-amber-500"
      />
      <span>{{ locationError || 'تحديد الموقع معطل' }}</span>
      <UButton
        color="primary"
        variant="ghost"
        size="xs"
        icon="i-heroicons-arrow-path-20-solid"
        class="p-0.5"
        :loading="isRequesting"
        @click="handleRequestLocation"
      />
    </div>

    <!-- بطاقة الطقس الأفقية -->
    <UPopover
      v-else
      v-model:open="isOpen"
    >
      <UCard
        class="group cursor-pointer transition-all duration-200 hover:border-primary-500/50 border border-default"
        :ui="{ body: 'px-2 py-1 sm:px-3 sm:py-1.5' }"
      >
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5">
            <UIcon
              :name="currentWeatherIcon"
              class="size-5 text-primary-500 transition-transform group-hover:scale-110"
            />
            <span class="text-sm font-extrabold text-accented leading-none">
              {{ currentTemp }}°
            </span>
          </div>

          <div class="flex items-center gap-1.5 text-xs">
            <span class="font-bold text-accented">
              {{ weatherData?.city || 'جاري التحميل...' }}
            </span>
            <span class="text-accented">•</span>
            <span class="text-accented hidden sm:inline">
              {{ currentCondition }}
            </span>
          </div>

          <div class="hidden 2xl:flex items-center gap-3 text-[11px] text-accented border-r border-default pr-3">
            <span><UIcon name="i-lucide-droplets" /> ٪{{ weatherData?.current.relative_humidity_2m ?? '--' }}</span>
            <span><UIcon name="i-lucide-wind" /> {{ weatherData?.current.wind_speed_10m ?? '--' }} كم/س</span>
          </div>
        </div>
      </UCard>

      <template #content>
        <div
          dir="rtl"
          class="p-4 space-y-4 w-80"
        >
          <div class="flex flex-col gap-2 justify-end">
            <UButton
              color="neutral"
              variant="ghost"
              size="xs"
              icon="i-heroicons-x-mark-20-solid"
              class="self-end"
              @click="isOpen = false"
            />

            <div class="flex items-center justify-between bg-primary-50 p-3 rounded-xl border border-primary-200/50">
              <div>
                <p class="text-xs font-semibold text-primary-600">
                  الحالة الحالية
                </p>
                <h2 class="text-xl font-black text-gray-600 leading-none">
                  {{ currentTemp }}°م
                </h2>
                <p class="text-xs text-gray-600">
                  تُشعر وكأنها {{ feelsLike }}°م • {{ currentCondition }}
                </p>
                <p class="text-[11px] text-gray-600 mt-0.5">
                  {{ weatherData?.city }}
                </p>
              </div>
              <UIcon
                :name="currentWeatherIcon"
                class="size-10 text-primary-500"
              />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div class="bg-accented/50 p-2 rounded-lg border border-default">
                <div class="flex items-center gap-1.5 text-accented text-[11px] mb-1">
                  <UIcon
                    name="i-heroicons-swatch"
                    class="size-3.5 text-primary-500"
                  />
                  <span>الرطوبة</span>
                </div>
                <p class="text-sm font-bold text-accented">
                  ٪{{ weatherData?.current.relative_humidity_2m ?? '--' }}
                </p>
              </div>

              <div class="bg-accented/50 p-2 rounded-lg border border-default">
                <div class="flex items-center gap-1.5 text-accented text-[11px] mb-1">
                  <UIcon
                    name="i-heroicons-arrow-path-20-solid"
                    class="size-3.5 text-primary-500"
                  />
                  <span>الرياح</span>
                </div>
                <p class="text-sm font-bold text-accented">
                  {{ weatherData?.current.wind_speed_10m ?? '--' }} كم/س
                </p>
              </div>

              <div class="bg-accented/50 p-2 rounded-lg border border-default">
                <div class="flex items-center gap-1.5 text-accented text-[11px] mb-1">
                  <UIcon
                    name="i-heroicons-variable"
                    class="size-3.5 text-primary-500"
                  />
                  <span>الضغط</span>
                </div>
                <p class="text-sm font-bold text-accented">
                  {{ weatherData?.current.surface_pressure ? Math.round(weatherData.current.surface_pressure) : '--' }} هكتو
                </p>
              </div>

              <div class="bg-accented/50 p-2 rounded-lg border border-default">
                <div class="flex items-center gap-1.5 text-accented text-[11px] mb-1">
                  <UIcon
                    name="i-heroicons-sparkles"
                    class="size-3.5 text-primary-500"
                  />
                  <span>UV</span>
                </div>
                <p class="text-sm font-bold text-accented">
                  {{ weatherData?.daily?.uv_index_max?.[0] ? weatherData.daily.uv_index_max[0].toFixed(1) : '--' }}
                </p>
              </div>
            </div>

            <div>
              <h4 class="text-xs font-bold text-accented mb-2">
                توقعات 5 أيام
              </h4>
              <div class="space-y-1.5 max-h-48 overflow-y-auto">
                <div
                  v-for="(day, i) in forecast"
                  :key="i"
                  class="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-accented/50 text-xs"
                >
                  <span class="w-16 font-medium text-accented">{{ day.day }}</span>
                  <UIcon
                    :name="day.icon"
                    class="size-4 text-primary-500"
                  />
                  <div class="w-20 text-left">
                    <span class="font-bold text-accented">{{ day.high }}°</span>
                    <span class="text-accented mr-1">{{ day.low }}°</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UPopover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWeather } from '../../composables/useWeather'

const isOpen = ref(false)
const isRequesting = ref(false)
const locationError = ref('')

const { weatherState, isGeolocationEnabled, requestLocation } = useWeather()

const isLoading = computed(() => weatherState.value?.loading ?? false)

const weatherData = computed(() => weatherState.value?.data)

const handleRequestLocation = async () => {
  isRequesting.value = true
  locationError.value = ''
  try {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async () => {
          if (requestLocation) await requestLocation()
          isRequesting.value = false
        },
        (error) => {
          isRequesting.value = false
          if (error.code === error.PERMISSION_DENIED) {
            locationError.value = 'تم رفض الإذن، يرجى تفعيله من إعدادات المتصفح'
          } else {
            locationError.value = 'تعذر الجلب الفعلي للموقع'
          }
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      locationError.value = 'المتصفح لا يدعم تحديد الموقع'
      isRequesting.value = false
    }
  } catch {
    isRequesting.value = false
    locationError.value = 'حدث خطأ غير متوقع'
  }
}

onMounted(() => {
  // التحقق الفوري عند التحميل
  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') {
        if (requestLocation) requestLocation()
      }
    })
  }
})

const currentTemp = computed(() => {
  return weatherData.value?.current?.temperature_2m ? Math.round(weatherData.value.current.temperature_2m) : '--'
})

const feelsLike = computed(() => {
  return weatherData.value?.current?.apparent_temperature ? Math.round(weatherData.value.current.apparent_temperature) : '--'
})

const currentCondition = computed(() => {
  if (!weatherData.value?.current) return '--'
  return getWeatherCondition(weatherData.value.current.weather_code)
})

const currentWeatherIcon = computed(() => {
  if (!weatherData.value?.current) return 'i-lucide-cloud'
  return getWeatherIcon(weatherData.value.current.weather_code)
})

const forecast = computed(() => {
  if (!weatherData.value?.daily) return []
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const result = []

  for (let i = 0; i < weatherData.value.daily.time.length; i++) {
    const time = weatherData.value.daily.time[i]
    const high = weatherData.value.daily.temperature_2m_max[i]
    const low = weatherData.value.daily.temperature_2m_min[i]
    const code = weatherData.value.daily.weather_code[i]

    if (time == null || high == null || low == null || code == null) continue

    const date = new Date(time)
    const dayName = i === 0 ? 'اليوم' : days[date.getDay()]
    const icon = getWeatherIcon(code)

    result.push({ day: dayName, high: Math.round(high), low: Math.round(low), icon })
  }

  return result
})

const getWeatherCondition = (code: number): string => {
  if (code === 0) return 'سماء صافية'
  if (code === 1) return 'صافي غالباً'
  if (code === 2) return 'غائم جزئياً'
  if (code === 3) return 'غائم'
  if (code >= 45 && code <= 48) return 'ضبابي'
  if (code >= 51 && code <= 55) return 'رذاذ'
  if (code >= 61 && code <= 65) return 'ماطر'
  if (code >= 71 && code <= 75) return 'ثلجي'
  if (code >= 80 && code <= 82) return 'زخات مطر'
  if (code >= 95 && code <= 99) return 'عاصفة رعدية'
  return 'غير معروف'
}

const getWeatherIcon = (code: number): string => {
  if (code === 0) return 'i-lucide-sun'
  if (code >= 1 && code <= 3) return 'i-lucide-cloud-sun'
  if (code >= 45 && code <= 48) return 'i-lucide-cloud-fog'
  if (code >= 51 && code <= 55) return 'i-lucide-cloud-drizzle'
  if (code >= 61 && code <= 65) return 'i-lucide-cloud-rain'
  if (code >= 71 && code <= 75) return 'i-lucide-snowflake'
  if (code >= 80 && code <= 82) return 'i-lucide-cloud-rain-wind'
  if (code >= 95 && code <= 99) return 'i-lucide-cloud-lightning'
  return 'i-lucide-cloud'
}
</script>
