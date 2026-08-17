import { useEffect, useMemo, useState } from 'react'
import { useTimeEntries } from './useTimeEntries'
import type { Project, TimeEntry } from '../lib/types'

export function useTimer(projects: Project[]) {
  const { runningEntries, addEntry, updateEntry } = useTimeEntries()
  const [now, setNow] = useState(Date.now())

  const anyRunning = runningEntries.length > 0

  useEffect(() => {
    if (!anyRunning) return
    const tick = () => setNow(Date.now())
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [anyRunning, runningEntries])

  const runningProjects = useMemo(
    () =>
      runningEntries.map((entry) => ({
        entry,
        project: projects.find((p) => p.id === entry.projectId) ?? null,
      })),
    [runningEntries, projects],
  )

  async function start(projectId: string) {
    if (runningEntries.some((e) => e.projectId === projectId)) return
    await addEntry({ projectId, start: Date.now(), end: null })
  }

  async function stop(projectId: string) {
    const entry = runningEntries.find((e) => e.projectId === projectId)
    if (!entry) return
    await updateEntry(entry.id, { end: Date.now() })
  }

  function elapsedFor(entry: TimeEntry): number {
    return now - entry.start
  }

  return { runningEntries, runningProjects, elapsedFor, start, stop }
}
