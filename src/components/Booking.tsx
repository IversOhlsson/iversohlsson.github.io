import { useMemo, useState } from 'react'
import s from './Booking.module.css'
import { FORM_ENDPOINT, SITE } from '../content/site'

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

type Status = 'idle' | 'sending' | 'sent' | 'mail' | 'error'

export default function Booking() {
  const days = useMemo(() => upcoming(), [])
  const [pick, setPick] = useState<{ d: number; t: string } | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [about, setAbout] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const chosen = pick ? `${fmt(days[pick.d].date)}, ${pick.t}` : null
  const ready = !!chosen && name.trim().length > 1 && /.+@.+\..+/.test(email)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ready || !chosen) return
    const subject = `Meeting request: ${chosen} (Stockholm time)`
    const body = `Requested time: ${chosen} (Stockholm time)\nName: ${name}\nEmail: ${email}\n\nAbout the business:\n${about}\n`
    if (FORM_ENDPOINT) {
      setStatus('sending')
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ _subject: subject, slot: chosen, name, email, about, _replyto: email }),
        })
        setStatus(res.ok ? 'sent' : 'error')
      } catch {
        setStatus('error')
      }
      return
    }
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setStatus('mail')
  }

  if (status === 'sent') {
    return (
      <div className={s.done}>
        <strong>Request sent for {chosen}.</strong>
        <p>I confirm by email to {email} within a day, with a calendar invite.</p>
      </div>
    )
  }

  return (
    <form className={s.wrap} onSubmit={submit}>
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
                    onClick={() => setPick({ d: di, t: sl.time })}>
                    {sl.time}{sl.taken && <span>Taken</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className={s.form}>
        <p className={s.picked}>{chosen ? <>Requesting <strong>{chosen}</strong>, Stockholm time · 30 minutes on a video call</> : 'Pick a time above, then leave your details.'}</p>
        <div className={s.fields}>
          <label className={s.field}><span>Name</span><input value={name} onChange={e => setName(e.target.value)} autoComplete="name" required /></label>
          <label className={s.field}><span>Email</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required /></label>
          <label className={[s.field, s.fieldWide].join(' ')}><span>A line about your business and what slows you down</span><textarea value={about} onChange={e => setAbout(e.target.value)} rows={3} /></label>
        </div>
        <div className={s.actions}>
          <button type="submit" className={s.btn} disabled={!ready || status === 'sending'}>
            {status === 'sending' ? 'Sending…' : chosen ? `Request ${chosen}` : 'Request this time'}
          </button>
          <span className={s.note}>I confirm by email within a day and send the calendar invite.</span>
        </div>
        {status === 'mail' && <p className={s.info}>Your email app should have opened with the request. If not, write to <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>}
        {status === 'error' && <p className={s.info}>Something went wrong sending that. Please email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> with your time.</p>}
      </div>
    </form>
  )
}
