import { useEffect } from 'react'

/**
 * Adds `data-shown` to every `[data-reveal]` element once it scrolls into view.
 * CSS handles the fade; with reduced motion the elements are simply visible.
 */
export function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (els.length === 0) return
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(el => el.setAttribute('data-shown', ''))
      return
    }
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          (e.target as HTMLElement).setAttribute('data-shown', '')
          io.unobserve(e.target)
        }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}
