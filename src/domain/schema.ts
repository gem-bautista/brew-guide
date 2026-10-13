import { z } from 'zod'

export const BREWERS = ['V60', 'Kalita Wave', 'Chemex', 'Aeropress', 'Origami', 'April', 'Orea', 'Other'] as const
export const STEP_KINDS = ['pour', 'bloom', 'stir', 'swirl', 'wait', 'press', 'drawdown'] as const
export const GRIND_SCALE = ['extra-fine', 'fine', 'medium-fine', 'medium', 'medium-coarse', 'coarse'] as const

/** Step kinds that add water to the coffee. */
export const POUR_KINDS = ['pour', 'bloom'] as const

export const StepSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(STEP_KINDS),
  /** Seconds from the start of the brew. */
  startSec: z.number().int().min(0),
  /** Grams of water added in this step; only pours and blooms carry water. */
  waterG: z.number().int().positive().optional(),
  instruction: z.string().min(1),
})

export const RecipeSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    author: z.string().min(1),
    family: z.string().optional(),
    origin: z.enum(['built-in', 'personal']),
    copiedFromId: z.string().optional(),
    source: z.object({ label: z.string().min(1), url: z.url().optional() }).optional(),
    /** How well the numbers are backed: author or official page, partial (secondary host or fragmentary), or supplied by the user. */
    verification: z.enum(['verified', 'partial', 'user-supplied']).optional(),
    brewer: z.enum(BREWERS),
    /**
     * A built-in's bundled photo (`photos/recipes/<id>.jpg`) or a photo the
     * user added, stored inline as a JPEG data URL. Nothing else is accepted,
     * so an imported backup cannot make the app load an image from elsewhere.
     */
    photo: z.string().regex(/^(photos\/recipes\/[a-z0-9-]+\.jpg|data:image\/jpeg;base64,[A-Za-z0-9+/=]+)$/).optional(),
    photoAlt: z.string().optional(),
    doseG: z.number().positive(),
    tempC: z.number().min(60).max(100),
    grind: z.object({
      scale: z.enum(GRIND_SCALE),
      /** 1Zpresso ZP6 click setting; decimals allowed (e.g. 7.2). */
      zp6Clicks: z.number().min(0).max(10).optional(),
      zp6Estimated: z.boolean().default(false),
      authorText: z.string().optional(),
      microns: z.number().positive().optional(),
    }),
    scalable: z.boolean().default(true),
    timingNote: z.string().optional(),
    notes: z.string().optional(),
    steps: z.array(StepSchema).min(1),
    /** Seconds from the start of the brew to its end. */
    totalSec: z.number().int().positive(),
    createdAt: z.number().int().optional(),
  })
  .superRefine((r, ctx) => {
    r.steps.forEach((s, i) => {
      const carriesWater = (POUR_KINDS as readonly string[]).includes(s.kind)
      if (carriesWater && s.waterG === undefined)
        ctx.addIssue({ code: 'custom', path: ['steps', i, 'waterG'], message: `${s.kind} step needs water` })
      if (!carriesWater && s.waterG !== undefined)
        ctx.addIssue({ code: 'custom', path: ['steps', i, 'waterG'], message: `${s.kind} step cannot carry water` })
      const prev = r.steps[i - 1]
      if (prev && s.startSec <= prev.startSec)
        ctx.addIssue({ code: 'custom', path: ['steps', i, 'startSec'], message: 'steps must start in increasing order' })
    })
    const last = r.steps[r.steps.length - 1]
    if (last && r.totalSec <= last.startSec)
      ctx.addIssue({ code: 'custom', path: ['totalSec'], message: 'brew must end after the last step starts' })
  })

export type Step = z.infer<typeof StepSchema>
export type Recipe = z.infer<typeof RecipeSchema>
export type Brewer = (typeof BREWERS)[number]
