import type { Recipe, Step } from './schema'

/** Running total of water on the scale after each step (non-pour steps repeat the previous total). */
export function cumulativeWater(steps: readonly Step[]): number[] {
  let total = 0
  return steps.map((s) => (total += s.waterG ?? 0))
}

export function totalWater(recipe: Pick<Recipe, 'steps'>): number {
  return recipe.steps.reduce((sum, s) => sum + (s.waterG ?? 0), 0)
}

/** Water per gram of coffee, e.g. 15 for 1:15. */
export function ratio(recipe: Pick<Recipe, 'steps' | 'doseG'>): number {
  return totalWater(recipe) / recipe.doseG
}
