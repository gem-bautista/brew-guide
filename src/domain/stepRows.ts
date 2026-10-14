import type { Step } from './schema'
import { cumulativeWater } from './cumulative'

export const STEP_VERB: Record<Step['kind'], string> = {
  pour: 'Pour', bloom: 'Bloom', stir: 'Stir', swirl: 'Swirl', wait: 'Wait', press: 'Press', drawdown: 'Let it drain',
}

/** One line of the Step list, with its title built from the Step's numbers (ADR 0004). */
export interface StepRow {
  id: string
  startSec: number
  /** "Pour to 120 g", "Swirl". A Pour leads with its Scale target. */
  title: string
  /** Grams this Pour adds, when that differs from its Scale target. */
  addedG?: number
  /** The technique, without numbers. May be empty. */
  instruction: string
}

export function stepRows(steps: readonly Step[]): StepRow[] {
  const cumulative = cumulativeWater(steps)
  return steps.map((s, i) => {
    const target = cumulative[i]!
    const pour = s.waterG !== undefined
    return {
      id: s.id,
      startSec: s.startSec,
      title: pour ? `${STEP_VERB[s.kind]} to ${target} g` : STEP_VERB[s.kind],
      addedG: pour && s.waterG !== target ? s.waterG : undefined,
      instruction: s.instruction,
    }
  })
}
