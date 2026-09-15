import s from './Section.module.css'
import styles from './Contact.module.css'
import { CONTACT, SITE } from '../content/site'

export default function Contact() {
  return (
    <section id="contact" className={[s.section, styles.section].join(' ')}>
      <div className={styles.inner} data-reveal>
        <p className={s.label}><span className={s.slash}>/</span> 05 — Contact</p>
        <h2 className={styles.h2} dangerouslySetInnerHTML={{ __html: CONTACT.title }} />
        <p className={s.lead}>{CONTACT.body}</p>
        <a className={styles.mail} href={`mailto:${SITE.email}`}>{SITE.email}</a>
        <p className={styles.links}>
          <a href={SITE.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href={SITE.github} target="_blank" rel="noreferrer">GitHub</a>
        </p>
      </div>
      <footer className={styles.foot}>
        <span>{SITE.mark} · {SITE.location.toUpperCase()}</span>
        <span>© 2026 / {SITE.name.toUpperCase()}</span>
      </footer>
    </section>
  )
}
