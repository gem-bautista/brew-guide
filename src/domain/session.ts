import type { Step } from './schema'

/** A live brew's clock. Position is derived from timestamps, so reloads and sleep cannot drift it. */
export interface Session {
  startedAtMs: number
  /** Set while paused. */
  pausedAtMs?: number
  /** Total time spent paused in earlier pauses. */
  pausedTotalMs: number
  /** Seconds the clock was moved forward by advancing to the next step early. */
  skippedSec: number
}

export function startSession(nowMs: number): Session {
  return { startedAtMs: nowMs, pausedTotalMs: 0, skippedSec: 0 }
}

export function pauseSession(s: Session, nowMs: number): Session {
  return s.pausedAtMs === undefined ? { ...s, pausedAtMs: nowMs } : s
}

export function resumeSession(s: Session, nowMs: number): Session {
  if (s.pausedAtMs === undefined) return s
  const { pausedAtMs, ...rest } = s
  return { ...rest, pausedTotalMs: s.pausedTotalMs + (nowMs - pausedAtMs) }
}

/** Seconds on the brew clock (fractional). */
export function elapsedSec(s: Session, nowMs: number): number {
  const end = s.pausedAtMs ?? nowMs
  return Math.max(0, (end - s.startedAtMs - s.pausedTotalMs) / 1000 + s.skippedSec)
}

export interface Position {
  /** Index of the current step, or -1 before the first step starts. */
  stepIndex: number
  /** Seconds until the next step starts (or until the brew ends after the last step). */
  secondsToNext: number
  finished: boolean
}

export function positionAt(steps: readonly Step[], totalSec: number, elapsed: number): Position {
  if (elapsed >= totalSec) return { stepIndex: steps.length - 1, secondsToNext: 0, finished: true }
  let stepIndex = -1
  steps.forEach((s, i) => {
    if (s.startSec <= elapsed) stepIndex = i
  })
  const next = steps[stepIndex + 1]
  return { stepIndex, secondsToNext: (next?.startSec ?? totalSec) - elapsed, finished: false }
}

/** Jump the clock to the start of the next step (or the end of the brew after the last one); later steps then come that much sooner. */
export function advanceEarly(s: Session, steps: readonly Step[], totalSec: number, nowMs: number): Session {
  const elapsed = elapsedSec(s, nowMs)
  const target = steps.find((st) => st.startSec > elapsed)?.startSec ?? totalSec
  return target > elapsed ? { ...s, skippedSec: s.skippedSec + (target - elapsed) } : s
}

/** A stored session older than this is discarded instead of offered for resume. */
export const RESUME_WINDOW_MS = 10 * 60 * 1000

export function isResumable(s: Session, nowMs: number): boolean {
  return nowMs - s.startedAtMs <= RESUME_WINDOW_MS
}

