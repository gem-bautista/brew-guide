import { z } from 'zod'
import { RecipeSchema } from '../domain/schema'
import type { Recipe } from '../domain/schema'
import type { Session } from '../domain/session'

const KEY = 'brew-guide:active-session'

const StoredSchema = z.object({
  recipe: RecipeSchema,
  session: z.object({
    startedAtMs: z.number(),
    pausedAtMs: z.number().optional(),
    pausedTotalMs: z.number(),
    skippedSec: z.number(),
  }),
})

export interface StoredSession {
  recipe: Recipe
  session: Session
}

export function loadActiveSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = StoredSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export function saveActiveSession(value: StoredSession): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    /* storage unavailable: the brew still runs, it just can't be resumed */
  }
}

export function clearActiveSession(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
