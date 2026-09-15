import styles from './Pipeline.module.css'
import { PIPELINE, type Step, type StepKind } from '../content/site'

const KIND: Record<StepKind, string> = {
  code: 'code',
  model: 'model',
  human: 'human',
  store: 'store',
}

function Row({ step, i }: { step: Step; i: number }) {
  return (
    <li className={styles.row} data-reveal style={{ transitionDelay: `${Math.min(i, 8) * 40}ms` }}>
      <span className={[styles.kind, styles[step.kind]].join(' ')}>{KIND[step.kind]}</span>
      <span className={styles.name}>{step.name}</span>
      <span className={styles.what}>
        {step.what}
        {step.note && <span className={styles.note}>{step.note}</span>}
      </span>
    </li>
  )
}

/** The document-to-structured-data path, rendered like the trace it produces. */
export default function Pipeline() {
  return (
    <div className={styles.wrap}>
      <div className={styles.legend}>
        <span><i className={styles.code} /> code, deterministic</span>
        <span><i className={styles.model} /> model call, structured output</span>
        <span><i className={styles.human} /> human, durable interrupt</span>
        <span><i className={styles.store} /> storage</span>
      </div>
      <div className={styles.cols}>
        <section className={styles.col}>
          <h4 className={styles.h4}>Prepare <span>code, once per upload</span></h4>
          <ol className={styles.list}>
            {PIPELINE.prepare.map((st, i) => <Row key={st.name} step={st} i={i} />)}
          </ol>
        </section>
        <section className={styles.col}>
          <h4 className={styles.h4}>Intake graph <span>LangGraph, checkpointed</span></h4>
          <ol className={styles.list}>
            {PIPELINE.graph.map((st, i) => <Row key={st.name} step={st} i={i} />)}
          </ol>
        </section>
      </div>
    </div>
  )
}
