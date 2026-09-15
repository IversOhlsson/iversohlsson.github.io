import s from './Section.module.css'
import styles from './Work.module.css'
import { BACKGROUND, WORK } from '../content/site'

export default function Work() {
  return (
    <section id="work" className={s.section}>
      <div className={s.head} data-reveal>
        <p className={s.label}><span className={s.slash}>/</span> 04 — Work</p>
        <div>
          <h2 className={s.h2}>Other things shipped <em>start to finish.</em></h2>
          <p className={s.lead}>
            Smaller than the marketplace, same shape: one person from the first commit to a hosted system someone else could use.
          </p>
        </div>
      </div>
      <div className={styles.grid}>
        {WORK.map((w, i) => (
          <article key={w.label} className={[s.card, styles.item].join(' ')} data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
            <p className={styles.meta}><span>{w.label}</span><span>{w.year}</span></p>
            <h3 className={styles.title}>{w.title}</h3>
            <p className={styles.body}>{w.body}</p>
            <div className={s.tags}>{w.tags.map(t => <span key={t}>{t}</span>)}</div>
            {w.link && (
              <a className={styles.link} href={w.link.href} target="_blank" rel="noreferrer">{w.link.label} ↗</a>
            )}
          </article>
        ))}
      </div>

      <p className={s.sub}><span className={s.slash}>/</span> {BACKGROUND.title}</p>
      <div className={styles.background} data-reveal>
        <div>
          {BACKGROUND.body.map(p => <p key={p} className={s.lead}>{p}</p>)}
        </div>
        <div className={s.tags}>{BACKGROUND.tags.map(t => <span key={t}>{t}</span>)}</div>
      </div>
    </section>
  )
}
