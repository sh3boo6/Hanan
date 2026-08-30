<template>
  <div class="relative scale-[0.85] md:scale-[1] h-36 max-w-48 w-full p-3 flex flex-col justify-end items-center text-default overflow-hidden">
    <div
      v-if="loading"
      class="flex items-center justify-center h-full"
    >
      <UIcon
        name="i-lucide-loader-2"
        class="w-5 h-5 animate-spin text-default"
      />
    </div>

    <div
      v-else-if="error"
      class="flex items-center justify-center h-full text-xs text-default/80 text-center px-2"
    >
      {{ errorMessage }}
    </div>

    <template v-else>
      <!-- رأس البطاقة -->

      <!-- محتوى الصلوات -->
      <div class="grid grid-cols-1 gap-1 my-auto w-full divide-y divide-accented">
        <!-- الصلاة السابقة -->
        <div class="flex items-center justify-between p-1.5">
          <div class="truncate">
            <p class="text-sm text-default/70">
              {{ prevPrayer.name }}
            </p>
            <p class="text-xs font-semibold text-default">
              {{ prevPrayer.time }}
            </p>
          </div>
          <div class="text-left">
            <span class="text-[10px] text-default/70 block">مضى</span>
            <span class="text-xs font-bold text-default">{{ timeElapsed }}</span>
          </div>
        </div>

        <!-- الصلاة القادمة -->
        <div class="flex items-center justify-between p-1.5">
          <div class="truncate">
            <p class="text-sm text-default/90 font-medium">
              {{ nextPrayer.name }}
            </p>
            <p class="text-xs font-bold text-default">
              {{ nextPrayer.time }}
            </p>
          </div>
          <div class="text-left">
            <span class="text-[10px] text-default/90 block">باقي</span>
            <span class="text-xs font-bold text-default">{{ timeRemaining }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const loading = ref(true)
const error = ref(false)
const errorMessage = ref('تعذر جلب المواقيت')
const timings = ref(null)
const nextPrayer = ref({ name: '', time: '' })
const prevPrayer = ref({ name: '', time: '' })
const timeRemaining = ref('')
const timeElapsed = ref('')
let timer = null

const prayerNamesAr = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء'
}

// ترتيب الصلوات الفعلي لتمثيل اليوم بشكل صحيح
const prayerKeys = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

const fetchTimingsByCoords = (latitude, longitude) => {
  const date = Math.floor(Date.now() / 1000)
  // استخدام طريقة أم القرى (method=4) وهي المعتمدة في السعودية
  fetch(`https://api.aladhan.com/v1/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=4`)
    .then(res => res.json())
    .then((data) => {
      if (data && data.data && data.data.timings) {
        timings.value = data.data.timings
        updatePrayerStatus()
        timer = setInterval(updatePrayerStatus, 1000)
      } else {
        throw new Error()
      }
    })
    .catch(() => {
      error.value = true
      errorMessage.value = 'تعذر جلب المواقيت للإحداثيات الحالية'
    })
    .finally(() => {
      loading.value = false
    })
}

const getUserLocation = () => {
  if (!navigator.geolocation) {
    fetchTimingsByCoords(19.8814, 41.3788)
    return
  }

  if (navigator.permissions?.query) {
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchTimingsByCoords(position.coords.latitude, position.coords.longitude)
          },
          () => {
            fetchTimingsByCoords(19.8814, 41.3788)
          },
          { timeout: 10000 }
        )
      } else if (result.state === 'prompt') {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchTimingsByCoords(position.coords.latitude, position.coords.longitude)
          },
          () => {
            fetchTimingsByCoords(19.8814, 41.3788)
          },
          { timeout: 10000 }
        )
      } else {
        fetchTimingsByCoords(19.8814, 41.3788)
      }
    }).catch(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchTimingsByCoords(position.coords.latitude, position.coords.longitude)
        },
        () => {
          fetchTimingsByCoords(19.8814, 41.3788)
        },
        { timeout: 10000 }
      )
    })
  } else {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchTimingsByCoords(position.coords.latitude, position.coords.longitude)
      },
      () => {
        fetchTimingsByCoords(19.8814, 41.3788)
      },
      { timeout: 10000 }
    )
  }
}

const parseTimeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

const formatDiff = (diffMinutes) => {
  const absMins = Math.abs(diffMinutes)
  const hours = Math.floor(absMins / 60)
  const mins = absMins % 60
  if (hours > 0) {
    return `${hours}س ${mins}د`
  }
  return `${mins}د`
}

const updatePrayerStatus = () => {
  if (!timings.value) return

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const prayerList = prayerKeys.map(key => ({
    key,
    name: prayerNamesAr[key],
    time: timings.value[key],
    totalMinutes: parseTimeToMinutes(timings.value[key])
  }))

  let currentIdx = -1
  for (let i = 0; i < prayerList.length; i++) {
    if (currentMinutes >= prayerList[i].totalMinutes) {
      currentIdx = i
    }
  }

  let prev, next
  if (currentIdx === -1) {
    // الوقت قبل صلاة الفجر (بعد منتصف الليل وقبل الفجر)
    prev = prayerList[prayerList.length - 1] // العشاء اليوم السابق (أو نعتبرها آخر صلاة)
    next = prayerList[0] // الفجر
  } else {
    prev = prayerList[currentIdx]
    next = prayerList[(currentIdx + 1) % prayerList.length]
  }

  prevPrayer.value = { name: prev.name, time: prev.time }
  nextPrayer.value = { name: next.name, time: next.time }

  // حساب الوقت المضى على الصلاة السابقة بالدقائق الثابتة
  const prevTotalMins = prev.totalMinutes
  let diffPrev = currentMinutes - prevTotalMins
  if (diffPrev < 0) diffPrev += 1440
  timeElapsed.value = formatDiff(diffPrev)

  // حساب الوقت المتبقي للصلاة القادمة
  const nextTotalMins = next.totalMinutes
  let diffNext = nextTotalMins - currentMinutes
  if (diffNext < 0) {
    diffNext += 1440
  }
  timeRemaining.value = formatDiff(diffNext)
}

onMounted(() => {
  getUserLocation()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
