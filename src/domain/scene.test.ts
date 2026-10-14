import { describe, expect, it } from 'vitest'
import { RecipeSchema, type Recipe } from './schema'
import { drawdownStart, sceneAt, ACTION_SEC } from './scene'
import { stepRows } from './stepRows'
import { countInLeft, elapsedSec, positionAt, skipCountIn, startSession } from './session'
import { POUR_SEC } from './fill'

const make = (steps: unknown[], totalSec = 210, brewer = 'V60'): Recipe =>
  RecipeSchema.parse({
    id: 'r', name: 'r', author: 'A', origin: 'built-in', brewer, doseG: 20, tempC: 93,
    grind: { scale: 'medium' }, totalSec, steps,
  })

// 50 + 70 + 60 = 180 g, a swirl during the drawdown, done at 3:30.
const v60 = make([
  { id: 's1', kind: 'bloom', startSec: 0, waterG: 50, instruction: 'Wet the grounds.' },
  { id: 's2', kind: 'pour', startSec: 45, waterG: 70, instruction: '' },
  { id: 's3', kind: 'pour', startSec: 90, waterG: 60, instruction: '' },
  { id: 's4', kind: 'swirl', startSec: 105, instruction: 'Gently.' },
])

const press = make([
  { id: 'p1', kind: 'pour', startSec: 0, waterG: 120, instruction: '' },
  { id: 's1', kind: 'stir', startSec: 60, instruction: '' },
  { id: 's2', kind: 'press', startSec: 70, instruction: '' },
], 130, 'Aeropress')

describe('stepRows', () => {
  it('leads each Pour with its Scale target and adds the Pour amount when it differs', () => {
    const rows = stepRows(v60.steps)
    expect(rows.map((r) => r.title)).toEqual(['Bloom to 50 g', 'Pour to 120 g', 'Pour to 180 g', 'Swirl'])
    expect(rows.map((r) => r.addedG)).toEqual([undefined, 70, 60, undefined])
  })
})

describe('drawdownStart', () => {
  it('starts once the last Pour lands, and a later Swirl does not delay it', () => {
    expect(drawdownStart(v60)).toBe(90 + POUR_SEC)
  })
  it('starts at a Press Step after the last Pour', () => {
    expect(drawdownStart(press)).toBe(70)
  })
  it('never starts after the brew ends', () => {
    const tight = make([{ id: 'a', kind: 'pour', startSec: 0, waterG: 100, instruction: '' }], 5)
    expect(drawdownStart(tight)).toBe(5)
  })
})

describe('sceneAt', () => {
  it('holds what was poured in the Brewer until the Drawdown', () => {
    const s = sceneAt(v60, 30)
    expect(s.inBrewer).toBeCloseTo(50 / 180)
    expect(sceneAt(v60, 60).inBrewer).toBeCloseTo(120 / 180)
    expect(s.inServer).toBe(0)
    expect(s.draining).toBe(false)
  })
  it('empties the Brewer into the Server through the Drawdown', () => {
    const start = 90 + POUR_SEC
    const half = sceneAt(v60, (start + 210) / 2)
    expect(half.draining).toBe(true)
    expect(half.inBrewer).toBeCloseTo(0.5)
    expect(half.inServer).toBeCloseTo(0.5)
    const end = sceneAt(v60, 210)
    expect(end.inBrewer).toBe(0)
    expect(end.inServer).toBe(1)
  })
  it('shows the kettle only while a Pour lands', () => {
    expect(sceneAt(v60, 2).pouring).toBe(true)
    expect(sceneAt(v60, POUR_SEC + 1).pouring).toBe(false)
    expect(sceneAt(v60, 46).pouring).toBe(true)
  })
  it('blooms after a bloom Pour and stops once a regular Pour lands', () => {
    expect(sceneAt(v60, 20).blooming).toBe(true)
    expect(sceneAt(v60, 50).blooming).toBe(false)
  })
  it('moves for a Swirl or Stir only at the start of that Step', () => {
    expect(sceneAt(v60, 106).swirling).toBe(true)
    expect(sceneAt(v60, 105 + ACTION_SEC + 1).swirling).toBe(false)
    expect(sceneAt(press, 61).stirring).toBe(true)
  })
  it('presses the AeroPress from the Press Step to the end', () => {
    expect(sceneAt(press, 65).pressing).toBe(false)
    const mid = sceneAt(press, 100)
    expect(mid.pressing).toBe(true)
    expect(mid.inBrewer).toBeCloseTo(0.5)
  })
})

describe('Count-in', () => {
  it('holds the clock at 0:00 until the Count-in runs out', () => {
    const s = startSession(1000, 3)
    expect(countInLeft(s, 1000)).toBe(3)
    expect(elapsedSec(s, 2500)).toBe(0)
    expect(countInLeft(s, 4000)).toBe(0)
    expect(elapsedSec(s, 6000)).toBe(2)
  })
  it('can be skipped, starting the clock at once on the first Step', () => {
    const s = skipCountIn(startSession(1000, 3), 2000)
    expect(countInLeft(s, 2000)).toBe(0)
    expect(elapsedSec(s, 3000)).toBe(1)
    expect(positionAt(v60.steps, v60.totalSec, elapsedSec(s, 3000)).stepIndex).toBe(0)
  })
})
