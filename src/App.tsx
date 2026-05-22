import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styles from './App.module.css'
import AuroraBackground from './components/AuroraBackground'
import TopNav from './components/TopNav'
import AreaList from './components/AreaList'
import MainContent from './components/MainContent'
import MobileSwitcher from './components/MobileSwitcher'
import Footer from './components/Footer'
import { AREA_ORDER, type AreaId } from './content/areas'

function App() {
  const [current, setCurrent] = useState<AreaId | null>(null)

  // Shared mouse position — ref to avoid re-rendering on every move.
  // `lastMove` lets consumers (aurora, parallax) decay back to centre when the cursor rests.
  const mouseRef = useRef({ x: 0.5, y: 0.5, lastMove: 0 })

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth
      mouseRef.current.y = e.clientY / window.innerHeight
      mouseRef.current.lastMove = performance.now()
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const onSelect = useCallback((id: AreaId | null) => {
    setCurrent(prev => (prev === id ? prev : id))
  }, [])

  // Ordered list of pages for swipe + bottom switcher (About first, then areas).
  const pages = useMemo<(AreaId | null)[]>(() => [null, ...AREA_ORDER], [])

  const step = useCallback((dir: 1 | -1) => {
    setCurrent(prev => {
      const idx = pages.indexOf(prev)
      if (idx === -1) return prev
      const next = Math.max(0, Math.min(pages.length - 1, idx + dir))
      return pages[next]
    })
  }, [pages])

  // Swipe handling — horizontal-only to avoid hijacking vertical scroll.
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null)
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY, t: performance.now() }
  }, [])
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const s = touchStart.current
    touchStart.current = null
    if (!s) return
    const t = e.changedTouches[0]
    const dx = t.clientX - s.x
    const dy = t.clientY - s.y
    const dt = performance.now() - s.t
    if (dt > 600) return
    if (Math.abs(dx) < 55) return
    if (Math.abs(dy) > Math.abs(dx) * 0.7) return
    step(dx < 0 ? 1 : -1)
  }, [step])

  // Keyboard: 0 = about / home, 1-4 select an area, Esc/Backspace also home, ↑↓ / ←→ step through.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.key === 'Escape' || e.key === 'Backspace' || e.key === '0') {
        if (current !== null) {
          e.preventDefault()
          setCurrent(null)
        }
        return
      }
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const id = ('0' + e.key) as AreaId
        if (AREA_ORDER.includes(id)) setCurrent(id)
        return
      }
      if (current) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          const idx = AREA_ORDER.indexOf(current)
          setCurrent(AREA_ORDER[(idx + 1) % AREA_ORDER.length])
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          const idx = AREA_ORDER.indexOf(current)
          setCurrent(AREA_ORDER[(idx - 1 + AREA_ORDER.length) % AREA_ORDER.length])
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current])

  return (
    <>
      <AuroraBackground mouseRef={mouseRef} />

      <div className={styles.stage}>
        <TopNav current={current} />

        <main
          className={styles.main}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <AreaList current={current} onSelect={onSelect} />
          <MainContent current={current} mouseRef={mouseRef} />
        </main>

        <MobileSwitcher current={current} onSelect={onSelect} />

        <Footer />
      </div>
    </>
  )
}

export default App
