import { useCallback, useEffect, useRef, useState } from 'react'
import type { Recipe } from '../../domain/schema'
import {
  advanceEarly, COUNT_IN_SEC, countInLeft, elapsedSec, isResumable, pauseSession, positionAt, resumeSession, skipCountIn,
  startSession, type Session,
} from '../../domain/session'
import { clearActiveSession, loadActiveSession, saveActiveSession } from '../../storage/activeSession'

function beep(ctx: AudioContext | null) {
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.frequency.value = 880
  gain.gain.setValueAtTime(0.0001, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.4)
}

/** Drives one brew: the clock, the audio and vibration cue at each step, the wake lock and resume storage. */
export function useBrewSession() {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [resumable, setResumable] = useState<{ recipe: Recipe; session: Session } | null>(() => {
    const stored = loadActiveSession()
    if (stored && isResumable(stored.session, Date.now())) return stored
    if (stored) clearActiveSession()
    return null
  })
  const audio = useRef<AudioContext | null>(null)
  const lastIndex = useRef(-2)

  const paused = session?.pausedAtMs !== undefined
  const elapsed = session ? elapsedSec(session, now) : 0
  const position = recipe && session ? positionAt(recipe.steps, recipe.totalSec, elapsed) : null
  const finished = position?.finished ?? false
  const running = !!session && !paused && !finished
  /** Seconds of Count-in left; 0 once the clock is running. */
  const countIn = session ? countInLeft(session, now) : 0
  const counting = countIn > 0

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setNow(Date.now()), 200)
    return () => clearInterval(id)
  }, [running])

  // Cue each time a new step begins.
  const stepIndex = position?.stepIndex ?? -1
  useEffect(() => {
    if (!running) return
    if (lastIndex.current !== -2 && stepIndex !== lastIndex.current) {
      beep(audio.current)
      navigator.vibrate?.([120, 60, 120])
    }
    lastIndex.current = stepIndex
  }, [stepIndex, running])

  // Cue 0:00 when the Count-in runs out: that is when the first Step begins.
  const wasCounting = useRef(false)
  useEffect(() => {
    if (wasCounting.current && !counting && running) {
      beep(audio.current)
      navigator.vibrate?.([120, 60, 120])
    }
    wasCounting.current = counting
  }, [counting, running])

  // Keep the screen awake while brewing.
  useEffect(() => {
    if (!running || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    navigator.wakeLock.request('screen').then((l) => (lock = l)).catch(() => {})
    return () => void lock?.release().catch(() => {})
  }, [running])

  // Persist so a reload or sleeping phone can resume.
  useEffect(() => {
    if (!recipe || !session) return
    if (finished) clearActiveSession()
    else saveActiveSession({ recipe, session })
  }, [recipe, session, finished])

  const start = useCallback((r: Recipe) => {
    audio.current ??= new AudioContext()
    void audio.current.resume()
    lastIndex.current = -2
    const t = Date.now()
    setNow(t)
    setResumable(null)
    setRecipe(r)
    setSession(startSession(t, COUNT_IN_SEC))
  }, [])

  const resume = useCallback(() => {
    if (!resumable) return
    audio.current ??= new AudioContext()
    void audio.current.resume()
    lastIndex.current = -2
    setNow(Date.now())
    setRecipe(resumable.recipe)
    setSession(resumable.session)
    setResumable(null)
  }, [resumable])

  const discard = useCallback(() => {
    clearActiveSession()
    setResumable(null)
  }, [])

  const togglePause = useCallback(() => {
    setSession((s) => {
      if (!s) return s
      const t = Date.now()
      setNow(t)
      return s.pausedAtMs === undefined ? pauseSession(s, t) : resumeSession(s, t)
    })
  }, [])

  const next = useCallback(() => {
    setSession((s) => {
      if (!s || !recipe) return s
      const t = Date.now()
      setNow(t)
      return countInLeft(s, t) > 0 ? skipCountIn(s, t) : advanceEarly(s, recipe.steps, recipe.totalSec, t)
    })
  }, [recipe])

  const stop = useCallback(() => {
    clearActiveSession()
    setSession(null)
    setRecipe(null)
  }, [])

  return { recipe, session, elapsed, countIn, position, paused, finished, resumable, start, resume, discard, togglePause, next, stop }
}

