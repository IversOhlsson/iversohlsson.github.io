import s from './Capabilities.module.css'

/** Everything that can be built in, each with a small looping illustration. */
const ITEMS = [
  { id: 'human', title: 'A person in the loop', text: 'The system pauses on a real decision and waits for someone to approve, correct or answer.' },
  { id: 'pipeline', title: 'Pipelines you design', text: 'Readers, checks, lookups and reports connected in the order your work needs. Change it later.' },
  { id: 'systems', title: 'Connected to your systems', text: 'ERP, CRM, email, spreadsheets, your database. Data goes where it already lives.' },
  { id: 'api', title: 'Outside sources via API', text: 'Registries, credit ratings, sanctions lists, carriers, banks. Called automatically, answers kept.' },
  { id: 'checks', title: 'Checks in plain language', text: 'Write a rule in your own words. It becomes code and runs on every file after that.' },
  { id: 'verify', title: 'Verify against the source', text: 'Every extracted value shows the exact passage it came from. Confirm or correct in a click.' },
  { id: 'auto', title: 'Runs on its own', text: 'Starts when something arrives or on a schedule. Only asks a person when a check flags something.' },
  { id: 'notify', title: 'Notifications anywhere', text: 'Phone, email, chat or your own app. One tap answers, and the system carries on.' },
  { id: 'dist', title: 'Built to keep working', text: 'Independent parts talking through a shared log. One stops, the rest carry on, it catches up.' },
  { id: 'edge', title: 'Devices at the edge', text: 'Machines, sensors and vehicles keep recording offline and sync on their own when back.' },
  { id: 'host', title: 'Cloud, on-premise, or both', text: 'The same system packaged to run anywhere. Sensitive data can stay in your building.' },
  { id: 'log', title: 'Everything on the record', text: 'What arrived, what the AI read, what code decided, who approved. Readable later, by anyone.' },
]

export default function Capabilities() {
  return (
    <section className={s.wrap}>
      <div className={s.head}>
        <p className={s.eyebrow}>Agent building blocks</p>
        <h2 className={s.h2}>The building blocks behind every agent flow.</h2>
        <p className={s.sub}>Pick the ones your work needs. Each has been built before and can be combined with the others.</p>
      </div>
      <ul className={s.grid}>
        {ITEMS.map(it => (
          <li key={it.id} className={s.card}>
            <div className={s.art}><Art id={it.id} /></div>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

function Art({ id }: { id: string }) {
  switch (id) {
    case 'human':
      return (
        <svg viewBox="0 0 120 72" className={s.svg}>
          <path {...P} d="M8 36h34M78 36h34" className={s.faint} />
          <circle cx="60" cy="36" r="11" {...P} className={s.accent} />
          <circle cx="60" cy="32" r="3.5" {...P} className={s.accent} />
          <path {...P} d="M53 43c1.5-4 12.5-4 14 0" className={s.accent} />
          <circle r="4" className={[s.dot, s.animHuman].join(' ')} />
          <path {...P} d="M84 22l3 3 6-6" className={[s.ok, s.animHumanTick].join(' ')} />
        </svg>
      )
    case 'pipeline':
      return (
        <svg viewBox="0 0 120 72" className={s.svg}>
          {[8, 36, 64].map((x, i) => <rect key={x} x={x} y="26" width="20" height="20" rx="4" {...P} style={{ animationDelay: `${i * 0.25}s` }} className={s.animPop} />)}
          <path {...P} d="M28 36h8M56 36h8" className={s.accent} />
          <path {...P} d="M84 36h8" className={[s.accent, s.animPipeNew].join(' ')} />
          <rect x="92" y="26" width="20" height="20" rx="4" {...P} className={[s.accent, s.animPipeNew].join(' ')} />
          <path {...P} d="M98 36h8M102 32v8" className={[s.accent, s.animPipeNew].join(' ')} />
        </svg>
      )
    case 'systems':
      return (
        <svg viewBox="0 0 120 72" className={s.svg}>
          <circle cx="60" cy="36" r="9" {...P} className={s.accent} />
          {[[14, 14], [106, 14], [14, 58], [106, 58]].map(([x, y], i) => (
            <g key={i}>
              <path {...P} d={`M${x} ${y}L60 36`} className={s.faint} />
              <rect x={x - 9} y={y - 6} width="18" height="12" rx="3" {...P} />
              <circle r="2.6" className={[s.dot, s.animTravel].join(' ')} style={{ offsetPath: `path('M${x} ${y}L60 36')`, animationDelay: `${i * 0.5}s` } as React.CSSProperties} />
            </g>
          ))}
        </svg>
      )
    case 'api':
      return (
        <svg viewBox="0 0 120 72" className={s.svg}>
          <rect x="8" y="24" width="30" height="24" rx="4" {...P} />
          <rect x="82" y="24" width="30" height="24" rx="4" {...P} className={s.accent} />
          <path {...P} d="M40 31h36" className={s.faint} /><path {...P} d="M76 41H40" className={s.faint} />
          <circle r="3" className={[s.dot, s.animReq].join(' ')} />
          <circle r="3" className={[s.dot, s.ok, s.animRes].join(' ')} />
          <text x="60" y="60" textAnchor="middle" className={[s.label, s.animFadeLoop].join(' ')}>0.4 s</text>
        </svg>
      )
    case 'checks':
      return (
        <svg viewBox="0 0 120 72" className={s.svg}>
          <rect x="10" y="20" width="100" height="32" rx="6" {...P} className={s.faint} />
          <rect x="18" y="30" height="3" rx="1.5" className={[s.bar, s.animType].join(' ')} />
          <rect x="18" y="40" height="3" rx="1.5" className={[s.bar, s.animType2].join(' ')} />
          <g className={s.animRule}>
            <rect x="72" y="26" width="30" height="20" rx="10" className={s.fillAccent} />
            <text x="87" y="40" textAnchor="middle" className={s.labelWhite}>RULE</text>
          </g>
        </svg>
      )
    case 'verify':
      return (
        <svg viewBox="0 0 120 72" className={s.svg}>
          <rect x="14" y="10" width="52" height="52" rx="4" {...P} />
          {[20, 28, 36, 44, 52].map(y => <rect key={y} x="22" y={y} width={y === 36 ? 36 : 28} height="3" rx="1.5" className={s.barFaint} />)}
          <rect x="20" y="33" width="40" height="9" rx="2" className={[s.hl, s.animHl].join(' ')} />
          <rect x="76" y="26" width="32" height="20" rx="4" {...P} className={s.accent} />
          <path {...P} d="M86 36l3 3 6-6" className={[s.ok, s.animTick].join(' ')} />
        </svg>
      )
    case 'auto':
      return (
        <svg viewBox="0 0 120 72" className={s.svg}>
          <circle cx="40" cy="36" r="16" {...P} />
          <path {...P} d="M40 36V26" className={[s.accent, s.animHand].join(' ')} style={{ transformOrigin: '40px 36px' }} />
          <path {...P} d="M62 36h14" className={s.faint} />
          <rect x="80" y="26" width="30" height="20" rx="4" {...P} className={[s.accent, s.animPulse].join(' ')} />
        </svg>
      )
    case 'notify':
      return (
        <svg viewBox="0 0 120 72" className={s.svg}>
          <rect x="44" y="8" width="32" height="56" rx="7" {...P} />
          <rect x="50" y="20" width="20" height="12" rx="3" className={[s.fillAccent, s.animNotif].join(' ')} />
          <circle cx="76" cy="12" r="5" className={[s.fillWarn, s.animBadge].join(' ')} />
          <path {...P} d="M52 44h16M52 50h10" className={s.faint} />
        </svg>
      )
    case 'dist':
      return (
        <svg viewBox="0 0 120 72" className={s.svg}>
          <rect x="12" y="46" width="96" height="10" rx="3" {...P} className={s.faint} />
          {[22, 60, 98].map((x, i) => (
            <g key={x}>
              <path {...P} d={`M${x} 34v12`} className={s.faint} />
              <rect x={x - 12} y="14" width="24" height="20" rx="4" {...P} className={i === 2 ? s.animDown : ''} />
            </g>
          ))}
          <circle r="3" className={[s.dot, s.animBus].join(' ')} />
        </svg>
      )
    case 'edge':
      return (
        <svg viewBox="0 0 120 72" className={s.svg}>
          <rect x="12" y="20" width="40" height="32" rx="5" {...P} />
          {[20, 27, 34, 41].map((x, i) => <rect key={x} x={x} y="40" width="4" height="8" rx="1" className={[s.fillAccent, s.animBuf].join(' ')} style={{ animationDelay: `${i * 0.3}s` }} />)}
          <path {...P} d="M58 36h44" className={[s.faint, s.animDash].join(' ')} />
          <path {...P} d="M96 30l6 6-6 6" className={s.accent} />
        </svg>
      )
    case 'host':
      return (
        <svg viewBox="0 0 120 72" className={s.svg}>
          <path {...P} d="M28 44a10 10 0 0 1 2-19.8A13 13 0 0 1 55 22a9 9 0 0 1 2 22z" className={[s.animAlt, s.a1].join(' ')} />
          <rect x="70" y="20" width="36" height="10" rx="2" {...P} className={[s.animAlt, s.a2].join(' ')} />
          <rect x="70" y="36" width="36" height="10" rx="2" {...P} className={[s.animAlt, s.a2].join(' ')} />
          <path {...P} d="M58 58h6M60 58h0" className={s.faint} />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 120 72" className={s.svg}>
          {[18, 30, 42, 54].map((y, i) => (
            <g key={y} className={s.animLine} style={{ animationDelay: `${i * 0.5}s` }}>
              <circle cx="20" cy={y} r="2.5" className={s.fillAccent} />
              <rect x="30" y={y - 1.5} width={50 + (i * 13) % 30} height="3" rx="1.5" className={s.barFaint} />
            </g>
          ))}
        </svg>
      )
  }
}
