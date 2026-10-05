import { z } from 'zod'
import { RecipeSchema, type Recipe } from '../domain/schema'

const FAVORITES_KEY = 'brew-guide:favorites'
const PERSONAL_KEY = 'brew-guide:personal-recipes'

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable: changes last until the page closes */
  }
}

export function loadFavorites(): Set<string> {
  const parsed = z.array(z.string()).safeParse(read(FAVORITES_KEY))
  return new Set(parsed.success ? parsed.data : [])
}

export function saveFavorites(ids: ReadonlySet<string>): void {
  write(FAVORITES_KEY, [...ids])
}

/** Recipes that fail validation are skipped so one bad entry cannot break the Library. */
export function loadPersonalRecipes(): Recipe[] {
  const raw = read(PERSONAL_KEY)
  if (!Array.isArray(raw)) return []
  return raw.flatMap((r) => {
    const parsed = RecipeSchema.safeParse(r)
    return parsed.success && parsed.data.origin === 'personal' ? [parsed.data] : []
  })
}

export function savePersonalRecipes(recipes: readonly Recipe[]): void {
  write(PERSONAL_KEY, recipes)
}
