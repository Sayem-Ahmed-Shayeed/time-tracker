import { useTimer } from '../hooks/useTimer'
import { formatDuration } from '../lib/format'
import type { Project } from '../lib/types'

export function TimerPanel({ projects }: { projects: Project[] }) {
  const activeProjects = projects.filter((p) => !p.archived)
  const { runningProjects, elapsedFor, start, stop } = useTimer(projects)
  const runningCount = runningProjects.length

  return (
    <section className="surface-elevated reveal reveal-delay-1 overflow-hidden p-5 sm:p-7" aria-label="Live timers">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-teal/[0.045] blur-3xl" aria-hidden />
      <div className="relative">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`status-dot ${runningCount > 0 ? 'status-dot-live' : ''}`}
              style={
                runningCount === 0
                  ? { background: '#686f7b', boxShadow: '0 0 0 4px rgb(104 111 123 / 0.08)' }
                  : undefined
              }
              aria-hidden
            />
            <p className="eyebrow">
              {runningCount > 0
                ? `Tracking · ${runningCount} project${runningCount === 1 ? '' : 's'}`
                : 'Timer ready'}
            </p>
          </div>

          {runningCount === 0 ? (
            <p className="metric-value mt-4 text-[clamp(3.2rem,9vw,6.7rem)] leading-none text-paper" aria-live="off">
              {formatDuration(0)}
            </p>
          ) : (
            <ul className="mt-5 space-y-3">
              {runningProjects.map(({ entry, project }) => (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/[0.07] bg-white/[0.03] px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: project?.color ?? '#686f7b' }}
                      aria-hidden
                    />
                    <span className="truncate text-sm font-medium">
                      {project?.name ?? 'Deleted project'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-2xl leading-none tabular-nums text-paper" aria-live="off">
                      {formatDuration(elapsedFor(entry))}
                    </span>
                    <button
                      onClick={() => void stop(entry.projectId)}
                      className="btn btn-primary px-4 py-2 text-sm"
                    >
                      <span className="h-2 w-2 rounded-[2px] bg-current" aria-hidden />
                      Stop
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-3 text-sm text-muted">
            {runningCount > 0
              ? 'All active sessions sync automatically.'
              : 'Choose projects below to begin sessions in parallel.'}
          </p>
        </div>
      </div>

      <div className="relative mt-7 border-t border-white/[0.07] pt-5">
        {activeProjects.length === 0 ? (
          <p className="text-sm text-muted">Create an active project to start tracking time.</p>
        ) : (
          <div className="flex flex-wrap gap-2" aria-label="Start timer for project">
            {activeProjects.map((project) => {
              const running = runningProjects.some((r) => r.entry.projectId === project.id)
              return (
                <button
                  key={project.id}
                  onClick={() => void start(project.id)}
                  className={`btn min-h-9 px-3 text-xs ${running ? 'border bg-white/[0.055] text-paper' : 'btn-ghost'}`}
                  disabled={running}
                  style={running ? { borderColor: `${project.color}66` } : undefined}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: project.color }} aria-hidden />
                  {project.name}
                  {running ? (
                    <span className="ml-1 text-teal" aria-hidden>●</span>
                  ) : (
                    <span className="ml-1 text-muted-2" aria-hidden>↗</span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
