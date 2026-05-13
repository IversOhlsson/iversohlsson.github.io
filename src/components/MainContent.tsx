import { useEffect, useRef } from 'react'
import styles from './MainContent.module.css'
import { AREA_ORDER, AREAS, type AreaId } from '../content/areas'

type Props = {
  current: AreaId | null
  /** Shared mouse ref for subtle parallax on the title row. */
  mouseRef: React.MutableRefObject<{ x: number; y: number; lastMove: number }>
}

export default function MainContent({ current, mouseRef }: Props) {
  const stackRef = useRef<HTMLDivElement>(null)

  // Subtle parallax — gently nudge the whole content stack toward the cursor.
  useEffect(() => {
    let raf = 0
    const smoothed = { x: 0.5, y: 0.5 }
    const tick = () => {
      // Idle decay: when the cursor rests, lerp back to neutral.
      const idleMs = performance.now() - mouseRef.current.lastMove
      const idle   = Math.min(1, Math.max(0, (idleMs - 300) / 1500))
      const tx = mouseRef.current.x * (1 - idle) + 0.5 * idle
      const ty = mouseRef.current.y * (1 - idle) + 0.5 * idle
      smoothed.x += (tx - smoothed.x) * 0.05
      smoothed.y += (ty - smoothed.y) * 0.05
      const el = stackRef.current
      if (el) {
        const px = (smoothed.x - 0.5) * -6
        const py = (smoothed.y - 0.5) * -4
        el.style.setProperty('--tx', `${px}px`)
        el.style.setProperty('--ty', `${py}px`)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [mouseRef])

  return (
    <section className={styles.right}>
      <div
        className={styles.stack}
        ref={stackRef}
        style={{ transform: 'translate3d(var(--tx, 0), var(--ty, 0), 0)' }}
      >
        <DefaultPanel hidden={current !== null} />
        {AREA_ORDER.map(id => (
          <AreaPanelView key={id} id={id} hidden={current !== id} />
        ))}
      </div>
    </section>
  )
}

function DefaultPanel({ hidden }: { hidden: boolean }) {
  return (
    <div className={[styles.panel, hidden ? styles.hidden : ''].filter(Boolean).join(' ')}>
      <p className={styles.crumb}>~ <span className={styles.slash}>/</span> about</p>
      <h1 className={styles.h1}>
        Distributed, <em>real-time</em>, IoT systems{' '}
        <span className={styles.ampr}>&</span> the people who run them.
      </h1>
      <p className={styles.brief}>
        <strong>Philip Ivers Ohlsson</strong> — full-stack engineer and systems architect focused on
        distributed, real-time, IoT-enabled, and event-driven systems. Backend services, data pipelines,
        frontend interfaces, and ML-enabled production workflows — with domain experience in life sciences,
        mission-critical systems, edge computing, signal processing, and real-time analytics.
      </p>

      <p className={styles.sectionLabel}>/ PASSION</p>
      <ul className={styles.caps}>
        <li>Distributed architecture &amp; event-driven system design.</li>
        <li>Real-time and IoT — gRPC, WebRTC, Pub/Sub, edge components.</li>
        <li>ML embedded in the data path, not bolted on as a service.</li>
        <li>Production-grade systems built for operational and field constraints.</li>
        <li>Fast-paced iteration — building tools and infrastructure that make R&amp;D quicker, not slower.</li>
      </ul>

      <p className={styles.sectionLabel}>/ CONTACT</p>
      <div className={styles.meta}>
        <a href="mailto:philip.iversohlsson@gmail.com">philip.iversohlsson@gmail.com →</a>
        <a href="https://www.linkedin.com/in/philip-ivers-ohlsson-9874a313b/" target="_blank" rel="noreferrer">LinkedIn ↗</a>
        <a href="https://github.com/IversOhlsson" target="_blank" rel="noreferrer">GitHub ↗</a>
      </div>
    </div>
  )
}

function AreaPanelView({ id, hidden }: { id: AreaId; hidden: boolean }) {
  const area = AREAS[id]
  return (
    <div className={[styles.panel, hidden ? styles.hidden : ''].filter(Boolean).join(' ')}>
      <p className={styles.crumb}>~ <span className={styles.slash}>/</span> {area.crumb}</p>
      <h1 className={styles.h1} dangerouslySetInnerHTML={{ __html: area.title }} />
      <p className={styles.brief} dangerouslySetInnerHTML={{ __html: area.brief }} />

      <p className={styles.sectionLabel}>/ FOCUS</p>
      <ul className={styles.caps}>
        {area.capabilities.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>

      <p className={styles.sectionLabel}>/ STACK</p>
      <div className={styles.tags}>
        {area.tags.map(t => <span key={t}>{t}</span>)}
      </div>
    </div>
  )
}
