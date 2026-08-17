import { useTimer } from '../hooks/useTimer'
import { formatDuration } from '../lib/format'
import type { Project } from '../lib/types'

export function TimerPanel({ projects }: { projects: Project[] }) {
  const activeProjects = projects.filter((p) => !p.archived)
  const { runningProject, elapsed, start, stop } = useTimer(projects)

  return (
    <div className="panel panel-ticks p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-muted">
            LIVE TIMER / {runningProject ? runningProject.name.toUpperCase() : 'IDLE'}
          </p>
          <p
            className="mt-2 font-mono text-5xl font-semibold tabular-nums"
            aria-live="off"
          >
            {formatDuration(elapsed)}
          </p>
        </div>
        <div className="flex gap-2">
          {activeProjects.map((p) => (
            <button
              key={p.id}
              onClick={() => void start(p.id)}
              className="btn btn-ghost px-3 py-1.5 text-sm uppercase"
              disabled={runningProject?.id === p.id}
              style={
                runningProject?.id === p.id
                  ? { borderColor: p.color, color: p.color }
                  : undefined
              }
            >
              <span
                className="mr-1.5 inline-block h-2 w-2"
                style={{ background: p.color }}
                aria-hidden
              />
              {p.name}
            </button>
          ))}
          {runningProject && (
            <button
              onClick={() => void stop()}
              className="btn btn-primary px-4 py-1.5 text-sm uppercase"
            >
              Stop
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
