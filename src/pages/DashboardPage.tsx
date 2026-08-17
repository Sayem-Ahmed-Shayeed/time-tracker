import { Link } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useTimeEntries } from '../hooks/useTimeEntries'
import { TimerPanel } from '../components/TimerPanel'
import { formatDurationLong } from '../lib/format'

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="panel panel-ticks p-5">
      <p className="font-mono text-[10px] tracking-[0.3em] text-muted">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold" style={{ color: accent ?? undefined }}>
        {value}
      </p>
    </div>
  )
}

export function DashboardPage() {
  const { projects } = useProjects()
  const { entries } = useTimeEntries()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayMs = entries
    .filter((e) => e.end !== null && e.end > todayStart.getTime())
    .reduce((s, e) => s + (e.end! - e.start), 0)
  const weekStart = Date.now() - 7 * 86_400_000
  const weekMs = entries
    .filter((e) => e.end !== null && e.end > weekStart)
    .reduce((s, e) => s + (e.end! - e.start), 0)
  const activeCount = projects.filter((p) => !p.archived).length
  const completedCount = entries.filter((e) => e.end !== null).length

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[10px] tracking-[0.3em] text-muted">
          CONSOLE / OVERVIEW
        </p>
        <h1 className="font-display text-3xl uppercase">Dashboard</h1>
      </div>

      <TimerPanel projects={projects} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="TODAY" value={formatDurationLong(todayMs)} accent="#ffb400" />
        <Stat label="LAST 7 DAYS" value={formatDurationLong(weekMs)} accent="#2de1c2" />
        <Stat label="ACTIVE PROJECTS" value={String(activeCount)} />
        <Stat label="TOTAL ENTRIES" value={String(completedCount)} />
      </div>

      <div className="panel panel-ticks flex flex-wrap items-center justify-between gap-3 p-5">
        <p className="text-sm text-muted">
          {projects.length === 0
            ? 'Start by creating your first project.'
            : `${activeCount} project${activeCount === 1 ? '' : 's'} tracked.`}
        </p>
        <div className="flex gap-2">
          <Link to="/projects" className="btn btn-ghost px-3 py-1.5 text-xs uppercase">
            Manage projects
          </Link>
          <Link to="/times" className="btn btn-ghost px-3 py-1.5 text-xs uppercase">
            Add entry
          </Link>
          <Link to="/reports" className="btn btn-primary px-3 py-1.5 text-xs uppercase">
            View reports
          </Link>
        </div>
      </div>
    </div>
  )
}
