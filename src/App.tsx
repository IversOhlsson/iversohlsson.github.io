import styles from './App.module.css'
import { ABOUT, CONTACT, EXAMPLE, HERO, OFFER, SITE, STEPS } from './content/site'
import Icon from './components/Icon'

export default function App() {
  const mail = `mailto:${SITE.email}`
  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <a href="#top" className={styles.brand}>{SITE.name}</a>
        <a href={mail} className={styles.navBtn}>Get in touch</a>
      </header>

      <main>
        <section id="top" className={styles.hero}>
          <h1 className={styles.h1}>{HERO.title}</h1>
          <p className={styles.sub}>{HERO.sub}</p>
          <div className={styles.ctas}>
            <a href={mail} className={styles.primary}>Let’s talk</a>
            <a href="#how" className={styles.secondary}>How it works</a>
          </div>
        </section>

        <section className={styles.section}>
          <ul className={styles.offer}>
            {OFFER.map(o => (
              <li key={o.title}>
                <span className={styles.icon}><Icon name={o.icon} /></span>
                <h2 className={styles.h3}>{o.title}</h2>
                <p className={styles.p}>{o.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <div className={styles.card}>
            <p className={styles.label}>{EXAMPLE.label}</p>
            <h2 className={styles.h2}>{EXAMPLE.title}</h2>
            <ol className={styles.flow}>
              {EXAMPLE.steps.map(st => (
                <li key={st.n}>
                  <span className={styles.num}>{st.n}</span>
                  <h3 className={styles.h3}>{st.title}</h3>
                  <p className={styles.p}>{st.text}</p>
                </li>
              ))}
            </ol>
            <p className={styles.caption}>{EXAMPLE.caption}</p>
          </div>
        </section>

        <section id="how" className={styles.section}>
          <h2 className={styles.h2}>How it works</h2>
          <ol className={styles.steps}>
            {STEPS.map(st => (
              <li key={st.n}>
                <span className={styles.stepNum}>{st.n}</span>
                <div>
                  <h3 className={styles.h3}>{st.title}</h3>
                  <p className={styles.p}>{st.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.section}>
          <div className={styles.about}>
            <h2 className={styles.h2}>{ABOUT.title}</h2>
            <p className={styles.p}>{ABOUT.text}</p>
            <p className={styles.meta}>{SITE.location} · working with clients anywhere</p>
          </div>
        </section>

        <section id="contact" className={[styles.section, styles.contact].join(' ')}>
          <h2 className={styles.h2}>{CONTACT.title}</h2>
          <p className={styles.p}>{CONTACT.text}</p>
          <a href={mail} className={styles.primary}>{SITE.email}</a>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>© 2026 {SITE.name}</span>
        <a href={SITE.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
      </footer>
    </div>
  )
}
