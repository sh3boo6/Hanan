import { ref, computed, watch } from 'vue'
import { useGeolocation, usePermission } from '@vueuse/core'

interface WeatherCurrent {
  temperature_2m: number
  relative_humidity_2m: number
  apparent_temperature: number
  weather_code: number
  wind_speed_10m: number
  surface_pressure: number
  time: string
}

interface WeatherDaily {
  time: string[]
  weather_code: number[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  uv_index_max: number[]
}

interface WeatherData {
  city: string
  lat: number
  lon: number
  current: WeatherCurrent
  daily: WeatherDaily
}

interface WeatherState {
  data: WeatherData | null
  loading: boolean
  error: string | null
  lastUpdated: number | null
}

const CACHE_TTL = 15 * 60 * 1000
const cache: Record<string, { data: WeatherData, timestamp: number }> = {}

const weatherState = ref<WeatherState>({
  data: null,
  loading: false,
  error: null,
  lastUpdated: null
})

export const useWeather = () => {
  const { coords, error: geoError, resume } = useGeolocation({
    enableHighAccuracy: true,
    immediate: true
  })

  const geolocationPermission = usePermission('geolocation')

  const isGeolocationEnabled = computed(() => {
    if (geoError.value || geolocationPermission.value === 'denied') {
      return false
    }
    return coords.value.latitude !== Infinity && coords.value.longitude !== Infinity
  })

  const cacheKey = computed(() => {
    const c = weatherState.value.data
    if (!c) return ''
    return `${c.lat.toFixed(2)}_${c.lon.toFixed(2)}`
  })

  const isCacheValid = computed(() => {
    const key = cacheKey.value
    if (!key || !cache[key]) return false
    return Date.now() - cache[key].timestamp < CACHE_TTL
  })

  const requestLocation = () => {
    resume()
  }

  const fetchWeather = async (lat: number, lon: number, cityName?: string) => {
    weatherState.value.loading = true
    weatherState.value.error = null

    const key = `${lat.toFixed(2)}_${lon.toFixed(2)}`

    if (cache[key] && Date.now() - cache[key].timestamp < CACHE_TTL) {
      weatherState.value.data = cache[key].data
      weatherState.value.lastUpdated = cache[key].timestamp
      weatherState.value.loading = false
      return cache[key].data
    }

    try {
      const params = new URLSearchParams()
      params.set('lat', lat.toString())
      params.set('lon', lon.toString())
      if (cityName) params.set('city', cityName)

      const data = await $fetch<WeatherData>('/api/weather?' + params.toString())
      cache[key] = { data, timestamp: Date.now() }
      weatherState.value.data = data
      weatherState.value.lastUpdated = Date.now()
      return data
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
      weatherState.value.error = message
      throw err
    } finally {
      weatherState.value.loading = false
    }
  }

  const fetchByCity = async (city: string) => {
    return fetchWeather(0, 0, city)
  }

  watch(
    () => coords.value.latitude,
    (newLat) => {
      if (newLat !== Infinity && coords.value.longitude !== Infinity && isGeolocationEnabled.value) {
        fetchWeather(newLat, coords.value.longitude)
      }
    }
  )

  watch(
    () => geolocationPermission.value,
    (perm) => {
      if (perm === 'granted' && coords.value.latitude !== Infinity) {
        fetchWeather(coords.value.latitude, coords.value.longitude)
      }
    }
  )

  return {
    weatherState,
    isGeolocationEnabled,
    isCacheValid,
    requestLocation,
    fetchWeather,
    fetchByCity
  }
}
