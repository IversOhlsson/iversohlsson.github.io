import s from './scenes.module.css'

/** Fraction of `p` between two thresholds, clamped to 0..1. */
const seg = (p: number, a: number, b: number) => Math.max(0, Math.min(1, (p - a) / (b - a)))
const on = (cond: boolean, cls: string) => (cond ? cls : '')

type NodeProps = { title: string; sub?: string; show: boolean; tone?: 'plain' | 'accent' | 'down' | 'ok' }
function Node({ title, sub, show, tone = 'plain' }: NodeProps) {
  return (
    <div className={[s.node, s[tone], on(show, s.show)].join(' ')}>
      <strong>{title}</strong>
      {sub && <span>{sub}</span>}
    </div>
  )
}

function Arrow({ show, vertical }: { show: boolean; vertical?: boolean }) {
  return <span className={[vertical ? s.arrowV : s.arrowH, on(show, s.show)].join(' ')} />
}

/* 1. Full-stack: three layers build up, then a request travels through. */
export function FullStack({ p }: { p: number }) {
  const cols = [
    { t: 'What people use', items: [['Web app', 'Customers'], ['Internal tool', 'Your team'], ['Devices in the field', 'Sensors, machines']] },
    { t: 'The core', items: [['Front door', 'Login, permissions'], ['Services', 'The rules of your business'], ['AI agents', 'Read, plan, ask']] },
    { t: 'Where data lives', items: [['Database', 'Records'], ['Files', 'Documents, images'], ['Log', 'What happened, when']] },
  ]
  const pulse = seg(p, 0.62, 0.95)
  return (
    <div className={s.stack}>
      {cols.map((c, ci) => (
        <div key={c.t} className={s.col}>
          <p className={[s.colTitle, on(p > 0.04 + ci * 0.18, s.show)].join(' ')}>{c.t}</p>
          {c.items.map(([t, sub], i) => (
            <Node key={t} title={t} sub={sub} show={p > 0.08 + ci * 0.18 + i * 0.045} tone={ci === 1 && i === 2 ? 'accent' : 'plain'} />
          ))}
        </div>
      ))}
      <div className={s.pulseTrack} style={{ opacity: p > 0.6 ? 1 : 0 }}>
        <span className={s.pulse} style={{ left: `${pulse * 100}%` }} />
      </div>
      <p className={[s.note, on(p > 0.62, s.show)].join(' ')}>One request, all the way through: screen → rules → data → back.</p>
    </div>
  )
}

/* 2. Distributed: services share a log; one goes down, events queue, it catches up. */
export function Distributed({ p }: { p: number }) {
  const down = p > 0.42 && p < 0.78
  const queued = down ? Math.min(4, Math.floor(seg(p, 0.42, 0.78) * 5)) : p >= 0.78 ? Math.max(0, 4 - Math.floor(seg(p, 0.78, 0.92) * 5)) : 0
  const travel = p > 0.14 && p < 0.42 ? (seg(p, 0.14, 0.42) * 3) % 1 : p > 0.78 && p < 0.95 ? (seg(p, 0.78, 0.95) * 3) % 1 : -1
  const services: [string, string][] = [['Orders', 'Takes new orders'], ['Billing', 'Sends invoices'], ['Notify', 'Emails and texts']]
  return (
    <div className={s.dist}>
      <div className={s.row}>
        {services.map(([t, sub], i) => (
          <Node key={t} title={t} sub={sub} show={p > 0.05 + i * 0.06} tone={i === 2 && down ? 'down' : i === 2 && p >= 0.78 ? 'ok' : 'plain'} />
        ))}
      </div>
      <div className={s.row}>
        {services.map(([t], i) => <Arrow key={t} show={p > 0.12 + i * 0.03} vertical />)}
      </div>
      <div className={[s.bus, on(p > 0.12, s.show)].join(' ')}>
        <span className={s.busLabel}>Shared log · every event, in order</span>
        {travel >= 0 && <span className={s.busDot} style={{ left: `${8 + travel * 84}%` }} />}
        {queued > 0 && (
          <span className={s.queue}>{queued} waiting for Notify</span>
        )}
      </div>
      <div className={s.statusRow}>
        <span className={[s.tag, on(p > 0.2, s.show)].join(' ')}>Each part can be updated on its own</span>
        <span className={[s.tag, s.tagDown, on(down, s.show)].join(' ')}>Notify is down. Orders and Billing keep working.</span>
        <span className={[s.tag, s.tagOk, on(p >= 0.78, s.show)].join(' ')}>Notify is back and catches up. Nothing lost.</span>
      </div>
    </div>
  )
}

/* 3. Agents: a task runs through plan, tools, code checks and a human approval. */
export function Agents({ p }: { p: number }) {
  const steps = [
    { k: 'plan', t: 'Plan', d: 'Read last week’s orders, compare with supplier terms, draft the report.', at: 0.08 },
    { k: 'tool', t: 'Tool · orders database', d: '312 orders, 4 suppliers', at: 0.2 },
    { k: 'tool', t: 'Tool · supplier terms', d: 'Read 4 agreements', at: 0.3 },
    { k: 'code', t: 'Check · totals match', d: 'Code compares sums. Pass.', at: 0.42 },
    { k: 'tool', t: 'Draft report', d: '2 suppliers over agreed price', at: 0.52 },
    { k: 'human', t: 'Approval · send to finance?', d: 'Waiting for a person', at: 0.62 },
    { k: 'ok', t: 'Approved by Anna', d: 'Report sent. Every step logged.', at: 0.84 },
  ]
  const rules = ['Only the tools you allow', 'Code checks every result', 'A person approves what goes out', 'Every step is logged']
  return (
    <div className={s.agent}>
      <div className={s.task}>
        <span className={s.taskLabel}>Task</span>
        <strong>Prepare the weekly supplier report</strong>
      </div>
      <div className={s.agentGrid}>
        <ol className={s.trace}>
          {steps.map(st => {
            const visible = p > st.at
            const waiting = st.k === 'human' && p > st.at && p < 0.84
            return (
              <li key={st.t} className={[s.step, s['k_' + st.k], on(visible, s.show), on(waiting, s.waiting)].join(' ')}>
                <span className={s.stepKind}>{st.k === 'tool' ? 'tool' : st.k === 'code' ? 'code' : st.k === 'human' ? 'person' : st.k === 'ok' ? 'done' : 'plan'}</span>
                <span className={s.stepText}><strong>{st.t}</strong><em>{st.d}</em></span>
              </li>
            )
          })}
        </ol>
        <ul className={s.rules}>
          <li className={s.rulesTitle}>Rules, written in code</li>
          {rules.map((r, i) => <li key={r} className={on(p > 0.1 + i * 0.12, s.show)}>{r}</li>)}
        </ul>
      </div>
    </div>
  )
}

/* 4. Hosting: the same stack lands in the cloud, on your servers, or both. */
export function Hosting({ p }: { p: number }) {
  const targets = [
    { t: 'Cloud', sub: 'Google, Azure, or another', at: 0.18 },
    { t: 'Your servers', sub: 'In your building, your network', at: 0.36 },
    { t: 'Both', sub: 'Sensitive data stays home', at: 0.54 },
  ]
  return (
    <div className={s.host}>
      <div className={s.pkg + ' ' + on(p > 0.04, s.show)}>
        <strong>Your system</strong>
        <span>Packaged so it runs the same everywhere</span>
      </div>
      <div className={s.fan}>
        {targets.map(t => (
          <div key={t.t} className={s.fanItem}>
            <Arrow show={p > t.at - 0.06} vertical />
            <Node title={t.t} sub={t.sub} show={p > t.at} tone={p > 0.7 ? 'ok' : 'plain'} />
          </div>
        ))}
      </div>
      <div className={s.statusRow}>
        <span className={[s.tag, on(p > 0.72, s.show)].join(' ')}>Deploy on push</span>
        <span className={[s.tag, on(p > 0.8, s.show)].join(' ')}>Roll back in one step</span>
        <span className={[s.tag, on(p > 0.88, s.show)].join(' ')}>Private network between sites</span>
      </div>
    </div>
  )
}

/* 5. Care: a small status board. */
export function Care({ p }: { p: number }) {
  const bars = Array.from({ length: 24 }, (_, i) => (i === 15 ? 0.35 : 0.85 + ((i * 7) % 5) * 0.03))
  const items = [
    { t: 'All services up', at: 0.15, ok: true },
    { t: 'Backup done 03:00', at: 0.3, ok: true },
    { t: 'Security updates applied', at: 0.45, ok: true },
    { t: 'One slow request last night, fixed', at: 0.6, ok: false },
  ]
  return (
    <div className={s.care}>
      <div className={s.chart + ' ' + on(p > 0.05, s.show)}>
        <p className={s.chartTitle}>Last 24 hours</p>
        <div className={s.bars}>
          {bars.map((h, i) => (
            <span key={i} className={h < 0.5 ? s.barWarn : ''} style={{ height: `${h * 100}%`, opacity: p > 0.08 + i * 0.015 ? 1 : 0 }} />
          ))}
        </div>
      </div>
      <ul className={s.checks}>
        {items.map(it => (
          <li key={it.t} className={[on(p > it.at, s.show), it.ok ? '' : s.checkWarn].join(' ')}>{it.ok ? '✓' : '!'} {it.t}</li>
        ))}
      </ul>
      <p className={[s.note, on(p > 0.78, s.show)].join(' ')}>One partner to call, who already knows your system.</p>
    </div>
  )
}
