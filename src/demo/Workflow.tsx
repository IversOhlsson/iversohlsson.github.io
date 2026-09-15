import { useCallback, useEffect, useRef, useState } from 'react'
import s from './Workflow.module.css'

/* ---------- State built from a timeline of events ---------- */

type Status = 'idle' | 'working' | 'waiting' | 'done'
type Doc = { name: string; status: 'waiting' | 'reading' | 'done'; facts?: string }
type Score = { area: string; level: 'green' | 'amber' | 'red'; note: string }
type Item = { who: string; text: string; kind?: 'ask' | 'answer' | 'ok' | 'warn' }

type State = {
  docs: Doc[]
  coordinator: { status: Status; text: string }
  readers: { status: Status; text: string }
  checker: { status: Status; text: string; results: { ok: boolean; text: string }[] }
  risk: { status: Status; text: string; scores: Score[] }
  question: { text: string; answer: string; answeredAt: number } | null
  report: { status: 'none' | 'draft' | 'review' | 'approved'; findings: string[] }
  stream: Item[]
}

const DOCS0: Doc[] = [
  { name: 'Annual accounts 2025.pdf', status: 'waiting' },
  { name: 'Customer contracts (12).pdf', status: 'waiting' },
  { name: 'Liability insurance.pdf', status: 'waiting' },
  { name: 'Tax certificate.pdf', status: 'waiting' },
  { name: 'Employee list.xlsx', status: 'waiting' },
  { name: 'ISO 9001 certificate.pdf', status: 'waiting' },
]

const initial = (): State => ({
  docs: DOCS0.map(d => ({ ...d })),
  coordinator: { status: 'idle', text: 'Waiting for a task' },
  readers: { status: 'idle', text: 'Idle' },
  checker: { status: 'idle', text: 'Idle', results: [] },
  risk: { status: 'idle', text: 'Idle', scores: [] },
  question: null,
  report: { status: 'none', findings: [] },
  stream: [],
})

const T = 1.35 // global slow-down factor
const at = (ms: number) => Math.round(ms * T)

const EVENTS: { t: number; run: (st: State) => void }[] = [
  { t: at(200), run: st => { st.stream.push({ who: 'Investment team', text: 'Started due diligence on Halden Systems Ltd. 6 documents in the data room.' }) } },
  { t: at(900), run: st => { st.coordinator = { status: 'working', text: 'Planning: finance, legal, insurance, people' } } },
  { t: at(2000), run: st => {
    st.coordinator = { status: 'done', text: 'Plan ready. 4 areas, 6 documents.' }
    st.readers = { status: 'working', text: 'Reading 6 documents in parallel' }
    st.docs.forEach(d => { d.status = 'reading' })
    st.stream.push({ who: 'Coordinator', text: 'Split the work into four areas and started one reader per document.' })
  } },
  { t: at(2900), run: st => { st.docs[3] = { ...st.docs[3], status: 'done', facts: '3 facts' } } },
  { t: at(3400), run: st => { st.docs[5] = { ...st.docs[5], status: 'done', facts: '4 facts' } } },
  { t: at(3900), run: st => { st.docs[2] = { ...st.docs[2], status: 'done', facts: '5 facts' } } },
  { t: at(4500), run: st => { st.docs[4] = { ...st.docs[4], status: 'done', facts: '9 facts' } } },
  { t: at(5100), run: st => { st.docs[0] = { ...st.docs[0], status: 'done', facts: '14 facts' } } },
  { t: at(5700), run: st => {
    st.docs[1] = { ...st.docs[1], status: 'done', facts: '18 facts' }
    st.readers = { status: 'done', text: '53 facts, each linked to its page' }
    st.stream.push({ who: 'Readers', text: '53 facts collected. Every one keeps a link to the page it came from.' })
  } },
  { t: at(6300), run: st => { st.checker = { status: 'working', text: 'Cross-checking 53 facts', results: [] } } },
  { t: at(7400), run: st => {
    st.checker = { status: 'done', text: '1 issue found', results: [
      { ok: true, text: 'Revenue in accounts matches contract totals' },
      { ok: true, text: 'Company number identical across all documents' },
      { ok: false, text: 'Liability insurance expired 31 Mar 2026' },
    ] }
    st.stream.push({ who: 'Checks', text: 'Two checks passed. One issue: the liability insurance certificate expired on 31 March 2026.', kind: 'warn' })
  } },
  { t: at(8200), run: st => {
    st.coordinator = { status: 'waiting', text: 'Waiting for your answer' }
    st.question = { text: 'The liability insurance certificate in the data room expired on 31 March 2026. Do you have a current certificate?', answer: '', answeredAt: 0 }
    st.stream.push({ who: 'Coordinator', text: 'The liability insurance certificate expired on 31 March 2026. Do you have a current one?', kind: 'ask' })
  } },
  { t: at(10600), run: st => {
    if (st.question) { st.question.answer = 'Yes. Uploading Liability insurance 2026-27.pdf now.'; st.question.answeredAt = at(10600) }
  } },
  { t: at(12400), run: st => {
    st.stream.push({ who: 'You', text: 'Yes. Uploading Liability insurance 2026-27.pdf now.', kind: 'answer' })
    st.docs.push({ name: 'Liability insurance 2026-27.pdf', status: 'reading' })
    st.coordinator = { status: 'working', text: 'Answer received. Re-reading insurance.' }
    st.readers = { status: 'working', text: 'Reading 1 new document' }
  } },
  { t: at(13600), run: st => {
    st.docs[6] = { ...st.docs[6], status: 'done', facts: '5 facts' }
    st.readers = { status: 'done', text: '58 facts, each linked to its page' }
    st.checker = { status: 'working', text: 'Re-checking insurance', results: st.checker.results }
  } },
  { t: at(14500), run: st => {
    st.checker = { status: 'done', text: 'All checks pass', results: [
      { ok: true, text: 'Revenue in accounts matches contract totals' },
      { ok: true, text: 'Company number identical across all documents' },
      { ok: true, text: 'Liability insurance valid until 31 Mar 2027' },
    ] }
    st.coordinator = { status: 'done', text: 'All areas covered' }
    st.stream.push({ who: 'Checks', text: 'New certificate is valid until 31 March 2027. All checks pass.', kind: 'ok' })
    st.risk = { status: 'working', text: 'Scoring 4 areas', scores: [] }
  } },
  { t: at(15600), run: st => { st.risk.scores = [{ area: 'Finance', level: 'green', note: 'Stable revenue, low debt' }] } },
  { t: at(16200), run: st => { st.risk.scores.push({ area: 'Legal', level: 'amber', note: '2 contracts end on change of ownership' }) } },
  { t: at(16800), run: st => { st.risk.scores.push({ area: 'Insurance', level: 'green', note: 'Valid cover, adequate limits' }) } },
  { t: at(17400), run: st => {
    st.risk.scores.push({ area: 'People', level: 'green', note: 'Key staff on long notice periods' })
    st.risk = { ...st.risk, status: 'done', text: '1 area to look at' }
    st.stream.push({ who: 'Risk', text: 'Legal needs a look: two customer contracts can be ended if the company changes owner.', kind: 'warn' })
  } },
  { t: at(18400), run: st => {
    st.report = { status: 'draft', findings: ['2 of 12 customer contracts end on change of ownership (pages 14, 31)', 'Liability insurance renewed, valid to 31 Mar 2027 (new certificate)', 'Revenue 2025 matches signed contract values within 1% (accounts p. 6)'] }
    st.stream.push({ who: 'Report', text: 'Draft report ready. Every finding links to the page it came from.' })
  } },
  { t: at(19800), run: st => { st.report.status = 'review'; st.stream.push({ who: 'Report', text: 'Sent to Anna for review before anyone else sees it.' }) } },
  { t: at(22000), run: st => { st.report.status = 'approved'; st.stream.push({ who: 'Anna', text: 'Approved. Shared with the investment team.', kind: 'ok' }) } },
]

const TOTAL = at(24500)

const CHAPTERS = [
  { t: 0, title: 'The task comes in', caption: 'Your team drops the documents in. That is all they need to do.' },
  { t: at(2000), title: 'Agents read in parallel', caption: 'One reader per document. Every fact keeps a link to its page.' },
  { t: at(6300), title: 'Code cross-checks the facts', caption: 'Numbers and dates are compared by rules, not by the AI.' },
  { t: at(8200), title: 'It asks instead of guessing', caption: 'An expired certificate. The coordinator asks you, then carries on.' },
  { t: at(14500), title: 'Risk by area', caption: 'Green, amber, red. Each with a one-line reason.' },
  { t: at(18400), title: 'A report you can trust', caption: 'Every finding cites its source. A person approves before it goes anywhere.' },
]

function stateAt(t: number): State {
  const st = initial()
  for (const e of EVENTS) { if (e.t <= t) e.run(st) }
  return st
}

/* ---------- Component ---------- */

export default function Workflow() {
  const [elapsed, setElapsed] = useState(0)
  const [playing, setPlaying] = useState(true)
  const last = useRef<number | null>(null)

  useEffect(() => {
    if (!playing) { last.current = null; return }
    let raf = 0
    const tick = (now: number) => {
      if (last.current !== null) {
        const dt = now - last.current
        setElapsed(e => { const n = e + dt; if (n >= TOTAL) { setPlaying(false); return TOTAL } return n })
      }
      last.current = now
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  const st = stateAt(elapsed)
  const ended = elapsed >= TOTAL
  let ci = 0
  for (let i = 0; i < CHAPTERS.length; i++) if (elapsed >= CHAPTERS[i].t) ci = i
  const chapter = CHAPTERS[ci]
  const seek = useCallback((t: number) => { setElapsed(t); setPlaying(true) }, [])
  const restart = useCallback(() => { setElapsed(0); setPlaying(true) }, [])

  // Typed answer
  const q = st.question
  const typedAnswer = q && q.answeredAt ? q.answer.slice(0, Math.round(q.answer.length * Math.min(1, (elapsed - q.answeredAt) / at(1500)))) : ''
  const streamRef = useRef<HTMLDivElement>(null)
  const streamLen = st.stream.length + (q ? 1 : 0)
  useEffect(() => { const el = streamRef.current; if (el) el.scrollTop = el.scrollHeight }, [streamLen])

  return (
    <div>
      <div className={s.stage}>
        <div className={s.grid}>
          <div className={s.left}>
            <div className={s.task}>
              <span className={s.taskLabel}>Task</span>
              <strong>Due diligence on Halden Systems Ltd</strong>
              <span className={s.taskMeta}>Requested by the investment team · {st.docs.length} documents</span>
            </div>

            <div className={s.agents}>
              <Agent name="Coordinator" role="Plans and asks" st={st.coordinator} />
              <Agent name="Readers" role="One per document" st={st.readers} />
              <Agent name="Checks" role="Rules in code" st={st.checker} />
              <Agent name="Risk and report" role="Scores and writes" st={st.risk} />
            </div>

            {st.report.status === 'none' ? (
              <div className={s.docs}>
                {st.docs.map(d => (
                  <div key={d.name} className={[s.doc, s['doc_' + d.status]].join(' ')}>
                    <span className={s.docIcon} />
                    <span className={s.docName}>{d.name}</span>
                    <span className={s.docState}>{d.status === 'done' ? d.facts : d.status === 'reading' ? 'Reading…' : ''}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={s.report}>
                <div className={s.reportHead}>
                  <strong>Due diligence report · Halden Systems Ltd</strong>
                  <span className={[s.pill, st.report.status === 'approved' ? s.pillOk : st.report.status === 'review' ? s.pillWarn : ''].join(' ')}>
                    {st.report.status === 'approved' ? 'Approved by Anna' : st.report.status === 'review' ? 'With Anna for review' : 'Draft'}
                  </span>
                </div>
                <div className={s.scores}>
                  {st.risk.scores.map(sc => (
                    <div key={sc.area} className={[s.score, s['lvl_' + sc.level]].join(' ')}><strong>{sc.area}</strong><span>{sc.note}</span></div>
                  ))}
                </div>
                <ul className={s.findings}>
                  {st.report.findings.map(f => <li key={f}>{f}</li>)}
                </ul>
              </div>
            )}

            {st.report.status === 'none' && st.risk.scores.length > 0 && (
              <div className={s.scores}>
                {st.risk.scores.map(sc => (
                  <div key={sc.area} className={[s.score, s['lvl_' + sc.level]].join(' ')}><strong>{sc.area}</strong><span>{sc.note}</span></div>
                ))}
              </div>
            )}

            {st.checker.results.length > 0 && st.report.status === 'none' && (
              <ul className={s.checks}>
                {st.checker.results.map(r => <li key={r.text} className={r.ok ? s.checkOk : s.checkWarn}>{r.ok ? '✓' : '!'} {r.text}</li>)}
              </ul>
            )}
          </div>

          <div className={s.right}>
            <p className={s.streamTitle}>What is happening</p>
            <div className={s.stream} ref={streamRef}>
              {st.stream.map((it, i) => (
                <div key={i} className={[s.item, it.kind ? s['k_' + it.kind] : ''].join(' ')}>
                  <span className={s.who}>{it.who}</span>
                  <span>{it.text}</span>
                </div>
              ))}
              {q && elapsed < at(12400) && (
                <div className={s.ask}>
                  <span className={s.askLabel}>Needs your answer</span>
                  <p>{q.text}</p>
                  {q.answeredAt > 0 && (
                    <div className={s.answerBox}>{typedAnswer}<span className={s.caret} /></div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {ended && <button className={s.replay} onClick={restart}>Replay</button>}
      </div>

      <div className={s.controls}>
        <button className={s.playBtn} onClick={() => (ended ? restart() : setPlaying(v => !v))} aria-label={playing ? 'Pause' : 'Play'}>
          {ended ? '↻' : playing ? '❚❚' : '▶'}
        </button>
        <div className={s.chapters}>
          {CHAPTERS.map((c, i) => {
            const end = i < CHAPTERS.length - 1 ? CHAPTERS[i + 1].t : TOTAL
            const fill = Math.max(0, Math.min(1, (elapsed - c.t) / (end - c.t)))
            return (
              <button key={c.title} className={s.chapter} style={{ flex: end - c.t }} onClick={() => seek(c.t)} title={c.title}>
                <span className={s.track}><span className={s.fill} style={{ transform: `scaleX(${fill})` }} /></span>
              </button>
            )
          })}
        </div>
        <span className={s.time}>{Math.floor(elapsed / 1000)}s / {Math.round(TOTAL / 1000)}s</span>
      </div>
      <div className={s.caption} key={ci}>
        <span className={s.stepNo}>{ci + 1} / {CHAPTERS.length}</span>
        <div><strong>{chapter.title}</strong><p>{chapter.caption}</p></div>
      </div>
    </div>
  )
}

function Agent({ name, role, st }: { name: string; role: string; st: { status: Status; text: string } }) {
  return (
    <div className={[s.agent, s['a_' + st.status]].join(' ')}>
      <div className={s.agentHead}><strong>{name}</strong><span className={s.dot} /></div>
      <em>{role}</em>
      <p>{st.text}</p>
    </div>
  )
}
