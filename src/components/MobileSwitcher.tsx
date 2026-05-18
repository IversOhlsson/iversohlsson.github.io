import styles from './MobileSwitcher.module.css'
import { AREA_ORDER, AREAS, type AreaId } from '../content/areas'

type Props = {
  current: AreaId | null
  onSelect: (id: AreaId | null) => void
}

type Item = { id: AreaId | null; num: string; label: string }

export default function MobileSwitcher({ current, onSelect }: Props) {
  const items: Item[] = [
    { id: null, num: '00', label: 'ABOUT' },
    ...AREA_ORDER.map<Item>(id => ({ id, num: id, label: AREAS[id].monoLabel })),
  ]
  const currentItem = items.find(i => i.id === current) ?? items[0]

  return (
    <nav className={styles.switcher} aria-label="Sections">
      <div className={styles.hint}>
        <span className={styles.swipe}>‹ swipe ›</span>
        <span className={styles.label}>// {currentItem.label.toLowerCase()}</span>
      </div>
      <ul className={styles.dots}>
        {items.map(item => {
          const active = item.id === current
          return (
            <li key={item.num}>
              <button
                type="button"
                className={[styles.dot, active ? styles.active : ''].filter(Boolean).join(' ')}
                onClick={() => onSelect(item.id)}
                aria-label={`Show ${item.label}`}
                aria-current={active ? 'page' : undefined}
              >
                {item.num}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
