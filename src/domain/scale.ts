import type { Recipe } from './schema'
import { cumulativeWater } from './cumulative'

/**
 * Rescale a recipe to a new dose, keeping the ratio. Every pour lands on whole grams and
 * the total stays exactly round(total * factor): we round the running totals, then diff them,
 * so rounding error never accumulates. Ice scales too, to whole grams. Timings are left alone.
 */
export function scaleRecipe(recipe: Recipe, newDoseG: number): Recipe {
  if (!recipe.scalable) throw new Error(`${recipe.name} cannot be scaled`)
  if (!(newDoseG > 0)) throw new Error('dose must be positive')
  const factor = newDoseG / recipe.doseG
  const scaledTotals = cumulativeWater(recipe.steps).map((c) => Math.round(c * factor))
  let prev = 0
  const steps = recipe.steps.map((s, i) => {
    if (s.waterG === undefined) return s
    const cum = scaledTotals[i]!
    const waterG = cum - prev
    prev = cum
    return { ...s, waterG }
  })
  const ice = recipe.iceG === undefined ? {} : { iceG: Math.max(1, Math.round(recipe.iceG * factor)) }
  return { ...recipe, doseG: newDoseG, ...ice, steps }
}
