/** Seconds as m:ss, rounding up so a countdown never shows 0:00 early. */
export function formatClock(sec: number): string {
  const s = Math.max(0, Math.ceil(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** Reads "3:30" or a plain number of seconds ("210"). Returns undefined for anything else. */
export function parseClock(text: string): number | undefined {
  const t = text.trim()
  const m = /^(\d+):([0-5]?\d)$/.exec(t)
  if (m) return Number(m[1]) * 60 + Number(m[2])
  return /^\d+$/.test(t) ? Number(t) : undefined
}

/** Short random id. crypto.randomUUID is missing on plain-http pages, such as a phone opening the dev server. */
export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}
