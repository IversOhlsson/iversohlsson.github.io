import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type Ref } from 'react'
import s from './AgentTalk.module.css'

/**
 * Hero animation in two beats per job. First one run: something arrives, the agent calls its tools and a
 * person, then hands the result on, while a trace logs every call. Then the same company's whole day: three
 * agents working one shared log in parallel, one incident that recovers on its own, a counter ticking up.
 * One requestAnimationFrame clock drives both, so motion is continuous rather than a chain of timeouts.
 */
type Who = 'system' | 'person'
type PWho = Who | 'warn'
type Kind = 'api' | 'llm' | 'person' | 'io'
type RowKind = Kind | 'event' | 'done' | 'warn'
type Tool = { id: string; label: string; who: Who }
type Call = { tool: string; kind: Kind; m: string; path: string; res: string; flag?: boolean }
type DayRow = { at: number; kind: RowKind; m: string; path: string; res: string }
type Incident = { kind: 'retry' | 'restart' | 'offline'; at: number }
type Day = { company: string; sources: string[]; sinks: string[]; base: number; asked: number; incident: Incident; feed: DayRow[] }
type Job = { title: string; input: string; output: string; tools: Tool[]; event: { path: string; res: string }; calls: Call[]; done: string; day: Day }

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
    done: 'confirmed · 41 s · logged',
    day: { company: 'Nordic Parts', sources: ['Inbox', 'Portal', 'Phone'], sinks: ['Plan', 'ERP', 'Anna'], base: 311, asked: 6, incident: { kind: 'retry', at: 4600 },
      feed: [
        { at: 0, kind: 'event', m: 'LIVE', path: 'Nordic Parts · today', res: '3 agents · since 06:00' },
        { at: 2200, kind: 'api', m: 'POST', path: '/plan/orders  ×27 this hour', res: '27 confirmed' },
        { at: 5000, kind: 'warn', m: 'RETRY', path: '/erp/orders  timeout', res: '2nd try ok · 1.4 s' },
        { at: 7300, kind: 'person', m: 'ASK', path: 'Anna · 1 of 27 needed a decision', res: 'answered · 4 min' },
        { at: 9300, kind: 'done', m: 'DONE', path: 'day so far', res: '0 lost · every step logged' },
      ] } },
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
    done: '6 calls · draft for approval · logged',
    day: { company: 'Ather Capital', sources: ['Data room', 'Email', 'Schedule'], sinks: ['Report', 'Registry', 'Maria'], base: 84, asked: 2, incident: { kind: 'restart', at: 4300 },
      feed: [
        { at: 0, kind: 'event', m: 'LIVE', path: 'Ather Capital · today', res: '3 agents · 4 data rooms' },
        { at: 2200, kind: 'api', m: 'GET', path: 'api.bolagsverket.se  ×41 today', res: 'all answered' },
        { at: 4700, kind: 'warn', m: 'DOWN', path: 'agent-2 restarted', res: 'runs picked up · nothing lost' },
        { at: 7300, kind: 'person', m: 'ASK', path: 'Maria · 2 findings to decide', res: 'both answered' },
        { at: 9300, kind: 'done', m: 'DONE', path: 'weekly re-check', res: 'Monday 07:00 · scheduled' },
      ] } },
  { title: 'Fleet · Truck 12', input: 'Truck 12', output: 'Fleet log',
    tools: [{ id: 'local', label: 'Local store', who: 'system' }, { id: 'plan', label: 'Plan', who: 'system' }, { id: 'jonas', label: 'Jonas', who: 'person' }, { id: 'sync', label: 'Sync', who: 'system' }],
    event: { path: 'truck 12 · connection lost', res: '13:02' },
    calls: [
      { tool: 'local', kind: 'io', m: 'PUT', path: 'local://events  offline', res: 'queued · 2 ms' },
      { tool: 'plan', kind: 'api', m: 'GET', path: '/plan/deliveries?truck=12', res: '3 stops · no risk · 70 ms' },
      { tool: 'jonas', kind: 'person', m: 'PUSH', path: 'Jonas · “Truck 12 offline. No action needed.”', res: 'seen · 13:04' },
      { tool: 'sync', kind: 'api', m: 'POST', path: '/fleet/sync  412 events', res: 'online 13:40 · 200' },
    ],
    done: '4 calls · no one alarmed · logged',
    day: { company: 'Mälar Frakt', sources: ['Truck 12', 'Truck 7', 'Depot'], sinks: ['Fleet log', 'Plan', 'Jonas'], base: 1204, asked: 1, incident: { kind: 'offline', at: 1500 },
      feed: [
        { at: 0, kind: 'event', m: 'LIVE', path: 'Mälar Frakt · 14 vehicles', res: '3 agents' },
        { at: 1800, kind: 'warn', m: 'OFF', path: 'truck 12 · no signal', res: 'recording locally' },
        { at: 4300, kind: 'io', m: 'PUT', path: 'local://events  ×412', res: 'queued on the truck' },
        { at: 7200, kind: 'api', m: 'SYNC', path: 'truck 12 back online', res: '412 events · 1.1 s' },
        { at: 9300, kind: 'done', m: 'DONE', path: 'day so far', res: 'no one alarmed · logged' },
      ] } },
]

/* ---------- timing ---------- */
const T = { trigger: 750, think: 650, req: 460, res: 460, gap: 260, act: 750, done: 3400, out: 450 }
const WORK: Record<Kind, number> = { api: 560, io: 400, llm: 1000, person: 1200 }
const DAY_MS = 10800
type SegKind = 'trigger' | 'think' | 'req' | 'work' | 'res' | 'gap' | 'act' | 'done' | 'out' | 'day' | 'dayOut'
type Seg = { kind: SegKind; call: number; start: number; dur: number }

function schedule(job: Job): Seg[] {
  const segs: Seg[] = []
  let t = 0
  const add = (kind: SegKind, dur: number, call = -1) => { segs.push({ kind, call, start: t, dur }); t += dur }
  add('trigger', T.trigger); add('think', T.think)
  job.calls.forEach((c, i) => { add('req', T.req, i); add('work', WORK[c.kind], i); add('res', T.res, i); add('gap', T.gap, i) })
  add('act', T.act); add('done', T.done); add('out', T.out)
  job.day.feed.forEach((f, i) => add('day', (job.day.feed[i + 1]?.at ?? DAY_MS) - f.at, i))
  add('dayOut', T.out)
  return segs
}

/* ---------- geometry ---------- */
const R = 21, RING = 30, NH = 26, RW = 20, POOL = 12
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

/* The day view: sources on the left, a shared log, three agents, systems and a person on the right. */
function dayLayout(job: Job, W: number, { H }: Size) {
  const ys = [0.26, 0.52, 0.78].map(k => Math.round(H * k))
  const wSrc = Math.max(...job.day.sources.map(pillW)), wSink = Math.max(...job.day.sinks.map(pillW))
  const sources = job.day.sources.map((label, i) => ({ label, x: 12 + wSrc / 2, y: ys[i], w: wSrc }))
  const sinks = job.day.sinks.map((label, i) => ({ label, x: W - 12 - wSink / 2, y: ys[i], w: wSink, who: (i === 2 ? 'person' : 'system') as Who }))
  const l = 12 + wSrc, r = W - 12 - wSink
  const xq = Math.round(l + (r - l) * 0.24), xw = Math.round(l + (r - l) * 0.63)
  const workers = ys.map(y => ({ x: xw, y }))
  return { W, H, ys, sources, sinks, workers, xq }
}
type DayGeo = ReturnType<typeof dayLayout>

/* Every packet movement of the day, computed once. A flight is a curve travelled between two times;
 * a parked packet is a flight that stays put. Deterministic, so the day replays the same each loop. */
type Flight = { c: Curve; start: number; end: number; who: PWho; edge?: 'in' | 'out' }
type Span = { w: number; start: number; end: number }
type DayPlan = { flights: Flight[]; busy: Span[]; done: number[]; down: Span | null; off: Span | null }

function dayPlan(job: Job, g: DayGeo): DayPlan {
  let seed = 11
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
  const flights: Flight[] = [], busy: Span[] = [], done: number[] = []
  const inc = job.day.incident
  const down = inc.kind === 'restart' ? { w: 1, start: inc.at, end: inc.at + 2200 } : null
  const off = inc.kind === 'offline' ? { w: 0, start: inc.at, end: inc.at + 5200 } : null
  const fly = (a: P, b: P, start: number, dur: number, who: PWho = 'system', edge?: 'in' | 'out') => {
    flights.push({ c: curve(a, b, a.x === b.x), start, end: start + dur, who, edge })
    return start + dur
  }
  const park = (p: P, start: number, end: number, who: PWho = 'system') => { if (end > start) flights.push({ c: curve(p, p, false), start, end, who }) }
  const { sources, sinks, workers, xq } = g
  let retried = false, parked = 0
  for (let i = 0, t = 250; t < DAY_MS - 2400; i++, t += 560 + rnd() * 240) {
    let si = i % 3
    if (off && t >= off.start && t < off.end && i % 2 === 0) si = 0
    const src = sources[si]
    const from = { x: src.x + src.w / 2, y: src.y }
    const logIn = { x: xq, y: src.y }
    let now = t
    if (off && si === 0 && t >= off.start && t < off.end) {
      /* No signal: the event is recorded beside the truck and released in a burst when it is back. */
      const slot = parked++, k = Math.min(slot, 5)
      const p = { x: from.x + 8 + (k % 3) * 8, y: src.y - 5 + Math.floor(k / 3) * 10 }
      park(p, t, off.end + slot * 110, 'warn')
      now = fly(p, logIn, off.end + slot * 110, 450, 'warn')
    } else {
      now = fly(from, logIn, now, 550, 'system', 'in')
    }
    let w = i % 3
    const wait = 160 + rnd() * 240
    if (down && w === down.w && now + wait >= down.start - 600 && now + wait < down.end) w = (w + 1) % 3
    park(logIn, now, now + wait)
    now += wait
    let wk = workers[w]
    now = fly(logIn, { x: xq, y: wk.y }, now, 260)
    now = fly({ x: xq + 7, y: wk.y }, { x: wk.x - RW, y: wk.y }, now, 420)
    let work = 650 + rnd() * 300
    if (down && w === down.w && now < down.start && now + work > down.start) {
      /* Agent-2 dies mid-run. The run goes back to the log and another agent picks it up. */
      busy.push({ w, start: now, end: down.start })
      let t2 = fly({ x: wk.x - RW, y: wk.y }, { x: xq + 7, y: wk.y }, down.start, 420, 'warn')
      park({ x: xq, y: wk.y }, t2, t2 + 300, 'warn'); t2 += 300
      const w2 = (w + 1) % 3, wk2 = workers[w2]
      t2 = fly({ x: xq, y: wk.y }, { x: xq, y: wk2.y }, t2, 260)
      t2 = fly({ x: xq + 7, y: wk2.y }, { x: wk2.x - RW, y: wk2.y }, t2, 420)
      w = w2; wk = wk2; now = t2; work = 700
    }
    busy.push({ w, start: now, end: now + work })
    now += work
    const asked = i % 5 === 4
    const sink = sinks[asked ? 2 : w % 2]
    const a = { x: wk.x + RW, y: wk.y }, b = { x: sink.x - sink.w / 2, y: sink.y }
    if (inc.kind === 'retry' && !retried && !asked && now + 520 >= inc.at) {
      /* The ERP times out. The call bounces back, the agent waits, then tries again. */
      retried = true
      let t2 = fly(a, b, now, 520)
      t2 = fly(b, a, t2, 420, 'warn')
      busy.push({ w, start: t2, end: t2 + 500 }); t2 += 500
      now = fly(a, b, t2, 520, 'system', 'out')
    } else {
      now = fly(a, b, now, 520, asked ? 'person' : 'system', 'out')
    }
    done.push(now)
  }
  return { flights, busy, done, down, off }
}

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

const cls = (el: Element | null, value: string) => { if (el && el.getAttribute('class') !== value) el.setAttribute('class', value) }

export default function AgentTalk() {
  const [still] = useState(reducedMotion)
  const [job, setJob] = useState(0)
  const [seg, setSeg] = useState(0)
  const [visible, setVisible] = useState(true)
  const rootRef = useRef<HTMLDivElement>(null)
  const packetRef = useRef<SVGGElement>(null)
  const pool = useRef<(SVGGElement | null)[]>([])
  const workerEls = useRef<(SVGGElement | null)[]>([])
  const srcEls = useRef<(SVGGElement | null)[]>([])
  const runsEl = useRef<HTMLElement>(null)
  const geoRef = useRef<Geo | null>(null)
  const planRef = useRef<DayPlan | null>(null)
  const elapsed = useRef(0)
  const [graphRef, graph] = useSize<HTMLDivElement>()
  const [traceRef, trace] = useSize<HTMLDivElement>()

  const cur = JOBS[job]
  const segs = useMemo(() => schedule(cur), [cur])
  const W = graph.w
  const size = useMedia(PHONE) ? SIZES.compact : SIZES.wide
  const geo = useMemo(() => (W > 0 ? layout(cur, W, size) : null), [cur, W, size])
  const geoDay = useMemo(() => (W > 0 ? dayLayout(cur, W, size) : null), [cur, W, size])
  const plan = useMemo(() => (geoDay ? dayPlan(cur, geoDay) : null), [cur, geoDay])
  useEffect(() => { geoRef.current = geo; planRef.current = plan }, [geo, plan])

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
    const dayStart = segs.find(x => x.kind === 'day')!.start
    const start = performance.now() - elapsed.current
    let lastIdx = -1
    let raf = 0
    /* The run: one packet between the agent and whatever it is talking to. */
    const paintRun = (sg: Seg, p: number) => {
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
    /* The day: many packets from a pool, agents lighting up while busy, the counter ticking. */
    const paintDay = (tl: number) => {
      const plan = planRef.current
      if (!plan) return
      let slot = 0
      for (const f of plan.flights) {
        if (tl < f.start || tl >= f.end) continue
        const el = pool.current[slot++]
        if (!el) break
        const p = (tl - f.start) / (f.end - f.start)
        const pt = at(f.c, ease(p))
        el.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`)
        cls(el, [s.packet, f.who === 'person' ? s.packetPerson : f.who === 'warn' ? s.packetWarn : ''].join(' '))
        el.style.opacity = String(f.edge === 'in' ? Math.min(1, p * 4) : f.edge === 'out' ? Math.min(1, (1 - p) * 4) : 1)
      }
      for (; slot < POOL; slot++) { const el = pool.current[slot]; if (el) el.style.opacity = '0' }
      workerEls.current.forEach((el, w) => {
        const isDown = !!plan.down && plan.down.w === w && tl >= plan.down.start && tl < plan.down.end
        const isBusy = !isDown && plan.busy.some(b => b.w === w && tl >= b.start && tl < b.end)
        cls(el, [s.worker, isBusy ? s.wBusy : '', isDown ? s.wDown : ''].join(' '))
      })
      srcEls.current.forEach((el, i) => {
        const isOff = !!plan.off && plan.off.w === i && tl >= plan.off.start && tl < plan.off.end
        cls(el, [s.node, s.n_system, s.nodeOn, isOff ? s.srcOff : ''].join(' '))
      })
      if (runsEl.current) {
        let n = 0
        for (const x of plan.done) if (x <= tl) n++
        const text = String(cur.day.base + n)
        if (runsEl.current.textContent !== text) runsEl.current.textContent = text
      }
    }
    const frame = (now: number) => {
      const t = now - start
      elapsed.current = t
      if (t >= total) { elapsed.current = 0; setJob(j => (j + 1) % JOBS.length); setSeg(0); return }
      let i = 0
      while (i < segs.length - 1 && t >= segs[i].start + segs[i].dur) i++
      if (i !== lastIdx) { lastIdx = i; setSeg(i) }
      const sg = segs[i]
      if (sg.kind === 'day' || sg.kind === 'dayOut') paintDay(t - dayStart)
      else paintRun(sg, Math.min(1, (t - sg.start) / sg.dur))
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [cur, segs, still, visible])

  /* Everything below derives from the current segment. */
  const sg = segs[still ? segs.findIndex(x => x.kind === 'done') : Math.min(seg, segs.length - 1)]
  const view = sg.kind === 'day' || sg.kind === 'dayOut' ? 'day' : 'run'
  const n = cur.calls.length
  const inCall = sg.kind === 'req' || sg.kind === 'work' || sg.kind === 'res'
  const done = sg.kind === 'done' || sg.kind === 'out'
  const started = sg.call < 0 ? (sg.kind === 'trigger' || sg.kind === 'think' ? 0 : n) : sg.call + 1
  const resolved = sg.call < 0 ? started : sg.kind === 'gap' ? sg.call + 1 : sg.call
  const activeTool = inCall ? cur.calls[sg.call].tool : null
  const visited = new Set(cur.calls.slice(0, started).map(c => c.tool))
  const packetWho: Who = sg.kind === 'res' ? cur.tools.find(t => t.id === activeTool)?.who ?? 'system' : 'system'

  type Row = { key: string; kind: RowKind; m: string; path: string; res: string; pending?: boolean; flag?: boolean }
  const rows: Row[] = []
  if (view === 'run') {
    rows.push({ key: `${job}e`, kind: 'event', m: 'EVENT', path: cur.event.path, res: cur.event.res })
    cur.calls.slice(0, started).forEach((c, i) => rows.push({ key: `${job}c${i}`, kind: c.kind, m: c.m, path: c.path, res: c.res, pending: i >= resolved, flag: c.flag }))
    if (done) rows.push({ key: `${job}d`, kind: 'done', m: 'DONE', path: cur.output === 'Report' ? 'report/draft' : cur.output.toLowerCase(), res: cur.done })
  } else {
    cur.day.feed.slice(0, sg.call + 1).forEach((f, i) => rows.push({ key: `${job}y${i}`, kind: f.kind, m: f.m, path: f.path, res: f.res }))
  }
  const maxRows = Math.max(3, Math.floor((trace.h - 12) / size.lineH))
  const hidden = Math.max(0, rows.length - maxRows)
  const title = view === 'day' ? `${cur.day.company} · today` : cur.title
  const status = view === 'day' ? 'Live' : done ? 'Done' : 'Running'

  return (
    <div className={s.visual} aria-hidden="true" ref={rootRef}>
      <div className={s.glow} />
      <div className={s.window}>
        <div className={s.bar}>
          <i className={s.light} /><i className={s.light} /><i className={s.light} />
          <b className={s.jobTitle} key={title}>{title}</b>
          <span className={[s.status, status === 'Done' ? s.statusDone : ''].join(' ')}><i />{status}</span>
        </div>
        <div className={[s.body, (sg.kind === 'out' || sg.kind === 'dayOut') && !still ? s.bodyOut : ''].join(' ')}>
          <div className={s.graph} ref={graphRef} style={{ height: size.H }}>
            {geo && view === 'run' && (
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
            {geoDay && view === 'day' && (
              <>
                <div className={s.dayTop}>
                  <span>Today · 3 agents</span>
                  <span><b ref={runsEl}>{cur.day.base}</b> runs · <b>{cur.day.asked}</b> asked · <b>0</b> lost</span>
                </div>
                <svg className={s.svg} width={W} height={geoDay.H} viewBox={`0 0 ${W} ${geoDay.H}`}>
                  <rect width={W} height={geoDay.H} fill="url(#at-dots)" />
                  {geoDay.sources.map((src, i) => <path key={'s' + i} className={[s.edge, s.edgeOn].join(' ')} d={d(curve({ x: src.x + src.w / 2, y: src.y }, { x: geoDay.xq - 7, y: src.y }, false))} />)}
                  {geoDay.workers.map((w, i) => <path key={'w' + i} className={[s.edge, s.edgeOn].join(' ')} d={d(curve({ x: geoDay.xq + 7, y: w.y }, { x: w.x - RW, y: w.y }, false))} />)}
                  {geoDay.workers.map((w, i) => { const k = geoDay.sinks[i % 2]; return <path key={'k' + i} className={[s.edge, s.edgeOn].join(' ')} d={d(curve({ x: w.x + RW, y: w.y }, { x: k.x - k.w / 2, y: k.y }, false))} /> })}
                  <rect className={s.track} x={geoDay.xq - 7} y={geoDay.ys[0] - 22} width={14} height={geoDay.ys[2] - geoDay.ys[0] + 44} rx={7} />
                  <text className={s.trackLabel} x={geoDay.xq} y={geoDay.ys[2] + 36} textAnchor="middle">LOG</text>
                  {geoDay.sources.map((src, i) => <Pill key={src.label} ref={el => { srcEls.current[i] = el }} {...src} who="system" on />)}
                  {geoDay.sinks.map(k => <Pill key={k.label} {...k} on />)}
                  {geoDay.workers.map((w, i) => (
                    <g key={i} ref={el => { workerEls.current[i] = el }} className={s.worker} transform={`translate(${w.x} ${w.y})`}>
                      <circle r={RW} className={s.ring} />
                      <circle r={RW} className={[s.arc, s.arcSm].join(' ')} />
                      <circle r={14} className={s.core} />
                    </g>
                  ))}
                  {Array.from({ length: POOL }, (_, i) => (
                    <g key={i} ref={el => { pool.current[i] = el }} className={s.packet}>
                      <circle r={8} className={s.packetGlow} />
                      <circle r={3} className={s.packetCore} />
                    </g>
                  ))}
                </svg>
              </>
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

type PillProps = { x: number; y: number; w: number; label: string; who: Who; on?: boolean; now?: boolean; working?: boolean; ref?: Ref<SVGGElement> }
function Pill({ x, y, w, label, who, on, now, working, ref }: PillProps) {
  return (
    <g ref={ref} transform={`translate(${x} ${y})`} className={[s.node, s['n_' + who], on ? s.nodeOn : '', now ? s.nodeNow : '', working ? s.nodeWork : ''].join(' ')}>
      <rect x={-w / 2} y={-NH / 2} width={w} height={NH} rx={NH / 2} />
      <text y={4} textAnchor="middle">{label}</text>
    </g>
  )
}
