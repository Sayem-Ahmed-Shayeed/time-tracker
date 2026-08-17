import { useState, type FormEvent } from 'react'
import { useProjects } from '../hooks/useProjects'
import { useTimeEntries } from '../hooks/useTimeEntries'
import { PROJECT_COLORS } from '../lib/format'
import type { Project } from '../lib/types'

function ProjectCard({
  project,
  onRename,
  onToggleArchive,
  onDelete,
}: {
  project: Project
  onRename: (id: string, name: string) => Promise<void>
  onToggleArchive: (p: Project) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(project.name)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setBusy(true)
    await onRename(project.id, trimmed)
    setBusy(false)
    setEditing(false)
  }

  return (
    <article className={`panel panel-interactive overflow-hidden p-5 ${project.archived ? 'opacity-60' : ''}`}>
      <div className="absolute inset-x-0 top-0 h-px opacity-70" style={{ background: `linear-gradient(90deg, ${project.color}, transparent 60%)` }} aria-hidden />
      <div className="flex min-h-28 flex-col justify-between gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: project.color, boxShadow: `0 0 0 4px ${project.color}12` }} aria-hidden />
              <span className="eyebrow">{project.archived ? 'Archived' : 'Active project'}</span>
            </div>
            {editing ? (
              <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input min-w-0 flex-1 px-3 py-2 text-sm"
                  aria-label="Project name"
                />
                <button type="submit" disabled={busy} className="btn btn-primary min-h-10 px-3 text-xs disabled:opacity-50">
                  {busy ? 'Saving…' : 'Save'}
                </button>
              </form>
            ) : (
              <h2 className="truncate text-xl font-semibold tracking-[-0.035em] text-paper">{project.name}</h2>
            )}
          </div>
          <span className="font-mono text-[9px] tracking-[0.12em] text-muted-2">{project.id.slice(0, 6).toUpperCase()}</span>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
          <button onClick={() => setEditing((value) => !value)} className="btn btn-ghost min-h-9 px-3 text-xs">
            {editing ? 'Cancel' : 'Rename'}
          </button>
          <button onClick={() => void onToggleArchive(project)} className="btn btn-ghost min-h-9 px-3 text-xs">
            {project.archived ? 'Restore' : 'Archive'}
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete "${project.name}"? Its time entries stay in the database.`)) {
                void onDelete(project.id)
              }
            }}
            className="btn btn-ghost btn-danger min-h-9 px-3 text-xs text-alert"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}

export function ProjectsPage() {
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects()
  const { entries, deleteEntry } = useTimeEntries()
  const [name, setName] = useState('')
  const [color, setColor] = useState(PROJECT_COLORS[0])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setBusy(true)
    setError('')
    try {
      await createProject({ name: trimmed, color })
      setName('')
      setColor(PROJECT_COLORS[(PROJECT_COLORS.indexOf(color) + 1) % PROJECT_COLORS.length])
    } catch {
      setError('Failed to create project')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(id: string) {
    const projectEntries = entries.filter((e) => e.projectId === id)
    for (const e of projectEntries) await deleteEntry(e.id)
    await deleteProject(id)
  }

  const activeProjects = projects.filter((project) => !project.archived).length

  return (
    <div className="space-y-7 sm:space-y-9">
      <header className="reveal flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Workspace registry</p>
          <h1 className="page-title">Projects</h1>
          <p className="page-copy">Organize the work you want to measure. Each project keeps its own visual signal across the timer and reports.</p>
        </div>
        <div className="flex gap-5 text-sm text-muted">
          <div><span className="metric-value block text-lg text-paper">{activeProjects}</span><span className="text-xs">Active</span></div>
          <div><span className="metric-value block text-lg text-paper">{projects.length}</span><span className="text-xs">Total</span></div>
        </div>
      </header>

      <form onSubmit={submit} className="surface-elevated reveal reveal-delay-1 p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <div className="min-w-0">
            <label htmlFor="proj-name" className="mb-1.5 block text-xs font-semibold text-muted">Project name</label>
            <input
              id="proj-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Client redesign"
              className="input w-full px-3.5 py-2.5"
              required
            />
          </div>
          <fieldset>
            <legend className="mb-2 text-xs font-semibold text-muted">Project color</legend>
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLORS.map((projectColor) => {
                const selected = projectColor === color
                return (
                  <button
                    key={projectColor}
                    type="button"
                    onClick={() => setColor(projectColor)}
                    className="grid h-8 w-8 place-items-center rounded-lg border transition duration-200 hover:-translate-y-0.5"
                    style={{ background: `${projectColor}15`, borderColor: selected ? projectColor : 'rgba(255,255,255,.08)' }}
                    aria-label={`Use color ${projectColor}`}
                    aria-pressed={selected}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: projectColor }} aria-hidden />
                  </button>
                )
              })}
            </div>
          </fieldset>
          <button type="submit" disabled={busy} className="btn btn-primary w-full px-5 py-1.5 disabled:opacity-50 lg:w-auto">
            {busy ? 'Creating…' : <>Create project <span aria-hidden>＋</span></>}
          </button>
        </div>
      </form>

      {error && <p role="alert" className="rounded-xl border border-alert/30 bg-alert/[0.07] px-4 py-3 text-sm text-alert">{error}</p>}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((item) => <div key={item} className="skeleton panel relative h-44" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="panel reveal reveal-delay-2 p-10 text-center sm:p-14">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.025] text-xl text-muted" aria-hidden>◇</div>
          <h2 className="mt-4 text-lg font-semibold tracking-[-0.025em]">No projects yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">Create one above and it will become available immediately in your live timer and reporting views.</p>
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2" aria-label="Projects">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onRename={(id, nextName) => updateProject(id, { name: nextName })}
              onToggleArchive={(item) => updateProject(item.id, { archived: !item.archived })}
              onDelete={handleDelete}
            />
          ))}
        </section>
      )}
    </div>
  )
}
