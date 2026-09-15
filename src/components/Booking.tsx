import { useEffect, useMemo, useState } from 'react'
import s from './Booking.module.css'
import { SITE } from '../content/site'

/** Wednesday and Thursday afternoons over the next three weeks. */
const SLOT_TIMES = ['13:00', '14:00', '15:00', '16:00']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

type Day = { date: Date; slots: string[] }

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
    out.push({ date: day, slots: SLOT_TIMES })
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

/** Prefilled email as the alternative to a calendar slot. */
function mailUrl(name: string, company: string, message: string): string {
  const who = [name.trim(), company.trim()].filter(Boolean).join(', ')
  const q = new URLSearchParams({
    subject: `Hello from ${who || 'your website'}`,
    body: `${message.trim()}\n\n${who}`,
  })
  return `mailto:${SITE.email}?${q.toString().replace(/\+/g, '%20')}`
}

type Mode = 'meeting' | 'email'

export default function BookingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const days = useMemo(() => upcoming(), [])
  const [mode, setMode] = useState<Mode>('meeting')
  const [pick, setPick] = useState<{ d: number; t: string } | null>(null)
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [done, setDone] = useState<Mode | null>(null)
  const chosen = pick ? `${fmt(days[pick.d].date)}, ${pick.t}` : null
  const ready = mode === 'meeting' ? !!pick && name.trim().length > 1 : name.trim().length > 1 && message.trim().length > 3

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
    if (!ready) return
    if (mode === 'meeting') {
      if (!pick) return
      window.open(inviteUrl(days[pick.d].date, pick.t, name, company), '_blank', 'noopener')
    } else {
      window.location.href = mailUrl(name, company, message)
    }
    setDone(mode)
  }

  return (
    <div className={s.backdrop} onClick={onClose} role="presentation">
      <div className={s.modal} role="dialog" aria-modal="true" aria-labelledby="book-title" onClick={e => e.stopPropagation()}>
        <div className={s.head}>
          <h2 id="book-title">Get in touch</h2>
          <button type="button" className={s.close} onClick={onClose} aria-label="Close">×</button>
        </div>

        {done === 'meeting' ? (
          <div className={s.done}>
            <strong>Invite opened for {chosen}.</strong>
            <p>Save it in Google Calendar and it lands with me. I confirm from your calendar email within a day and send the video link.</p>
            <button type="button" className={s.btn} onClick={onClose}>Close</button>
          </div>
        ) : done === 'email' ? (
          <div className={s.done}>
            <strong>Your email app should be open.</strong>
            <p>Send it and I reply within a day. If nothing opened, write to <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
            <button type="button" className={s.btn} onClick={onClose}>Close</button>
          </div>
        ) : (
          <form onSubmit={submit} className={s.body}>
            <div className={s.modes} role="tablist" aria-label="How to get in touch">
              <button type="button" role="tab" aria-selected={mode === 'meeting'} className={[s.mode, mode === 'meeting' ? s.modeOn : ''].join(' ')} onClick={() => setMode('meeting')}>
                <strong>Book a meeting</strong><span>30 minutes on a video call</span>
              </button>
              <button type="button" role="tab" aria-selected={mode === 'email'} className={[s.mode, mode === 'email' ? s.modeOn : ''].join(' ')} onClick={() => setMode('email')}>
                <strong>Send an email</strong><span>Write a few lines, I reply within a day</span>
              </button>
            </div>

            {mode === 'meeting' && <>
            <p className={s.step}><span>1</span>Pick a time <em>Stockholm time, 30 minutes</em></p>
            <div className={s.days}>
              {days.map((day, di) => (
                <div key={day.date.toISOString()} className={s.day}>
                  <p className={s.dayName}>{fmt(day.date)}</p>
                  {day.slots.map(time => {
                    const on = pick?.d === di && pick.t === time
                    return (
                      <button key={time} type="button" aria-pressed={on}
                        className={[s.slot, on ? s.slotOn : ''].join(' ')}
                        onClick={() => setPick({ d: di, t: time })}>
                        {time}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
            </>}

            <p className={s.step}><span>{mode === 'meeting' ? '2' : '1'}</span>Your details</p>
            <div className={s.fields}>
              <label className={s.field}><span>Name</span><input value={name} onChange={e => setName(e.target.value)} autoComplete="name" required /></label>
              <label className={s.field}><span>Company</span><input value={company} onChange={e => setCompany(e.target.value)} autoComplete="organization" /></label>
              {mode === 'email' && (
                <label className={s.field + ' ' + s.fieldWide}><span>Message</span><textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="What you do, and what eats the week." required /></label>
              )}
            </div>

            <div className={s.actions}>
              {mode === 'meeting' ? (
                <>
                  <button type="submit" className={s.btn} disabled={!ready}>{chosen ? `Add ${chosen} to Google Calendar` : 'Add to Google Calendar'}</button>
                  <span className={s.note}>Opens a prefilled invite with me as guest. No Google account? Use <button type="button" className={s.linkBtn} onClick={() => setMode('email')}>Send an email</button> instead.</span>
                </>
              ) : (
                <>
                  <button type="submit" className={s.btn} disabled={!ready}>Open email</button>
                  <span className={s.note}>Opens your email app with the message filled in, to <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</span>
                </>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
