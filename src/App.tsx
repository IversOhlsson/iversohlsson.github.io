import s from './App.module.css'
import Icon from './components/Icon'
import { ABOUT, CONTACT, EXAMPLE, HERO, NAV, PROCESS, SERVICES, SITE } from './content/site'

const mail = `mailto:${SITE.email}`

export default function App() {
  return (
    <>
      <header className={s.nav}>
        <div className={s.navInner}>
          <a href="#top" className={s.brand}>{SITE.name}</a>
          <nav className={s.links} aria-label="Sections">
            {NAV.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}
          </nav>
          <a href={mail} className={s.btnSmall}>Get in touch</a>
        </div>
      </header>

      <main id="top">
        <section className={s.hero}>
          <div className={s.wrap + ' ' + s.heroGrid}>
            <div>
              <p className={s.eyebrow}>{HERO.eyebrow}</p>
              <h1 className={s.h1}>{HERO.title}</h1>
              <p className={s.sub}>{HERO.sub}</p>
              <div className={s.ctas}>
                <a href={mail} className={s.btn}>Let’s talk</a>
                <a href="#process" className={s.btnGhost}>How it works</a>
              </div>
              <p className={s.trust}>{HERO.trust}</p>
            </div>
            <Visual />
          </div>
        </section>

        <section id="services" className={s.section}>
          <div className={s.wrap}>
            <div className={s.head}>
              <p className={s.eyebrow}>Services</p>
              <h2 className={s.h2}>Everything a product needs, from one person.</h2>
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

        <section id="example" className={s.section + ' ' + s.tint}>
          <div className={s.wrap}>
            <div className={s.head}>
              <p className={s.eyebrow}>{EXAMPLE.label}</p>
              <h2 className={s.h2}>{EXAMPLE.title}</h2>
            </div>
            <ol className={s.flow}>
              {EXAMPLE.steps.map((st, i) => (
                <li key={st.title} className={s.card}>
                  <span className={s.flowNum}>{i + 1}</span>
                  <span className={s.iconBox}><Icon name={st.icon} /></span>
                  <h3 className={s.h3}>{st.title}</h3>
                  <p className={s.p}>{st.text}</p>
                </li>
              ))}
            </ol>
            <p className={s.caption}>{EXAMPLE.caption}</p>
          </div>
        </section>

        <section id="process" className={s.section}>
          <div className={s.wrap}>
            <div className={s.head}>
              <p className={s.eyebrow}>Process</p>
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

        <section className={s.section}>
          <div className={s.wrap}>
            <div className={s.band}>
              <div>
                <h2 className={s.bandTitle}>{CONTACT.title}</h2>
                <p className={s.bandText}>{CONTACT.text}</p>
              </div>
              <a href={mail} className={s.btnLight}>{SITE.email}</a>
            </div>
          </div>
        </section>
      </main>

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
function Visual() {
  return (
    <div className={s.visual} aria-hidden="true">
      <div className={s.glow} />
      <div className={s.window}>
        <div className={s.winBar}>
          <span /><span /><span />
          <em className={s.live}>Live</em>
        </div>
        <div className={s.winBody}>
          <div className={s.side}>
            <i className={s.barOn} /><i /><i /><i />
          </div>
          <div className={s.mainArea}>
            <div className={s.title} />
            <div className={s.tiles}><span /><span /><span /></div>
            <div className={s.rows}>
              <div><b /><i /></div>
              <div><b /><i /></div>
              <div><b /><i /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
