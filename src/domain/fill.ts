import type { Recipe } from './schema'
import { cumulativeWater, totalWater } from './cumulative'
import { positionAt } from './session'

/** Roughly how long one pour takes at the kettle; the drawn water level rises over this span. */
export const POUR_SEC = 10

const easeOut = (p: number) => 1 - (1 - p) ** 2

/**
 * How full to draw the Brewer, from 0 to 1: water poured so far over the
 * recipe's total. During a Pour the level eases from the previous total up to
 * this Pour's, taking `pourSec` or the Step's length, whichever is shorter.
 * It holds between Pours and stays full through the drawdown, so it follows
 * the scale reading rather than the water draining through the bed.
 *
 * Pass `pourSec` 0 to jump straight to each target (for reduced motion).
 */
export function fillFraction(recipe: Pick<Recipe, 'steps' | 'totalSec'>, elapsed: number, pourSec = POUR_SEC): number {
  const total = totalWater(recipe)
  if (total === 0) return 0
  const { stepIndex, finished } = positionAt(recipe.steps, recipe.totalSec, elapsed)
  if (finished) return 1
  if (stepIndex < 0) return 0

  const cumulative = cumulativeWater(recipe.steps)
  const step = recipe.steps[stepIndex]!
  const target = cumulative[stepIndex]!
  const from = target - (step.waterG ?? 0)
  const length = (recipe.steps[stepIndex + 1]?.startSec ?? recipe.totalSec) - step.startSec
  const span = Math.min(pourSec, length)
  const progress = span > 0 ? Math.min(1, (elapsed - step.startSec) / span) : 1
  return (from + (target - from) * easeOut(progress)) / total
}
