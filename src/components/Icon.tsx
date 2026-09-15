type Props = { name: string }

/** Three simple line icons, drawn inline so nothing is downloaded. */
export default function Icon({ name }: Props) {
  const common = { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
  switch (name) {
    case 'build':
      return <svg {...common}><path d="M4 20h16" /><path d="M6 20V9l6-5 6 5v11" /><path d="M10 20v-5h4v5" /></svg>
    case 'launch':
      return <svg {...common}><path d="M12 3c3.5 2.5 5 6 5 10l-2 2H9l-2-2c0-4 1.5-7.5 5-10z" /><path d="M9 15l-3 3M15 15l3 3" /><circle cx="12" cy="10" r="1.5" /></svg>
    default:
      return <svg {...common}><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" /></svg>
  }
}
