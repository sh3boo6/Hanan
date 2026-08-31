// app/composables/useSharedState.ts
import type { Ref } from 'vue'

/**
 * Shared reactive state for layout components rendered across desktop and mobile viewports.
 * Uses Nuxt's `useState` to guarantee a single source of truth across duplicate component instances,
 * preventing state desynchronization and data loss on screen resize.
 */

// ========================
// Calendar Shared State
// ========================

export interface CalendarFormState {
  title: string
}

export interface CustomCalendarEvent {
  id: string
  title: string
  date: { year: number, month: number, day: number }
  type: string
}

export interface CalendarSharedState {
  events: Ref<CustomCalendarEvent[]>
  addEventModal: Ref<boolean>
  addEventDrawer: Ref<boolean>
  deleteConfirmModal: Ref<boolean>
  eventToDeleteId: Ref<string | null>
  activeCalendarId: Ref<'gregorian' | 'umalqura' | 'tabular'>
  formState: Ref<CalendarFormState>
}

export function useCalendarSharedState(): CalendarSharedState {
  const events = useState<CustomCalendarEvent[]>('shared-calendar-events', () => [])

  const addEventModal = useState<boolean>('shared-calendar-add-modal', () => false)
  const addEventDrawer = useState<boolean>('shared-calendar-add-drawer', () => false)
  const deleteConfirmModal = useState<boolean>('shared-calendar-delete-modal', () => false)
  const eventToDeleteId = useState<string | null>('shared-calendar-delete-id', () => null)
  const activeCalendarId = useState<'gregorian' | 'umalqura' | 'tabular'>('shared-calendar-active-id', () => 'umalqura')
  const formState = useState<CalendarFormState>('shared-calendar-form-state', () => ({ title: '' }))

  if (import.meta.client) {
    onMounted(() => {
      const saved = localStorage.getItem('custom_calendar_events')
      if (saved) {
        try {
          events.value = JSON.parse(saved)
        } catch {
          // ignore corrupt data
        }
      }
    })

    watch(events, (newVal) => {
      localStorage.setItem('custom_calendar_events', JSON.stringify(newVal))
    }, { deep: true })
  }

  return {
    events,
    addEventModal,
    addEventDrawer,
    deleteConfirmModal,
    eventToDeleteId,
    activeCalendarId,
    formState
  }
}

// ========================
// QR Code Shared State
// ========================

export interface QrSharedState {
  data: Ref<string | null>
  dataUrl: Ref<string | null>
  generateModal: Ref<boolean>
  text: Ref<string>
}

export function useQrSharedState(): QrSharedState {
  const data = useState<string | null>('shared-qr-data', () => null)
  const dataUrl = useState<string | null>('shared-qr-data-url', () => null)
  const generateModal = useState<boolean>('shared-qr-generate-modal', () => false)
  const text = useState<string>('shared-qr-text', () => '')

  return {
    data,
    dataUrl,
    generateModal,
    text
  }
}
