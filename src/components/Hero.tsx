import styles from './Hero.module.css'
import { HERO, SITE } from '../content/site'

export default function Hero() {
  return (
    <section id="top" className={styles.hero}>
      <p className={styles.crumb}>~ <span className={styles.slash}>/</span> {HERO.crumb}</p>
      <h1 className={styles.h1} dangerouslySetInnerHTML={{ __html: HERO.title }} />
      <p className={styles.lead}>{HERO.lead}</p>
      <div className={styles.ctas}>
        <a className={styles.primary} href={HERO.primary.href}>{HERO.primary.label}</a>
        <a className={styles.secondary} href={HERO.secondary.href}>{HERO.secondary.label} <span aria-hidden="true">↓</span></a>
      </div>
      <ul className={styles.facts}>
        <li>{SITE.location}</li>
        {HERO.facts.map(f => <li key={f}>{f}</li>)}
      </ul>
    </section>
  )
}
