import styles from './SystemMap.module.css'

type BoxProps = { x: number; y: number; w: number; title: string; sub?: string; tone?: 'plain' | 'agent' | 'store' }

const H = 48

function Box({ x, y, w, title, sub, tone = 'plain' }: BoxProps) {
  return (
    <g className={[styles.box, styles[tone]].join(' ')}>
      <rect x={x} y={y} width={w} height={H} rx={2} />
      <text x={x + 12} y={y + (sub ? 20 : 29)} className={styles.title}>{title}</text>
      {sub && <text x={x + 12} y={y + 36} className={styles.sub}>{sub}</text>}
    </g>
  )
}

function Edge({ d, label, lx, ly, dashed }: { d: string; label?: string; lx?: number; ly?: number; dashed?: boolean }) {
  return (
    <g className={styles.edge}>
      <path d={d} markerEnd="url(#arrow)" className={dashed ? styles.dashed : undefined} />
      {label && lx !== undefined && ly !== undefined && (
        <text x={lx} y={ly} className={styles.edgeLabel}>{label}</text>
      )}
    </g>
  )
}

/** The Aether Space runtime, one glance: edge, services, agentic pair, data. */
export default function SystemMap() {
  return (
    <figure className={styles.wrap}>
      <p className={styles.hint} aria-hidden="true">SCROLL →</p>
      <div className={styles.scroll}>
        <svg viewBox="0 0 1000 322" className={styles.svg} role="img" aria-labelledby="sysmap-title">
          <title id="sysmap-title">System map: browser to Envoy, Envoy to core and auth, core to agents to llm gateway, with Postgres, MinIO, Keycloak and model providers below.</title>
          <defs>
            <marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L8,4 L0,8 z" className={styles.arrow} />
            </marker>
          </defs>

          {/* Row 1: edge */}
          <Box x={0} y={40} w={150} title="Browser" sub="React SPA" />
          <Box x={210} y={40} w={120} title="Envoy" sub="single edge" />

          {/* Row 2: services */}
          <Box x={200} y={150} w={140} title="auth" sub="Go · users, orgs, roles" />
          <Box x={380} y={150} w={180} title="core" sub="Go · domain, state machines" />
          <Box x={600} y={150} w={180} title="agents" sub="Python · LangGraph graphs" tone="agent" />
          <Box x={820} y={150} w={170} title="llm gateway" sub="Python · one Chat RPC" tone="agent" />

          {/* Row 3: data + external */}
          <Box x={210} y={260} w={120} title="Keycloak" sub="OIDC, self-hosted" tone="store" />
          <Box x={350} y={260} w={80} title="MinIO" sub="documents" tone="store" />
          <Box x={450} y={260} w={190} title="Postgres" sub="one schema per context" tone="store" />
          <Box x={700} y={260} w={290} title="Gemini · Ollama · replay" sub="provider chosen by env" tone="store" />

          {/* Edges */}
          <Edge d="M150,64 L208,64" label="Connect-RPC" lx={152} ly={30} />
          <Edge d="M270,88 L270,148" />
          <Edge d="M330,64 L460,64 L460,148" label="typed contract, one proto" lx={340} ly={56} />
          <Edge d="M380,174 L342,174" label="gRPC" lx={346} ly={214} />
          <Edge d="M560,174 L598,174" label="gRPC" lx={565} ly={166} />
          <Edge d="M780,174 L818,174" label="Chat" lx={786} ly={166} />
          <Edge d="M270,198 L270,258" label="OIDC" lx={278} ly={232} />
          <Edge d="M410,198 L410,258" />
          <Edge d="M500,198 L500,258" />
          <Edge d="M620,198 L620,258" label="checkpoints" lx={628} ly={232} dashed />
          <Edge d="M900,198 L900,258" />
        </svg>
      </div>
      <figcaption className={styles.caption}>
        Only core sits on the edge. The agentic pair (agents, llm gateway) is internal-only and never sees a browser.
      </figcaption>
    </figure>
  )
}
