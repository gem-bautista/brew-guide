import { POUR_KINDS, RecipeSchema, type Brewer, type Recipe, type Step } from './schema'
import { formatClock, parseClock, uid } from './clock'

type Kind = Step['kind']
type Scale = Recipe['grind']['scale']

export interface StepDraft {
  key: string
  kind: Kind
  /** m:ss or seconds, as typed. */
  start: string
  water: string
  instruction: string
}

/** The editor's form state: everything the user types stays a string until it is validated. */
export interface RecipeDraft {
  id: string
  name: string
  brewer: Brewer
  dose: string
  /** Grams of ice in the Server, or '' for a hot recipe. */
  ice: string
  temp: string
  grindScale: Scale
  zp6: string
  zp6Estimated: boolean
  authorText: string
  microns: string
  scalable: boolean
  timingNote: string
  notes: string
  steps: StepDraft[]
  total: string
  /** The recipe's photo as stored on the recipe, or '' for none. */
  photo: string
  /** Fields the editor does not show but must carry over unchanged. */
  keep: Pick<Recipe, 'family' | 'copiedFromId' | 'source' | 'verification' | 'createdAt' | 'photoAlt'>
}

export const carriesWater = (kind: Kind) => (POUR_KINDS as readonly string[]).includes(kind)

export const newStepDraft = (kind: Kind = 'pour'): StepDraft => ({
  key: uid(), kind, start: '', water: carriesWater(kind) ? '50' : '', instruction: '',
})

/** The pre-filled shape a new recipe starts from: a standard 15 g V60. */
export function templateDraft(): RecipeDraft {
  const step = (kind: Kind, start: string, water: string, instruction: string): StepDraft => ({ key: uid(), kind, start, water, instruction })
  return {
    id: uid(), name: '', brewer: 'V60', dose: '15', ice: '', temp: '94', grindScale: 'medium-fine', zp6: '', zp6Estimated: false,
    authorText: '', microns: '', scalable: true, timingNote: '', notes: '',
    steps: [
      step('bloom', '0:00', '45', 'Wet all the grounds.'),
      step('swirl', '0:10', '', 'Swirl gently so no dry pockets remain.'),
      step('pour', '0:40', '105', 'Pour in slow circles.'),
      step('pour', '1:20', '90', 'Pour the rest in slow circles.'),
    ],
    total: '3:00',
    photo: '',
    keep: {},
  }
}

export function recipeToDraft(r: Recipe): RecipeDraft {
  return {
    id: r.id, name: r.name, brewer: r.brewer, dose: String(r.doseG), ice: r.iceG?.toString() ?? '', temp: String(r.tempC),
    grindScale: r.grind.scale, zp6: r.grind.zp6Clicks?.toString() ?? '', zp6Estimated: r.grind.zp6Estimated,
    authorText: r.grind.authorText ?? '', microns: r.grind.microns?.toString() ?? '',
    scalable: r.scalable, timingNote: r.timingNote ?? '', notes: r.notes ?? '',
    steps: r.steps.map((s) => ({
      key: uid(), kind: s.kind, start: formatClock(s.startSec), water: s.waterG?.toString() ?? '', instruction: s.instruction,
    })),
    total: formatClock(r.totalSec),
    photo: r.photo ?? '',
    keep: { family: r.family, copiedFromId: r.copiedFromId, source: r.source, verification: r.verification, createdAt: r.createdAt, photoAlt: r.photoAlt },
  }
}

/** A personal copy of any recipe, ready to edit. It is only saved when the user saves it. */
export function duplicateDraft(r: Recipe): RecipeDraft {
  const d = recipeToDraft(r)
  return {
    ...d,
    id: uid(),
    name: `${r.name} (copy)`,
    keep: {
      copiedFromId: r.id,
      source: { label: `Copied from ${r.name} by ${r.author}`, url: r.source?.url },
      verification: 'user-supplied',
      photoAlt: d.keep.photoAlt,
    },
  }
}

export type DraftResult = { ok: true; recipe: Recipe } | { ok: false; errors: string[] }

const toNum = (s: string) => (s.trim() === '' ? undefined : Number(s))

export function draftToRecipe(d: RecipeDraft, nowMs: number): DraftResult {
  const errors: string[] = []
  if (!d.name.trim()) errors.push('Give the recipe a name.')
  const dose = toNum(d.dose)
  if (dose === undefined || !(dose > 0)) errors.push('Coffee dose must be a number above 0.')
  const ice = toNum(d.ice)
  if (ice !== undefined && !(Number.isInteger(ice) && ice > 0)) errors.push('Ice must be a whole number of grams above 0, or empty.')
  const temp = toNum(d.temp)
  if (temp === undefined || !(temp >= 60 && temp <= 100)) errors.push('Water temperature must be between 60 and 100 °C.')
  const zp6 = toNum(d.zp6)
  if (zp6 !== undefined && !(zp6 >= 0 && zp6 <= 10)) errors.push('ZP6 clicks must be between 0 and 10, such as 4.7.')
  const microns = toNum(d.microns)
  if (microns !== undefined && !(microns > 0)) errors.push('Microns must be a number above 0.')
  const total = parseClock(d.total)
  if (total === undefined) errors.push('Total brew time must look like 3:30.')
  if (d.steps.length === 0) errors.push('Add at least one step.')

  const steps = d.steps.map((s, i) => {
    const label = `Step ${i + 1}`
    const startSec = parseClock(s.start)
    if (startSec === undefined) errors.push(`${label}: start time must look like 0:45.`)
    let waterG: number | undefined
    if (carriesWater(s.kind)) {
      waterG = toNum(s.water)
      if (waterG === undefined || !Number.isInteger(waterG) || waterG <= 0) errors.push(`${label}: water must be a whole number of grams above 0.`)
    }
    return { id: s.key, kind: s.kind, startSec: startSec ?? 0, waterG, instruction: s.instruction.trim() }
  })
  if (errors.length) return { ok: false, errors }

  // Steps are saved in time order, so the user can add them in any order.
  steps.sort((a, b) => a.startSec - b.startSec)
  const parsed = RecipeSchema.safeParse({
    id: d.id,
    name: d.name.trim(),
    author: 'You',
    origin: 'personal',
    ...d.keep,
    createdAt: d.keep.createdAt ?? nowMs,
    brewer: d.brewer,
    photo: d.photo || undefined,
    doseG: dose,
    iceG: ice,
    tempC: temp,
    grind: {
      scale: d.grindScale,
      zp6Clicks: zp6,
      zp6Estimated: zp6 !== undefined && d.zp6Estimated,
      authorText: d.authorText.trim() || undefined,
      microns,
    },
    scalable: d.scalable,
    timingNote: d.timingNote.trim() || undefined,
    notes: d.notes.trim() || undefined,
    steps,
    totalSec: total,
  })
  if (parsed.success) return { ok: true, recipe: parsed.data }
  return {
    ok: false,
    errors: parsed.error.issues.map((i) =>
      i.path[0] === 'steps' && typeof i.path[1] === 'number' ? `Step ${i.path[1] + 1} (in time order): ${i.message}.` : `${i.message}.`,
    ),
  }
}
