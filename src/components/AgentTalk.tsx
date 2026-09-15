import { useEffect, useState } from 'react'
import s from './AgentTalk.module.css'

/** Hero animation: agents, systems and a person passing one job along, message by message. Loops through a few jobs. */
type Who = 'agent' | 'person' | 'system'
type Line = { who: Who; name: string; text: string }
type Job = { title: string; lines: Line[] }

const JOBS: Job[] = [
  { title: 'Order PO-4471 · Nordic Parts', lines: [
    { who: 'system', name: 'Inbox', text: 'New email from Bergström Verkstad. PO-4471.pdf attached.' },
    { who: 'agent', name: 'Reader', text: 'Read the order. Customer, part, 1 200 pcs, 30 days net. Delivery date missing.' },
    { who: 'agent', name: 'Planner', text: 'Usual lead time gives 30 Oct. Asking Anna before I commit.' },
    { who: 'person', name: 'Anna', text: 'Use 30 Oct.' },
    { who: 'agent', name: 'Writer', text: 'Order in the production plan. Confirmation published to the customer portal.' },
    { who: 'system', name: 'Log', text: 'Done in 41 s. Every step on the record.' },
  ] },
  { title: 'Due diligence · Halden Systems', lines: [
    { who: 'system', name: 'Data room', text: 'Halden Systems uploaded 6 documents.' },
    { who: 'agent', name: 'Readers', text: '53 facts extracted, each linked to its page.' },
    { who: 'agent', name: 'Lookup', text: 'Bolagsverket, UC, sanctions: registered 2014, rating 4 of 5, no matches.' },
    { who: 'agent', name: 'Checks', text: 'Liability insurance expired 31 Mar. Flagging it.' },
    { who: 'person', name: 'Maria', text: 'Ask them for a current certificate.' },
    { who: 'agent', name: 'Writer', text: 'Request sent. Report drafted, waiting for your approval.' },
  ] },
  { title: 'Fleet · Truck 12', lines: [
    { who: 'system', name: 'Truck 12', text: 'Lost connection 13:02. Recording locally.' },
    { who: 'agent', name: 'Checker', text: 'Checked the delivery plan. Nothing at risk yet.' },
    { who: 'agent', name: 'Notifier', text: 'Told Jonas: no action needed.' },
    { who: 'system', name: 'Truck 12', text: 'Back online 13:40. 38 minutes synced.' },
    { who: 'system', name: 'Log', text: 'No one was alarmed. Everything on the record.' },
  ] },
]

const TYPING_MS = 750
const HOLD_MS = 3200
const readMs = (t: string) => 900 + t.length * 22

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function AgentTalk() {
  const [still] = useState(reducedMotion)
  const [job, setJob] = useState(0)
  const [shown, setShown] = useState(() => (still ? JOBS[0].lines.length : 0))
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    if (still) return
    let t: number
    const lines = JOBS[job].lines
    if (shown < lines.length) {
      const prev = shown > 0 ? readMs(lines[shown - 1].text) : 300
      t = window.setTimeout(() => {
        setTyping(true)
        t = window.setTimeout(() => { setTyping(false); setShown(n => n + 1) }, TYPING_MS)
      }, prev)
    } else {
      t = window.setTimeout(() => { setShown(0); setJob(j => (j + 1) % JOBS.length) }, HOLD_MS)
    }
    return () => window.clearTimeout(t)
  }, [job, shown, still])

  const cur = JOBS[job]
  const done = shown >= cur.lines.length
  return (
    <div className={s.visual} aria-hidden="true">
      <div className={s.glow} />
      <div className={s.window}>
        <div className={s.bar}>
          <span /><span /><span />
          <b className={s.jobTitle} key={cur.title}>{cur.title}</b>
          <em className={done ? s.doneTag : s.live}>{done ? 'Done' : 'Agents working'}</em>
        </div>
        <ol className={s.feed} key={job}>
          {cur.lines.slice(0, shown).map((l, i) => (
            <li key={i} className={[s.line, s[l.who], still ? s.noAnim : ''].join(' ')}>
              <span className={s.chip}>{l.name}</span>
              <p className={s.msg}>{l.text}</p>
            </li>
          ))}
          {typing && !done && (
            <li className={[s.line, s[cur.lines[shown].who]].join(' ')}>
              <span className={s.chip}>{cur.lines[shown].name}</span>
              <p className={s.msg + ' ' + s.dots}><i /><i /><i /></p>
            </li>
          )}
        </ol>
      </div>
    </div>
  )
}
