import { RiCalendarLine } from '@remixicon/react'
import bookmyshowIcon from '../assets/bookmyshow.png'
import nexasIcon from '../assets/nexas.png'
import swiggyIcon from '../assets/swiggy.png'

export interface PlanMyWeekEvent {
  time: string
  title: string
  type: 'movie' | 'restaurant' | 'bowling'
  agentId: string
}

export interface PlanMyWeekDay {
  date: string
  label: string
  events: PlanMyWeekEvent[]
}

interface PlanMyWeekPageProps {
  mode: 'week' | 'weekend'
  days: PlanMyWeekDay[]
  onAgentActive?: (agentId: string) => void
}

const AGENT_ICONS: Record<string, string> = {
  bookmyshow: bookmyshowIcon,
  swiggy: swiggyIcon,
  nexas: nexasIcon
}

function sortEventsByTime(events: PlanMyWeekEvent[]): PlanMyWeekEvent[] {
  return [...events].sort((a, b) => {
    const toMinutes = (t: string) => {
      const [h, m] = t.replace(/\s*(am|pm)/i, '').split(':').map(Number)
      const isPm = /pm/i.test(t)
      return (h % 12) * 60 + (m || 0) + (isPm ? 12 * 60 : 0)
    }
    return toMinutes(a.time) - toMinutes(b.time)
  })
}

export default function PlanMyWeekPage({
  mode,
  days,
  onAgentActive
}: PlanMyWeekPageProps) {
  const displayDays = days.length > 0 ? days : (mode === 'weekend'
    ? [
        { date: '', label: 'Saturday', events: [] as PlanMyWeekEvent[] },
        { date: '', label: 'Sunday', events: [] as PlanMyWeekEvent[] }
      ]
    : Array.from({ length: 7 }, (_, i) => ({
        date: '',
        label: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i],
        events: [] as PlanMyWeekEvent[]
      })))

  return (
    <div className="w-full bg-white min-h-full p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
            <RiCalendarLine size={24} className="text-gray-700" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {mode === 'weekend' ? 'Plan the weekend' : 'Plan my week'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {mode === 'weekend' ? '2 days' : '7 days'} · Movies, dining, bowling
            </p>
          </div>
        </div>
      </div>

      <div className={`grid gap-6 ${mode === 'weekend' ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {displayDays.map((day, idx) => {
          const sortedEvents = sortEventsByTime(day.events)
          return (
            <div
              key={day.label + idx}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                {day.label}
                {day.date && <span className="font-normal text-gray-500 ml-1">{day.date}</span>}
              </div>
              <div className="space-y-3">
                {sortedEvents.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2">No events yet</p>
                ) : (
                  sortedEvents.map((event, eIdx) => {
                    const iconSrc = AGENT_ICONS[event.agentId] || nexasIcon
                    return (
                      <div
                        key={eIdx}
                        className="flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-50 border border-gray-100"
                        onMouseEnter={() => onAgentActive?.(event.agentId)}
                      >
                        <span className="text-xs font-medium text-gray-600 shrink-0 w-12">{event.time}</span>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0 bg-white border border-gray-200">
                          <img src={iconSrc} alt={event.agentId} className="w-5 h-5 object-contain" />
                        </div>
                        <span className="text-sm text-gray-900 truncate">{event.title}</span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
