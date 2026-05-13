import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.foot}>
      <span>
        <a href="mailto:philip.iversohlsson@gmail.com">philip.iversohlsson@gmail.com</a>
        {' · '}
        <a href="https://www.linkedin.com/in/philip-ivers-ohlsson-9874a313b/" target="_blank" rel="noreferrer">LinkedIn</a>
        {' · '}
        <a href="https://github.com/IversOhlsson" target="_blank" rel="noreferrer">GitHub</a>
      </span>
      <span className={styles.kbd}>
        HOME <kbd>0</kbd>
        SEL <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd><kbd>4</kbd>
        STEP <kbd>↑</kbd><kbd>↓</kbd>
      </span>
      <span>© 2026 / PHILIP IVERS OHLSSON</span>
    </footer>
  )
}
