import { useState, type FormEvent } from 'react'
import type { Project, TimeEntry } from '../lib/types'
import { fromLocalInputValue, toLocalInputValue } from '../lib/format'

interface Props {
  projects: Project[]
  entry: TimeEntry | null
  onSave: (data: {
    projectId: string
    start: number
    end: number | null
  }) => Promise<void>
  onCancel: () => void
}

export function TimeEntryForm({ projects, entry, onSave, onCancel }: Props) {
  const activeProjects = projects.filter((p) => !p.archived)
  const now = new Date()
  const [projectId, setProjectId] = useState(
    entry?.projectId ?? activeProjects[0]?.id ?? '',
  )
  const [startValue, setStartValue] = useState(
    entry ? toLocalInputValue(new Date(entry.start)) : toLocalInputValue(now),
  )
  const [endValue, setEndValue] = useState(
    entry?.end
      ? toLocalInputValue(new Date(entry.end))
      : toLocalInputValue(new Date(now.getTime() + 3_600_000)),
  )
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
      <div className="panel panel-ticks p-6">
        <p className="text-sm text-muted">
          Create a project first, then add time entries.
        </p>
      </div>
    )
  }

  return (
    <div className="panel panel-ticks p-6" role="dialog" aria-modal="true">
      <p className="font-mono text-[10px] tracking-[0.3em] text-muted">
        {entry ? 'ENTRY / EDIT' : 'ENTRY / MANUAL'}
      </p>
      <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold tracking-wider text-muted" htmlFor="entry-project">
            PROJECT
          </label>
          <select
            id="entry-project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="input mt-1 w-full px-3 py-2"
            required
          >
            {activeProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold tracking-wider text-muted" htmlFor="entry-start">
            START
          </label>
          <input
            id="entry-start"
            type="datetime-local"
            value={startValue}
            onChange={(e) => setStartValue(e.target.value)}
            className="input mt-1 w-full px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold tracking-wider text-muted" htmlFor="entry-end">
            END
          </label>
          <input
            id="entry-end"
            type="datetime-local"
            value={endValue}
            onChange={(e) => setEndValue(e.target.value)}
            className="input mt-1 w-full px-3 py-2"
            required
          />
        </div>

        {error && (
          <p role="alert" className="sm:col-span-2 border border-alert/50 bg-alert/10 px-3 py-2 text-sm text-alert">
            {error}
          </p>
        )}

        <div className="flex gap-2 sm:col-span-2">
          <button type="submit" disabled={busy} className="btn btn-primary px-4 py-2 uppercase disabled:opacity-50">
            {busy ? 'Saving...' : 'Save entry'}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-ghost px-4 py-2 uppercase">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
