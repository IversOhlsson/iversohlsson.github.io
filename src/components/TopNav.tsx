import styles from './TopNav.module.css'
import { AREAS, type AreaId } from '../content/areas'

type Props = {
  current: AreaId | null
}

export default function TopNav({ current }: Props) {
  const crumb = current ? AREAS[current].crumb : 'about'
  return (
    <header className={styles.nav}>
      <div className={styles.brand}>
        <span className={styles.mark}>PIO/26</span>
        <span className={styles.dot}>·</span>
        <span>UPPSALA.SE</span>
      </div>
      <span className={[styles.center, current ? styles.selected : ''].filter(Boolean).join(' ')}>
        // {crumb}
      </span>
      <div className={styles.status}>
        <span className={styles.pill}>
          <span className={styles.live} />
          STATUS: AVAILABLE Q2 2026
        </span>
      </div>
    </header>
  )
}
