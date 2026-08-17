import { useEffect, useRef, useState } from 'react'
import { useTimeEntries } from './useTimeEntries'
import type { Project } from '../lib/types'

export function useTimer(projects: Project[]) {
  const { runningEntry, addEntry, updateEntry } = useTimeEntries()
  const [elapsed, setElapsed] = useState(0)
  const lastStartRef = useRef(0)

  useEffect(() => {
    if (!runningEntry) {
      setElapsed(0)
      return
    }
    lastStartRef.current = runningEntry.start

    const tick = () => setElapsed(Date.now() - lastStartRef.current)
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [runningEntry])

  async function start(projectId: string) {
    if (runningEntry) {
      if (runningEntry.projectId === projectId) return
      await updateEntry(runningEntry.id, { end: Date.now() })
    }
    await addEntry({ projectId, start: Date.now(), end: null })
  }

  async function stop() {
    if (!runningEntry) return
    await updateEntry(runningEntry.id, { end: Date.now() })
  }

  const runningProject =
    projects.find((p) => p.id === runningEntry?.projectId) ?? null

  return { runningEntry, runningProject, elapsed, start, stop }
}
