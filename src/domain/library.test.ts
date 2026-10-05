import { describe, expect, it } from 'vitest'
import { RecipeSchema, type Recipe } from './schema'
import { DEFAULT_QUERY, isFiltered, queryRecipes } from './library'

const make = (id: string, over: Record<string, unknown>): Recipe =>
  RecipeSchema.parse({
    id, name: id, author: 'A', origin: 'built-in', brewer: 'V60', doseG: 15, tempC: 94,
    grind: { scale: 'medium' }, totalSec: 200,
    steps: [{ id: 's', kind: 'pour', startSec: 0, waterG: 250, instruction: 'x' }],
    ...over,
  })

const recipes = [
  make('Alpha four six', { author: 'Kasuya', totalSec: 210, createdAt: 1 }),
  make('Bravo ultimate', { author: 'Hoffmann', totalSec: 170, notes: 'rinse the filter', createdAt: 3 }),
  make('Charlie press', { author: 'Hoffmann', brewer: 'Aeropress', totalSec: 300, origin: 'personal', createdAt: 2 }),
]
const none = new Set<string>()
const names = (q: Partial<typeof DEFAULT_QUERY>, fav = none) =>
  queryRecipes(recipes, { ...DEFAULT_QUERY, ...q }, fav).map((r) => r.id)

describe('queryRecipes', () => {
  it('searches name, author and notes, all terms required', () => {
    expect(names({ search: 'kasuya' })).toEqual(['Alpha four six'])
    expect(names({ search: 'RINSE filter' })).toEqual(['Bravo ultimate'])
    expect(names({ search: 'hoffmann nothing' })).toEqual([])
  })
  it('filters by source, brewer, author and time bucket', () => {
    expect(names({ source: 'mine' })).toEqual(['Charlie press'])
    expect(names({ source: 'favorites' }, new Set(['Bravo ultimate']))).toEqual(['Bravo ultimate'])
    expect(names({ brewer: 'Aeropress' })).toEqual(['Charlie press'])
    expect(names({ author: 'Hoffmann' })).toEqual(['Bravo ultimate', 'Charlie press'])
    expect(names({ time: 'under-3' })).toEqual(['Bravo ultimate'])
    expect(names({ time: '3-4' })).toEqual(['Alpha four six'])
    expect(names({ time: 'over-4' })).toEqual(['Charlie press'])
  })
  it('sorts by name, time and recently added', () => {
    expect(names({ sort: 'time' })).toEqual(['Bravo ultimate', 'Alpha four six', 'Charlie press'])
    expect(names({ sort: 'recent' })).toEqual(['Bravo ultimate', 'Charlie press', 'Alpha four six'])
    expect(names({ sort: 'name' })).toEqual(['Alpha four six', 'Bravo ultimate', 'Charlie press'])
  })
  it('knows when filters are active, ignoring sort', () => {
    expect(isFiltered(DEFAULT_QUERY)).toBe(false)
    expect(isFiltered({ ...DEFAULT_QUERY, sort: 'time' })).toBe(false)
    expect(isFiltered({ ...DEFAULT_QUERY, search: 'x' })).toBe(true)
  })
})
