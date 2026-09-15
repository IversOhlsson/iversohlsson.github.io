import s from './Section.module.css'
import styles from './Approach.module.css'
import { APPROACH } from '../content/site'

export default function Approach() {
  return (
    <section id="approach" className={s.section}>
      <div className={s.head} data-reveal>
        <p className={s.label}><span className={s.slash}>/</span> 03 — Approach</p>
        <div>
          <h2 className={s.h2}>Four steps, <em>one accountable engineer.</em></h2>
          <p className={s.lead}>
            Fixed-scope where the scope is clear, retained where it is not. Either way you see the system
            running from the first weeks, and the documentation is written as the code is.
          </p>
        </div>
      </div>
      <ol className={styles.steps}>
        {APPROACH.map((st, i) => (
          <li key={st.n} className={styles.step} data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
            <span className={styles.n}>{st.n}</span>
            <h3 className={styles.title}>{st.title}</h3>
            <p className={styles.body}>{st.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
