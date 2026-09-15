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
    const takenCount = 1 + (h % 2)
    const taken = new Set([h, (h + 2) % 4].slice(0, takenCount))
    out.push({ date: day, slots: SLOT_TIMES.map((t, k) => ({ time: t, taken: taken.has(k) })) })
  }
  return out
}

const fmt = (d: Date) => `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`

export default function Booking() {
  const days = useMemo(() => upcoming(), [])
  const [pick, setPick] = useState<{ d: number; t: string } | null>(null)
  const chosen = pick ? `${fmt(days[pick.d].date)}, ${pick.t}` : null
  const href = chosen
    ? `mailto:${SITE.email}?subject=${encodeURIComponent(`Meeting request: ${chosen} (Stockholm time)`)}&body=${encodeURIComponent(`Hi Philip,\n\nI would like to book ${chosen} (Stockholm time).\n\nA few lines about what we do and what we need:\n\n`)}`
    : undefined

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
                  <button
                    key={sl.time}
                    type="button"
                    disabled={sl.taken}
                    className={[s.slot, on ? s.slotOn : '', sl.taken ? s.slotTaken : ''].join(' ')}
                    onClick={() => setPick({ d: di, t: sl.time })}
                  >
                    {sl.time}{sl.taken && <span>Taken</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className={s.action}>
        <p className={s.note}>30 minutes on a video call, Stockholm time. Pick a slot and I confirm by email within a day.</p>
        {href
          ? <a className={s.btn} href={href}>Request {chosen}</a>
          : <span className={[s.btn, s.btnOff].join(' ')}>Pick a time</span>}
        <p className={s.alt}>None of these work? Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> with a time that does.</p>
      </div>
    </div>
  )
}
