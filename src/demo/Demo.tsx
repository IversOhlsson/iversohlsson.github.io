import { useCallback, useEffect, useMemo, useState } from 'react'
import s from './Demo.module.css'
import { bookHref } from '../content/site'
import Workflow from './Workflow'

/* ---------- Data ---------- */

type View = 'overview' | 'inbox' | 'orders' | 'devices' | 'activity'

type Order = { id: string; customer: string; item: string; qty: string; due: string; status: 'Confirmed' | 'In production' | 'Shipped' | 'New' }

const ORDERS0: Order[] = [
  { id: 'PO-4468', customer: 'Lindqvist Bygg', item: 'Steel bracket S-110', qty: '800', due: '2 Oct 2026', status: 'In production' },
  { id: 'PO-4469', customer: 'Norrland Energi', item: 'Mounting rail R-40', qty: '2 400', due: '9 Oct 2026', status: 'Confirmed' },
  { id: 'PO-4470', customer: 'Hansa Marine', item: 'Hinge set H-7', qty: '150', due: '28 Sep 2026', status: 'Shipped' },
]

const DOC = {
  name: 'PO-4471 Bergström Verkstad.pdf',
  from: 'inkop@bergstromverkstad.se',
  received: 'Today 08:12',
  lines: [
    'Purchase order from Bergström Verkstad AB.',
    'Item: aluminium bracket, part no. AB-220, quantity 1 200 pcs.',
    'Surface treatment: anodised, natural.',
    'Payment terms: 30 days net.',
    'Please confirm receipt of this order.',
  ],
}

const FIELDS = [
  { label: 'Customer', value: 'Bergström Verkstad AB', quote: 'Bergström Verkstad AB' },
  { label: 'Part', value: 'AB-220 aluminium bracket', quote: 'aluminium bracket, part no. AB-220' },
  { label: 'Quantity', value: '1 200 pcs', quote: '1 200 pcs' },
  { label: 'Payment terms', value: '30 days net', quote: '30 days net' },
  { label: 'Delivery date', value: '', quote: '' },
]

type Device = { id: string; name: string; where: string; online: boolean; buffered: number; last: string }
const DEVICES0: Device[] = [
  { id: 'd1', name: 'Line 1 sensor', where: 'Factory floor', online: true, buffered: 0, last: 'just now' },
  { id: 'd2', name: 'Warehouse gateway', where: 'Warehouse B', online: true, buffered: 0, last: 'just now' },
  { id: 'd3', name: 'Truck 12', where: 'On the road', online: false, buffered: 42, last: '18 min ago' },
  { id: 'd4', name: 'Cold room', where: 'Warehouse A', online: true, buffered: 0, last: 'just now' },
]

type Log = { t: string; who: string; what: string }
const LOG0: Log[] = [
  { t: '07:55', who: 'System', what: 'Nightly backup completed' },
  { t: '08:12', who: 'Email', what: 'New document received: PO-4471 Bergström Verkstad.pdf' },
  { t: '08:14', who: 'Truck 12', what: 'Lost connection. Readings are being stored on the device.' },
]

const TOUR = [
  { view: 'inbox' as View, title: 'A new order arrives by email', text: 'Open the document and press Read with AI. Watch it fill in the fields.' },
  { view: 'inbox' as View, title: 'It asks when something is missing', text: 'The delivery date is not in the document. Answer the question, then approve.' },
  { view: 'orders' as View, title: 'The order is in your system', text: 'No retyping. Everyone sees the same, correct data.' },
  { view: 'devices' as View, title: 'Devices in the field keep working', text: 'Truck 12 lost its connection. It keeps recording and catches up when it is back.' },
  { view: 'activity' as View, title: 'Everything is logged', text: 'Who did what, and what the AI read and wrote. Nothing happens in the dark.' },
]

/* ---------- App ---------- */

type Phase = 'idle' | 'reading' | 'asking' | 'ready' | 'saved'

type Mode = 'app' | 'workflow'

export default function Demo() {
  const [mode, setMode] = useState<Mode>(() => (window.location.hash === '#workflow' ? 'workflow' : 'app'))
  const pickMode = (m: Mode) => { setMode(m); window.history.replaceState(null, '', m === 'workflow' ? '#workflow' : '#') }
  const [view, setView] = useState<View>('overview')
  const [tour, setTour] = useState(0)
  const [tourOpen, setTourOpen] = useState(true)
  const [orders, setOrders] = useState<Order[]>(ORDERS0)
  const [devices, setDevices] = useState<Device[]>(DEVICES0)
  const [log, setLog] = useState<Log[]>(LOG0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [filled, setFilled] = useState(0)
  const [answer, setAnswer] = useState('')
  const [docOpen, setDocOpen] = useState(false)

  const addLog = useCallback((who: string, what: string) => {
    const d = new Date()
    const t = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    setLog(l => [...l, { t, who, what }])
  }, [])

  // Reading: fill fields one by one, then ask.
  useEffect(() => {
    if (phase !== 'reading') return
    if (filled >= 4) {
      const t = setTimeout(() => { setPhase('asking'); addLog('AI agent', 'Read PO-4471. Found 4 of 5 fields. Asked for the delivery date.'); setTour(1) }, 500)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setFilled(f => f + 1), 650)
    return () => clearTimeout(t)
  }, [phase, filled, addLog])

  const startRead = () => { setPhase('reading'); setFilled(0); addLog('Anna', 'Started AI reading of PO-4471') }
  const submitAnswer = () => { if (!answer.trim()) return; setPhase('ready'); addLog('Anna', `Answered: delivery date ${answer.trim()}`) }
  const approve = () => {
    setPhase('saved')
    setOrders(o => [{ id: 'PO-4471', customer: 'Bergström Verkstad AB', item: 'AB-220 aluminium bracket', qty: '1 200', due: answer.trim(), status: 'New' }, ...o])
    addLog('Anna', 'Approved PO-4471. Order created.')
    setTour(2)
  }
  const reconnect = () => {
    setDevices(d => d.map(x => x.id === 'd3' ? { ...x, online: true, buffered: 0, last: 'just now' } : x))
    addLog('Truck 12', 'Back online. 42 stored readings synced.')
    setTour(4)
  }
  const goTour = (i: number) => { const k = Math.max(0, Math.min(TOUR.length - 1, i)); setTour(k); setView(TOUR[k].view); if (TOUR[k].view === 'inbox') setDocOpen(true) }
  const reset = () => { setOrders(ORDERS0); setDevices(DEVICES0); setLog(LOG0); setPhase('idle'); setFilled(0); setAnswer(''); setDocOpen(false); setView('overview'); setTour(0); setTourOpen(true) }

  const offline = devices.filter(d => !d.online).length
  const nav: [View, string, number?][] = [['overview', 'Overview'], ['inbox', 'Inbox', phase === 'saved' ? 0 : 1], ['orders', 'Orders'], ['devices', 'Devices', offline], ['activity', 'Activity']]

  return (
    <div className={s.page}>
      <header className={s.top}>
        <a href="/" className={s.back}>← Philip Ivers Ohlsson</a>
        <span className={s.badge}>Demo · not public</span>
      </header>

      <section className={s.intro}>
        <div className={s.modes} role="tablist">
          <button role="tab" aria-selected={mode === 'app'} className={[s.mode, mode === 'app' ? s.modeOn : ''].join(' ')} onClick={() => pickMode('app')}>Try the system</button>
          <button role="tab" aria-selected={mode === 'workflow'} className={[s.mode, mode === 'workflow' ? s.modeOn : ''].join(' ')} onClick={() => pickMode('workflow')}>Watch an AI workflow</button>
        </div>
        {mode === 'app' ? (
          <>
            <p className={s.eyebrow}>Try a system like the ones I build</p>
            <h1 className={s.h1}>This is what your team would open every morning.</h1>
            <p className={s.sub}>A working example for a small manufacturer. Click around, or follow the short tour. Nothing here is real.</p>
          </>
        ) : (
          <>
            <p className={s.eyebrow}>Watch an AI workflow</p>
            <h1 className={s.h1}>See how AI works inside a system like yours.</h1>
            <p className={s.sub}>Pick your field. Something arrives, the AI fills in the record, you get a notification and decide with one tap, and the work moves on. Under a minute.</p>
          </>
        )}
      </section>

      {mode === 'workflow' && <Workflow />}

      {mode === 'workflow' && (
        <section className={s.notes}>
          <div>
            <h2>What this shows</h2>
            <ul>
              <li>Nothing new to learn. Work arrives by email or a form, the way it already does.</li>
              <li>The AI fills in your records and suggests. A person decides, from a phone if they like.</li>
              <li>When something is missing, the system asks instead of guessing. It never waits in silence.</li>
              <li>Every step is on the record: what arrived, what the AI read, who decided.</li>
            </ul>
          </div>
          <div>
            <h2>Where it fits</h2>
            <ul>
              <li>Due diligence, supplier onboarding, claims, tender reviews, compliance checks, customer intake.</li>
              <li>Anywhere a team reads piles of documents and fills in the same forms by hand.</li>
              <li>Built around your steps and your rules, so it fits the way your team already works.</li>
              <li>Runs in the cloud, on your own servers, or both. Your documents stay where you keep them.</li>
            </ul>
          </div>
        </section>
      )}

      {mode === 'app' && <section className={s.frame}>
        {tourOpen ? (
          <div className={s.tour}>
            <span className={s.tourStep}>{tour + 1} / {TOUR.length}</span>
            <div className={s.tourText}>
              <strong>{TOUR[tour].title}</strong>
              <p>{TOUR[tour].text}</p>
            </div>
            <div className={s.tourBtns}>
              <button onClick={() => goTour(tour - 1)} disabled={tour === 0}>Back</button>
              {view !== TOUR[tour].view
                ? <button className={s.tourNext} onClick={() => goTour(tour)}>Show me</button>
                : tour < TOUR.length - 1
                  ? <button className={s.tourNext} onClick={() => goTour(tour + 1)}>Next</button>
                  : <button className={s.tourNext} onClick={reset}>Start over</button>}
              <button className={s.tourClose} onClick={() => setTourOpen(false)} aria-label="Close tour">×</button>
            </div>
          </div>
        ) : (
          <div className={s.tour}><button className={s.tourOpenBtn} onClick={() => setTourOpen(true)}>Show tour</button></div>
        )}
        <div className={s.app}>
          <aside className={s.side}>
            <div className={s.brand}><span className={s.logo}>N</span> Nordic Parts AB</div>
            <nav className={s.menu}>
              {nav.map(([v, label, n]) => (
                <button key={v} className={[s.menuItem, view === v ? s.menuOn : ''].join(' ')} onClick={() => setView(v)}>
                  {label}{n ? <span className={s.count}>{n}</span> : null}
                </button>
              ))}
            </nav>
            <div className={s.sideFoot}>
              <span className={s.avatar}>A</span>
              <span><strong>Anna Ek</strong><em>Operations</em></span>
            </div>
          </aside>

          <main className={s.main}>
            {view === 'overview' && <Overview orders={orders} offline={offline} phase={phase} go={() => { setView('inbox'); setDocOpen(true) }} />}
            {view === 'inbox' && (
              <Inbox
                docOpen={docOpen} setDocOpen={setDocOpen} phase={phase} filled={filled}
                answer={answer} setAnswer={setAnswer} startRead={startRead} submitAnswer={submitAnswer} approve={approve}
                goOrders={() => setView('orders')}
              />
            )}
            {view === 'orders' && <Orders orders={orders} />}
            {view === 'devices' && <Devices devices={devices} reconnect={reconnect} />}
            {view === 'activity' && <Activity log={log} />}
          </main>
        </div>
      </section>}

      {mode === 'app' && <section className={s.notes}>
        <div>
          <h2>What this shows</h2>
          <ul>
            <li>Documents that arrive by email become records in your system, with a person approving each one.</li>
            <li>Devices in the field keep working without a connection and catch up on their own.</li>
            <li>Every action, by people or by AI, is logged and easy to read.</li>
          </ul>
        </div>
        <div>
          <h2>Yours would be different</h2>
          <ul>
            <li>Your words, your fields, your documents. Built around how your team already works.</li>
            <li>Connected to the tools you use today, not replacing them.</li>
            <li>Running in the cloud, on your own servers, or both.</li>
          </ul>
        </div>
      </section>}

      <footer className={s.foot}>
        <a href={bookHref} className={s.cta}>Book a meeting</a>
      </footer>
    </div>
  )
}

/* ---------- Views ---------- */

function Overview({ orders, offline, phase, go }: { orders: Order[]; offline: number; phase: Phase; go: () => void }) {
  return (
    <div className={s.view}>
      <h2 className={s.viewTitle}>Good morning, Anna</h2>
      <div className={s.tiles}>
        <div className={s.tile}><span>Open orders</span><strong>{orders.filter(o => o.status !== 'Shipped').length}</strong></div>
        <div className={s.tile}><span>Documents to review</span><strong>{phase === 'saved' ? 0 : 1}</strong></div>
        <div className={[s.tile, offline ? s.tileWarn : ''].join(' ')}><span>Devices offline</span><strong>{offline}</strong></div>
        <div className={s.tile}><span>Last backup</span><strong>07:55</strong></div>
      </div>
      <div className={s.panel}>
        <p className={s.panelTitle}>Needs your attention</p>
        {phase !== 'saved'
          ? <button className={s.rowBtn} onClick={go}><span className={s.dotNew} /> New purchase order from Bergström Verkstad. <em>Open →</em></button>
          : <p className={s.empty}>Nothing right now.</p>}
        {offline > 0 && <p className={s.rowText}><span className={s.dotWarn} /> Truck 12 is offline. Readings are stored on the device.</p>}
      </div>
    </div>
  )
}

function Inbox(props: {
  docOpen: boolean; setDocOpen: (v: boolean) => void; phase: Phase; filled: number
  answer: string; setAnswer: (v: string) => void; startRead: () => void; submitAnswer: () => void; approve: () => void; goOrders: () => void
}) {
  const { docOpen, setDocOpen, phase, filled, answer, setAnswer, startRead, submitAnswer, approve, goOrders } = props
  const isFilled = (i: number) => (i < 4 ? (phase === 'reading' ? i < filled : phase !== 'idle') : phase === 'ready' || phase === 'saved')
  return (
    <div className={s.view}>
      <h2 className={s.viewTitle}>Inbox</h2>
      <div className={s.inbox}>
        <ul className={s.docList}>
          <li>
            <button className={[s.docItem, docOpen ? s.docItemOn : ''].join(' ')} onClick={() => setDocOpen(true)}>
              {phase !== 'saved' && <span className={s.dotNew} />}
              <span><strong>{DOC.name}</strong><em>{DOC.from} · {DOC.received}</em></span>
            </button>
          </li>
          <li><button className={s.docItem} disabled><span><strong>Invoice 2026-0912.pdf</strong><em>Handled yesterday</em></span></button></li>
          <li><button className={s.docItem} disabled><span><strong>Delivery note 8812.pdf</strong><em>Handled yesterday</em></span></button></li>
        </ul>

        {docOpen ? (
          <div className={s.docPane}>
            <div className={s.doc}>
              <p className={s.docHead}>{DOC.name}</p>
              {DOC.lines.map((line, i) => {
                const f = FIELDS.find(f => f.quote && line.includes(f.quote))
                const fi = f ? FIELDS.indexOf(f) : -1
                if (!f?.quote) return <p key={i}>{line}</p>
                const [a, b] = line.split(f.quote)
                return <p key={i}>{a}<mark className={isFilled(fi) ? s.hot : ''}>{f.quote}</mark>{b}</p>
              })}
            </div>
            <div className={s.extract}>
              <div className={s.extractHead}>
                <span>Order details</span>
                {phase === 'idle' && <button className={s.primary} onClick={startRead}>Read with AI</button>}
                {phase === 'reading' && <span className={s.pill}>Reading…</span>}
                {phase === 'asking' && <span className={[s.pill, s.pillWarn].join(' ')}>1 question</span>}
                {phase === 'ready' && <button className={s.primary} onClick={approve}>Approve and create order</button>}
                {phase === 'saved' && <span className={[s.pill, s.pillOk].join(' ')}>Saved</span>}
              </div>
              <ul className={s.fields}>
                {FIELDS.map((f, i) => {
                  const on = isFilled(i)
                  const missing = i === 4 && phase === 'asking'
                  return (
                    <li key={f.label} className={[s.field, on ? s.fieldOn : '', missing ? s.fieldMissing : ''].join(' ')}>
                      <span>{f.label}</span>
                      <strong>{on ? (i === 4 ? answer : f.value) : missing ? 'Missing' : ''}</strong>
                    </li>
                  )
                })}
              </ul>
              {phase === 'asking' && (
                <div className={s.ask}>
                  <p><span className={s.who}>AI agent</span>The order has no delivery date. When should it be delivered?</p>
                  <form className={s.askForm} onSubmit={e => { e.preventDefault(); submitAnswer() }}>
                    <input value={answer} onChange={e => setAnswer(e.target.value)} placeholder="e.g. 30 Oct 2026" />
                    <button type="submit" className={s.primary} disabled={!answer.trim()}>Answer</button>
                  </form>
                  <button type="button" className={s.suggest} onClick={() => setAnswer('30 Oct 2026')}>Use 30 Oct 2026</button>
                </div>
              )}
              {phase === 'saved' && (
                <div className={s.saved}>✓ Order PO-4471 created. <button className={s.link} onClick={goOrders}>Open in Orders →</button></div>
              )}
            </div>
          </div>
        ) : (
          <div className={s.docPane}><p className={s.empty}>Select a document.</p></div>
        )}
      </div>
    </div>
  )
}

function Orders({ orders }: { orders: Order[] }) {
  return (
    <div className={s.view}>
      <h2 className={s.viewTitle}>Orders</h2>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>Order</th><th>Customer</th><th>Item</th><th>Qty</th><th>Due</th><th>Status</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className={o.status === 'New' ? s.rowNew : ''}>
                <td>{o.id}</td><td>{o.customer}</td><td>{o.item}</td><td>{o.qty}</td><td>{o.due}</td>
                <td><span className={[s.status, s['st_' + o.status.replace(' ', '')]].join(' ')}>{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Devices({ devices, reconnect }: { devices: Device[]; reconnect: () => void }) {
  return (
    <div className={s.view}>
      <h2 className={s.viewTitle}>Devices</h2>
      <div className={s.devices}>
        {devices.map(d => (
          <div key={d.id} className={[s.device, d.online ? '' : s.deviceOff].join(' ')}>
            <div className={s.deviceHead}><strong>{d.name}</strong><span className={d.online ? s.dotOk : s.dotWarn} /></div>
            <em>{d.where}</em>
            <p>{d.online ? `Online · last reading ${d.last}` : `Offline · ${d.buffered} readings stored on the device`}</p>
            {!d.online && <button className={s.primary} onClick={reconnect}>Simulate connection back</button>}
          </div>
        ))}
      </div>
    </div>
  )
}

function Activity({ log }: { log: Log[] }) {
  const items = useMemo(() => [...log].reverse(), [log])
  return (
    <div className={s.view}>
      <h2 className={s.viewTitle}>Activity</h2>
      <ul className={s.log}>
        {items.map((l, i) => (
          <li key={i}><span className={s.logT}>{l.t}</span><span className={s.logWho}>{l.who}</span><span>{l.what}</span></li>
        ))}
      </ul>
    </div>
  )
}
