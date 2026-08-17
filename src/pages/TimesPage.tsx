import { useState } from 'react'
import { useProjects } from '../hooks/useProjects'
import { useTimeEntries } from '../hooks/useTimeEntries'
import { EntryList } from '../components/EntryList'
import { TimeEntryForm } from '../components/TimeEntryForm'
import type { TimeEntry } from '../lib/types'

export function TimesPage() {
  const { projects } = useProjects()
  const { addEntry, updateEntry } = useTimeEntries()
  const [editing, setEditing] = useState<TimeEntry | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  async function handleSave(data: {
    projectId: string
    start: number
    end: number | null
  }) {
    if (editing) {
      await updateEntry(editing.id, data)
    } else {
      await addEntry(data)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-muted">
            TIME / LOG
          </p>
          <h1 className="font-display text-3xl uppercase">Time entries</h1>
        </div>
        {!formOpen && (
          <button
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
            className="btn btn-primary px-4 py-2 uppercase"
          >
            + Add entry
          </button>
        )}
      </div>

      {(formOpen || editing) && (
        <TimeEntryForm
          projects={projects}
          entry={editing}
          onSave={async (data) => {
            await handleSave(data)
          }}
          onCancel={() => {
            setFormOpen(false)
            setEditing(null)
          }}
        />
      )}

      <EntryList
        projects={projects}
        onEdit={(e) => {
          setEditing(e)
          setFormOpen(true)
        }}
      />
    </div>
  )
}
