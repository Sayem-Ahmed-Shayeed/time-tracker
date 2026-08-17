import { useMemo, useState } from 'react'
import { useTimeEntries } from '../hooks/useTimeEntries'
import { formatDurationLong } from '../lib/format'
import type { Project, TimeEntry } from '../lib/types'

export function EntryList({
  projects,
  onEdit,
}: {
  projects: Project[]
  onEdit: (entry: TimeEntry) => void
}) {
  const { entries, deleteEntry } = useTimeEntries()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const projectById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects])

  const completed = entries.filter((e) => e.end !== null)

  const grouped = useMemo(() => {
    const map = new Map<string, TimeEntry[]>()
    for (const entry of completed) {
      const key = new Date(entry.start).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
      const list = map.get(key) ?? []
      list.push(entry)
      map.set(key, list)
    }
    return [...map.entries()].sort((a, b) => b[1][0].start - a[1][0].start)
  }, [completed])

  function fmtRange(entry: TimeEntry) {
    const start = new Date(entry.start).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    })
    const end = entry.end
      ? new Date(entry.end).toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'now'
    return `${start} – ${end}`
  }

  if (grouped.length === 0) {
    return (
      <div className="panel p-10 text-center sm:p-14">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.025] text-xl text-muted" aria-hidden>◷</div>
        <h2 className="mt-4 text-lg font-semibold tracking-[-0.025em]">No completed entries</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">Finished timer sessions and manual entries will appear here, grouped by day.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {grouped.map(([day, list]) => {
        const dayTotal = list.reduce((sum, entry) => sum + (entry.end ? entry.end - entry.start : 0), 0)
        return (
          <section key={day} aria-labelledby={`day-${day.replace(/\W/g, '-')}`}>
            <div className="mb-3 flex items-end justify-between gap-4 px-1">
              <div>
                <p className="eyebrow">Daily log</p>
                <h2 id={`day-${day.replace(/\W/g, '-')}`} className="mt-1 text-sm font-semibold text-paper">{day}</h2>
              </div>
              <div className="text-right">
                <p className="eyebrow">Total</p>
                <p className="mt-1 font-mono text-xs text-teal">{formatDurationLong(dayTotal)}</p>
              </div>
            </div>

            <ul className="panel divide-y divide-white/[0.055] overflow-hidden">
              {list.map((entry) => {
                const project = projectById.get(entry.projectId)
                return (
                  <li key={entry.id} className="group grid gap-4 px-4 py-4 transition-colors hover:bg-white/[0.018] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5">
                    <div className="flex min-w-0 items-center gap-3.5">
                      <span className="h-9 w-1 shrink-0 rounded-full" style={{ background: project?.color ?? '#686f7b' }} aria-hidden />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold tracking-[-0.01em] text-paper">{project?.name ?? 'Deleted project'}</p>
                        <p className="mt-1 font-mono text-[10px] tracking-[0.04em] text-muted">{fmtRange(entry)}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <span className="mr-auto font-mono text-sm font-medium tabular-nums text-paper sm:mr-2">{formatDurationLong(entry.end ? entry.end - entry.start : 0)}</span>
                      <button onClick={() => onEdit(entry)} className="btn btn-ghost min-h-8 px-2.5 text-[11px]">Edit</button>
                      {confirmDelete === entry.id ? (
                        <span className="flex gap-1.5" role="group" aria-label="Confirm deletion">
                          <button
                            onClick={() => {
                              void deleteEntry(entry.id)
                              setConfirmDelete(null)
                            }}
                            className="btn min-h-8 border border-alert/40 bg-alert/[0.09] px-2.5 text-[11px] text-alert"
                          >
                            Confirm
                          </button>
                          <button onClick={() => setConfirmDelete(null)} className="btn btn-ghost min-h-8 px-2.5 text-[11px]">Cancel</button>
                        </span>
                      ) : (
                        <button onClick={() => setConfirmDelete(entry.id)} className="btn btn-ghost btn-danger min-h-8 px-2.5 text-[11px] text-alert">Delete</button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
