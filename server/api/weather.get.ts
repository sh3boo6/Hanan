// server/api/weather.get.ts
interface OpenMeteoCurrent {
  temperature_2m: number
  relative_humidity_2m: number
  apparent_temperature: number
  weather_code: number
  wind_speed_10m: number
  surface_pressure: number
  time: string
}

interface OpenMeteoDaily {
  time: string[]
  weather_code: number[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  uv_index_max: number[]
}

interface OpenMeteoResponse {
  current: OpenMeteoCurrent
  daily: OpenMeteoDaily
}

interface NominatimAddress {
  city?: string
  town?: string
  village?: string
  county?: string
  state?: string
}

interface NominatimResponse {
  address: NominatimAddress
}

interface NominatimItem {
  lat: string
  lon: string
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const lat = typeof query.lat === 'string' ? parseFloat(query.lat) : typeof query.lat === 'number' ? query.lat : undefined
  const lon = typeof query.lon === 'string' ? parseFloat(query.lon) : typeof query.lon === 'number' ? query.lon : undefined
  const cityName = typeof query.city === 'string' ? query.city : undefined

  if (cityName && (lat === undefined || lon === undefined)) {
    const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1&accept-language=ar`
    const geoRes = await $fetch<NominatimItem[]>(geoUrl, {
      headers: { 'User-Agent': 'Hanan-App/1.0' }
    })

    if (Array.isArray(geoRes) && geoRes.length > 0) {
      const first = geoRes[0]!
      const { lat: geoLatStr, lon: geoLonStr } = first
      const geoLat = parseFloat(geoLatStr)
      const geoLon = parseFloat(geoLonStr)
      const weatherData = await fetchWeatherData(geoLat, geoLon, cityName)
      return { ...weatherData, city: cityName, lat: geoLat, lon: geoLon }
    } else {
      throw createError({ statusCode: 404, statusMessage: 'المدينة غير موجودة' })
    }
  }

  if (lat === undefined || lon === undefined) {
    throw createError({ statusCode: 400, statusMessage: 'مطلوب إحداثيات أو اسم مدينة' })
  }

  return fetchWeatherData(lat, lon, cityName)
})

async function fetchWeatherData(lat: number, lon: number, cityName?: string) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto&forecast_days=5`

  const weatherData = await $fetch<OpenMeteoResponse>(weatherUrl)

  let cityAr = cityName || ''
  if (!cityAr) {
    const reverseUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ar`
    const reverseData = await $fetch<NominatimResponse>(reverseUrl, {
      headers: { 'User-Agent': 'Hanan-App/1.0' }
    })

    if (reverseData.address) {
      const addr = reverseData.address
      cityAr = addr.city || addr.town || addr.village || addr.county || addr.state || 'موقع غير معروف'
    }
  }

  return {
    city: cityAr,
    lat,
    lon,
    current: weatherData.current,
    daily: weatherData.daily
  }
}
