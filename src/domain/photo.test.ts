import { describe, expect, it } from 'vitest'
import { BUILT_IN_RECIPES } from '../data/builtInRecipes'
import { draftToRecipe, recipeToDraft, templateDraft } from './draft'
import { coverCrop } from './photo'
import { RecipeSchema } from './schema'

// Lists the bundled photos without loading them.
const BUNDLED = new Set(Object.keys(import.meta.glob('../../public/photos/recipes/*.jpg')).map((k) => k.replace('../../public/', '')))

describe('coverCrop', () => {
  it('takes a centred 4:5 slice from a landscape video still', () => {
    expect(coverCrop(1280, 720)).toEqual({ x: 352, y: 0, w: 576, h: 720 })
  })
  it('trims top and bottom off a tall phone photo', () => {
    const c = coverCrop(3000, 4000)
    expect(c.w).toBe(3000)
    expect(c.h).toBeCloseTo(3750)
    expect(c.y).toBeCloseTo(125)
  })
})

describe('recipe photos', () => {
  it('gives every built-in a bundled photo that exists, with a description', () => {
    for (const r of BUILT_IN_RECIPES) {
      expect(r.photo, r.id).toBe(`photos/recipes/${r.id}.jpg`)
      expect(BUNDLED.has(r.photo!), r.photo).toBe(true)
      expect(r.photoAlt, r.id).toBeTruthy()
    }
  })

  it('accepts a stored JPEG but never an image from another site', () => {
    const base = BUILT_IN_RECIPES[0]!
    expect(RecipeSchema.safeParse({ ...base, photo: 'data:image/jpeg;base64,/9j/4AAQ' }).success).toBe(true)
    expect(RecipeSchema.safeParse({ ...base, photo: 'https://example.com/track.gif' }).success).toBe(false)
    expect(RecipeSchema.safeParse({ ...base, photo: 'photos/../secret.jpg' }).success).toBe(false)
  })

  it('keeps a photo through the editor, and a new recipe starts without one', () => {
    expect(templateDraft().photo).toBe('')
    const draft = { ...templateDraft(), name: 'Mine', photo: 'data:image/jpeg;base64,/9j/4AAQ' }
    const saved = draftToRecipe(draft, 0)
    expect(saved.ok && saved.recipe.photo).toBe(draft.photo)

    const built = BUILT_IN_RECIPES[0]!
    const again = draftToRecipe(recipeToDraft(built), 0)
    expect(again.ok && again.recipe.photo).toBe(built.photo)
    expect(again.ok && again.recipe.photoAlt).toBe(built.photoAlt)
  })
})
