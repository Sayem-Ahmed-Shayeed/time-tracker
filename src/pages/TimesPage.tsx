import { useState } from 'react'
import { useProjects } from '../hooks/useProjects'
import { useTimeEntries } from '../hooks/useTimeEntries'
import { EntryList } from '../components/EntryList'
import { TimeEntryForm } from '../components/TimeEntryForm'
import type { TimeEntry } from '../lib/types'

export function TimesPage() {
  const { projects } = useProjects()
  const { entries, addEntry, updateEntry } = useTimeEntries()
  const [editing, setEditing] = useState<TimeEntry | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  async function handleSave(data: { projectId: string; start: number; end: number | null }) {
    if (editing) {
      await updateEntry(editing.id, data)
    } else {
      await addEntry(data)
    }
  }

  const completedCount = entries.filter((entry) => entry.end !== null).length

  return (
    <div className="space-y-7 sm:space-y-9">
      <header className="reveal flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Recorded activity</p>
          <h1 className="page-title">Time log</h1>
          <p className="page-copy">Review completed sessions, correct recorded time, or add work that happened away from the live timer.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="metric-value text-lg text-paper">{completedCount}</p>
            <p className="text-xs text-muted">Completed entries</p>
          </div>
          {!formOpen && !editing && (
            <button
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
              className="btn btn-primary px-4 py-2.5 text-sm"
            >
              Add entry <span aria-hidden>＋</span>
            </button>
          )}
        </div>
      </header>

      {(formOpen || editing) && (
        <TimeEntryForm
          projects={projects}
          entry={editing}
          onSave={async (data) => { await handleSave(data) }}
          onCancel={() => {
            setFormOpen(false)
            setEditing(null)
          }}
        />
      )}

      <div className="reveal reveal-delay-1">
        <EntryList
          projects={projects}
          onEdit={(entry) => {
            setEditing(entry)
            setFormOpen(true)
          }}
        />
      </div>
    </div>
  )
}
