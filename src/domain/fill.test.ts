import { describe, expect, it } from 'vitest'
import { RecipeSchema, type Recipe } from './schema'
import { fillFraction, POUR_SEC } from './fill'

const make = (steps: unknown[], totalSec = 210): Recipe =>
  RecipeSchema.parse({
    id: 'r', name: 'r', author: 'A', origin: 'built-in', brewer: 'V60', doseG: 20, tempC: 93,
    grind: { scale: 'medium' }, totalSec, steps,
  })

// 50 + 70 + 60 = 180 g, then a swirl and the drawdown.
const recipe = make([
  { id: 's1', kind: 'bloom', startSec: 0, waterG: 50, instruction: 'x' },
  { id: 's2', kind: 'pour', startSec: 45, waterG: 70, instruction: 'x' },
  { id: 's3', kind: 'pour', startSec: 90, waterG: 60, instruction: 'x' },
  { id: 's4', kind: 'swirl', startSec: 150, instruction: 'x' },
])

describe('fillFraction', () => {
  it('starts empty and reaches each pour target once the pour has had time to land', () => {
    expect(fillFraction(recipe, 0)).toBe(0)
    expect(fillFraction(recipe, POUR_SEC)).toBeCloseTo(50 / 180)
    expect(fillFraction(recipe, 45 + POUR_SEC)).toBeCloseTo(120 / 180)
  })

  it('eases out during a pour: fast at first, slowing into the target', () => {
    // Halfway through the bloom's pour, ease-out has covered three quarters of it.
    expect(fillFraction(recipe, POUR_SEC / 2)).toBeCloseTo((50 * 0.75) / 180)
    // The second pour rises from the bloom's level, not from empty.
    expect(fillFraction(recipe, 45 + POUR_SEC / 2)).toBeCloseTo((50 + 70 * 0.75) / 180)
  })

  it('holds its level between pours and through non-pour steps', () => {
    expect(fillFraction(recipe, 30)).toBeCloseTo(50 / 180)
    expect(fillFraction(recipe, 44.9)).toBeCloseTo(50 / 180)
    expect(fillFraction(recipe, 160)).toBe(1)
  })

  it('stays full through the drawdown and after the brew ends', () => {
    expect(fillFraction(recipe, 209)).toBe(1)
    expect(fillFraction(recipe, 210)).toBe(1)
    expect(fillFraction(recipe, 500)).toBe(1)
  })

  it('finishes a pour before the next step when the gap is shorter than a pour', () => {
    const quick = make([
      { id: 'a', kind: 'bloom', startSec: 0, waterG: 40, instruction: 'x' },
      { id: 'b', kind: 'pour', startSec: 4, waterG: 160, instruction: 'x' },
    ], 120)
    expect(fillFraction(quick, 3.99)).toBeCloseTo(40 / 200, 2)
    expect(fillFraction(quick, 2)).toBeCloseTo((40 * 0.75) / 200)
  })

  it('is empty before a late first step and while the recipe pours no water', () => {
    const late = make([
      { id: 'a', kind: 'wait', startSec: 5, instruction: 'x' },
      { id: 'b', kind: 'pour', startSec: 10, waterG: 100, instruction: 'x' },
    ], 60)
    expect(fillFraction(late, 2)).toBe(0)
    expect(fillFraction(late, 7)).toBe(0)
    const dry = make([{ id: 'a', kind: 'stir', startSec: 0, instruction: 'x' }], 30)
    expect(fillFraction(dry, 10)).toBe(0)
    expect(fillFraction(dry, 30)).toBe(0)
  })

  it('jumps straight to each target when the pour time is zero (reduced motion)', () => {
    expect(fillFraction(recipe, 0, 0)).toBeCloseTo(50 / 180)
    expect(fillFraction(recipe, 45, 0)).toBeCloseTo(120 / 180)
  })

  it('never drops and never leaves 0 to 1 over a whole brew', () => {
    let last = 0
    for (let t = 0; t <= 220; t += 0.5) {
      const f = fillFraction(recipe, t)
      expect(f).toBeGreaterThanOrEqual(last)
      expect(f).toBeLessThanOrEqual(1)
      last = f
    }
  })
})
