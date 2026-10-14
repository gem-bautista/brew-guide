import type { Recipe } from './schema'
import { fillFraction, POUR_SEC } from './fill'
import { positionAt } from './session'

/** How long a Swirl or Stir is shown moving, at most. */
export const ACTION_SEC = 8

type Brew = Pick<Recipe, 'steps' | 'totalSec'>

/**
 * When the Drawdown starts: at a Press or Drawdown Step after the last Pour
 * begins, or else once the last Pour has landed. A Swirl or Stir after the
 * last Pour happens during the Drawdown and does not delay it.
 */
export function drawdownStart({ steps, totalSec }: Brew, pourSec = POUR_SEC): number {
  let last = -1
  steps.forEach((s, i) => {
    if (s.waterG !== undefined) last = i
  })
  if (last < 0) return totalSec
  const explicit = steps.slice(last + 1).find((s) => s.kind === 'press' || s.kind === 'drawdown')
  if (explicit) return explicit.startSec
  const pour = steps[last]!
  const length = (steps[last + 1]?.startSec ?? totalSec) - pour.startSec
  return Math.min(totalSec, pour.startSec + Math.min(pourSec, length))
}

/** What the illustrated scene shows at one moment of a brew. Fractions are of the recipe's total water. */
export interface SceneState {
  /** Water in the Brewer, 0 to 1. */
  inBrewer: number
  /** Coffee in the Server, 0 to 1. */
  inServer: number
  /** A Pour is landing now: show the kettle and its stream. */
  pouring: boolean
  /** The bloom is going: the bed puffs and bubbles. */
  blooming: boolean
  swirling: boolean
  stirring: boolean
  /** The Drawdown is under way: the Brewer empties into the Server. */
  draining: boolean
  /** The plunger is going down. */
  pressing: boolean
}

/**
 * The scene at `elapsed` seconds. Up to the Drawdown the Brewer holds what has
 * been poured, following the scale. Through the Drawdown it empties steadily
 * into the Server, reaching empty when the brew ends. That drain is drawn for
 * looks only: the real speed depends on the grind and is never measured.
 *
 * Pass `pourSec` 0 for reduced motion, so levels jump instead of easing.
 */
export function sceneAt(recipe: Brew, elapsed: number, pourSec = POUR_SEC): SceneState {
  const poured = fillFraction(recipe, elapsed, pourSec)
  const start = drawdownStart(recipe)
  const draining = elapsed >= start && elapsed < recipe.totalSec
  const left = elapsed >= recipe.totalSec ? 0 : draining ? 1 - (elapsed - start) / (recipe.totalSec - start) : 1
  const inBrewer = poured * left

  const { stepIndex, finished } = positionAt(recipe.steps, recipe.totalSec, elapsed)
  const step = finished || stepIndex < 0 ? undefined : recipe.steps[stepIndex]
  const into = step ? elapsed - step.startSec : 0
  const length = step ? (recipe.steps[stepIndex + 1]?.startSec ?? recipe.totalSec) - step.startSec : 0
  const lastPour = recipe.steps.slice(0, stepIndex + 1).reverse().find((s) => s.waterG !== undefined)

  return {
    inBrewer,
    inServer: poured - inBrewer,
    pouring: !!step && step.waterG !== undefined && into < Math.min(POUR_SEC, length),
    blooming: lastPour?.kind === 'bloom' && !draining && !finished,
    swirling: step?.kind === 'swirl' && into < Math.min(ACTION_SEC, length),
    stirring: step?.kind === 'stir' && into < Math.min(ACTION_SEC, length),
    draining,
    pressing: draining && recipe.steps.some((s) => s.kind === 'press' && s.startSec === start),
  }
}
