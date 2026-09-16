import { useState } from 'react'
import s from './App.module.css'
import Icon from './components/Icon'
import { ABOUT, CONTACT, FIELDS, HERO, NAV, PROCESS, SEE, SERVICES, SITE } from './content/site'
import Workflow from './components/Workflow'
import Capabilities from './components/Capabilities'
import BookingModal from './components/Booking'
import AgentTalk from './components/AgentTalk'

const mail = `mailto:${SITE.email}`

export default function App() {
  const [bookOpen, setBookOpen] = useState(false)
  const openBook = () => setBookOpen(true)
  return (
    <>
      <header className={s.nav}>
        <div className={s.navInner}>
          <a href="#top" className={s.brand}>{SITE.name}</a>
          <nav className={s.links} aria-label="Sections">
            {NAV.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}
          </nav>
          <button type="button" className={s.btnSmall} onClick={openBook}>Book a meeting</button>
        </div>
      </header>

      <main id="top">
        <section className={s.hero}>
          <div className={s.wrap + ' ' + s.heroGrid}>
            <div className={s.heroTitle}>
              <p className={s.eyebrow}>{HERO.eyebrow}</p>
              <h1 className={s.h1}>{HERO.title}</h1>
            </div>
            <div className={s.heroVisual}><AgentTalk /></div>
            <div className={s.heroCopy}>
              <p className={s.sub}>{HERO.sub}</p>
              <div className={s.ctas}>
                <button type="button" className={s.btn} onClick={openBook}>Book a meeting</button>
                <a href="#see" className={s.btnGhost}>See it work</a>
              </div>
              <p className={s.trust}>{HERO.trust}</p>
            </div>
          </div>
        </section>

        <section id="services" className={s.section}>
          <div className={s.wrap}>
            <div className={s.head}>
              <p className={s.eyebrow}>Services</p>
              <h2 className={s.h2}>Agents, and everything they need around them.</h2>
            </div>
            <ul className={s.services}>
              {SERVICES.map(x => (
                <li key={x.title} className={s.card}>
                  <span className={s.iconBox}><Icon name={x.icon} /></span>
                  <h3 className={s.h3}>{x.title}</h3>
                  <p className={s.p}>{x.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="fields" className={s.section + ' ' + s.tint}>
          <div className={s.wrap}>
            <div className={s.head}>
              <p className={s.eyebrow}>Your field</p>
              <h2 className={s.h2}>Built for your workflow, whatever the industry.</h2>
              <p className={s.p + ' ' + s.headText}>Every business has a few workflows that eat the week. Documents that arrive by email, forms filled in twice, data that lives in five places. That is where the agents go to work.</p>
            </div>
            <ul className={s.fields2}>
              {FIELDS.map(f => (
                <li key={f.title}>
                  <h3 className={s.h3}>{f.title}</h3>
                  <p className={s.p}>{f.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="see" className={s.section}>
          <div className={s.wrap}>
            <div className={s.head}>
              <p className={s.eyebrow}>See it work</p>
              <h2 className={s.h2}>{SEE.title}</h2>
              <p className={s.p + ' ' + s.headText}>{SEE.text}</p>
            </div>
            <Workflow />
          </div>
        </section>

        <section id="blocks" className={s.section + ' ' + s.tint}>
          <div className={s.wrap}>
            <Capabilities />
          </div>
        </section>

        <section id="process" className={s.section}>
          <div className={s.wrap}>
            <div className={s.head}>
              <p className={s.eyebrow}>How we work</p>
              <h2 className={s.h2}>Three steps. No surprises.</h2>
            </div>
            <ol className={s.process}>
              {PROCESS.map(st => (
                <li key={st.n}>
                  <span className={s.dot}>{st.n}</span>
                  <h3 className={s.h3}>{st.title}</h3>
                  <p className={s.p}>{st.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="about" className={s.section + ' ' + s.tint}>
          <div className={s.wrap + ' ' + s.aboutGrid}>
            <div>
              <p className={s.eyebrow}>About</p>
              <h2 className={s.h2}>{ABOUT.title}</h2>
              <p className={s.p}>{ABOUT.text}</p>
            </div>
            <ul className={s.facts}>
              {ABOUT.facts.map(f => <li key={f}><Icon name="check" size={18} />{f}</li>)}
            </ul>
          </div>
        </section>

        <section id="book" className={s.section}>
          <div className={s.wrap}>
            <div className={s.head}>
              <p className={s.eyebrow}>Book a meeting</p>
              <h2 className={s.h2}>{CONTACT.title}</h2>
              <p className={s.p + ' ' + s.headText}>{CONTACT.text}</p>
            </div>
            <div className={s.ctas}>
              <button type="button" className={s.btn} onClick={openBook}>Book a meeting</button>
              <a href={mail} className={s.btnGhost}>Send an email</a>
            </div>
            <p className={s.bookNote}>30 minutes on a video call. Wednesday and Thursday afternoons, Stockholm time.</p>
          </div>
        </section>
      </main>

      <BookingModal open={bookOpen} onClose={() => setBookOpen(false)} />

      <footer className={s.footer}>
        <div className={s.wrap + ' ' + s.footInner}>
          <span>{SITE.name} · {SITE.location}</span>
          <span className={s.footLinks}>
            <a href={mail}>{SITE.email}</a>
            <a href={SITE.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          </span>
        </div>
      </footer>
    </>
  )
}

/** Abstract "your product, live" illustration built from plain boxes. */
