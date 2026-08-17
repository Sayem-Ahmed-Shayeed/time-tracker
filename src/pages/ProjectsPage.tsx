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
    <div
      className="panel panel-ticks p-4"
      style={{ opacity: project.archived ? 0.55 : 1 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span
            className="mb-2 inline-block h-3 w-3"
            style={{ background: project.color }}
            aria-hidden
          />
          {editing ? (
            <form onSubmit={submit} className="flex gap-2">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input px-2 py-1 text-sm"
                aria-label="Project name"
              />
              <button
                type="submit"
                disabled={busy}
                className="btn btn-primary px-2 py-1 text-xs uppercase"
              >
                Save
              </button>
            </form>
          ) : (
            <h3 className="font-display text-lg uppercase leading-tight">
              {project.name}
            </h3>
          )}
          <p className="mt-1 font-mono text-[10px] tracking-widest text-muted">
            {project.archived ? 'ARCHIVED' : 'ACTIVE'}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => setEditing((v) => !v)}
            className="btn btn-ghost px-2 py-1 text-xs uppercase"
          >
            {editing ? 'Cancel' : 'Rename'}
          </button>
          <button
            onClick={() => void onToggleArchive(project)}
            className="btn btn-ghost px-2 py-1 text-xs uppercase"
          >
            {project.archived ? 'Restore' : 'Archive'}
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete "${project.name}"? Its time entries stay in the database.`)) {
                void onDelete(project.id)
              }
            }}
            className="btn btn-ghost px-2 py-1 text-xs uppercase text-alert hover:!border-alert hover:!text-alert"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export function ProjectsPage() {
  const { projects, loading, createProject, updateProject, deleteProject } =
    useProjects()
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

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[10px] tracking-[0.3em] text-muted">
          PROJECTS / REGISTRY
        </p>
        <h1 className="font-display text-3xl uppercase">Projects</h1>
      </div>

      <form onSubmit={submit} className="panel panel-ticks flex flex-wrap items-end gap-4 p-5">
        <div className="min-w-48 flex-1">
          <label htmlFor="proj-name" className="text-xs font-semibold tracking-wider text-muted">
            NEW PROJECT
          </label>
          <input
            id="proj-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Thesis chapter 3"
            className="input mt-1 w-full px-3 py-2"
            required
          />
        </div>
        <div>
          <span className="block text-xs font-semibold tracking-wider text-muted">COLOR</span>
          <div className="mt-1.5 flex gap-1.5">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="h-6 w-6 border-2"
                style={{
                  background: c,
                  borderColor: c === color ? '#e6e6e6' : 'transparent',
                }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="btn btn-primary px-4 py-2 uppercase disabled:opacity-50"
        >
          Create
        </button>
      </form>

      {error && (
        <p role="alert" className="border border-alert/50 bg-alert/10 px-3 py-2 text-sm text-alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="font-mono text-sm text-muted">LOADING...</p>
      ) : projects.length === 0 ? (
        <div className="panel panel-ticks p-8 text-center">
          <p className="font-mono text-sm tracking-widest text-muted">
            NO PROJECTS YET — CREATE ONE ABOVE
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onRename={(id, n) => updateProject(id, { name: n })}
              onToggleArchive={(p) =>
                updateProject(p.id, { archived: !p.archived })
              }
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
