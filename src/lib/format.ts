export const PROJECT_COLORS = [
  '#ffb400',
  '#2de1c2',
  '#ff5c39',
  '#7c6cff',
  '#3b82f6',
  '#f472b6',
  '#22c55e',
  '#e6e6e6',
]

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function formatDurationLong(ms: number): string {
  const hours = ms / 3_600_000
  if (hours >= 1) {
    const whole = Math.floor(hours)
    const mins = Math.round((hours - whole) * 60)
    return mins > 0 ? `${whole}h ${mins}m` : `${whole}h`
  }
  return `${Math.round(ms / 60000)}m`
}

export function formatHoursDecimal(ms: number): string {
  return (ms / 3_600_000).toFixed(2)
}

export function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function fromLocalInputValue(value: string): Date {
  return new Date(value)
}
