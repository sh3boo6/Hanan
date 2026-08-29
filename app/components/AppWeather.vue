<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useGeolocation } from '@vueuse/core'

const cityName = ref('المخواة')
const temperature = ref<number | null>(null)
const weatherCode = ref<number | null>(null)
const loading = ref(true)
const errorMessage = ref<string | null>(null)

const DEFAULT_LAT = 19.76263711759087
const DEFAULT_LON = 41.43428519181898
const DEFAULT_CITY = ''

const { coords, locatedAt, error: geoError } = useGeolocation()

const getWeatherInfo = (code: number | null) => {
  switch (code) {
    case 0:
      return { text: 'مشمس', icon: 'i-lucide-sun' }
    case 1:
    case 2:
      return { text: 'غائم جزئياً', icon: 'i-lucide-cloud-sun' }
    case 3:
      return { text: 'غائم', icon: 'i-lucide-cloud' }
    case 45:
    case 48:
      return { text: 'ضباب', icon: 'i-lucide-cloud-fog' }
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return { text: 'رذاذ', icon: 'i-lucide-cloud-drizzle' }
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
      return { text: 'ممطر', icon: 'i-lucide-cloud-rain' }
    case 71:
    case 73:
    case 75:
    case 77:
      return { text: 'ثلوج', icon: 'i-lucide-snowflake' }
    case 95:
    case 96:
    case 99:
      return { text: 'عواصف رعدية', icon: 'i-lucide-cloud-lightning' }
    default:
      return { text: 'معتدل', icon: 'i-lucide-cloudy' }
  }
}

const currentWeather = computed(() => getWeatherInfo(weatherCode.value))

const fetchWeather = async (lat: number, lon: number, name: string) => {
  cityName.value = name
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=apparent_temperature,weather_code`
    )
    if (!response.ok) throw new Error('فشل في جلب بيانات الطقس')
    const data = await response.json()

    temperature.value = Math.round(data.current.apparent_temperature)
    weatherCode.value = data.current.weather_code
  } catch (err) {
    console.error(err)
    errorMessage.value = 'تعذر جلب البيانات'
  } finally {
    loading.value = false
  }
}

watchEffect(() => {
  const latitude = coords.value.latitude
  const longitude = coords.value.longitude

  if (latitude !== Infinity && longitude !== Infinity && !isNaN(latitude) && (latitude !== 0 || longitude !== 0)) {
    fetchWeather(latitude, longitude, 'موقعك الحالي')
  } else if (geoError.value) {
    fetchWeather(DEFAULT_LAT, DEFAULT_LON, DEFAULT_CITY)
  } else if (locatedAt.value === null) {
    fetchWeather(DEFAULT_LAT, DEFAULT_LON, DEFAULT_CITY)
  }
})
</script>

<template>
  <div class="flex items-center gap-1">
    <div class="flex items-end gap-1">
      <span class="font-bold text-secondary text-xs">
        {{ cityName }}
      </span>
      <UIcon
        :name="currentWeather.icon"
        class="w-6 h-6"
      />
      <span class="text-sm font-bold flex items-center gap-0.5">
        <span v-if="loading">...</span>
        <span v-else-if="temperature !== null">{{ temperature + 2 }}°</span>
        <span v-else>--</span>
        <UIcon
          name="i-lucide-thermometer"
          class="text-error/80"
        />
      </span>
    </div>
    <span class="text-xs text-muted font-medium bg-muted/10 px-2 py-0.5 rounded-md">
      {{ currentWeather.text }}
    </span>
  </div>
</template>
