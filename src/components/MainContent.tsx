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
        Distributed, <em>real-time</em>, and IoT systems for complex technical environments.
      </h1>
      <p className={styles.brief} style={{ marginBottom: 16 }}>
        I’m <strong>Philip Ivers Ohlsson</strong>, a full-stack engineer and systems architect.
        I work with teams building production-grade software across distributed systems, real-time
        applications, IoT platforms, backend services, data pipelines, frontend interfaces, and
        practical ML workflows.
      </p>
      <p className={styles.brief} style={{ marginBottom: 16 }}>
        My work often sits close to the real world: edge devices, signal processing, real-time
        analytics, mission-critical environments, and systems that need to keep working outside
        the happy path.
      </p>
      <p className={styles.brief}>
        I bring experience from life sciences, R&amp;D-heavy teams, edge computing, and technically
        demanding products where reliability, speed, and clarity matter. A lot of my work sits
        between engineers and the people who need the system to work — turning requirements into
        something real, and trade-offs into plain terms.
      </p>

      <p className={styles.sectionLabel}>/ EXPERTISE</p>
      <ul className={styles.caps}>
        <li>Distributed architecture and event-driven systems.</li>
        <li>Real-time platforms, IoT, edge components, gRPC, WebRTC, and Pub/Sub.</li>
        <li>Backend services, data pipelines, frontend interfaces, and production tooling.</li>
        <li>Practical ML workflows in production systems.</li>
        <li>Software built for operational, technical, and field constraints.</li>
        <li>Tools and infrastructure that help R&amp;D teams move faster.</li>
        <li>Collaboration across technical and non-technical stakeholders — engineering, R&amp;D, ops, and business.</li>
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
