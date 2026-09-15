import { useCallback, useEffect, useRef, useState } from 'react'
import s from './Workflow.module.css'

/* ---------- State built from a timeline of events ---------- */

type Status = 'idle' | 'working' | 'waiting' | 'done'
type Doc = { name: string; status: 'waiting' | 'reading' | 'done'; facts?: string }
type Score = { area: string; level: 'green' | 'amber' | 'red'; note: string }
type Item = { who: string; text: string; kind?: 'ask' | 'answer' | 'ok' | 'warn' | 'me'; typedAt?: number }

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

const T = 1.15 // global slow-down factor
const at = (ms: number) => Math.round(ms * T)
/** Length of the opening scene: chat message + files dragged into the data room. */
const INTRO = 9000
const E = (ms: number) => at(INTRO + ms)
const FILE_START = 3400
const FILE_GAP = 700
const FILE_FLY = 600
const MSG = 'Hi! Can you start due diligence on Halden Systems? I am putting everything in the data room now.'

const EVENTS: { t: number; run: (st: State) => void }[] = [
  { t: at(1400), run: st => { st.stream.push({ who: 'Maria, investment team', text: MSG, kind: 'me', typedAt: at(1400) }) } },
  { t: at(FILE_START + 5 * FILE_GAP + FILE_FLY + 500), run: st => { st.stream.push({ who: 'Coordinator', text: 'Got all six. Starting now. I will ask if anything is missing.' }) } },
  { t: E(900), run: st => { st.coordinator = { status: 'working', text: 'Planning: finance, legal, insurance, people' } } },
  { t: E(2000), run: st => {
    st.coordinator = { status: 'done', text: 'Plan ready. 4 areas, 6 documents.' }
    st.readers = { status: 'working', text: 'Reading 6 documents in parallel' }
    st.docs.forEach(d => { d.status = 'reading' })
    st.stream.push({ who: 'Coordinator', text: 'Split the work into four areas and started one reader per document.' })
  } },
  { t: E(2900), run: st => { st.docs[3] = { ...st.docs[3], status: 'done', facts: '3 facts' } } },
  { t: E(3400), run: st => { st.docs[5] = { ...st.docs[5], status: 'done', facts: '4 facts' } } },
  { t: E(3900), run: st => { st.docs[2] = { ...st.docs[2], status: 'done', facts: '5 facts' } } },
  { t: E(4500), run: st => { st.docs[4] = { ...st.docs[4], status: 'done', facts: '9 facts' } } },
  { t: E(5100), run: st => { st.docs[0] = { ...st.docs[0], status: 'done', facts: '14 facts' } } },
  { t: E(5700), run: st => {
    st.docs[1] = { ...st.docs[1], status: 'done', facts: '18 facts' }
    st.readers = { status: 'done', text: '53 facts, each linked to its page' }
    st.stream.push({ who: 'Readers', text: '53 facts collected. Every one keeps a link to the page it came from.' })
  } },
  { t: E(6300), run: st => { st.checker = { status: 'working', text: 'Cross-checking 53 facts', results: [] } } },
  { t: E(7400), run: st => {
    st.checker = { status: 'done', text: '1 issue found', results: [
      { ok: true, text: 'Revenue in accounts matches contract totals' },
      { ok: true, text: 'Company number identical across all documents' },
      { ok: false, text: 'Liability insurance expired 31 Mar 2026' },
    ] }
    st.stream.push({ who: 'Checks', text: 'Two checks passed. One issue: the liability insurance certificate expired on 31 March 2026.', kind: 'warn' })
  } },
  { t: E(8200), run: st => {
    st.coordinator = { status: 'waiting', text: 'Waiting for your answer' }
    st.question = { text: 'The liability insurance certificate in the data room expired on 31 March 2026. Do you have a current certificate?', answer: '', answeredAt: 0 }
    st.stream.push({ who: 'Coordinator', text: 'The liability insurance certificate expired on 31 March 2026. Do you have a current one?', kind: 'ask' })
  } },
  { t: E(10600), run: st => {
    if (st.question) { st.question.answer = 'Yes. Uploading Liability insurance 2026-27.pdf now.'; st.question.answeredAt = E(10600) }
  } },
  { t: E(12400), run: st => {
    st.stream.push({ who: 'You', text: 'Yes. Uploading Liability insurance 2026-27.pdf now.', kind: 'answer' })
    st.docs.push({ name: 'Liability insurance 2026-27.pdf', status: 'reading' })
    st.coordinator = { status: 'working', text: 'Answer received. Re-reading insurance.' }
    st.readers = { status: 'working', text: 'Reading 1 new document' }
  } },
  { t: E(13600), run: st => {
    st.docs[6] = { ...st.docs[6], status: 'done', facts: '5 facts' }
    st.readers = { status: 'done', text: '58 facts, each linked to its page' }
    st.checker = { status: 'working', text: 'Re-checking insurance', results: st.checker.results }
  } },
  { t: E(14500), run: st => {
    st.checker = { status: 'done', text: 'All checks pass', results: [
      { ok: true, text: 'Revenue in accounts matches contract totals' },
      { ok: true, text: 'Company number identical across all documents' },
      { ok: true, text: 'Liability insurance valid until 31 Mar 2027' },
    ] }
    st.coordinator = { status: 'done', text: 'All areas covered' }
    st.stream.push({ who: 'Checks', text: 'New certificate is valid until 31 March 2027. All checks pass.', kind: 'ok' })
    st.risk = { status: 'working', text: 'Scoring 4 areas', scores: [] }
  } },
  { t: E(15600), run: st => { st.risk.scores = [{ area: 'Finance', level: 'green', note: 'Stable revenue, low debt' }] } },
  { t: E(16200), run: st => { st.risk.scores.push({ area: 'Legal', level: 'amber', note: '2 contracts end on change of ownership' }) } },
  { t: E(16800), run: st => { st.risk.scores.push({ area: 'Insurance', level: 'green', note: 'Valid cover, adequate limits' }) } },
  { t: E(17400), run: st => {
    st.risk.scores.push({ area: 'People', level: 'green', note: 'Key staff on long notice periods' })
    st.risk = { ...st.risk, status: 'done', text: '1 area to look at' }
    st.stream.push({ who: 'Risk', text: 'Legal needs a look: two customer contracts can be ended if the company changes owner.', kind: 'warn' })
  } },
  { t: E(18400), run: st => {
    st.report = { status: 'draft', findings: ['2 of 12 customer contracts end on change of ownership (pages 14, 31)', 'Liability insurance renewed, valid to 31 Mar 2027 (new certificate)', 'Revenue 2025 matches signed contract values within 1% (accounts p. 6)'] }
    st.stream.push({ who: 'Report', text: 'Draft report ready. Every finding links to the page it came from.' })
  } },
  { t: E(19800), run: st => { st.report.status = 'review'; st.stream.push({ who: 'Report', text: 'Sent to Anna for review before anyone else sees it.' }) } },
  { t: E(22000), run: st => { st.report.status = 'approved'; st.stream.push({ who: 'Anna', text: 'Approved. Shared with the investment team.', kind: 'ok' }) } },
]

const TOTAL = E(24500)

const CHAPTERS = [
  { t: 0, title: 'Documents come in', caption: 'A message and a few files dragged into the data room. That is all your team needs to do.' },
  { t: E(2000), title: 'Agents read in parallel', caption: 'One reader per document. Every fact keeps a link to its page.' },
  { t: E(6300), title: 'Code cross-checks the facts', caption: 'Numbers and dates are compared by rules, not by the AI.' },
  { t: E(8200), title: 'It asks instead of guessing', caption: 'An expired certificate. The coordinator asks you, then carries on.' },
  { t: E(14500), title: 'Risk by area', caption: 'Green, amber, red. Each with a one-line reason.' },
  { t: E(18400), title: 'A report you can trust', caption: 'Every finding cites its source. A person approves before it goes anywhere.' },
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
          {elapsed < at(INTRO) ? <Intro elapsed={elapsed} /> : (
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
          )}

          <div className={s.right}>
            <p className={s.streamTitle}>Conversation</p>
            <div className={s.stream} ref={streamRef}>
              {elapsed < at(1400) && (
                <div className={[s.item, s.k_me].join(' ')}>
                  <span className={s.who}>Maria, investment team</span>
                  <span className={s.typing}><i /><i /><i /></span>
                </div>
              )}
              {st.stream.map((it, i) => (
                <div key={i} className={[s.item, it.kind ? s['k_' + it.kind] : ''].join(' ')}>
                  <span className={s.who}>{it.who}</span>
                  <span>{it.typedAt ? it.text.slice(0, Math.round(it.text.length * Math.min(1, (elapsed - it.typedAt) / at(1700)))) : it.text}</span>
                </div>
              ))}
              {q && elapsed < E(12400) && (
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


/* ---------- Opening scene: files dragged into the data room ---------- */

function Intro({ elapsed }: { elapsed: number }) {
  const files = DOCS0.map(d => d.name)
  const state = files.map((_, i) => {
    const start = at(FILE_START + i * FILE_GAP)
    const end = start + at(FILE_FLY)
    if (elapsed < start) return { phase: 'waiting' as const, k: 0 }
    if (elapsed < end) return { phase: 'flying' as const, k: (elapsed - start) / (end - start) }
    return { phase: 'landed' as const, k: 1 }
  })
  const flying = state.findIndex(f => f.phase === 'flying')
  const landed = state.filter(f => f.phase === 'landed').length
  const ease = (k: number) => 1 - Math.pow(1 - k, 3)
  return (
    <div className={s.intro}>
      <div className={s.introCol}>
        <p className={s.introTitle}>Your files</p>
        <ul className={s.fileList}>
          {files.map((f, i) => (
            <li key={f} className={[s.file, state[i].phase !== 'waiting' ? s.fileGone : ''].join(' ')}>
              <span className={s.docIcon} /><span className={s.docName}>{f}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={[s.dropzone, flying >= 0 ? s.dropActive : '', landed === files.length ? s.dropDone : ''].join(' ')}>
        <p className={s.introTitle}>Data room · Halden Systems Ltd</p>
        {landed === 0 && flying < 0 && <p className={s.dropHint}>Drag documents here</p>}
        <ul className={s.fileList}>
          {files.map((f, i) => state[i].phase === 'landed' && (
            <li key={f} className={[s.file, s.fileIn].join(' ')}>
              <span className={s.docIcon} /><span className={s.docName}>{f}</span><span className={s.fileOk}>✓</span>
            </li>
          ))}
        </ul>
        {landed === files.length && <p className={s.dropHint}>{files.length} documents · shared with the AI team</p>}
      </div>
      {flying >= 0 && (() => {
        const k = ease(state[flying].k)
        const x = 8 + k * 52
        const y = 58 + flying * 44 + (110 - (58 + flying * 44)) * k - Math.sin(k * Math.PI) * 24
        return (
          <div className={s.ghost} style={{ left: `${x}%`, top: y }}>
            <span className={s.docIcon} /><span className={s.docName}>{files[flying]}</span>
            <span className={s.cursor} />
          </div>
        )
      })()}
    </div>
  )
}
