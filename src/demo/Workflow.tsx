import { useCallback, useEffect, useRef, useState } from 'react'
import s from './Workflow.module.css'
import { SCENARIOS, type Scenario, type Scene, type Where } from './scenarios'

const clamp = (v: number) => Math.max(0, Math.min(1, v))
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
const ease = (k: number) => 1 - Math.pow(1 - k, 3)
const io = (on: boolean) => (on ? s.in : s.out)

const WHERE: Record<Where, string> = { internal: 'Your system', external: 'Outside your company', phone: 'Your phone' }

/* ---------- Player ---------- */

export default function Workflow() {
  const [sc, setSc] = useState<Scenario>(SCENARIOS[0])
  const [elapsed, setElapsed] = useState(0)
  const [playing, setPlaying] = useState(true)
  const last = useRef<number | null>(null)
  const total = sc.scenes.reduce((a, x) => a + x.ms, 0)

  useEffect(() => {
    if (!playing) { last.current = null; return }
    let raf = 0
    const tick = (now: number) => {
      if (last.current !== null) {
        const dt = now - last.current
        setElapsed(e => { const n = e + dt; if (n >= total) { setPlaying(false); return total } return n })
      }
      last.current = now
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, total])

  const starts: number[] = []
  let acc = 0
  for (const x of sc.scenes) { starts.push(acc); acc += x.ms }
  let index = sc.scenes.length - 1
  for (let i = 0; i < sc.scenes.length; i++) if (elapsed < starts[i] + sc.scenes[i].ms) { index = i; break }
  const scene = sc.scenes[index]
  const p = clamp((elapsed - starts[index]) / scene.ms)
  const ended = elapsed >= total

  const seek = useCallback((t: number) => { setElapsed(t); setPlaying(true) }, [])
  const restart = useCallback(() => { setElapsed(0); setPlaying(true) }, [])
  const pick = (x: Scenario) => { setSc(x); setElapsed(0); setPlaying(true) }

  return (
    <div>
      <div className={s.picker} role="tablist" aria-label="Field">
        {SCENARIOS.map(x => (
          <button key={x.id} role="tab" aria-selected={x.id === sc.id} className={[s.chip, x.id === sc.id ? s.chipOn : ''].join(' ')} onClick={() => pick(x)}>
            <strong>{x.label}</strong><span>{x.tagline}</span>
          </button>
        ))}
      </div>

      <div className={s.stage}>
        <div className={s.scene} key={sc.id + index}>
          <SceneView scene={scene} p={p} company={sc.company} />
        </div>
        {ended && <button className={s.replay} onClick={restart}>Replay</button>}
      </div>

      <div className={s.controls}>
        <button className={s.playBtn} onClick={() => (ended ? restart() : setPlaying(v => !v))} aria-label={playing ? 'Pause' : 'Play'}>
          {ended ? '↻' : playing ? '❚❚' : '▶'}
        </button>
        <div className={s.chapters}>
          {sc.scenes.map((x, i) => {
            const fill = i < index ? 1 : i === index ? p : 0
            return (
              <button key={i} className={s.chapter} style={{ flex: x.ms }} onClick={() => seek(starts[i])} title={x.title}>
                <span className={s.track}><span className={s.fill} style={{ transform: `scaleX(${fill})` }} /></span>
              </button>
            )
          })}
        </div>
        <span className={s.time}>{Math.floor(elapsed / 1000)}s / {Math.round(total / 1000)}s</span>
      </div>
      <div className={s.caption} key={sc.id + 'c' + index}>
        <span className={s.stepNo}>{index + 1} / {sc.scenes.length}</span>
        <div><strong>{scene.title}</strong><p>{scene.caption}</p></div>
      </div>
    </div>
  )
}

function SceneView({ scene, p, company }: { scene: Scene; p: number; company: string }) {
  switch (scene.kind) {
    case 'email': return <EmailScene x={scene} p={p} company={company} />
    case 'portal': return <PortalScene x={scene} p={p} />
    case 'record': return <RecordScene x={scene} p={p} company={company} />
    case 'readmany': return <ReadManyScene x={scene} p={p} company={company} />
    case 'phone': return <PhoneScene x={scene} p={p} company={company} />
    case 'chat': return <ChatScene x={scene} p={p} />
    case 'board': return <BoardScene x={scene} p={p} company={company} />
    case 'report': return <ReportScene x={scene} p={p} company={company} />
    case 'devices': return <DevicesScene x={scene} p={p} company={company} />
    case 'log': return <LogScene x={scene} p={p} company={company} />
  }
}

/** Window frame with a tag saying where this screen lives. */
function Win({ where, label, right, children, wide }: { where: Where; label: string; right?: React.ReactNode; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={[s.window, wide ? s.wide : ''].join(' ')}>
      <div className={s.winBar}>
        <span className={s.dots}><i /><i /><i /></span>
        <span className={s.winLabel}>{label}</span>
        <span className={[s.whereTag, s['wh_' + where]].join(' ')}>{WHERE[where]}</span>
        {right}
      </div>
      {children}
    </div>
  )
}

/* ---------- Scenes ---------- */

function EmailScene({ x, p, company }: { x: Extract<Scene, { kind: 'email' }>; p: number; company: string }) {
  return (
    <Win where={x.where} label={`${x.system} · ${company}`}>
      <div className={s.mail}>
        <ul className={s.mailList}>
          <li className={[s.mailItem, s.mailNew, io(p > 0.25)].join(' ')}>
            <span className={s.unread} /><span><strong>{x.from}</strong><em>{x.subject}</em></span><span className={s.when}>now</span>
          </li>
          {x.older.map(m => <li key={m.subject} className={s.mailItem}><span /><span><strong>{m.from}</strong><em>{m.subject}</em></span><span className={s.when}>yesterday</span></li>)}
        </ul>
        <div className={[s.mailBody, io(p > 0.6)].join(' ')}>
          <h4>{x.subject}</h4><p className={s.mailFrom}>{x.from}</p><p>{x.preview}</p>
          <span className={s.attachment}><span className={s.docIcon} />{x.attachment}</span>
        </div>
      </div>
    </Win>
  )
}

function PortalScene({ x, p }: { x: Extract<Scene, { kind: 'portal' }>; p: number }) {
  const files = x.files ?? []
  const shown = files.filter((_, i) => p > 0.2 + (i / Math.max(files.length, 1)) * 0.4)
  const clicked = p > 0.72
  const done = p > 0.82
  return (
    <Win where={x.where} label={x.system}>
      <div className={s.urlBar}><span className={s.lock} />{x.url}</div>
      <div className={s.portal}>
        <h4>{x.heading}</h4>
        {x.lines.map((l, i) => <p key={l} className={io(p > 0.08 + i * 0.08)}>{l}</p>)}
        {files.length > 0 && (
          <ul className={s.fileList}>
            {shown.map(f => <li key={f} className={s.fileIn}><span className={s.docIcon} />{f}<span className={s.fileOk}>✓</span></li>)}
          </ul>
        )}
        <div className={s.portalAction}>
          {!done
            ? <button className={[s.btnPrimary, clicked ? s.pressed : ''].join(' ')}>{x.action}</button>
            : <span className={s.doneBox}>✓ {x.done}</span>}
          {!done && p > 0.55 && <span className={s.cursorDot} style={{ transform: `translate(${(1 - ease(seg(p, 0.55, 0.72))) * 60}px, ${(1 - ease(seg(p, 0.55, 0.72))) * 40}px)` }} />}
        </div>
      </div>
    </Win>
  )
}

function RecordScene({ x, p, company }: { x: Extract<Scene, { kind: 'record' }>; p: number; company: string }) {
  const n = x.fields.length
  const done = p > 0.8
  const pill = <span className={[s.pill, done ? s.pillWarn : s.pillOn].join(' ')}>{done ? `${n} of ${n + 1} · 1 question` : p > 0.15 ? 'AI reading…' : 'New'}</span>
  return (
    <Win where={x.where} label={`${x.system} · ${company}`} right={pill}>
      <div className={s.record}>
        <div className={s.docCard}>
          <span className={s.docIcon} /><span>{x.doc}</span>
          <div className={s.scan} style={{ top: `${20 + seg(p, 0.15, 0.75) * 70}%`, opacity: p > 0.15 && p < 0.78 ? 1 : 0 }} />
          <div className={s.docLines}>{Array.from({ length: 9 }, (_, i) => <i key={i} style={{ width: `${55 + ((i * 37) % 40)}%` }} />)}</div>
        </div>
        <div className={s.form}>
          <h4>{x.recordTitle}</h4>
          {x.fields.map((f, i) => {
            const on = p > 0.22 + (i / n) * 0.5
            return <div key={f.label} className={[s.fieldRow, on ? s.fieldOn : ''].join(' ')}><span>{f.label}</span><strong>{on ? f.value : ''}</strong></div>
          })}
          <div className={[s.fieldRow, done ? s.fieldMissing : ''].join(' ')}><span>{x.missing}</span><strong>{done ? `Missing · asking ${x.askWho}` : ''}</strong></div>
        </div>
      </div>
    </Win>
  )
}

function ReadManyScene({ x, p, company }: { x: Extract<Scene, { kind: 'readmany' }>; p: number; company: string }) {
  const order = [3, 5, 2, 4, 0, 1]
  const doneAt = (i: number) => 0.2 + (order.indexOf(i) / x.docs.length) * 0.5
  const total = x.docs.reduce((a, d) => a + (p > doneAt(d ? x.docs.indexOf(d) : 0) ? d.facts : 0), 0)
  const issue = p > 0.82
  const pill = <span className={[s.pill, issue ? s.pillWarn : s.pillOn].join(' ')}>{issue ? '1 issue' : p > 0.08 ? `Reading · ${total} facts` : 'Starting'}</span>
  return (
    <Win where={x.where} label={`${x.system} · ${company}`} right={pill}>
      <div className={s.readGrid}>
        {x.docs.map((d, i) => {
          const reading = p > 0.08 && p <= doneAt(i)
          const done = p > doneAt(i)
          return (
            <div key={d.name} className={[s.readDoc, reading ? s.readOn : '', done ? s.readDone : ''].join(' ')}>
              <span className={s.docIcon} /><span className={s.readName}>{d.name}</span>
              <span className={s.readState}>{done ? `${d.facts} facts` : reading ? 'Reading…' : ''}</span>
              {reading && <span className={s.readBar}><i style={{ width: `${seg(p, 0.08, doneAt(i)) * 100}%` }} /></span>}
            </div>
          )
        })}
      </div>
      <div className={[s.issue, io(issue)].join(' ')}>! {x.issue}</div>
    </Win>
  )
}

function PhoneScene({ x, p, company }: { x: Extract<Scene, { kind: 'phone' }>; p: number; company: string }) {
  const open = p > 0.42
  const tapK = seg(p, 0.6, 0.72)
  const tapped = p > 0.72
  return (
    <div className={s.phoneWrap}>
      <span className={[s.whereTag, s.wh_phone, s.phoneTag].join(' ')}>{WHERE.phone}</span>
      <div className={s.phone}>
        <div className={s.phoneTop}><span>09:41</span><span className={s.statusIcons}>●●● ▲ ▮</span></div>
        {!open ? (
          <div className={s.lockScreen}>
            <div className={s.clock}>09:41</div>
            <div className={[s.notif, io(p > 0.1)].join(' ')}>
              <span className={s.notifApp}><i />{company}</span><strong>{x.notifTitle}</strong><em>Tap to decide</em>
            </div>
          </div>
        ) : (
          <div className={s.app}>
            <p className={s.appHead}>{company}</p>
            <div className={s.question}>
              <strong>{x.notifTitle}</strong><p>{x.body}</p>
              {!tapped ? (
                <div className={s.choices}>
                  <button className={[s.choice, s.choicePrimary, tapK > 0.5 ? s.pressed : ''].join(' ')}>{x.primary}</button>
                  <button className={s.choice}>{x.secondary}</button>
                </div>
              ) : <div className={s.doneBox}>✓ {x.result}</div>}
            </div>
            {!tapped && p > 0.5 && <span className={s.finger} style={{ transform: `translate(${(1 - ease(tapK)) * 40}px, ${(1 - ease(tapK)) * 60}px) scale(${tapK > 0.5 ? 0.9 : 1})` }} />}
          </div>
        )}
      </div>
    </div>
  )
}

function ChatScene({ x, p }: { x: Extract<Scene, { kind: 'chat' }>; p: number }) {
  const typing = p > 0.35 && p < 0.55
  const replied = p > 0.55
  const after = p > 0.75
  return (
    <div className={s.phoneWrap}>
      <span className={[s.whereTag, s.wh_external, s.phoneTag].join(' ')}>{x.system}</span>
      <div className={s.phone}>
        <div className={s.phoneTop}><span>13:07</span><span className={s.statusIcons}>●●● ▲ ▮</span></div>
        <div className={s.chat}>
          <p className={s.chatHead}>{x.contact}</p>
          <div className={[s.bubble, s.bubbleIn, io(p > 0.08)].join(' ')}>{x.outgoing}</div>
          {typing && <div className={[s.bubble, s.bubbleOut].join(' ')}><span className={s.typing}><i /><i /><i /></span></div>}
          {replied && <div className={[s.bubble, s.bubbleOut].join(' ')}>{x.reply}</div>}
          <div className={[s.bubble, s.bubbleIn, io(after)].join(' ')}>{x.afterReply}</div>
        </div>
      </div>
    </div>
  )
}

function BoardScene({ x, p, company }: { x: Extract<Scene, { kind: 'board' }>; p: number; company: string }) {
  return (
    <Win where={x.where} label={`${x.system} · ${company}`}>
      <div className={s.board}>
        {x.columns.map((col, ci) => (
          <div key={col} className={s.column}>
            <p className={s.colTitle}>{col}</p>
            {x.cards.filter(c => c.col === ci).map(c => <div key={c.title} className={s.cardItem}><strong>{c.title}</strong><span>{c.sub}</span></div>)}
            {ci === x.into && <div className={[s.cardItem, s.cardNew, io(p > 0.3)].join(' ')}><strong>{x.card}</strong><span>{x.cardSub}</span></div>}
          </div>
        ))}
      </div>
      <div className={[s.toast, io(p > 0.62)].join(' ')}>✓ {x.toast}</div>
    </Win>
  )
}

function ReportScene({ x, p, company }: { x: Extract<Scene, { kind: 'report' }>; p: number; company: string }) {
  const status = p > 0.85 ? 'approved' : p > 0.6 ? 'review' : 'draft'
  const pill = <span className={[s.pill, status === 'approved' ? s.pillOk : status === 'review' ? s.pillWarn : ''].join(' ')}>{status === 'approved' ? `Approved by ${x.reviewer}` : status === 'review' ? `With ${x.reviewer} for review` : 'Draft'}</span>
  return (
    <Win where={x.where} label={`${x.system} · ${company}`} right={pill}>
      <div className={s.report}>
        <h4>{x.reportTitle}</h4>
        <div className={s.areas}>
          {x.areas.map((a, i) => <div key={a.area} className={[s.area, s['lvl_' + a.level], io(p > 0.08 + i * 0.1)].join(' ')}><strong>{a.area}</strong><span>{a.note}</span></div>)}
        </div>
        <ul className={s.findings}>
          {x.findings.map((f, i) => <li key={f} className={io(p > 0.45 + i * 0.05)}>{f}</li>)}
        </ul>
      </div>
    </Win>
  )
}

function DevicesScene({ x, p, company }: { x: Extract<Scene, { kind: 'devices' }>; p: number; company: string }) {
  const flip = x.phase === 'synced' ? p > 0.3 : p > 0.25
  return (
    <Win where={x.where} label={`${x.system} · ${company}`}>
      <div className={s.devices}>
        {x.devices.map((d, i) => {
          const isMain = i === 0
          const showState = !isMain || flip
          const ok = isMain ? (x.phase === 'synced' ? flip : !flip) : d.ok
          return (
            <div key={d.name} className={[s.device, showState && !ok ? s.deviceOff : '', isMain && flip && x.phase === 'synced' ? s.deviceBack : ''].join(' ')}>
              <div className={s.deviceHead}><strong>{d.name}</strong><span className={ok ? s.dotOk : s.dotWarn} /></div>
              <em>{d.where}</em>
              <p>{isMain && !flip ? (x.phase === 'offline' ? 'Online · on schedule' : 'Offline · 42 readings stored on board') : d.note}</p>
            </div>
          )
        })}
      </div>
      {x.toast && <div className={[s.toast, io(p > 0.65)].join(' ')}>✓ {x.toast}</div>}
    </Win>
  )
}

function LogScene({ x, p, company }: { x: Extract<Scene, { kind: 'log' }>; p: number; company: string }) {
  return (
    <Win where={x.where} label={`${x.system} · ${company}`}>
      <ul className={s.log}>
        {x.entries.map((l, i) => (
          <li key={l.what} className={io(p > 0.1 + i * 0.14)}>
            <span className={[s.logWho, l.who === 'AI' ? s.logAi : ''].join(' ')}>{l.who}</span><span>{l.what}</span>
          </li>
        ))}
      </ul>
    </Win>
  )
}
