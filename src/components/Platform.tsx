import s from './Section.module.css'
import styles from './Platform.module.css'
import SystemMap from './SystemMap'
import Pipeline from './Pipeline'
import { OPS, PLATFORM, PLATFORM_TAGS, PRINCIPLES } from '../content/site'

export default function Platform() {
  return (
    <section id="platform" className={s.section}>
      <div className={s.head} data-reveal>
        <p className={s.label}><span className={s.slash}>/</span> 02 — {PLATFORM.kicker}</p>
        <div>
          <h2 className={s.h2} dangerouslySetInnerHTML={{ __html: PLATFORM.title }} />
          {PLATFORM.lead.map(p => <p key={p} className={s.lead}>{p}</p>)}
        </div>
      </div>

      <ul className={styles.stats} data-reveal>
        {PLATFORM.stats.map(st => (
          <li key={st.label}>
            <span className={styles.value}>{st.value}</span>
            <span className={styles.statLabel}>{st.label}</span>
          </li>
        ))}
      </ul>

      <p className={s.sub}><span className={s.slash}>/</span> System map</p>
      <div data-reveal><SystemMap /></div>

      <p className={s.sub}><span className={s.slash}>/</span> From PDF to structured need — the agentic path</p>
      <p className={s.lead}>
        The part that earns its keep. A document goes through a prepare stage that is plain code, then a
        graph where the model interprets and code decides. It pauses on the customer when something is
        missing and resumes from where it stopped.
      </p>
      <Pipeline />

      <p className={s.sub}><span className={s.slash}>/</span> Rules the system is built on</p>
      <div className={styles.principles}>
        {PRINCIPLES.map((p, i) => (
          <div key={p.title} className={[s.card, styles.principle].join(' ')} data-reveal style={{ transitionDelay: `${i * 70}ms` }}>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </div>
        ))}
      </div>

      <p className={s.sub}><span className={s.slash}>/</span> How it runs</p>
      <dl className={styles.ops} data-reveal>
        {OPS.map(o => (
          <div key={o.k} className={styles.op}>
            <dt>{o.k}</dt>
            <dd>{o.v}</dd>
          </div>
        ))}
      </dl>

      <p className={s.sub}><span className={s.slash}>/</span> Stack</p>
      <div className={s.tags} data-reveal>
        {PLATFORM_TAGS.map(t => <span key={t}>{t}</span>)}
      </div>
      <p className={styles.footnote}>
        Private repository. Architecture decision records, walkthroughs and trace reports available on request.
      </p>
    </section>
  )
}
