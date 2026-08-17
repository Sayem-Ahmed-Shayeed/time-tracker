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
  { key: '7d', label: '7 DAYS', days: 7 },
  { key: '30d', label: '30 DAYS', days: 30 },
  { key: 'all', label: 'ALL TIME', days: null },
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

  const projectById = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects],
  )

  const filtered = useMemo(() => {
    const days = RANGES.find((r) => r.key === range)?.days ?? null
    const cutoff = days
      ? startOfDay(new Date(Date.now() - days * 86_400_000))
      : 0
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
    () => filtered.reduce((s, e) => s + (e.end! - e.start), 0),
    [filtered],
  )

  const totalMs = (row: Record<string, string | number>) =>
    Object.entries(row).reduce(
      (sum, [k, v]) => (k === 'day' ? sum : sum + Number(v)),
      0,
    )

  const barColors = useMemo(
    () => new Map(projects.map((p) => [p.id, p.color])),
    [projects],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-muted">
            REPORTS / TELEMETRY
          </p>
          <h1 className="font-display text-3xl uppercase">Reports</h1>
        </div>
        <div className="flex gap-1 border border-line">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`btn px-3 py-1.5 text-xs uppercase ${
                range === r.key ? 'btn-primary' : 'btn-ghost border-0'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="panel panel-ticks p-4">
        <p className="mb-3 font-mono text-[10px] tracking-[0.3em] text-muted">
          HOURS PER DAY
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid stroke="#2a2a2a" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="#9a9a9a"
                tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
              />
              <YAxis
                stroke="#9a9a9a"
                tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
                unit="h"
              />
              <Tooltip
                contentStyle={{
                  background: '#171717',
                  border: '1px solid #2a2a2a',
                  borderRadius: 0,
                  fontSize: 12,
                }}
                labelStyle={{ color: '#e6e6e6' }}
                formatter={(value, name) => [
                  `${Number(value).toFixed(2)}h`,
                  projectById.get(String(name))?.name ?? String(name),
                ]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {projects.map((p) => (
                <Bar
                  key={p.id}
                  dataKey={p.id}
                  name={p.name}
                  stackId="a"
                  fill={barColors.get(p.id)}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="panel panel-ticks p-5">
          <p className="font-mono text-[10px] tracking-[0.3em] text-muted">
            TOTAL
          </p>
          <p className="mt-2 font-mono text-4xl font-semibold text-hazard">
            {formatDurationLong(grandTotal)}
          </p>
          <p className="mt-1 font-mono text-xs text-muted">
            {formatHoursDecimal(grandTotal)} h
          </p>
        </div>

        <div className="panel panel-ticks p-5">
          <p className="font-mono text-[10px] tracking-[0.3em] text-muted">
            PER PROJECT
          </p>
          <ul className="mt-3 space-y-2">
            {totalsByProject.length === 0 && (
              <li className="text-sm text-muted">No entries in range.</li>
            )}
            {totalsByProject.map(({ project, ms }) => (
              <li key={project?.id ?? '?'} className="flex items-center gap-3">
                <span
                  className="h-3 w-3 shrink-0"
                  style={{ background: project?.color ?? '#6b6b6b' }}
                  aria-hidden
                />
                <span className="flex-1 truncate text-sm font-medium">
                  {project?.name ?? 'Deleted project'}
                </span>
                <span className="font-mono text-sm">{formatDurationLong(ms)}</span>
                <span className="w-16 text-right font-mono text-xs text-muted">
                  {((ms / grandTotal) * 100).toFixed(0)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {chartData.length > 0 && (
        <button
          onClick={() => {
            const rows = chartData.map((row) => ({
              day: row.day,
              total_hours: Number(totalMs(row).toFixed(2)),
            }))
            const csv = [
              'day,total_hours',
              ...rows.map((r) => `${r.day},${r.total_hours}`),
            ].join('\n')
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `time-report-${range}.csv`
            a.click()
            URL.revokeObjectURL(url)
          }}
          className="btn btn-ghost px-4 py-2 text-xs uppercase"
        >
          Export CSV
        </button>
      )}
    </div>
  )
}
