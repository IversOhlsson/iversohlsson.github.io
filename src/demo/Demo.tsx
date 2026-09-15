import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import s from './Demo.module.css'
import { SCENARIOS, type Scenario } from './scenarios'

/** Scenes in order, with how long each plays. */
const SCENES = [
  { id: 'arrive', title: 'A document arrives', caption: 'The way it always has. Email, upload, or a shared folder.', ms: 2600 },
  { id: 'read', title: 'The agent reads it', caption: 'It finds what matters and fills in the fields you care about.', ms: 6500 },
  { id: 'ask', title: 'It asks when something is missing', caption: 'No guessing. A short question to a person, then it carries on.', ms: 7500 },
  { id: 'done', title: 'Clean data, where you need it', caption: 'Saved into the system you already use. No retyping.', ms: 3200 },
  { id: 'setup', title: 'How it is set up', caption: 'A small, well-defined system. Runs in the cloud or on your own servers.', ms: 9000 },
] as const

const TOTAL = SCENES.reduce((a, sc) => a + sc.ms, 0)

const clamp = (v: number) => Math.max(0, Math.min(1, v))
/** Fraction of `p` between two thresholds, clamped to 0..1. */
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
const typed = (text: string, k: number) => text.slice(0, Math.round(text.length * clamp(k)))

export default function Demo() {
  const [scenario, setScenario] = useState<Scenario>(SCENARIOS[0])
  const [elapsed, setElapsed] = useState(0)
  const [playing, setPlaying] = useState(true)
  const last = useRef<number | null>(null)

  // Clock: advance while playing, stop at the end.
  useEffect(() => {
    if (!playing) { last.current = null; return }
    let raf = 0
    const tick = (now: number) => {
      if (last.current !== null) {
        const dt = now - last.current
        setElapsed(e => {
          const n = e + dt
          if (n >= TOTAL) { setPlaying(false); return TOTAL }
          return n
        })
      }
      last.current = now
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  const { index, p, starts } = useMemo(() => {
    const starts: number[] = []
    let acc = 0
    for (const sc of SCENES) { starts.push(acc); acc += sc.ms }
    let index = SCENES.length - 1
    for (let i = 0; i < SCENES.length; i++) {
      if (elapsed < starts[i] + SCENES[i].ms) { index = i; break }
    }
    const p = clamp((elapsed - starts[index]) / SCENES[index].ms)
    return { index, p, starts }
  }, [elapsed])

  const seek = useCallback((i: number) => {
    setElapsed(starts[i])
    setPlaying(true)
  }, [starts])

  const restart = useCallback(() => { setElapsed(0); setPlaying(true) }, [])
  const pick = useCallback((sc: Scenario) => { setScenario(sc); setElapsed(0); setPlaying(true) }, [])
  const ended = elapsed >= TOTAL
  const scene = SCENES[index]

  return (
    <div className={s.page}>
      <header className={s.top}>
        <a href="/" className={s.back}>← Philip Ivers Ohlsson</a>
        <span className={s.badge}>Demo · not public</span>
      </header>

      <section className={s.intro}>
        <p className={s.eyebrow}>How the agent works</p>
        <h1 className={s.h1}>Documents in. Organised data out. In about 30 seconds.</h1>
        <p className={s.sub}>Pick a kind of customer. The same system handles each one; only the fields change.</p>
        <div className={s.picker} role="tablist" aria-label="Customer type">
          {SCENARIOS.map(sc => (
            <button
              key={sc.id}
              role="tab"
              aria-selected={sc.id === scenario.id}
              className={[s.chip, sc.id === scenario.id ? s.chipOn : ''].join(' ')}
              onClick={() => pick(sc)}
            >
              <strong>{sc.customer}</strong><span>{sc.tagline}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={s.player}>
        <div className={s.stage}>
          {index < 4
            ? <AppScene sc={scenario} scene={scene.id} p={p} />
            : <SetupScene p={p} />}
          {ended && (
            <button className={s.replay} onClick={restart}>Replay</button>
          )}
        </div>

        <div className={s.controls}>
          <button className={s.playBtn} onClick={() => (ended ? restart() : setPlaying(v => !v))} aria-label={playing ? 'Pause' : 'Play'}>
            {ended ? '↻' : playing ? '❚❚' : '▶'}
          </button>
          <div className={s.chapters}>
            {SCENES.map((sc, i) => {
              const fill = i < index ? 1 : i === index ? p : 0
              return (
                <button key={sc.id} className={s.chapter} onClick={() => seek(i)} title={sc.title} style={{ flex: sc.ms }}>
                  <span className={s.track}><span className={s.fill} style={{ transform: `scaleX(${fill})` }} /></span>
                </button>
              )
            })}
          </div>
          <span className={s.time}>{Math.floor(elapsed / 1000)}s / {Math.round(TOTAL / 1000)}s</span>
        </div>

        <div className={s.caption} key={scene.id}>
          <span className={s.stepNo}>{index + 1} / {SCENES.length}</span>
          <div>
            <strong>{scene.title}</strong>
            <p>{scene.caption}</p>
          </div>
        </div>
      </section>

      <section className={s.notes}>
        <div>
          <h2>What you just saw</h2>
          <ul>
            <li>The document never leaves your system. The agent reads a copy and keeps a log of every step.</li>
            <li>Rules written in code decide what counts as complete. The AI only reads, extracts and phrases questions.</li>
            <li>When something is missing, it pauses and asks a person. It picks up where it left off.</li>
          </ul>
        </div>
        <div>
          <h2>What it takes to set up</h2>
          <ul>
            <li>A list of the fields you care about, and a few example documents.</li>
            <li>Where the data should go: a spreadsheet, your existing system, or a small app I build for you.</li>
            <li>Where it should run: in the cloud, on your own servers, or both.</li>
          </ul>
        </div>
      </section>

      <footer className={s.foot}>
        <a href="mailto:philip.iversohlsson@gmail.com" className={s.cta}>Talk to me about your documents</a>
      </footer>
    </div>
  )
}

/* ---------- Scene 1 to 4: the app ---------- */

function AppScene({ sc, scene, p }: { sc: Scenario; scene: string; p: number }) {
  const reading = scene === 'read'
  const asking = scene === 'ask'
  const done = scene === 'done'
  const afterRead = asking || done

  // Which fields are filled. During "read", the known fields appear one after another.
  const known = sc.fields.map((_, i) => i !== sc.missing)
  const knownOrder = sc.fields.map((_, i) => i).filter(i => known[i])
  const filled = sc.fields.map((_, i) => {
    if (i === sc.missing) return (asking && p > 0.86) || done
    if (afterRead) return true
    if (!reading) return false
    const k = knownOrder.indexOf(i)
    return p > 0.18 + (k / knownOrder.length) * 0.7
  })

  const docIn = scene !== 'arrive' || p > 0.15
  const scanY = reading ? seg(p, 0.1, 0.9) : afterRead ? 1 : 0
  const qText = asking ? typed(sc.question, seg(p, 0.06, 0.34)) : ''
  const aText = asking ? typed(sc.answer, seg(p, 0.5, 0.74)) : ''
  const showAnswer = asking && p > 0.48
  const saved = done && p > 0.15

  return (
    <div className={s.app}>
      <div className={s.appBar}>
        <span className={s.dots}><i /><i /><i /></span>
        <span className={s.appTitle}>Intake</span>
        <span className={[s.status, reading ? s.statusOn : asking ? s.statusWait : done ? s.statusOk : ''].join(' ')}>
          {reading ? 'Reading…' : asking ? 'Waiting for you' : done ? 'Saved' : 'Idle'}
        </span>
      </div>
      <div className={s.appBody}>
        <div className={s.docPane}>
          <div className={[s.doc, docIn ? s.docIn : ''].join(' ')}>
            <div className={s.docHead}>
              <span className={s.docIcon} />
              <span>{sc.file}</span>
            </div>
            {sc.lines.map((line, i) => {
              const f = sc.fields.find(f => f.quote && line.includes(f.quote))
              const fi = f ? sc.fields.indexOf(f) : -1
              const hot = fi >= 0 && filled[fi]
              if (!f?.quote) return <p key={i} className={s.line}>{line}</p>
              const [a, b] = line.split(f.quote)
              return (
                <p key={i} className={s.line}>
                  {a}<mark className={hot ? s.hot : ''}>{f.quote}</mark>{b}
                </p>
              )
            })}
            {(reading || afterRead) && (
              <div className={s.scan} style={{ top: `${8 + scanY * 84}%`, opacity: reading ? 1 : 0 }} />
            )}
          </div>
        </div>

        <div className={s.dataPane}>
          <p className={s.paneTitle}>Extracted</p>
          <ul className={s.fields}>
            {sc.fields.map((f, i) => {
              const on = filled[i]
              const missing = i === sc.missing && !on && afterRead
              return (
                <li key={f.label} className={[s.field, on ? s.fieldOn : '', missing ? s.fieldMissing : ''].join(' ')}>
                  <span className={s.fLabel}>{f.label}</span>
                  <span className={s.fValue}>
                    {on ? f.value : missing ? 'Missing' : ''}
                  </span>
                  <span className={s.fMark}>{on ? '✓' : missing ? '?' : ''}</span>
                </li>
              )
            })}
          </ul>
          <div className={[s.toast, saved ? s.toastOn : ''].join(' ')}>
            ✓ Saved to {sc.destination}
          </div>
        </div>
      </div>

      <div className={[s.chat, asking ? s.chatOn : ''].join(' ')}>
        <div className={s.bubbleAgent}>
          <span className={s.who}>Agent</span>
          {qText}<span className={s.caret} style={{ opacity: qText.length < sc.question.length ? 1 : 0 }} />
        </div>
        <div className={[s.bubbleUser, showAnswer ? s.bubbleOn : ''].join(' ')}>
          <span className={s.who}>You</span>
          {aText}
        </div>
      </div>
    </div>
  )
}

/* ---------- Scene 5: how it is set up ---------- */

function SetupScene({ p }: { p: number }) {
  const boxes = [
    { t: 'Your team', d: 'Sends documents, answers questions' },
    { t: 'The app', d: 'Small, built for your workflow' },
    { t: 'AI agent', d: 'Reads, extracts, asks' },
    { t: 'Your data', d: 'Spreadsheet or your system' },
  ]
  const notes = [
    'Rules in code decide. AI only reads and asks.',
    'Every step is logged, with what it read and what it wrote.',
    'Pauses for a person when something is missing.',
  ]
  const cloud = p > 0.55 && p < 0.8
  return (
    <div className={s.setup}>
      <div className={s.chain}>
        {boxes.map((b, i) => (
          <div key={b.t} className={s.chainItem}>
            <div className={[s.node, p > 0.06 + i * 0.1 ? s.nodeOn : ''].join(' ')}>
              <strong>{b.t}</strong>
              <span>{b.d}</span>
            </div>
            {i < boxes.length - 1 && <span className={[s.arrow, p > 0.12 + i * 0.1 ? s.arrowOn : ''].join(' ')} />}
          </div>
        ))}
      </div>
      <div className={[s.host, p > 0.48 ? s.hostOn : ''].join(' ')}>
        <span className={s.hostLabel}>Runs</span>
        <span className={[s.hostOpt, cloud ? s.hostSel : ''].join(' ')}>in the cloud</span>
        <span className={[s.hostOpt, !cloud && p > 0.8 ? s.hostSel : ''].join(' ')}>on your servers</span>
        <span className={[s.hostOpt, p > 0.95 ? s.hostSel : ''].join(' ')}>or both</span>
      </div>
      <ul className={s.setupNotes}>
        {notes.map((n, i) => (
          <li key={n} className={p > 0.5 + i * 0.13 ? s.noteOn : ''}>{n}</li>
        ))}
      </ul>
    </div>
  )
}
