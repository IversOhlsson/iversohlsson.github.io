import { useEffect, useRef } from 'react'
import styles from './App.module.css'
import AuroraBackground from './components/AuroraBackground'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Offer from './components/Offer'
import Platform from './components/Platform'
import Approach from './components/Approach'
import Work from './components/Work'
import Contact from './components/Contact'
import { useReveal } from './hooks/useReveal'

export default function App() {
  // Shared pointer position for the aurora; a ref so nothing re-renders on move.
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

  useReveal()

  return (
    <>
      <AuroraBackground mouseRef={mouseRef} />
      <div className={styles.page}>
        <Nav />
        <main>
          <Hero />
          <Offer />
          <Platform />
          <Approach />
          <Work />
          <Contact />
        </main>
      </div>
    </>
  )
}
