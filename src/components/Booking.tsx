import { useEffect, useMemo, useState } from 'react'
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
function inviteUrl(date: Date, time: string, name: string, company: string): string {
  const ymd = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
  const [h, m] = time.split(':').map(Number)
  const who = company.trim() || name.trim()
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${who} / Philip Ivers Ohlsson`,
    dates: `${ymd}T${pad(h)}${pad(m)}00/${ymd}T${pad(h)}${pad(m + 30)}00`,
    ctz: 'Europe/Stockholm',
    details: `30-minute video call.\n\n${name.trim()}${company.trim() ? `, ${company.trim()}` : ''}\n\nBooked via iversohlsson.github.io`,
    add: SITE.email,
  })
  return `https://calendar.google.com/calendar/render?${q.toString()}`
}

export default function BookingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const days = useMemo(() => upcoming(), [])
  const [pick, setPick] = useState<{ d: number; t: string } | null>(null)
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [done, setDone] = useState(false)
  const chosen = pick ? `${fmt(days[pick.d].date)}, ${pick.t}` : null
  const ready = !!pick && name.trim().length > 1

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])

  if (!open) return null

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ready || !pick) return
    window.open(inviteUrl(days[pick.d].date, pick.t, name, company), '_blank', 'noopener')
    setDone(true)
  }

  return (
    <div className={s.backdrop} onClick={onClose} role="presentation">
      <div className={s.modal} role="dialog" aria-modal="true" aria-labelledby="book-title" onClick={e => e.stopPropagation()}>
        <div className={s.head}>
          <h2 id="book-title">Book a meeting</h2>
          <button type="button" className={s.close} onClick={onClose} aria-label="Close">×</button>
        </div>

        {done ? (
          <div className={s.done}>
            <strong>Invite opened for {chosen}.</strong>
            <p>Save it in Google Calendar and it lands with me. I confirm from your calendar email within a day and send the video link.</p>
            <button type="button" className={s.btn} onClick={onClose}>Close</button>
          </div>
        ) : (
          <form onSubmit={submit} className={s.body}>
            <p className={s.step}><span>1</span>Pick a time <em>Stockholm time, 30 minutes</em></p>
            <div className={s.days}>
              {days.map((day, di) => (
                <div key={day.date.toISOString()} className={s.day}>
                  <p className={s.dayName}>{fmt(day.date)}</p>
                  {day.slots.map(sl => {
                    const on = pick?.d === di && pick.t === sl.time
                    return (
                      <button key={sl.time} type="button" disabled={sl.taken} aria-pressed={on}
                        className={[s.slot, on ? s.slotOn : '', sl.taken ? s.slotTaken : ''].join(' ')}
                        onClick={() => setPick({ d: di, t: sl.time })}>
                        {sl.time}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            <p className={s.step}><span>2</span>Your details</p>
            <div className={s.fields}>
              <label className={s.field}><span>Name</span><input value={name} onChange={e => setName(e.target.value)} autoComplete="name" required /></label>
              <label className={s.field}><span>Company</span><input value={company} onChange={e => setCompany(e.target.value)} autoComplete="organization" /></label>
            </div>

            <div className={s.actions}>
              <button type="submit" className={s.btn} disabled={!ready}>{chosen ? `Add ${chosen} to Google Calendar` : 'Add to Google Calendar'}</button>
              <span className={s.note}>Opens a prefilled invite with me as guest. No Google account? Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</span>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
