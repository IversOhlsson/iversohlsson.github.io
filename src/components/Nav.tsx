import { useEffect, useState } from 'react'
import styles from './Nav.module.css'
import { NAV, SITE } from '../content/site'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={[styles.nav, scrolled ? styles.scrolled : ''].filter(Boolean).join(' ')}>
      <a href="#top" className={styles.brand}>
        <span className={styles.mark}>{SITE.mark}</span>
        <span className={styles.dot}>·</span>
        <span>GREENFIELD</span>
      </a>
      <nav className={styles.links} aria-label="Sections">
        {NAV.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}
      </nav>
      <span className={styles.pill}>
        <span className={styles.live} />
        <span className={styles.long}>{SITE.status}</span>
        <span className={styles.short}>{SITE.statusShort}</span>
      </span>
    </header>
  )
}
