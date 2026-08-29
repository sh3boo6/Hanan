// composables/useCalendarEvents.ts
import { CalendarDate, GregorianCalendar, toCalendar } from '@internationalized/date'
import type { Calendar } from '@internationalized/date'
import eventsData from '~/data/calendar-events.json'

export interface CalendarEvent {
  title: string
  type: 'annual' | 'monthly' | 'once' | 'range'
  year?: number
  month?: number
  day?: number
  targetDay?: number
  start?: { year: number, month: number, day: number }
  end?: { year: number, month: number, day: number }
  hijriText?: string
}

export function useCalendarEvents() {
  const events = ref<CalendarEvent[]>(eventsData as CalendarEvent[])

  const getAdjustedMonthlyDay = (year: number, month: number, targetDay: number) => {
    const jsDate = new Date(year, month - 1, targetDay)
    const dayOfWeek = jsDate.getDay()
    if (dayOfWeek === 5) return targetDay - 1
    if (dayOfWeek === 6) return targetDay + 1
    return targetDay
  }

  const getGregorianEquivalent = (date: { year: number, month: number, day: number }, activeCalendar: Calendar) => {
    try {
      const calDate = new CalendarDate(activeCalendar, date.year, date.month, date.day)
      return toCalendar(calDate, new GregorianCalendar())
    } catch {
      return null
    }
  }

  const isWithinRange = (current: { year: number, month: number, day: number }, start?: { year: number, month: number, day: number }, end?: { year: number, month: number, day: number }) => {
    if (!start || !end) return false
    const currTime = new Date(current.year, current.month - 1, current.day).getTime()
    const startTime = new Date(start.year, start.month - 1, start.day).getTime()
    const endTime = new Date(end.year, end.month - 1, end.day).getTime()
    return currTime >= startTime && currTime <= endTime
  }

  const matchesEvent = (greg: { year: number, month: number, day: number }, event: CalendarEvent) => {
    if (event.type === 'annual') {
      return greg.month === event.month && greg.day === event.day
    }
    if (event.type === 'monthly' && event.targetDay) {
      const adjustedDay = getAdjustedMonthlyDay(greg.year, greg.month, event.targetDay)
      return greg.day === adjustedDay
    }
    if (event.type === 'once') {
      return greg.year === event.year && greg.month === event.month && greg.day === event.day
    }
    if (event.type === 'range') {
      return isWithinRange(greg, event.start, event.end)
    }
    return false
  }

  const hasEvent = (date: { year: number, month: number, day: number }, activeCalendar: Calendar) => {
    const greg = getGregorianEquivalent(date, activeCalendar)
    if (!greg) return false
    return events.value.some(event => matchesEvent(greg, event))
  }

  const getEventsForDate = (date: { year: number, month: number, day: number }, activeCalendar: Calendar) => {
    const greg = getGregorianEquivalent(date, activeCalendar)
    if (!greg) return []
    return events.value.filter(event => matchesEvent(greg, event))
  }

  return {
    events,
    hasEvent,
    getEventsForDate
  }
}
