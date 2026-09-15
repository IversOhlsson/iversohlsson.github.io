import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import s from './Demo.module.css'
import { FullStack, Distributed, Agents, Hosting, Care } from './scenes'
import { bookHref } from '../content/site'

const SCENES = [
  { id: 'stack', title: 'Every layer, one partner', caption: 'From the screen people use to the database behind it. Nothing falls between teams.', ms: 8000, View: FullStack },
  { id: 'dist', title: 'Built to keep working', caption: 'Parts talk through a shared log. If one stops, the rest carry on and it catches up.', ms: 11000, View: Distributed },
  { id: 'agents', title: 'AI agents you can trust', caption: 'The model plans and reads. Code checks the result. A person approves anything that leaves the building.', ms: 14000, View: Agents },
  { id: 'host', title: 'Runs where you need it', caption: 'The same system in the cloud, on your own servers, or both. Deploy on push, roll back in one step.', ms: 9000, View: Hosting },
  { id: 'care', title: 'Looked after', caption: 'Monitoring, backups and updates. If something needs attention, I see it first.', ms: 7000, View: Care },
]

const TOTAL = SCENES.reduce((a, sc) => a + sc.ms, 0)
const clamp = (v: number) => Math.max(0, Math.min(1, v))

export default function Demo() {
  const [elapsed, setElapsed] = useState(0)
  const [playing, setPlaying] = useState(true)
  const last = useRef<number | null>(null)

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

  const starts = useMemo(() => {
    const out: number[] = []
    let acc = 0
    for (const sc of SCENES) { out.push(acc); acc += sc.ms }
    return out
  }, [])

  let index = SCENES.length - 1
  for (let i = 0; i < SCENES.length; i++) {
    if (elapsed < starts[i] + SCENES[i].ms) { index = i; break }
  }
  const p = clamp((elapsed - starts[index]) / SCENES[index].ms)
  const ended = elapsed >= TOTAL
  const scene = SCENES[index]
  const View = scene.View

  const seek = useCallback((i: number) => { setElapsed(starts[i]); setPlaying(true) }, [starts])
  const restart = useCallback(() => { setElapsed(0); setPlaying(true) }, [])

  return (
    <div className={s.page}>
      <header className={s.top}>
        <a href="/" className={s.back}>← Philip Ivers Ohlsson</a>
        <span className={s.badge}>Demo · not public</span>
      </header>

      <section className={s.intro}>
        <p className={s.eyebrow}>How I build systems</p>
        <h1 className={s.h1}>The whole system, from the screen to the server room.</h1>
        <p className={s.sub}>Five short chapters, under a minute. Press play or jump to any chapter.</p>
      </section>

      <section className={s.player}>
        <div className={s.stage}>
          <div className={s.card} key={scene.id}>
            <View p={p} />
          </div>
          {ended && <button className={s.replay} onClick={restart}>Replay</button>}
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

      <ol className={s.chapterList}>
        {SCENES.map((sc, i) => (
          <li key={sc.id}>
            <button className={[s.chapterBtn, i === index ? s.chapterOn : ''].join(' ')} onClick={() => seek(i)}>
              <span className={s.chapterNo}>{i + 1}</span>
              <span>
                <strong>{sc.title}</strong>
                <em>{sc.caption}</em>
              </span>
            </button>
          </li>
        ))}
      </ol>

      <section className={s.notes}>
        <div>
          <h2>Where this comes from</h2>
          <ul>
            <li>A two-sided marketplace where customers upload documents and AI agents turn them into structured requests, negotiations and agreements.</li>
            <li>Industrial IoT systems: sensors in the field, real-time processing at the edge, dashboards in the office.</li>
            <li>A phone app for running AI coding agents at home over a private network, with approval prompts before anything runs.</li>
          </ul>
        </div>
        <div>
          <h2>How an engagement starts</h2>
          <ul>
            <li>A thirty-minute call about what you need and who will use it.</li>
            <li>A written plan with the shape of the system and where it will run.</li>
            <li>Something working within weeks, on a preview address you can open.</li>
          </ul>
        </div>
      </section>

      <footer className={s.foot}>
        <a href={bookHref} className={s.cta}>Book a meeting</a>
      </footer>
    </div>
  )
}
