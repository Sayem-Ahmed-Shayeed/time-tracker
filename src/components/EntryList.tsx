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
  const projectById = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects],
  )

  const completed = entries.filter((e) => e.end !== null)

  const grouped = useMemo(() => {
    const map = new Map<string, TimeEntry[]>()
    for (const e of completed) {
      const key = new Date(e.start).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
      const list = map.get(key) ?? []
      list.push(e)
      map.set(key, list)
    }
    return [...map.entries()].sort((a, b) => b[1][0].start - a[1][0].start)
  }, [completed])

  function fmtRange(e: TimeEntry) {
    const s = new Date(e.start).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    })
    const en = e.end
      ? new Date(e.end).toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'now'
    return `${s} – ${en}`
  }

  if (grouped.length === 0) {
    return (
      <div className="panel panel-ticks p-8 text-center">
        <p className="font-mono text-sm tracking-widest text-muted">
          NO COMPLETED ENTRIES YET
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {grouped.map(([day, list]) => {
        const dayTotal = list.reduce(
          (sum, e) => sum + (e.end ? e.end - e.start : 0),
          0,
        )
        return (
          <div key={day}>
            <div className="mb-2 flex items-baseline justify-between border-b border-line pb-1">
              <h3 className="font-mono text-xs tracking-[0.25em] text-muted">
                {day.toUpperCase()}
              </h3>
              <span className="font-mono text-xs text-teal">
                {formatDurationLong(dayTotal)}
              </span>
            </div>
            <ul className="space-y-2">
              {list.map((e) => {
                const project = projectById.get(e.projectId)
                return (
                  <li
                    key={e.id}
                    className="panel flex flex-wrap items-center justify-between gap-3 px-4 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 shrink-0"
                        style={{ background: project?.color ?? '#6b6b6b' }}
                        aria-hidden
                      />
                      <span className="font-semibold">
                        {project?.name ?? 'Deleted project'}
                      </span>
                      <span className="font-mono text-xs text-muted">
                        {fmtRange(e)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm">
                        {formatDurationLong(e.end ? e.end - e.start : 0)}
                      </span>
                      <button
                        onClick={() => onEdit(e)}
                        className="btn btn-ghost px-2 py-0.5 text-xs uppercase"
                      >
                        Edit
                      </button>
                      {confirmDelete === e.id ? (
                        <span className="flex gap-1">
                          <button
                            onClick={() => {
                              void deleteEntry(e.id)
                              setConfirmDelete(null)
                            }}
                            className="btn btn-primary px-2 py-0.5 text-xs uppercase"
                          >
                            Sure
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="btn btn-ghost px-2 py-0.5 text-xs uppercase"
                          >
                            No
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(e.id)}
                          className="btn btn-ghost px-2 py-0.5 text-xs uppercase text-alert hover:!border-alert hover:!text-alert"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
