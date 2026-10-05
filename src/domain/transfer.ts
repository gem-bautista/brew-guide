import { z } from 'zod'
import { RecipeSchema, type Recipe } from './schema'

const FileSchema = z.object({
  app: z.literal('brew-guide'),
  version: z.literal(1),
  recipes: z.array(z.unknown()),
  favorites: z.array(z.string()).default([]),
})

export function exportJson(personal: readonly Recipe[], favorites: ReadonlySet<string>): string {
  return JSON.stringify({ app: 'brew-guide', version: 1, recipes: personal, favorites: [...favorites] }, null, 2)
}

export type ImportResult =
  | { ok: true; recipes: Recipe[]; favorites: string[]; skipped: number }
  | { ok: false; error: string }

/** Reads a backup file. Recipes that fail validation are skipped, and every imported recipe becomes a personal one. */
export function parseImport(text: string): ImportResult {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' }
  }
  const file = FileSchema.safeParse(json)
  if (!file.success) return { ok: false, error: 'That file is not a Brew Guide backup.' }
  const recipes: Recipe[] = []
  let skipped = 0
  for (const raw of file.data.recipes) {
    const r = RecipeSchema.safeParse(raw)
    if (r.success) recipes.push({ ...r.data, origin: 'personal' })
    else skipped++
  }
  return { ok: true, recipes, favorites: file.data.favorites, skipped }
}

/** Adds imported recipes to the existing ones. Same id replaces; an id that belongs to a built-in gets a fresh one. */
export function mergeImported(
  existing: readonly Recipe[],
  imported: readonly Recipe[],
  reservedIds: ReadonlySet<string>,
  newId: () => string,
): Recipe[] {
  const out = [...existing]
  for (const r of imported) {
    const recipe = reservedIds.has(r.id) ? { ...r, id: newId() } : r
    const at = out.findIndex((e) => e.id === recipe.id)
    if (at >= 0) out[at] = recipe
    else out.push(recipe)
  }
  return out
}
