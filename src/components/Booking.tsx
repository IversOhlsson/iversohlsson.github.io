import { useMemo, useState } from 'react'
import s from './Booking.module.css'
import { SITE } from '../content/site'

/** Wednesday and Thursday afternoons over the next three weeks. Some slots are already taken. */
const SLOT_TIMES = ['13:00', '14:00', '15:00', '16:00']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

type Day = { date: Date; slots: { time: string; taken: boolean }[] }

function upcoming(): Day[] {
  const out: Day[] = []
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 1)
  for (let i = 0; i < 24 && out.length < 6; i++) {
    const day = new Date(d)
    day.setDate(d.getDate() + i)
    const wd = day.getDay()
    if (wd !== 3 && wd !== 4) continue
    const h = (day.getDate() * 7 + day.getMonth() * 3 + wd) % 4
    const taken = new Set([h, (h + 2) % 4].slice(0, 1 + (h % 2)))
    out.push({ date: day, slots: SLOT_TIMES.map((t, k) => ({ time: t, taken: taken.has(k) })) })
  }
  return out
}

const fmt = (d: Date) => `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
const pad = (n: number) => String(n).padStart(2, '0')

/** Google Calendar event link: 30 minutes, Stockholm time, Philip as guest. Saving it sends him the invite. */
function inviteUrl(date: Date, time: string): string {
  const ymd = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
  const [h, m] = time.split(':').map(Number)
  const start = `${ymd}T${pad(h)}${pad(m)}00`
  const end = `${ymd}T${pad(h)}${pad(m + 30)}00`
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: 'Intro call · Philip Ivers Ohlsson',
    dates: `${start}/${end}`,
    ctz: 'Europe/Stockholm',
    details: 'A 30-minute video call about your business and what software could take off your plate. Philip sends the video link once the invite arrives.',
    add: SITE.email,
  })
  return `https://calendar.google.com/calendar/render?${q.toString()}`
}

export default function Booking() {
  const days = useMemo(() => upcoming(), [])
  const [pick, setPick] = useState<{ d: number; t: string } | null>(null)
  const chosen = pick ? `${fmt(days[pick.d].date)}, ${pick.t}` : null

  const choose = (di: number, time: string) => {
    setPick({ d: di, t: time })
    window.open(inviteUrl(days[di].date, time), '_blank', 'noopener')
  }

  return (
    <div className={s.wrap}>
      <div className={s.days}>
        {days.map((day, di) => (
          <div key={day.date.toISOString()} className={s.day}>
            <p className={s.dayName}>{fmt(day.date)}</p>
            <div className={s.slots}>
              {day.slots.map(sl => {
                const on = pick?.d === di && pick.t === sl.time
                return (
                  <button key={sl.time} type="button" disabled={sl.taken} aria-pressed={on}
                    className={[s.slot, on ? s.slotOn : '', sl.taken ? s.slotTaken : ''].join(' ')}
                    onClick={() => choose(di, sl.time)}>
                    {sl.time}{sl.taken && <span>Taken</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <p className={s.note}>
        {chosen
          ? <>Google Calendar opened with <strong>{chosen}</strong>. Save the invite and it lands with me. I confirm within a day.</>
          : <>Times are Stockholm time, 30 minutes on a video call. Pick one and it opens as a Google Calendar invite with me as guest.</>}
      </p>
    </div>
  )
}
