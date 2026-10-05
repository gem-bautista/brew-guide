import type { Brewer, Recipe } from './schema'

export type SourceFilter = 'all' | 'mine' | 'favorites'
export type TimeBucket = 'any' | 'under-3' | '3-4' | 'over-4'
export type SortKey = 'name' | 'time' | 'recent'

export interface LibraryQuery {
  search: string
  source: SourceFilter
  brewer: Brewer | 'any'
  author: string | 'any'
  time: TimeBucket
  sort: SortKey
}

export const DEFAULT_QUERY: LibraryQuery = { search: '', source: 'all', brewer: 'any', author: 'any', time: 'any', sort: 'name' }

const inBucket = (sec: number, b: TimeBucket) =>
  b === 'any' || (b === 'under-3' && sec < 180) || (b === '3-4' && sec >= 180 && sec <= 240) || (b === 'over-4' && sec > 240)

export function queryRecipes(recipes: readonly Recipe[], q: LibraryQuery, favoriteIds: ReadonlySet<string>): Recipe[] {
  const terms = q.search.toLowerCase().split(/\s+/).filter(Boolean)
  const out = recipes.filter((r) => {
    if (q.source === 'mine' && r.origin !== 'personal') return false
    if (q.source === 'favorites' && !favoriteIds.has(r.id)) return false
    if (q.brewer !== 'any' && r.brewer !== q.brewer) return false
    if (q.author !== 'any' && r.author !== q.author) return false
    if (!inBucket(r.totalSec, q.time)) return false
    const haystack = `${r.name} ${r.author} ${r.notes ?? ''}`.toLowerCase()
    return terms.every((t) => haystack.includes(t))
  })
  const by: Record<SortKey, (a: Recipe, b: Recipe) => number> = {
    name: (a, b) => a.name.localeCompare(b.name),
    time: (a, b) => a.totalSec - b.totalSec || a.name.localeCompare(b.name),
    recent: (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0) || a.name.localeCompare(b.name),
  }
  return out.sort(by[q.sort])
}

export function isFiltered(q: LibraryQuery): boolean {
  return JSON.stringify({ ...q, sort: 'name' }) !== JSON.stringify({ ...DEFAULT_QUERY })
}
