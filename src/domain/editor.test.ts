import { describe, expect, it } from 'vitest'
import { formatClock, parseClock } from './clock'
import { draftToRecipe, duplicateDraft, recipeToDraft, templateDraft } from './draft'
import { exportJson, mergeImported, parseImport } from './transfer'
import { totalWater } from './cumulative'
import { BUILT_IN_RECIPES } from '../data/builtInRecipes'

const filled = () => ({ ...templateDraft(), name: 'My V60' })

describe('clock', () => {
  it('parses m:ss and plain seconds, and rejects the rest', () => {
    expect(parseClock('3:30')).toBe(210)
    expect(parseClock(' 0:05 ')).toBe(5)
    expect(parseClock('45')).toBe(45)
    expect(parseClock('1:75')).toBeUndefined()
    expect(parseClock('abc')).toBeUndefined()
    expect(formatClock(210)).toBe('3:30')
  })
})

describe('draftToRecipe', () => {
  it('turns the template into a valid personal recipe', () => {
    const r = draftToRecipe(filled(), 1000)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.recipe.origin).toBe('personal')
      expect(r.recipe.author).toBe('You')
      expect(r.recipe.createdAt).toBe(1000)
      expect(totalWater(r.recipe)).toBe(240)
    }
  })
  it('sorts steps into time order', () => {
    const d = filled()
    d.steps.reverse()
    const r = draftToRecipe(d, 0)
    expect(r.ok && r.recipe.steps.map((s) => s.startSec)).toEqual([0, 10, 40, 80])
  })
  it('explains every problem in plain words', () => {
    const d = { ...filled(), name: ' ', dose: '0', total: 'soon' }
    d.steps[0]!.water = ''
    d.steps[1]!.instruction = ''
    const r = draftToRecipe(d, 0)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.errors).toContain('Give the recipe a name.')
      expect(r.errors).toContain('Coffee dose must be a number above 0.')
      expect(r.errors).toContain('Total brew time must look like 3:30.')
      expect(r.errors).toContain('Step 1: water must be a whole number of grams above 0.')
      expect(r.errors).toContain('Step 2: write what to do.')
    }
  })
  it('rejects two steps at the same time and a brew that ends too soon', () => {
    const d = filled()
    d.steps[3]!.start = '0:40'
    expect(draftToRecipe(d, 0).ok).toBe(false)
    expect(draftToRecipe({ ...filled(), total: '1:00' }, 0).ok).toBe(false)
  })
  it('only marks ZP6 clicks as estimated when a value is given', () => {
    const r = draftToRecipe({ ...filled(), zp6: '', zp6Estimated: true }, 0)
    expect(r.ok && r.recipe.grind.zp6Estimated).toBe(false)
  })
  it('round-trips a built-in through the draft', () => {
    const original = BUILT_IN_RECIPES[0]!
    const r = draftToRecipe(recipeToDraft(original), 0)
    expect(r.ok && r.recipe.steps.map((s) => [s.startSec, s.waterG])).toEqual(original.steps.map((s) => [s.startSec, s.waterG]))
  })
})

describe('duplicateDraft', () => {
  it('makes a new personal copy that remembers where it came from', () => {
    const original = BUILT_IN_RECIPES[0]!
    const d = duplicateDraft(original)
    expect(d.id).not.toBe(original.id)
    const r = draftToRecipe(d, 5)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.recipe.name).toBe(`${original.name} (copy)`)
      expect(r.recipe.copiedFromId).toBe(original.id)
      expect(r.recipe.origin).toBe('personal')
      expect(r.recipe.source?.label).toContain(original.author)
    }
  })
})

describe('export and import', () => {
  const mine = (id: string) => {
    const r = draftToRecipe({ ...filled(), id }, 1)
    if (!r.ok) throw new Error('bad fixture')
    return r.recipe
  }
  it('round-trips personal recipes and favorites', () => {
    const text = exportJson([mine('a'), mine('b')], new Set(['a', 'kasuya-46-balanced']))
    const back = parseImport(text)
    expect(back.ok && back.recipes.map((r) => r.id)).toEqual(['a', 'b'])
    expect(back.ok && back.favorites).toEqual(['a', 'kasuya-46-balanced'])
  })
  it('rejects non-backups and skips invalid recipes', () => {
    expect(parseImport('nope').ok).toBe(false)
    expect(parseImport('{"hello":1}').ok).toBe(false)
    const text = JSON.stringify({ app: 'brew-guide', version: 1, recipes: [mine('a'), { id: 'bad' }] })
    const back = parseImport(text)
    expect(back.ok && back.skipped).toBe(1)
    expect(back.ok && back.recipes).toHaveLength(1)
  })
  it('forces imported recipes to be personal', () => {
    const text = JSON.stringify({ app: 'brew-guide', version: 1, recipes: [{ ...mine('a'), origin: 'built-in' }] })
    const back = parseImport(text)
    expect(back.ok && back.recipes[0]!.origin).toBe('personal')
  })
  it('merges by id and gives built-in ids a fresh one', () => {
    const merged = mergeImported([mine('a')], [{ ...mine('a'), name: 'Changed' }, mine('kasuya-46-balanced'), mine('c')], new Set(['kasuya-46-balanced']), () => 'fresh')
    expect(merged.map((r) => r.id)).toEqual(['a', 'fresh', 'c'])
    expect(merged[0]!.name).toBe('Changed')
  })
})
