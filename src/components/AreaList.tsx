import styles from './AreaList.module.css'
import { AREA_ORDER, AREAS, type AreaId } from '../content/areas'

type Props = {
  current: AreaId | null
  /** `null` selection means "go home / About". */
  onSelect: (id: AreaId | null) => void
}

export default function AreaList({ current, onSelect }: Props) {
  return (
    <aside className={styles.list} aria-label="Practice areas">
      <p className={styles.kicker}>PRACTICE.LS</p>
      <ul className={styles.options} role="tablist">
        <li>
          <button
            className={[styles.opt, current === null ? styles.selected : ''].filter(Boolean).join(' ')}
            type="button"
            role="tab"
            aria-selected={current === null}
            data-area="00"
            onClick={() => onSelect(null)}
          >
            <span className={styles.caret}>▸</span>
            <span className={styles.num}>[00]</span>
            <span className={styles.name}>ABOUT</span>
          </button>
        </li>
        {AREA_ORDER.map(id => {
          const area = AREAS[id]
          const selected = current === id
          return (
            <li key={id}>
              <button
                className={[styles.opt, selected ? styles.selected : ''].filter(Boolean).join(' ')}
                type="button"
                role="tab"
                aria-selected={selected}
                data-area={id}
                onClick={() => onSelect(id)}
              >
                <span className={styles.caret}>▸</span>
                <span className={styles.num}>[{area.badge}]</span>
                <span className={styles.name}>{area.monoLabel}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
