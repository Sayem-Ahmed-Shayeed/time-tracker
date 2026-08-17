import { Link } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useTimeEntries } from '../hooks/useTimeEntries'
import { TimerPanel } from '../components/TimerPanel'
import { formatDurationLong } from '../lib/format'

function Stat({ label, value, accent, detail }: { label: string; value: string; accent?: string; detail: string }) {
  return (
    <div className="panel panel-interactive reveal reveal-delay-2 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">{label}</p>
        <span className="h-1.5 w-1.5 rounded-full bg-line" style={accent ? { background: accent } : undefined} aria-hidden />
      </div>
      <p className="metric-value mt-5 text-2xl sm:text-3xl" style={{ color: accent ?? undefined }}>{value}</p>
      <p className="mt-1.5 text-xs text-muted-2">{detail}</p>
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
    <div className="space-y-7 sm:space-y-9">
      <header className="reveal flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Workspace overview</p>
          <h1 className="page-title">Your time, in focus.</h1>
          <p className="page-copy">Start a session, check today’s momentum, and keep your project activity moving from one calm workspace.</p>
        </div>
        <Link to="/reports" className="btn btn-ghost w-fit px-4 text-sm">
          Open reports <span aria-hidden>↗</span>
        </Link>
      </header>

      <TimerPanel projects={projects} />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4" aria-label="Time summary">
        <Stat label="Today" value={formatDurationLong(todayMs)} accent="#f6b84a" detail="Completed time" />
        <Stat label="7 days" value={formatDurationLong(weekMs)} accent="#68e0cf" detail="Rolling total" />
        <Stat label="Projects" value={String(activeCount)} detail="Active right now" />
        <Stat label="Entries" value={String(completedCount)} detail="All completed" />
      </section>

      <section className="panel reveal reveal-delay-3 overflow-hidden p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow">Next action</p>
            <h2 className="mt-2 text-lg font-semibold tracking-[-0.025em] text-paper">
              {projects.length === 0 ? 'Build your first project.' : `${activeCount} active project${activeCount === 1 ? '' : 's'} are ready to track.`}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {projects.length === 0
                ? 'Create a project, then use the live timer to start collecting useful time data.'
                : 'Manage your workspace, add a manual entry, or inspect the story behind your tracked hours.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/projects" className="btn btn-ghost px-3.5 text-xs">Manage projects</Link>
            <Link to="/times" className="btn btn-ghost px-3.5 text-xs">Add entry</Link>
            <Link to="/reports" className="btn btn-primary px-3.5 text-xs">View reports <span aria-hidden>→</span></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
