<script setup lang="ts">
import {
  now,
  getLocalTimeZone,
  CalendarDate,
  GregorianCalendar,
  IslamicUmalquraCalendar,
  IslamicTabularCalendar,
  toCalendar
} from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = z.object({
  title: z.string('يجب كتابة العنوان').min(5, 'الحد الإدنى ٥ أحرف')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  title: undefined
})

const addEventModal = ref(false)
const addEventDrawer = ref(false)
const toast = useToast()

const deleteConfirmModal = ref(false)
const eventToDeleteId = ref<string | null>(null)

interface CustomEvent {
  id: string
  title: string
  date: { year: number, month: number, day: number }
  type: string
}

const localEvents = ref<CustomEvent[]>([])

onMounted(() => {
  const saved = localStorage.getItem('custom_calendar_events')
  if (saved) {
    try {
      localEvents.value = JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
  }
})

const saveToLocalStorage = () => {
  localStorage.setItem('custom_calendar_events', JSON.stringify(localEvents.value))
}

async function onSubmit(_event: FormSubmitEvent<Schema>) {
  if (!state.title) return

  // توحيد حفظ التاريخ بتحويله إلى التقويم الميلادي دائماً لضمان توافقه بين التقويمين
  const gregorianDate = toCalendar(calendarValue.value, new GregorianCalendar())

  const newCustomEvent: CustomEvent = {
    id: Date.now().toString(),
    title: state.title,
    date: { year: gregorianDate.year, month: gregorianDate.month, day: gregorianDate.day },
    type: 'once'
  }

  localEvents.value.push(newCustomEvent)
  saveToLocalStorage()

  toast.add({ title: 'نجاح', description: 'تم اضافة الحدث بنجاح.', color: 'success' })
  state.title = ''
  addEventModal.value = false
  addEventDrawer.value = false
}

const promptDeleteEvent = (id: string) => {
  eventToDeleteId.value = id
  deleteConfirmModal.value = true
}

const confirmDeleteEvent = () => {
  if (eventToDeleteId.value) {
    localEvents.value = localEvents.value.filter(e => e.id !== eventToDeleteId.value)
    saveToLocalStorage()
    toast.add({ title: 'حذف', description: 'تم حذف الحدث بنجاح.', color: 'error' })
  }
  deleteConfirmModal.value = false
  eventToDeleteId.value = null
}

const { getEventsForDate } = useCalendarEvents()

// دالة مساعدة لتوحيد ومقارنة التواريخ بغض النظر عن التقويم المعروض
const isSameDay = (d1: { year: number, month: number, day: number }, d2: DateValue) => {
  const converted = toCalendar(d2, new GregorianCalendar())
  return d1.year === converted.year && d1.month === converted.month && d1.day === converted.day
}

const selectedEvents = computed(() => {
  const baseEvents = getEventsForDate(calendarValue.value, activeConfig.value.calendar)
  const displayBaseEvents = baseEvents.map(e => ({ ...e, isCustom: false as const }))

  const currentDayCustoms = localEvents.value.filter(
    e => isSameDay(e.date, calendarValue.value)
  ).map(e => ({ ...e, isCustom: true }))

  return [...displayBaseEvents, ...currentDayCustoms]
})

const calendarOptions = [
  {
    id: 'gregorian',
    label: 'ميلادي',
    calendar: new GregorianCalendar(),
    locale: 'ar-SA-u-ca-gregory'
  },
  {
    id: 'umalqura',
    label: 'أم القرى',
    calendar: new IslamicUmalquraCalendar(),
    locale: 'ar-SA-u-ca-islamic-umalqura'
  },
  {
    id: 'tabular',
    label: 'الهجري الجدولي',
    calendar: new IslamicTabularCalendar(),
    locale: 'ar-SA-u-ca-islamic-tbla'
  }
] as const

const activeCalendarId = ref<'gregorian' | 'umalqura' | 'tabular'>('umalqura')

const activeConfig = computed(() => {
  return calendarOptions.find(c => c.id === activeCalendarId.value) ?? calendarOptions[1]
})

const createCalendar = () => activeConfig.value.calendar

const maxDots = 4

const typeColors: Record<string, string> = {
  annual: 'bg-rose-500',
  monthly: 'bg-blue-500',
  once: 'bg-amber-500',
  range: 'bg-green-500'
}

const getDayEvents = (day: DateValue) => {
  const baseEvents = getEventsForDate(day, activeConfig.value.calendar)
  const dayCustoms = localEvents.value.filter(
    e => isSameDay(e.date, day)
  )
  return [...baseEvents, ...dayCustoms]
}

const calendarDescriptions: Record<string, string> = {
  gregorian: 'التقويم الميلادي الشمسي: التقويم المدني الدولي الأكثر انتشاراً.',
  umalqura: 'تقويم أم القرى: تقويم هجري يعتمد على الحسابات الفلكية وفق مكة المكرمة (التقويم الرسمي السعودي).',
  tabular: 'التقويم الهجري الجدولي: تقويم هجري يعتمد على قواعد رياضية ودورية ثابتة للأشهر - يستخدم للتواريخ القديمة مثل تاريخ الميلاد.'
}

const currentDescription = computed(() => calendarDescriptions[activeCalendarId.value])

const today = now(getLocalTimeZone())
const baseDate = shallowRef(new CalendarDate(new GregorianCalendar(), today.year, today.month, today.day))

const goToToday = () => {
  const t = now(getLocalTimeZone())
  baseDate.value = new CalendarDate(new GregorianCalendar(), t.year, t.month, t.day)
}

const calendarValue = computed({
  get() {
    return toCalendar(baseDate.value, activeConfig.value.calendar)
  },
  set(newVal: DateValue | null) {
    if (newVal) {
      const convertedGregorian = toCalendar(newVal, new GregorianCalendar())
      baseDate.value = new CalendarDate(
        new GregorianCalendar(),
        convertedGregorian.year,
        convertedGregorian.month,
        convertedGregorian.day
      )
    }
  }
})

const isNotToday = computed(() => {
  const t = now(getLocalTimeZone())
  const currentGregorian = toCalendar(calendarValue.value, new GregorianCalendar())
  return (
    currentGregorian.year !== t.year
    || currentGregorian.month !== t.month
    || currentGregorian.day !== t.day
  )
})
</script>

<template>
  <div class="flex-1 flex flex-col">
    <div class="flex items-center gap-1 mb-3 border-b border-b-default border-b-dashed pb-3 h-16">
      <UButton
        size="md"
        :color="isNotToday ? 'primary' : 'neutral'"
        variant="subtle"
        class="mb-2"
        label="اليوم"
        @click="goToToday"
      />
      <UTabs
        v-model="activeCalendarId"
        :items="calendarOptions.map(c => ({ id: c.id, label: c.label }))"
        value-key="id"
        size="sm"
        class="w-full"
      />
    </div>

    <div class="max-h-100 2xl:max-h-140 overflow-y-auto">
      <UCalendar
        :key="activeCalendarId"
        v-model="calendarValue"
        variant="subtle"
        :create-calendar="createCalendar"
        :locale="activeConfig.locale"
        :prev-month-icon="'i-lucide-chevron-right'"
        :next-month-icon="'i-lucide-chevron-left'"
        :prev-year-icon="'i-lucide-chevrons-right'"
        :next-year-icon="'i-lucide-chevrons-left'"
        :ui="{
          cellTrigger: 'data-outside-view:hidden'
        }"
      >
        <template #day="{ day }">
          <div class="relative flex flex-col items-center justify-center w-full h-full">
            <span>{{ day.day }}</span>
            <div
              v-if="getDayEvents(day).length > 0"
              class="absolute bottom-1 flex flex-wrap items-center justify-center gap-0.5"
            >
              <span
                v-for="(event, index) in getDayEvents(day).slice(0, maxDots)"
                :key="index"
                :class="typeColors[event.type] || 'bg-amber-500'"
                class="w-1.5 h-1.5 rounded-full"
              />
              <span
                v-if="getDayEvents(day).length > maxDots"
                class="text-[9px] leading-none text-muted"
              >
                +{{ getDayEvents(day).length - maxDots }}
              </span>
            </div>
          </div>
        </template>
      </UCalendar>

      <div class="text-xs text-muted mb-3 px-4 mt-2 border rounded-2xl border-dashed border-default p-2 flex items-center justify-between">
        <span>{{ currentDescription }}</span>
      </div>

      <div class="hidden xl:flex border border-dashed text-primary font-semibold border-primary/40 rounded-2xl bg-primary/5 mt-auto flex-col justify-center px-4 py-2 text-sm gap-3">
        <UModal
          v-model:open="addEventModal"
          title="اضافة حدث"
        >
          <UButton
            variant="outline"
            size="sm"
            class="self-start"
          >
            اضافة حدث
          </UButton>
          <template #body>
            <UForm
              :schema="schema"
              :state="state"
              class="space-y-4"
              @submit="onSubmit"
            >
              <UFormField
                label="عنوان الحدث"
                name="title"
              >
                <UInput
                  v-model="state.title"
                  class="block"
                />
              </UFormField>
              <UButton
                type="submit"
                class="mt-3"
              >
                اضافة
              </UButton>
            </UForm>
          </template>
        </UModal>

        <template v-if="selectedEvents.length > 0">
          <div
            v-for="(event, index) in selectedEvents"
            :key="index"
            class="flex items-center justify-between border-b border-dashed border-primary/20 pb-1 last:border-0"
          >
            <div class="flex flex-col">
              <span>{{ event.title }}</span>
              <span
                v-if="'hijriText' in event && event.hijriText"
                class="text-xs text-muted font-normal"
              >
                الموافق: {{ event.hijriText }}
              </span>
            </div>
            <UButton
              v-if="event.isCustom"
              size="xs"
              color="error"
              variant="ghost"
              icon="i-lucide-trash"
              @click="promptDeleteEvent(event.id)"
            />
          </div>
        </template>
        <span
          v-else
          class="text-muted font-normal"
        >
          لا توجد احداث مسجلة في هذا التاريخ.
        </span>
      </div>

      <div class="xl:hidden mt-0 px-4">
        <UButton
          icon="i-lucide-calendar-days"
          color="primary"
          block
          variant="solid"
          @click="addEventDrawer = true"
        >
          عرض أحداث اليوم وإضافة حدث ({{ selectedEvents.length }})
        </UButton>
      </div>

      <UDrawer
        v-model:open="addEventDrawer"
        title="أحداث اليوم والتحكم بها"
      >
        <template #body>
          <div class="space-y-6">
            <div class="p-4 border border-dashed border-primary/40 rounded-2xl bg-primary/5 space-y-3">
              <h3 class="text-sm font-semibold text-primary">
                اضافة حدث جديد
              </h3>
              <UForm
                :schema="schema"
                :state="state"
                class="space-y-3"
                @submit="onSubmit"
              >
                <UFormField
                  label="عنوان الحدث"
                  name="title"
                >
                  <UInput
                    v-model="state.title"
                    class="block w-full"
                  />
                </UFormField>
                <UButton
                  type="submit"
                  size="sm"
                  class="mt-2"
                >
                  اضافة
                </UButton>
              </UForm>
            </div>

            <div class="space-y-3">
              <h3 class="text-sm font-semibold text-muted">
                الأحداث المسجلة في هذا التاريخ:
              </h3>
              <template v-if="selectedEvents.length > 0">
                <div
                  v-for="(event, index) in selectedEvents"
                  :key="index"
                  class="flex items-center justify-between border-b border-dashed border-default pb-2 last:border-0"
                >
                  <div class="flex flex-col">
                    <span class="text-sm font-medium">{{ event.title }}</span>
                    <span
                      v-if="'hijriText' in event && event.hijriText"
                      class="text-xs text-muted font-normal"
                    >
                      الموافق: {{ event.hijriText }}
                    </span>
                  </div>
                  <UButton
                    v-if="event.isCustom"
                    size="xs"
                    color="error"
                    variant="ghost"
                    icon="i-lucide-trash"
                    @click="promptDeleteEvent(event.id)"
                  />
                </div>
              </template>
              <span
                v-else
                class="text-xs text-muted font-normal"
              >
                لا توجد احداث مسجلة في هذا التاريخ.
              </span>
            </div>
          </div>
        </template>
      </UDrawer>

      <UModal
        v-model:open="deleteConfirmModal"
        title="تأكيد الحذف"
      >
        <template #body>
          <div class="space-y-4">
            <p class="text-sm text-muted">
              هل أنت متأكد من رغبتك في حذف هذا الحدث؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="subtle"
                label="إلغاء"
                @click="deleteConfirmModal = false"
              />
              <UButton
                color="error"
                label="تأكيد الحذف"
                @click="confirmDeleteEvent"
              />
            </div>
          </div>
        </template>
      </UModal>
    </div>
  </div>
</template>
