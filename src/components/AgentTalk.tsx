import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import s from './AgentTalk.module.css'

/**
 * Hero animation: one agent run at a time. Something arrives, the agent calls its tools and a person,
 * then hands the result on. A packet glides along the graph while the trace below logs every call.
 * One requestAnimationFrame clock drives it, so motion is continuous rather than a chain of timeouts.
 */
type Who = 'system' | 'person'
type Kind = 'api' | 'llm' | 'person' | 'io'
type Tool = { id: string; label: string; who: Who }
type Call = { tool: string; kind: Kind; m: string; path: string; res: string; flag?: boolean }
type Job = { title: string; input: string; output: string; tools: Tool[]; event: { path: string; res: string }; calls: Call[]; done: string }

const JOBS: Job[] = [
  { title: 'Order PO-4471 · Nordic Parts', input: 'Inbox', output: 'Portal',
    tools: [{ id: 'docs', label: 'Documents', who: 'system' }, { id: 'erp', label: 'ERP', who: 'system' }, { id: 'anna', label: 'Anna', who: 'person' }, { id: 'plan', label: 'Plan', who: 'system' }],
    event: { path: 'inbox · mail from Bergström Verkstad', res: 'PO-4471.pdf' },
    calls: [
      { tool: 'docs', kind: 'llm', m: 'POST', path: '/documents/parse  PO-4471.pdf', res: '4 of 5 fields · date missing', flag: true },
      { tool: 'erp', kind: 'api', m: 'GET', path: '/erp/parts/AB-220/lead-time', res: '30 Oct · 64 ms' },
      { tool: 'anna', kind: 'person', m: 'ASK', path: 'Anna · “Deliver 30 Oct?”', res: 'approved · 2 min' },
      { tool: 'plan', kind: 'api', m: 'POST', path: '/plan/orders  PO-4471', res: '201 · 210 ms' },
    ],
    done: 'confirmed · 41 s · logged' },
  { title: 'Due diligence · Halden Systems', input: 'Data room', output: 'Report',
    tools: [{ id: 'docs', label: 'Documents', who: 'system' }, { id: 'reg', label: 'Registry', who: 'system' }, { id: 'credit', label: 'Credit', who: 'system' }, { id: 'sanc', label: 'Sanctions', who: 'system' }, { id: 'maria', label: 'Maria', who: 'person' }],
    event: { path: 'data room · Halden Systems', res: '6 documents' },
    calls: [
      { tool: 'docs', kind: 'llm', m: 'POST', path: '/documents/parse  6 files', res: '53 facts · 4.2 s' },
      { tool: 'reg', kind: 'api', m: 'GET', path: 'api.bolagsverket.se/company/559122-1421', res: 'registered 2014 · 180 ms' },
      { tool: 'credit', kind: 'api', m: 'GET', path: 'api.uc.se/rating/559122-1421', res: '4 of 5 · 240 ms' },
      { tool: 'sanc', kind: 'api', m: 'GET', path: '/sanctions/screen  Halden Systems', res: 'no matches · 90 ms' },
      { tool: 'docs', kind: 'llm', m: 'RUN', path: 'checks/insurance  policy.pdf', res: 'expired 31 Mar', flag: true },
      { tool: 'maria', kind: 'person', m: 'ASK', path: 'Maria · “Request a new certificate?”', res: 'yes · 6 min' },
    ],
    done: '6 calls · draft for approval · logged' },
  { title: 'Fleet · Truck 12', input: 'Truck 12', output: 'Fleet log',
    tools: [{ id: 'local', label: 'Local store', who: 'system' }, { id: 'plan', label: 'Plan', who: 'system' }, { id: 'jonas', label: 'Jonas', who: 'person' }, { id: 'sync', label: 'Sync', who: 'system' }],
    event: { path: 'truck 12 · connection lost', res: '13:02' },
    calls: [
      { tool: 'local', kind: 'io', m: 'PUT', path: 'local://events  offline', res: 'queued · 2 ms' },
      { tool: 'plan', kind: 'api', m: 'GET', path: '/plan/deliveries?truck=12', res: '3 stops · no risk · 70 ms' },
      { tool: 'jonas', kind: 'person', m: 'PUSH', path: 'Jonas · “Truck 12 offline. No action needed.”', res: 'seen · 13:04' },
      { tool: 'sync', kind: 'api', m: 'POST', path: '/fleet/sync  412 events', res: 'online 13:40 · 200' },
    ],
    done: '4 calls · no one alarmed · logged' },
]

/* ---------- timing ---------- */
const T = { trigger: 750, think: 650, req: 460, res: 460, gap: 260, act: 750, done: 3400, out: 450 }
const WORK: Record<Kind, number> = { api: 560, io: 400, llm: 1000, person: 1200 }
type SegKind = 'trigger' | 'think' | 'req' | 'work' | 'res' | 'gap' | 'act' | 'done' | 'out'
type Seg = { kind: SegKind; call: number; start: number; dur: number }

function schedule(job: Job): Seg[] {
  const segs: Seg[] = []
  let t = 0
  const add = (kind: SegKind, dur: number, call = -1) => { segs.push({ kind, call, start: t, dur }); t += dur }
  add('trigger', T.trigger); add('think', T.think)
  job.calls.forEach((c, i) => { add('req', T.req, i); add('work', WORK[c.kind], i); add('res', T.res, i); add('gap', T.gap, i) })
  add('act', T.act); add('done', T.done); add('out', T.out)
  return segs
}

/* ---------- geometry ---------- */
const R = 21, RING = 30, NH = 26
/* Desktop and phone sizes: graph height, top row y, the two tool rows, trace row height.
 * The phone breakpoint matches the CSS media query; phone rows are two lines tall. */
const PHONE = '(max-width: 640px)'
const SIZES = { wide: { H: 220, Y0: 62, YT: [158, 194], lineH: 26 }, compact: { H: 196, Y0: 54, YT: [138, 172], lineH: 42 } }
type Size = (typeof SIZES)['wide']
type P = { x: number; y: number }
type Curve = [P, P, P, P]
const pillW = (label: string) => Math.max(56, Math.round(label.length * 6.4) + 24)
const curve = (a: P, b: P, vertical: boolean): Curve => vertical
  ? [a, { x: a.x, y: a.y + (b.y - a.y) * 0.55 }, { x: b.x, y: b.y - (b.y - a.y) * 0.55 }, b]
  : [a, { x: a.x + (b.x - a.x) / 3, y: a.y }, { x: b.x - (b.x - a.x) / 3, y: b.y }, b]
const d = ([a, c1, c2, b]: Curve) => `M${a.x} ${a.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${b.x} ${b.y}`
const at = ([a, c1, c2, b]: Curve, t: number): P => {
  const u = 1 - t, w0 = u * u * u, w1 = 3 * u * u * t, w2 = 3 * u * t * t, w3 = t * t * t
  return { x: w0 * a.x + w1 * c1.x + w2 * c2.x + w3 * b.x, y: w0 * a.y + w1 * c1.y + w2 * c2.y + w3 * b.y }
}
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function layout(job: Job, W: number, { H, Y0, YT }: Size) {
  const wi = pillW(job.input), wo = pillW(job.output)
  const input = { x: 12 + wi / 2, y: Y0, w: wi }
  const output = { x: W - 12 - wo / 2, y: Y0, w: wo }
  const agent = { x: W / 2, y: Y0 }
  const n = job.tools.length
  const span = Math.min(W - 110, (n - 1) * 116)
  const tools = job.tools.map((t, i) => ({ ...t, x: n === 1 ? W / 2 : W / 2 - span / 2 + (span * i) / (n - 1), y: YT[i % 2], w: pillW(t.label) }))
  const eIn = curve({ x: input.x + wi / 2, y: Y0 }, { x: agent.x - RING, y: Y0 }, false)
  const eOut = curve({ x: agent.x + RING, y: Y0 }, { x: output.x - wo / 2, y: Y0 }, false)
  const eByTool: Record<string, Curve> = {}
  for (const t of tools) eByTool[t.id] = curve({ x: agent.x, y: Y0 + RING }, { x: t.x, y: t.y - NH / 2 }, true)
  return { W, H, input, output, agent, tools, eIn, eOut, eByTool }
}
type Geo = ReturnType<typeof layout>

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function useMedia(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatches(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return matches
}

function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const read = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    read()
    const ro = new ResizeObserver(read)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, size] as const
}

export default function AgentTalk() {
  const [still] = useState(reducedMotion)
  const [job, setJob] = useState(0)
  const [seg, setSeg] = useState(0)
  const [visible, setVisible] = useState(true)
  const rootRef = useRef<HTMLDivElement>(null)
  const packetRef = useRef<SVGGElement>(null)
  const geoRef = useRef<Geo | null>(null)
  const elapsed = useRef(0)
  const [graphRef, graph] = useSize<HTMLDivElement>()
  const [traceRef, trace] = useSize<HTMLDivElement>()

  const cur = JOBS[job]
  const segs = useMemo(() => schedule(cur), [cur])
  const W = graph.w
  const size = useMedia(PHONE) ? SIZES.compact : SIZES.wide
  const geo = useMemo(() => (W > 0 ? layout(cur, W, size) : null), [cur, W, size])
  useEffect(() => { geoRef.current = geo }, [geo])

  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (still || !visible) return
    const last = segs[segs.length - 1]
    const total = last.start + last.dur
    const start = performance.now() - elapsed.current
    let lastIdx = -1
    let raf = 0
    const paint = (sg: Seg, p: number) => {
      const el = packetRef.current, g = geoRef.current
      if (!el || !g) return
      const e = ease(p)
      let pt: P | null = null
      if (sg.kind === 'trigger') pt = at(g.eIn, e)
      else if (sg.kind === 'act') pt = at(g.eOut, e)
      else if (sg.kind === 'req' || sg.kind === 'res') {
        const c = g.eByTool[cur.calls[sg.call].tool]
        pt = at(c, sg.kind === 'req' ? e : 1 - e)
      }
      if (!pt) { el.style.opacity = '0'; return }
      el.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`)
      el.style.opacity = String(Math.min(1, Math.min(p, 1 - p) * 7))
    }
    const frame = (now: number) => {
      const t = now - start
      elapsed.current = t
      if (t >= total) { elapsed.current = 0; setJob(j => (j + 1) % JOBS.length); setSeg(0); return }
      let i = 0
      while (i < segs.length - 1 && t >= segs[i].start + segs[i].dur) i++
      if (i !== lastIdx) { lastIdx = i; setSeg(i) }
      const sg = segs[i]
      paint(sg, Math.min(1, (t - sg.start) / sg.dur))
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [cur, segs, still, visible])

  /* Everything below derives from the current segment. */
  const sg = segs[still ? segs.length - 2 : Math.min(seg, segs.length - 1)]
  const n = cur.calls.length
  const inCall = sg.kind === 'req' || sg.kind === 'work' || sg.kind === 'res'
  const done = sg.kind === 'done' || sg.kind === 'out'
  const started = sg.call < 0 ? (sg.kind === 'trigger' || sg.kind === 'think' ? 0 : n) : sg.call + 1
  const resolved = sg.call < 0 ? started : sg.kind === 'gap' ? sg.call + 1 : sg.call
  const activeTool = inCall ? cur.calls[sg.call].tool : null
  const visited = new Set(cur.calls.slice(0, started).map(c => c.tool))
  const packetWho: Who = sg.kind === 'res' ? cur.tools.find(t => t.id === activeTool)?.who ?? 'system' : 'system'

  type Row = { key: string; kind: Kind | 'event' | 'done'; m: string; path: string; res: string; pending?: boolean; flag?: boolean }
  const rows: Row[] = [{ key: `${job}e`, kind: 'event', m: 'EVENT', path: cur.event.path, res: cur.event.res }]
  cur.calls.slice(0, started).forEach((c, i) => rows.push({ key: `${job}c${i}`, kind: c.kind, m: c.m, path: c.path, res: c.res, pending: i >= resolved, flag: c.flag }))
  if (done) rows.push({ key: `${job}d`, kind: 'done', m: 'DONE', path: cur.output === 'Report' ? 'report/draft' : cur.output.toLowerCase(), res: cur.done })
  const maxRows = Math.max(3, Math.floor((trace.h - 12) / size.lineH))
  const hidden = Math.max(0, rows.length - maxRows)

  return (
    <div className={s.visual} aria-hidden="true" ref={rootRef}>
      <div className={s.glow} />
      <div className={s.window}>
        <div className={s.bar}>
          <i className={s.light} /><i className={s.light} /><i className={s.light} />
          <b className={s.jobTitle} key={cur.title}>{cur.title}</b>
          <span className={[s.status, done ? s.statusDone : ''].join(' ')}><i />{done ? 'Done' : 'Running'}</span>
        </div>
        <div className={[s.body, sg.kind === 'out' && !still ? s.bodyOut : ''].join(' ')}>
          <div className={s.graph} ref={graphRef} style={{ height: size.H }}>
            {geo && (
              <svg className={s.svg} width={W} height={geo.H} viewBox={`0 0 ${W} ${geo.H}`}>
                <defs>
                  <pattern id="at-dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" className={s.dot} /></pattern>
                </defs>
                <rect width={W} height={geo.H} fill="url(#at-dots)" />
                <path d={d(geo.eIn)} className={[s.edge, s.edgeOn, sg.kind === 'trigger' ? s.edgeNow : ''].join(' ')} />
                <path d={d(geo.eOut)} className={[s.edge, done ? s.edgeOn : '', sg.kind === 'act' ? s.edgeNow : ''].join(' ')} />
                {geo.tools.map(t => (
                  <path key={t.id} d={d(geo.eByTool[t.id])} className={[s.edge, visited.has(t.id) ? s.edgeOn : '', t.id === activeTool ? s.edgeNow : ''].join(' ')} />
                ))}
                <Pill {...geo.input} label={cur.input} who="system" on now={sg.kind === 'trigger'} />
                <Pill {...geo.output} label={cur.output} who="system" on={done} now={sg.kind === 'act'} />
                {geo.tools.map(t => <Pill key={t.id} {...t} on={visited.has(t.id)} now={t.id === activeTool} working={sg.kind === 'work' && t.id === activeTool} />)}
                <g className={[s.agent, done ? '' : s.agentRun].join(' ')} transform={`translate(${geo.agent.x} ${geo.agent.y})`}>
                  <circle r={RING} className={s.ring} />
                  <circle r={RING} className={s.arc} />
                  <circle r={R} className={s.core} />
                  <text y={4} textAnchor="middle">Agent</text>
                </g>
                <g ref={packetRef} className={[s.packet, packetWho === 'person' ? s.packetPerson : ''].join(' ')}>
                  <circle r={10} className={s.packetGlow} />
                  <circle r={3.5} className={s.packetCore} />
                </g>
              </svg>
            )}
          </div>
          <div className={[s.trace, hidden > 0 ? s.traceMask : ''].join(' ')} ref={traceRef} style={{ '--row': `${size.lineH}px` } as CSSProperties}>
            <ol className={s.lines} style={{ transform: `translateY(${-hidden * size.lineH}px)` }}>
              {rows.map(r => (
                <li key={r.key} className={[s.row, s['k_' + r.kind], r.pending ? s.pending : '', r.flag ? s.flag : '', still ? s.noAnim : ''].join(' ')}>
                  <b className={s.m}>{r.m}</b>
                  <span className={s.path}>{r.path}</span>
                  <span className={s.res}>{r.pending ? <span className={s.dots}><i /><i /><i /></span> : r.res}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

function Pill({ x, y, w, label, who, on, now, working }: { x: number; y: number; w: number; label: string; who: Who; on?: boolean; now?: boolean; working?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`} className={[s.node, s['n_' + who], on ? s.nodeOn : '', now ? s.nodeNow : '', working ? s.nodeWork : ''].join(' ')}>
      <rect x={-w / 2} y={-NH / 2} width={w} height={NH} rx={NH / 2} />
      <text y={4} textAnchor="middle">{label}</text>
    </g>
  )
}
