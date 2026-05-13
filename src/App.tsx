import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './App.module.css'
import AuroraBackground from './components/AuroraBackground'
import TopNav from './components/TopNav'
import AreaList from './components/AreaList'
import MainContent from './components/MainContent'
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
      if (['1', '2', '3', '4'].includes(e.key)) {
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

        <main className={styles.main}>
          <AreaList current={current} onSelect={onSelect} />
          <MainContent current={current} mouseRef={mouseRef} />
        </main>

        <Footer />
      </div>
    </>
  )
}

export default App
