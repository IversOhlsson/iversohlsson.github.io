import s from './Section.module.css'
import styles from './Offer.module.css'
import { OFFER } from '../content/site'

export default function Offer() {
  return (
    <section id="offer" className={s.section}>
      <div className={s.head} data-reveal>
        <p className={s.label}><span className={s.slash}>/</span> 01 — What I do</p>
        <div>
          <h2 className={s.h2}>Build it, ship it, <em>and keep it running.</em></h2>
          <p className={s.lead}>
            Most greenfield work stalls between the prototype and the thing people can use every day.
            I take the whole span, so there is one person to call about all of it.
          </p>
        </div>
      </div>
      <div className={styles.grid}>
        {OFFER.map((p, i) => (
          <article key={p.n} className={[s.card, styles.pillar].join(' ')} data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
            <p className={styles.n}>{p.n} <span>{p.label}</span></p>
            <h3 className={styles.title}>{p.title}</h3>
            <ul className={styles.points}>
              {p.points.map(pt => <li key={pt}>{pt}</li>)}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
