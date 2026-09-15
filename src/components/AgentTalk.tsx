import { useEffect, useState } from 'react'
import s from './AgentTalk.module.css'

/**
 * Hero animation. For each job it shows the conversation first (agents, systems and a person passing
 * the job along), then flips to the shape of that flow inside a Read / Check / Act frame. Then the next job.
 */
type Who = 'agent' | 'person' | 'system'
type Line = { who: Who; name: string; text: string }
type Node = { id: string; who: Who; label: string; col: 0 | 1 | 2; row: number }
type Edge = { from: string; to: string; loop?: boolean }
type Job = { title: string; shape: string; lines: Line[]; nodes: Node[]; edges: Edge[]; order: string[] }

const JOBS: Job[] = [
  { title: 'Order PO-4471 · Nordic Parts', shape: 'One in, one out. A person on the missing piece.',
    lines: [
      { who: 'system', name: 'Inbox', text: 'New email from Bergström Verkstad. PO-4471.pdf attached.' },
      { who: 'agent', name: 'Reader', text: 'Read the order. Customer, part, 1 200 pcs, 30 days net. Delivery date missing.' },
      { who: 'agent', name: 'Planner', text: 'Usual lead time gives 30 Oct. Asking Anna before I commit.' },
      { who: 'person', name: 'Anna', text: 'Use 30 Oct.' },
      { who: 'agent', name: 'Writer', text: 'Order in the production plan. Confirmation published to the customer portal.' },
      { who: 'system', name: 'Log', text: 'Done in 41 s. Every step on the record.' },
    ],
    nodes: [
      { id: 'inbox', who: 'system', label: 'Inbox', col: 0, row: 0 }, { id: 'reader', who: 'agent', label: 'Reader', col: 0, row: 2 },
      { id: 'planner', who: 'agent', label: 'Planner', col: 1, row: 0 }, { id: 'anna', who: 'person', label: 'Anna', col: 1, row: 2 },
      { id: 'writer', who: 'agent', label: 'Writer', col: 2, row: 0 }, { id: 'portal', who: 'system', label: 'Portal', col: 2, row: 2 },
    ],
    edges: [{ from: 'inbox', to: 'reader' }, { from: 'reader', to: 'planner' }, { from: 'planner', to: 'anna' }, { from: 'anna', to: 'writer' }, { from: 'writer', to: 'portal' }],
    order: ['inbox', 'reader', 'planner', 'anna', 'writer', 'portal'] },
  { title: 'Due diligence · Halden Systems', shape: 'Six readers at once, outside lookups, your checks. Re-checked every Monday.',
    lines: [
      { who: 'system', name: 'Data room', text: 'Halden Systems uploaded 6 documents.' },
      { who: 'agent', name: 'Readers', text: '53 facts extracted, each linked to its page.' },
      { who: 'agent', name: 'Lookup', text: 'Bolagsverket, UC, sanctions: registered 2014, rating 4 of 5, no matches.' },
      { who: 'agent', name: 'Checks', text: 'Liability insurance expired 31 Mar. Flagging it.' },
      { who: 'person', name: 'Maria', text: 'Ask them for a current certificate.' },
      { who: 'agent', name: 'Writer', text: 'Request sent. Report drafted, waiting for your approval.' },
    ],
    nodes: [
      { id: 'room', who: 'system', label: 'Data room', col: 0, row: 0 },
      { id: 'r1', who: 'agent', label: 'Reader', col: 0, row: 1.6 }, { id: 'r2', who: 'agent', label: 'Reader', col: 0, row: 2.4 }, { id: 'r3', who: 'agent', label: 'Reader ×6', col: 0, row: 3.2 },
      { id: 'lookup', who: 'agent', label: 'Lookups', col: 1, row: 0 }, { id: 'checks', who: 'agent', label: 'Your checks', col: 1, row: 1.6 }, { id: 'maria', who: 'person', label: 'Maria', col: 1, row: 3.2 },
      { id: 'writer', who: 'agent', label: 'Writer', col: 2, row: 0 }, { id: 'report', who: 'system', label: 'Report', col: 2, row: 1.6 },
    ],
    edges: [{ from: 'room', to: 'r1' }, { from: 'room', to: 'r2' }, { from: 'room', to: 'r3' }, { from: 'r2', to: 'lookup' }, { from: 'lookup', to: 'checks' }, { from: 'checks', to: 'maria' }, { from: 'checks', to: 'writer' }, { from: 'writer', to: 'report' }, { from: 'report', to: 'checks', loop: true }],
    order: ['room', 'r1', 'r2', 'r3', 'lookup', 'checks', 'maria', 'writer', 'report'] },
  { title: 'Fleet · Truck 12', shape: 'Works offline. Checks before it tells anyone. Syncs on its own.',
    lines: [
      { who: 'system', name: 'Truck 12', text: 'Lost connection 13:02. Recording locally.' },
      { who: 'agent', name: 'Checker', text: 'Checked the delivery plan. Nothing at risk yet.' },
      { who: 'agent', name: 'Notifier', text: 'Told Jonas: no action needed.' },
      { who: 'system', name: 'Truck 12', text: 'Back online 13:40. 38 minutes synced.' },
      { who: 'system', name: 'Log', text: 'No one was alarmed. Everything on the record.' },
    ],
    nodes: [
      { id: 'truck', who: 'system', label: 'Truck 12', col: 0, row: 0 }, { id: 'local', who: 'system', label: 'Local store', col: 0, row: 2 },
      { id: 'checker', who: 'agent', label: 'Checker', col: 1, row: 0 }, { id: 'plan', who: 'system', label: 'Delivery plan', col: 1, row: 2 },
      { id: 'notifier', who: 'agent', label: 'Notifier', col: 2, row: 0 }, { id: 'jonas', who: 'person', label: 'Jonas', col: 2, row: 2 }, { id: 'sync', who: 'system', label: 'Sync', col: 0, row: 3.2 },
    ],
    edges: [{ from: 'truck', to: 'local' }, { from: 'truck', to: 'checker' }, { from: 'checker', to: 'plan' }, { from: 'checker', to: 'notifier' }, { from: 'notifier', to: 'jonas' }, { from: 'local', to: 'sync' }, { from: 'sync', to: 'truck', loop: true }],
    order: ['truck', 'local', 'checker', 'plan', 'notifier', 'jonas', 'sync'] },
]

const TYPING_MS = 750
const HOLD_CHAT_MS = 1800
const STEP_MS = 520
const HOLD_FLOW_MS = 3600
const readMs = (t: string) => 900 + t.length * 22
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

type View = 'chat' | 'flow'

export default function AgentTalk() {
  const [still] = useState(reducedMotion)
  const [job, setJob] = useState(0)
  const [view, setView] = useState<View>('chat')
  const [shown, setShown] = useState(() => (still ? JOBS[0].lines.length : 0))
  const [typing, setTyping] = useState(false)
  const [step, setStep] = useState(() => (still ? JOBS[0].order.length : 0))

  useEffect(() => {
    if (still) return
    let t: number
    const cur = JOBS[job]
    if (view === 'chat') {
      if (shown < cur.lines.length) {
        const prev = shown > 0 ? readMs(cur.lines[shown - 1].text) : 300
        t = window.setTimeout(() => {
          setTyping(true)
          t = window.setTimeout(() => { setTyping(false); setShown(n => n + 1) }, TYPING_MS)
        }, prev)
      } else {
        t = window.setTimeout(() => { setStep(0); setView('flow') }, HOLD_CHAT_MS)
      }
    } else if (step < cur.order.length) {
      t = window.setTimeout(() => setStep(n => n + 1), STEP_MS)
    } else {
      t = window.setTimeout(() => { setShown(0); setJob(j => (j + 1) % JOBS.length); setView('chat') }, HOLD_FLOW_MS)
    }
    return () => window.clearTimeout(t)
  }, [job, view, shown, step, still])

  const cur = JOBS[job]
  const chatDone = shown >= cur.lines.length
  return (
    <div className={s.visual} aria-hidden="true">
      <div className={s.glow} />
      <div className={s.window}>
        <div className={s.bar}>
          <span /><span /><span />
          <b className={s.jobTitle} key={cur.title}>{cur.title}</b>
          <div className={s.tabs}>
            <i className={view === 'chat' ? s.tabOn : ''}>Conversation</i>
            <i className={view === 'flow' ? s.tabOn : ''}>Flow</i>
          </div>
        </div>
        <div className={s.body}>
          {(view === 'chat' || still) && (
            <ol className={s.feed} key={'c' + job}>
              {cur.lines.slice(0, shown).map((l, i) => (
                <li key={i} className={[s.line, s[l.who], still ? s.noAnim : ''].join(' ')}>
                  <span className={s.chip}>{l.name}</span>
                  <p className={s.msg}>{l.text}</p>
                </li>
              ))}
              {typing && !chatDone && (
                <li className={[s.line, s[cur.lines[shown].who]].join(' ')}>
                  <span className={s.chip}>{cur.lines[shown].name}</span>
                  <p className={s.msg + ' ' + s.dots}><i /><i /><i /></p>
                </li>
              )}
            </ol>
          )}
          {view === 'flow' && !still && <Flow job={cur} step={step} key={'f' + job} />}
        </div>
      </div>
    </div>
  )
}

/* Read / Check / Act frame with this job's nodes lighting up in order. */
const W = 520, H = 300, NW = 108, NH = 28
const COLX = [96, 260, 424]
const rowY = (r: number) => 66 + r * 52

function Flow({ job, step }: { job: Job; step: number }) {
  const at = new Map(job.nodes.map(n => [n.id, { x: COLX[n.col], y: rowY(n.row) }]))
  const lit = new Set(job.order.slice(0, step))
  const path = (e: Edge) => {
    const a = at.get(e.from)!, b = at.get(e.to)!
    if (e.loop && a.x === b.x) {
      const x = a.x - NW / 2, bulge = x - 36
      return `M${x} ${a.y} C${bulge} ${a.y} ${bulge} ${b.y} ${x} ${b.y}`
    }
    if (e.loop) {
      const y = Math.max(a.y, b.y) + NH / 2 + 26
      return `M${a.x} ${a.y + NH / 2} C${a.x} ${y} ${b.x} ${y} ${b.x} ${b.y + NH / 2}`
    }
    if (a.x === b.x) return `M${a.x} ${a.y + NH / 2} L${b.x} ${b.y - NH / 2}`
    const x1 = a.x + NW / 2, x2 = b.x - NW / 2, mx = (x1 + x2) / 2
    return `M${x1} ${a.y} C${mx} ${a.y} ${mx} ${b.y} ${x2} ${b.y}`
  }
  return (
    <div className={s.flow}>
      <svg viewBox={`0 0 ${W} ${H}`} className={s.svg}>
        {['Read', 'Check', 'Act'].map((h, i) => (
          <g key={h}>
            <text x={COLX[i]} y={26} className={s.colHead} textAnchor="middle">{h.toUpperCase()}</text>
            {i > 0 && <line x1={COLX[i] - 86} y1={14} x2={COLX[i] - 86} y2={H - 44} className={s.colLine} />}
          </g>
        ))}
        {job.edges.map((e, i) => (
          <path key={i} d={path(e)} className={[s.edge, e.loop ? s.edgeLoop : '', lit.has(e.from) && lit.has(e.to) ? s.edgeOn : ''].join(' ')} />
        ))}
        {job.nodes.map(n => {
          const p = at.get(n.id)!
          const on = lit.has(n.id)
          const now = job.order[step - 1] === n.id
          return (
            <g key={n.id} className={[s.node, s['n_' + n.who], on ? s.nodeOn : '', now ? s.nodeNow : ''].join(' ')}>
              <rect x={p.x - NW / 2} y={p.y - NH / 2} width={NW} height={NH} rx={NH / 2} />
              <text x={p.x} y={p.y + 4} textAnchor="middle">{n.label}</text>
            </g>
          )
        })}
        <text x={W / 2} y={H - 18} textAnchor="middle" className={s.shape}>{job.shape}</text>
      </svg>
    </div>
  )
}
