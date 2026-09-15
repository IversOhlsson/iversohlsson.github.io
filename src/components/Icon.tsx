type Props = { name: string; size?: number }

/** Simple line icons drawn inline. */
export default function Icon({ name, size = 24 }: Props) {
  const p = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true,
  }
  switch (name) {
    case 'app':
      return <svg {...p}><rect x="3" y="4" width="18" height="16" rx="2.5" /><path d="M3 9h18M9 9v11" /></svg>
    case 'ai':
      return <svg {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" /></svg>
    case 'host':
      return <svg {...p}><rect x="3" y="4" width="18" height="6" rx="1.5" /><rect x="3" y="14" width="18" height="6" rx="1.5" /><path d="M7 7h.01M7 17h.01" /></svg>
    case 'care':
      return <svg {...p}><path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z" /></svg>
    case 'doc':
      return <svg {...p}><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5M10 13h6M10 17h6" /></svg>
    case 'read':
      return <svg {...p}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.3-4.3M8.5 11h5" /></svg>
    default:
      return <svg {...p}><path d="M4 12l5 5L20 6" /></svg>
  }
}
