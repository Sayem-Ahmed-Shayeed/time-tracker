import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useProjects } from '../hooks/useProjects'
import { useTimeEntries } from '../hooks/useTimeEntries'
import { formatDurationLong, formatHoursDecimal } from '../lib/format'

type RangeKey = '7d' | '30d' | 'all'

const RANGES: { key: RangeKey; label: string; days: number | null }[] = [
  { key: '7d', label: '7 days', days: 7 },
  { key: '30d', label: '30 days', days: 30 },
  { key: 'all', label: 'All time', days: null },
]

function startOfDay(d: Date): number {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x.getTime()
}

export function ReportsPage() {
  const { projects } = useProjects()
  const { entries } = useTimeEntries()
  const [range, setRange] = useState<RangeKey>('7d')

  const projectById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects])

  const filtered = useMemo(() => {
    const days = RANGES.find((r) => r.key === range)?.days ?? null
    const cutoff = days ? startOfDay(new Date(Date.now() - days * 86_400_000)) : 0
    return entries.filter((e) => e.end !== null && e.end > cutoff)
  }, [entries, range])

  const chartData = useMemo(() => {
    const buckets = new Map<string, Map<string, number>>()
    const days: string[] = []
    const daysN = RANGES.find((r) => r.key === range)?.days
    if (daysN) {
      for (let i = daysN - 1; i >= 0; i--) {
        const day = new Date(Date.now() - i * 86_400_000)
        const label = day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        days.push(label)
        buckets.set(label, new Map())
      }
    }
    for (const e of filtered) {
      const label = new Date(e.start).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
      if (!buckets.has(label)) buckets.set(label, new Map())
      const perProject = buckets.get(label)!
      const ms = (e.end! - e.start) / 3_600_000
      perProject.set(e.projectId, (perProject.get(e.projectId) ?? 0) + ms)
    }
    return days.map((d) => {
      const row: Record<string, string | number> = { day: d }
      for (const [pid, hours] of buckets.get(d) ?? []) {
        row[pid] = Number(hours.toFixed(2))
      }
      return row
    })
  }, [filtered, range])

  const totalsByProject = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of filtered) {
      map.set(e.projectId, (map.get(e.projectId) ?? 0) + (e.end! - e.start))
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([pid, ms]) => ({ project: projectById.get(pid), ms }))
  }, [filtered, projectById])

  const grandTotal = useMemo(
    () => filtered.reduce((sum, entry) => sum + (entry.end! - entry.start), 0),
    [filtered],
  )

  const totalMs = (row: Record<string, string | number>) =>
    Object.entries(row).reduce(
      (sum, [key, value]) => (key === 'day' ? sum : sum + Number(value)),
      0,
    )

  const barColors = useMemo(() => new Map(projects.map((p) => [p.id, p.color])), [projects])

  return (
    <div className="space-y-7 sm:space-y-9">
      <header className="reveal flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="eyebrow">Performance telemetry</p>
          <h1 className="page-title">Reports</h1>
          <p className="page-copy">See where your hours are going and compare the project mix behind your recent work.</p>
        </div>
        <div className="flex w-fit gap-1 rounded-xl border border-line-soft bg-white/[0.018] p-1" role="group" aria-label="Report range">
          {RANGES.map((item) => (
            <button
              key={item.key}
              onClick={() => setRange(item.key)}
              className={`tab-btn min-h-9 px-3 text-xs font-semibold transition ${range === item.key ? 'tab-btn-active' : ''}`}
              aria-pressed={range === item.key}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="surface-elevated reveal reveal-delay-1 overflow-hidden p-5 sm:p-6">
          <p className="eyebrow">Tracked time</p>
          <p className="metric-value mt-3 text-4xl text-hazard sm:text-5xl">{formatDurationLong(grandTotal)}</p>
          <div className="mt-4 flex items-center gap-3 text-xs text-muted">
            <span>{formatHoursDecimal(grandTotal)} decimal hours</span>
            <span className="h-1 w-1 rounded-full bg-line" aria-hidden />
            <span>{filtered.length} entries</span>
          </div>
        </div>

        <div className="panel reveal reveal-delay-1 p-5 sm:p-6">
          <p className="eyebrow">Project mix</p>
          <div className="mt-4 flex min-h-16 flex-col justify-center gap-2.5">
            {totalsByProject.length === 0 ? (
              <p className="text-sm text-muted">No completed time in this range.</p>
            ) : (
              totalsByProject.slice(0, 3).map(({ project, ms }) => {
                const percentage = grandTotal > 0 ? (ms / grandTotal) * 100 : 0
                return (
                  <div key={project?.id ?? '?'} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: project?.color ?? '#686f7b' }} aria-hidden />
                      <span className="truncate text-xs font-medium text-paper">{project?.name ?? 'Deleted project'}</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted">{percentage.toFixed(0)}%</span>
                    <div className="col-span-2 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                      <div className="h-full rounded-full" style={{ width: `${percentage}%`, background: project?.color ?? '#686f7b' }} aria-hidden />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </section>

      <section className="panel reveal reveal-delay-2 overflow-hidden p-4 sm:p-6" aria-labelledby="hours-chart-title">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Daily distribution</p>
            <h2 id="hours-chart-title" className="mt-1 text-sm font-semibold text-paper">Hours per day</h2>
          </div>
          <span className="hidden font-mono text-[9px] tracking-[0.16em] text-muted-2 sm:block">STACKED BY PROJECT</span>
        </div>

        <div className="h-72 w-full sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 6, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,.055)" strokeDasharray="2 5" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="#686f7b"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontFamily: 'SFMono-Regular, monospace', fill: '#7d8490' }}
                dy={8}
              />
              <YAxis
                stroke="#686f7b"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontFamily: 'SFMono-Regular, monospace', fill: '#7d8490' }}
                unit="h"
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,.025)' }}
                contentStyle={{
                  background: 'rgba(17,19,24,.96)',
                  border: '1px solid rgba(255,255,255,.09)',
                  borderRadius: 12,
                  boxShadow: '0 18px 50px rgba(0,0,0,.35)',
                  fontSize: 12,
                }}
                labelStyle={{ color: '#f4f5f7', marginBottom: 5 }}
                itemStyle={{ color: '#9097a3' }}
                formatter={(value, name) => [
                  `${Number(value).toFixed(2)}h`,
                  projectById.get(String(name))?.name ?? String(name),
                ]}
              />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: 10, color: '#9097a3', paddingTop: 16 }}
              />
              {projects.map((project) => (
                <Bar
                  key={project.id}
                  dataKey={project.id}
                  name={project.name}
                  stackId="a"
                  fill={barColors.get(project.id)}
                  maxBarSize={38}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel reveal reveal-delay-3 overflow-hidden" aria-labelledby="project-breakdown-title">
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-4 sm:px-6">
          <div>
            <p className="eyebrow">Breakdown</p>
            <h2 id="project-breakdown-title" className="mt-1 text-sm font-semibold text-paper">Time by project</h2>
          </div>
          {chartData.length > 0 && (
            <button
              onClick={() => {
                const rows = chartData.map((row) => ({
                  day: row.day,
                  total_hours: Number(totalMs(row).toFixed(2)),
                }))
                const csv = ['day,total_hours', ...rows.map((row) => `${row.day},${row.total_hours}`)].join('\n')
                const blob = new Blob([csv], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const anchor = document.createElement('a')
                anchor.href = url
                anchor.download = `time-report-${range}.csv`
                anchor.click()
                URL.revokeObjectURL(url)
              }}
              className="btn btn-ghost min-h-9 px-3 text-xs"
            >
              Export CSV <span aria-hidden>↓</span>
            </button>
          )}
        </div>

        <ul className="divide-y divide-white/[0.055]">
          {totalsByProject.length === 0 && <li className="px-5 py-8 text-center text-sm text-muted sm:px-6">No entries in this range.</li>}
          {totalsByProject.map(({ project, ms }) => {
            const percentage = grandTotal > 0 ? (ms / grandTotal) * 100 : 0
            return (
              <li key={project?.id ?? '?'} className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: project?.color ?? '#686f7b' }} aria-hidden />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-paper">{project?.name ?? 'Deleted project'}</p>
                    <div className="mt-1.5 h-1 max-w-72 overflow-hidden rounded-full bg-white/[0.05]">
                      <div className="h-full rounded-full" style={{ width: `${percentage}%`, background: project?.color ?? '#686f7b' }} aria-hidden />
                    </div>
                  </div>
                </div>
                <span className="font-mono text-sm tabular-nums text-paper">{formatDurationLong(ms)}</span>
                <span className="w-12 text-right font-mono text-xs text-muted">{percentage.toFixed(0)}%</span>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
