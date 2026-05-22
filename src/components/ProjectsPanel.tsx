import { useState } from 'react'
import styles from './ProjectsPanel.module.css'
import { PROJECTS, type Project } from '../content/projects'

export default function ProjectsPanel() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <>
      <p className={styles.crumb}>~ <span className={styles.slash}>/</span> projects</p>
      <h1 className={styles.h1}>Selected <em>personal projects</em></h1>
      <p className={styles.brief}>
        A short list of things built on the side — data analytics, deep-learning experiments, product tooling.
        Click a row to expand.
      </p>

      <p className={styles.sectionLabel}>/ INDEX</p>
      <ul className={styles.list}>
        {PROJECTS.map(p => (
          <ProjectRow
            key={p.id}
            project={p}
            open={openId === p.id}
            onToggle={() => setOpenId(prev => (prev === p.id ? null : p.id))}
          />
        ))}
      </ul>
    </>
  )
}

function ProjectRow({ project, open, onToggle }: { project: Project; open: boolean; onToggle: () => void }) {
  return (
    <li className={[styles.row, open ? styles.open : ''].filter(Boolean).join(' ')}>
      <button
        type="button"
        className={styles.head}
        aria-expanded={open}
        aria-controls={`project-${project.id}-body`}
        onClick={onToggle}
      >
        <span className={styles.caret}>▸</span>
        <span className={styles.heading}>
          <span className={styles.name}>{project.monoLabel}</span>
          <span className={styles.kicker}>{project.kicker}</span>
        </span>
        <span className={styles.year}>{project.year}</span>
      </button>

      <div id={`project-${project.id}-body`} className={styles.body} role="region">
        <div className={styles.bodyInner}>
          <div className={styles.copy}>
            {project.body.map((para, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: para }} />
            ))}
            <div className={styles.tags}>
              {project.tags.map(t => <span key={t}>{t}</span>)}
            </div>
            {project.link && (
              <p className={styles.link}>
                <a href={project.link.href} target="_blank" rel="noreferrer">{project.link.label} ↗</a>
              </p>
            )}
          </div>
          {project.image && (
            <div className={styles.thumb}>
              <img src={project.image} alt={project.monoLabel} loading="lazy" />
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
