import { describe, expect, it } from 'vitest'
import { BUILT_IN_RECIPES } from './builtInRecipes'
import { cumulativeWater, totalWater } from '../domain/cumulative'

// Totals taken from each author's published or supplied recipe.
const EXPECTED_WATER: Record<string, number> = {
  'kasuya-46-balanced': 300,
  'kasuya-46-iced': 150,
  'hoffmann-ultimate-v60': 500,
  'hoffmann-better-1-cup-v60': 250,
  'hedrick-1-2-1-v60': 306,
  'hedrick-one-and-done-v60': 225,
  'hedrick-aeropress-1': 120,
  'hedrick-aeropress-2': 120,
  'wac-2025-nemo-pop': 100,
}

describe('built-in recipes', () => {
  it('have unique ids and the stated total water', () => {
    const ids = BUILT_IN_RECIPES.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect([...ids].sort()).toEqual(Object.keys(EXPECTED_WATER).sort())
    for (const r of BUILT_IN_RECIPES) expect(totalWater(r), r.id).toBe(EXPECTED_WATER[r.id])
  })
  it('hit the published scale readings', () => {
    const cum = (id: string) => cumulativeWater(BUILT_IN_RECIPES.find((r) => r.id === id)!.steps)
    expect(cum('kasuya-46-balanced')).toEqual([60, 120, 180, 240, 300])
    expect(cum('kasuya-46-iced')).toEqual([30, 30, 60, 60, 90, 120, 150])
    expect(cum('hoffmann-better-1-cup-v60')).toEqual([50, 50, 100, 150, 200, 250, 250])
  })
  it('label every ZP6 value as an estimate', () => {
    for (const r of BUILT_IN_RECIPES) if (r.grind.zp6Clicks !== undefined) expect(r.grind.zp6Estimated, r.id).toBe(true)
  })
})
