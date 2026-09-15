import { useCallback, useEffect, useRef, useState } from 'react'
import s from './Workflow.module.css'
import { SCENARIOS, type Scenario } from './scenarios'

/* ---------- Timeline ---------- */

const SCENES = [
  { id: 'email', title: 'It arrives the way it always has', caption: 'An email with an attachment. Nobody has to learn a new tool.', ms: 6500 },
  { id: 'record', title: 'AI fills in the record inside your system', caption: 'The fields you care about, filled in where they belong. Nothing copied by hand.', ms: 9500 },
  { id: 'phone', title: 'You get a notification. One tap decides.', caption: 'The AI suggests. A person decides. Anywhere, in seconds.', ms: 10500 },
  { id: 'board', title: 'It lands where the work happens', caption: 'The plan updates and the other side gets a confirmation. No one had to remember.', ms: 8000 },
  { id: 'log', title: 'Everything is on the record', caption: 'What arrived, what the AI read, who decided. Easy to read later.', ms: 7000 },
] as const

const TOTAL = SCENES.reduce((a, sc) => a + sc.ms, 0)
const clamp = (v: number) => Math.max(0, Math.min(1, v))
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
const ease = (k: number) => 1 - Math.pow(1 - k, 3)

/* ---------- Player ---------- */

export default function Workflow() {
  const [sc, setSc] = useState<Scenario>(SCENARIOS[0])
  const [elapsed, setElapsed] = useState(0)
  const [playing, setPlaying] = useState(true)
  const last = useRef<number | null>(null)

  useEffect(() => {
    if (!playing) { last.current = null; return }
    let raf = 0
    const tick = (now: number) => {
      if (last.current !== null) {
        const dt = now - last.current
        setElapsed(e => { const n = e + dt; if (n >= TOTAL) { setPlaying(false); return TOTAL } return n })
      }
      last.current = now
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  const starts: number[] = []
  let acc = 0
  for (const x of SCENES) { starts.push(acc); acc += x.ms }
  let index = SCENES.length - 1
  for (let i = 0; i < SCENES.length; i++) if (elapsed < starts[i] + SCENES[i].ms) { index = i; break }
  const p = clamp((elapsed - starts[index]) / SCENES[index].ms)
  const scene = SCENES[index]
  const ended = elapsed >= TOTAL

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
        <div className={s.scene} key={sc.id + scene.id}>
          {scene.id === 'email' && <EmailScene sc={sc} p={p} />}
          {scene.id === 'record' && <RecordScene sc={sc} p={p} />}
          {scene.id === 'phone' && <PhoneScene sc={sc} p={p} />}
          {scene.id === 'board' && <BoardScene sc={sc} p={p} />}
          {scene.id === 'log' && <LogScene sc={sc} p={p} />}
        </div>
        {ended && <button className={s.replay} onClick={restart}>Replay</button>}
      </div>

      <div className={s.controls}>
        <button className={s.playBtn} onClick={() => (ended ? restart() : setPlaying(v => !v))} aria-label={playing ? 'Pause' : 'Play'}>
          {ended ? '↻' : playing ? '❚❚' : '▶'}
        </button>
        <div className={s.chapters}>
          {SCENES.map((x, i) => {
            const fill = i < index ? 1 : i === index ? p : 0
            return (
              <button key={x.id} className={s.chapter} style={{ flex: x.ms }} onClick={() => seek(starts[i])} title={x.title}>
                <span className={s.track}><span className={s.fill} style={{ transform: `scaleX(${fill})` }} /></span>
              </button>
            )
          })}
        </div>
        <span className={s.time}>{Math.floor(elapsed / 1000)}s / {Math.round(TOTAL / 1000)}s</span>
      </div>
      <div className={s.caption} key={scene.id}>
        <span className={s.stepNo}>{index + 1} / {SCENES.length}</span>
        <div><strong>{scene.title}</strong><p>{scene.caption}</p></div>
      </div>
    </div>
  )
}

/* ---------- Scene 1: email ---------- */

function EmailScene({ sc, p }: { sc: Scenario; p: number }) {
  const arrived = p > 0.25
  const opened = p > 0.6
  return (
    <div className={s.window}>
      <div className={s.winBar}><span className={s.dots}><i /><i /><i /></span><span>Inbox · {sc.company}</span></div>
      <div className={s.mail}>
        <ul className={s.mailList}>
          <li className={[s.mailItem, s.mailNew, arrived ? s.in : s.out].join(' ')}>
            <span className={s.unread} />
            <span><strong>{sc.email.from}</strong><em>{sc.email.subject}</em></span>
            <span className={s.when}>now</span>
          </li>
          {sc.older.map(m => (
            <li key={m.subject} className={s.mailItem}><span /><span><strong>{m.from}</strong><em>{m.subject}</em></span><span className={s.when}>yesterday</span></li>
          ))}
        </ul>
        <div className={[s.mailBody, opened ? s.in : s.out].join(' ')}>
          <h4>{sc.email.subject}</h4>
          <p className={s.mailFrom}>{sc.email.from}</p>
          <p>{sc.email.preview}</p>
          <span className={s.attachment}><span className={s.docIcon} />{sc.email.attachment}</span>
        </div>
      </div>
    </div>
  )
}

/* ---------- Scene 2: the record fills itself in ---------- */

function RecordScene({ sc, p }: { sc: Scenario; p: number }) {
  const n = sc.record.fields.length
  const filled = sc.record.fields.map((_, i) => p > 0.22 + (i / n) * 0.5)
  const done = p > 0.8
  return (
    <div className={s.window}>
      <div className={s.winBar}>
        <span className={s.dots}><i /><i /><i /></span>
        <span>{sc.record.system} · {sc.company}</span>
        <span className={[s.pill, done ? s.pillWarn : s.pillOn].join(' ')}>{done ? `${n} of ${n + 1} · 1 question` : p > 0.15 ? 'AI reading…' : 'New'}</span>
      </div>
      <div className={s.record}>
        <div className={s.docCard}>
          <span className={s.docIcon} /><span>{sc.email.attachment}</span>
          <div className={s.scan} style={{ top: `${20 + seg(p, 0.15, 0.75) * 70}%`, opacity: p > 0.15 && p < 0.78 ? 1 : 0 }} />
          <div className={s.docLines}>{Array.from({ length: 9 }, (_, i) => <i key={i} style={{ width: `${55 + ((i * 37) % 40)}%` }} />)}</div>
        </div>
        <div className={s.form}>
          <h4>{sc.record.title}</h4>
          {sc.record.fields.map((f, i) => (
            <div key={f.label} className={[s.fieldRow, filled[i] ? s.fieldOn : ''].join(' ')}>
              <span>{f.label}</span><strong>{filled[i] ? f.value : ''}</strong>
            </div>
          ))}
          <div className={[s.fieldRow, done ? s.fieldMissing : ''].join(' ')}>
            <span>{sc.record.missing}</span><strong>{done ? `Missing · asking ${sc.person}` : ''}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Scene 3: phone notification, one tap ---------- */

function PhoneScene({ sc, p }: { sc: Scenario; p: number }) {
  const notif = p > 0.1
  const open = p > 0.42
  const tapK = seg(p, 0.6, 0.72)
  const tapped = p > 0.72
  return (
    <div className={s.phoneWrap}>
      <div className={s.phone}>
        <div className={s.phoneTop}><span>09:41</span><span className={s.statusIcons}>●●● ▲ ▮</span></div>
        {!open ? (
          <div className={s.lock}>
            <div className={s.clock}>09:41</div>
            <div className={[s.notif, notif ? s.in : s.out].join(' ')}>
              <span className={s.notifApp}><i />{sc.company}</span>
              <strong>{sc.phone.title}</strong>
              <em>Tap to decide</em>
            </div>
          </div>
        ) : (
          <div className={s.app}>
            <p className={s.appHead}>{sc.company}</p>
            <div className={s.question}>
              <strong>{sc.phone.title}</strong>
              <p>{sc.phone.body}</p>
              {!tapped ? (
                <div className={s.choices}>
                  <button className={[s.choice, s.choicePrimary, tapK > 0.5 ? s.pressed : ''].join(' ')}>{sc.phone.primary}</button>
                  <button className={s.choice}>{sc.phone.secondary}</button>
                </div>
              ) : (
                <div className={s.doneBox}>✓ {sc.phone.result}</div>
              )}
            </div>
            {!tapped && p > 0.5 && (
              <span className={s.finger} style={{ transform: `translate(${(1 - ease(tapK)) * 40}px, ${(1 - ease(tapK)) * 60}px) scale(${tapK > 0.5 ? 0.9 : 1})` }} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Scene 4: it lands in the plan ---------- */

function BoardScene({ sc, p }: { sc: Scenario; p: number }) {
  const landed = p > 0.3
  const toast = p > 0.62
  return (
    <div className={s.window}>
      <div className={s.winBar}><span className={s.dots}><i /><i /><i /></span><span>{sc.board.system} · {sc.company}</span></div>
      <div className={s.board}>
        {sc.board.columns.map((col, ci) => (
          <div key={col} className={s.column}>
            <p className={s.colTitle}>{col}</p>
            {sc.board.cards.filter(c => c.col === ci).map(c => (
              <div key={c.title} className={s.cardItem}><strong>{c.title}</strong><span>{c.sub}</span></div>
            ))}
            {ci === sc.board.into && (
              <div className={[s.cardItem, s.cardNew, landed ? s.in : s.out].join(' ')}><strong>{sc.board.card}</strong><span>{sc.board.cardSub}</span></div>
            )}
          </div>
        ))}
      </div>
      <div className={[s.toast, toast ? s.in : s.out].join(' ')}>✓ {sc.board.toast}</div>
    </div>
  )
}

/* ---------- Scene 5: the log ---------- */

function LogScene({ sc, p }: { sc: Scenario; p: number }) {
  return (
    <div className={s.window}>
      <div className={s.winBar}><span className={s.dots}><i /><i /><i /></span><span>Activity · {sc.company}</span></div>
      <ul className={s.log}>
        {sc.log.map((l, i) => (
          <li key={l.what} className={p > 0.1 + i * 0.14 ? s.in : s.out}>
            <span className={[s.logWho, l.who === 'AI' ? s.logAi : ''].join(' ')}>{l.who}</span>
            <span>{l.what}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
