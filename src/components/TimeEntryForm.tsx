import { useState, type FormEvent } from 'react'
import type { Project, TimeEntry } from '../lib/types'
import { fromLocalInputValue, toLocalInputValue } from '../lib/format'

interface Props {
  projects: Project[]
  entry: TimeEntry | null
  onSave: (data: { projectId: string; start: number; end: number | null }) => Promise<void>
  onCancel: () => void
}

export function TimeEntryForm({ projects, entry, onSave, onCancel }: Props) {
  const activeProjects = projects.filter((p) => !p.archived)
  const now = new Date()
  const [projectId, setProjectId] = useState(entry?.projectId ?? activeProjects[0]?.id ?? '')
  const [startValue, setStartValue] = useState(entry ? toLocalInputValue(new Date(entry.start)) : toLocalInputValue(now))
  const [endValue, setEndValue] = useState(entry?.end ? toLocalInputValue(new Date(entry.end)) : toLocalInputValue(new Date(now.getTime() + 3_600_000)))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const start = fromLocalInputValue(startValue).getTime()
    const end = fromLocalInputValue(endValue).getTime()
    if (!projectId) {
      setError('Pick a project')
      return
    }
    if (end <= start) {
      setError('End must be after start')
      return
    }
    setBusy(true)
    try {
      await onSave({ projectId, start, end })
      onCancel()
    } catch {
      setError('Failed to save entry')
    } finally {
      setBusy(false)
    }
  }

  if (activeProjects.length === 0) {
    return (
      <div className="panel p-6">
        <p className="eyebrow">Manual entry unavailable</p>
        <p className="mt-2 text-sm text-muted">Create an active project first, then add time entries.</p>
      </div>
    )
  }

  return (
    <section className="surface-elevated reveal p-5 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="entry-form-title">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{entry ? 'Edit recorded time' : 'Manual time'}</p>
          <h2 id="entry-form-title" className="mt-1 text-lg font-semibold tracking-[-0.025em]">{entry ? 'Update entry' : 'Add a time entry'}</h2>
        </div>
        <button type="button" onClick={onCancel} className="btn btn-ghost h-9 min-h-0 w-9 px-0 text-lg text-muted" aria-label="Close form">×</button>
      </div>

      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-muted" htmlFor="entry-project">Project</label>
          <select id="entry-project" value={projectId} onChange={(e) => setProjectId(e.target.value)} className="input w-full px-3.5 py-2.5" required>
            {activeProjects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted" htmlFor="entry-start">Start</label>
          <input id="entry-start" type="datetime-local" value={startValue} onChange={(e) => setStartValue(e.target.value)} className="input w-full px-3.5 py-2.5" required />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted" htmlFor="entry-end">End</label>
          <input id="entry-end" type="datetime-local" value={endValue} onChange={(e) => setEndValue(e.target.value)} className="input w-full px-3.5 py-2.5" required />
        </div>

        {error && <p role="alert" className="rounded-xl border border-alert/30 bg-alert/[0.07] px-3.5 py-3 text-sm text-alert sm:col-span-2">{error}</p>}

        <div className="flex flex-wrap gap-2 border-t border-white/[0.06] pt-4 sm:col-span-2">
          <button type="submit" disabled={busy} className="btn btn-primary px-4 py-1.5 disabled:opacity-50">{busy ? 'Saving…' : 'Save entry'}</button>
          <button type="button" onClick={onCancel} className="btn btn-ghost px-4 py-1.5">Cancel</button>
        </div>
      </form>
    </section>
  )
}
