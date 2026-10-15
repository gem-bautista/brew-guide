import { describe, expect, it } from 'vitest'
import { RecipeSchema, type Recipe } from './schema'
import { cumulativeWater, ratio, totalWater } from './cumulative'
import { scaleRecipe } from './scale'
import {
  advanceEarly, elapsedSec, isResumable, pauseSession, positionAt, resumeSession, startSession,
} from './session'

const base = {
  id: 'r1', name: 'Test 4:6', author: 'Tester', origin: 'built-in', brewer: 'V60',
  doseG: 20, tempC: 93, grind: { scale: 'medium-coarse' }, totalSec: 210,
  steps: [
    { id: 's1', kind: 'bloom', startSec: 0, waterG: 50, instruction: 'Pour 50 g' },
    { id: 's2', kind: 'pour', startSec: 45, waterG: 70, instruction: 'Pour 70 g' },
    { id: 's3', kind: 'pour', startSec: 90, waterG: 60, instruction: 'Pour 60 g' },
    { id: 's4', kind: 'swirl', startSec: 150, instruction: 'Swirl' },
  ],
}
const recipe = RecipeSchema.parse(base) as Recipe

describe('schema', () => {
  it('accepts a valid recipe and applies defaults', () => {
    expect(recipe.scalable).toBe(true)
    expect(recipe.grind.zp6Estimated).toBe(false)
  })
  it('rejects a pour without water', () => {
    const bad = { ...base, steps: [{ id: 's1', kind: 'pour', startSec: 0, instruction: 'x' }] }
    expect(RecipeSchema.safeParse(bad).success).toBe(false)
  })
  it('rejects water on a non-pour step', () => {
    const bad = { ...base, steps: [{ id: 's1', kind: 'wait', startSec: 0, waterG: 10, instruction: 'x' }] }
    expect(RecipeSchema.safeParse(bad).success).toBe(false)
  })
  it('rejects out-of-order starts and a brew that ends too early', () => {
    const steps = [
      { id: 'a', kind: 'wait', startSec: 30, instruction: 'x' },
      { id: 'b', kind: 'wait', startSec: 30, instruction: 'y' },
    ]
    expect(RecipeSchema.safeParse({ ...base, steps }).success).toBe(false)
    expect(RecipeSchema.safeParse({ ...base, totalSec: 150 }).success).toBe(false)
  })
})

describe('cumulative', () => {
  it('derives scale targets and totals', () => {
    expect(cumulativeWater(recipe.steps)).toEqual([50, 120, 180, 180])
    expect(totalWater(recipe)).toBe(180)
    expect(ratio(recipe)).toBe(9)
  })
})

describe('scaleRecipe', () => {
  it('keeps the ratio and lands on whole grams', () => {
    const s = scaleRecipe(recipe, 15)
    expect(s.doseG).toBe(15)
    expect(s.steps.map((x) => x.waterG)).toEqual([38, 52, 45, undefined]) // 37.5, 90, 135 -> 38, 90, 135
    expect(totalWater(s)).toBe(135)
    expect(s.steps.map((x) => x.startSec)).toEqual(recipe.steps.map((x) => x.startSec))
  })
  it('scales the ice with the dose, and adds none to a recipe without it', () => {
    expect(scaleRecipe({ ...recipe, iceG: 80 }, 15).iceG).toBe(60)
    expect(scaleRecipe({ ...recipe, iceG: 80 }, 13).iceG).toBe(52)
    expect('iceG' in scaleRecipe(recipe, 15)).toBe(false)
  })
  it('refuses non-scalable recipes and bad doses', () => {
    expect(() => scaleRecipe({ ...recipe, scalable: false }, 15)).toThrow()
    expect(() => scaleRecipe(recipe, 0)).toThrow()
  })
})

describe('session', () => {
  it('derives position from the clock', () => {
    expect(positionAt(recipe.steps, 210, 0)).toMatchObject({ stepIndex: 0, secondsToNext: 45 })
    expect(positionAt(recipe.steps, 210, 100)).toMatchObject({ stepIndex: 2, secondsToNext: 50 })
    expect(positionAt(recipe.steps, 210, 160)).toMatchObject({ stepIndex: 3, secondsToNext: 50 })
    expect(positionAt(recipe.steps, 210, 210).finished).toBe(true)
  })
  it('excludes paused time', () => {
    let s = startSession(0)
    s = pauseSession(s, 10_000)
    expect(elapsedSec(s, 50_000)).toBe(10)
    s = resumeSession(s, 50_000)
    expect(elapsedSec(s, 60_000)).toBe(20)
  })
  it('advancing early pulls later steps forward', () => {
    let s = startSession(0)
    s = advanceEarly(s, recipe.steps, 210, 40_000) // at 40 s, next step is at 45 s
    expect(elapsedSec(s, 40_000)).toBe(45)
    expect(positionAt(recipe.steps, 210, elapsedSec(s, 40_000)).stepIndex).toBe(1)
    expect(elapsedSec(s, 85_000)).toBe(90) // step 3 comes at 85 s real time
  })
  it('finishing from the last step jumps to the end of the brew', () => {
    const s = advanceEarly(startSession(0), recipe.steps, 210, 160_000)
    expect(positionAt(recipe.steps, 210, elapsedSec(s, 160_000)).finished).toBe(true)
  })
  it('only offers resume for recent sessions', () => {
    const s = startSession(0)
    expect(isResumable(s, 9 * 60_000)).toBe(true)
    expect(isResumable(s, 11 * 60_000)).toBe(false)
  })
})

