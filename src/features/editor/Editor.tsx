import { useState } from 'react'
import { BREWERS, GRIND_SCALE, STEP_KINDS, type Recipe } from '../../domain/schema'
import { carriesWater, draftToRecipe, newStepDraft, type RecipeDraft, type StepDraft } from '../../domain/draft'
import { Select } from '../../ui/Select'

const KIND_LABEL: Record<(typeof STEP_KINDS)[number], string> = {
  pour: 'Pour', bloom: 'Bloom', stir: 'Stir', swirl: 'Swirl', wait: 'Wait', press: 'Press', drawdown: 'Drain',
}

const input = 'h-12 w-full rounded-xl border-2 border-line bg-surface px-3 text-base text-ink'
const area = 'w-full rounded-xl border-2 border-line bg-surface px-3 py-2 text-base text-ink'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-sm text-ink-soft">{hint}</span>}
    </label>
  )
}

export function Editor({ initial, title, cancelHref, onSave }: {
  initial: RecipeDraft
  title: string
  cancelHref: string
  onSave: (recipe: Recipe) => void
}) {
  const [d, setD] = useState(initial)
  const [errors, setErrors] = useState<string[]>([])
  const set = (patch: Partial<RecipeDraft>) => setD((prev) => ({ ...prev, ...patch }))
  const setStep = (key: string, patch: Partial<StepDraft>) =>
    setD((prev) => ({ ...prev, steps: prev.steps.map((s) => (s.key === key ? { ...s, ...patch } : s)) }))

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    const result = draftToRecipe(d, Date.now())
    if (result.ok) onSave(result.recipe)
    else {
      setErrors(result.errors)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <form onSubmit={save} className="mx-auto max-w-xl space-y-6 p-6 pb-16" noValidate>
      <a href={cancelHref} className="inline-block py-2 text-ink-soft underline underline-offset-4">Cancel</a>
      <h1 className="font-display text-4xl font-normal">{title}</h1>

      {errors.length > 0 && (
        <div role="alert" className="rounded-2xl border-2 border-accent p-4">
          <p className="font-semibold">Fix {errors.length === 1 ? 'this' : 'these'} before saving:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">{errors.map((m) => <li key={m}>{m}</li>)}</ul>
        </div>
      )}

      <Field label="Name"><input className={input} value={d.name} onChange={(e) => set({ name: e.target.value })} /></Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Brewer">
          <Select className={input} value={d.brewer} onChange={(e) => set({ brewer: e.target.value as RecipeDraft['brewer'] })}>
            {BREWERS.map((b) => <option key={b}>{b}</option>)}
          </Select>
        </Field>
        <Field label="Coffee (g)"><input className={input} inputMode="decimal" value={d.dose} onChange={(e) => set({ dose: e.target.value })} /></Field>
        <Field label="Water temperature (°C)"><input className={input} inputMode="numeric" value={d.temp} onChange={(e) => set({ temp: e.target.value })} /></Field>
        <Field label="Total brew time" hint="Like 3:30">
          <input className={input} value={d.total} onChange={(e) => set({ total: e.target.value })} />
        </Field>
      </div>

      <fieldset className="space-y-4">
        <legend className="mb-1 font-display text-2xl font-normal">Grind</legend>
        <Field label="Grind size">
          <Select className={input} value={d.grindScale} onChange={(e) => set({ grindScale: e.target.value as RecipeDraft['grindScale'] })}>
            {GRIND_SCALE.map((g) => <option key={g}>{g}</option>)}
          </Select>
        </Field>
        <Field label="ZP6 Special setting" hint="Number and clicks, so 4.7 is number 4, click 7. Leave empty if you don't know.">
          <input className={input} inputMode="decimal" value={d.zp6} onChange={(e) => set({ zp6: e.target.value })} />
        </Field>
        <label className="flex items-center gap-3 py-1">
          <input type="checkbox" className="h-6 w-6 accent-[var(--accent)]" checked={d.zp6Estimated} onChange={(e) => set({ zp6Estimated: e.target.checked })} />
          <span>This setting is a guess, not dialed in</span>
        </label>
        <Field label="Author's grind wording or grinder setting">
          <input className={input} value={d.authorText} onChange={(e) => set({ authorText: e.target.value })} />
        </Field>
        <Field label="Microns (optional)"><input className={input} inputMode="numeric" value={d.microns} onChange={(e) => set({ microns: e.target.value })} /></Field>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-1 font-display text-2xl font-normal">Steps</legend>
        <p className="text-ink-soft">Start times count from the beginning of the brew. Steps are saved in time order.</p>
        {d.steps.map((s, i) => (
          <div key={s.key} className="space-y-3 rounded-2xl border-2 border-line p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Step {i + 1}</span>
              <button type="button" className="py-1 text-ink-soft underline underline-offset-4"
                onClick={() => setD((prev) => ({ ...prev, steps: prev.steps.filter((x) => x.key !== s.key) }))}>
                Remove step {i + 1}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Type">
                <Select className={input} value={s.kind}
                  onChange={(e) => {
                    const kind = e.target.value as StepDraft['kind']
                    setStep(s.key, { kind, water: carriesWater(kind) ? s.water || '50' : '' })
                  }}>
                  {STEP_KINDS.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
                </Select>
              </Field>
              <Field label="Starts at"><input className={input} value={s.start} placeholder="0:45" onChange={(e) => setStep(s.key, { start: e.target.value })} /></Field>
              {carriesWater(s.kind) && (
                <Field label="Water (g)"><input className={input} inputMode="numeric" value={s.water} onChange={(e) => setStep(s.key, { water: e.target.value })} /></Field>
              )}
            </div>
            <Field label="What to do">
              <textarea className={area} rows={2} value={s.instruction} onChange={(e) => setStep(s.key, { instruction: e.target.value })} />
            </Field>
          </div>
        ))}
        <button type="button" className="h-14 w-full rounded-2xl border-2 border-line bg-surface text-lg font-semibold"
          onClick={() => setD((prev) => ({ ...prev, steps: [...prev.steps, newStepDraft()] }))}>
          Add step
        </button>
      </fieldset>

      <Field label="Temperature or timing note (optional)">
        <textarea className={area} rows={2} value={d.timingNote} onChange={(e) => set({ timingNote: e.target.value })} />
      </Field>
      <Field label="Notes (optional)">
        <textarea className={area} rows={3} value={d.notes} onChange={(e) => set({ notes: e.target.value })} />
      </Field>
      <label className="flex items-center gap-3 py-1">
        <input type="checkbox" className="h-6 w-6 accent-[var(--accent)]" checked={d.scalable} onChange={(e) => set({ scalable: e.target.checked })} />
        <span>Water amounts scale with the coffee dose</span>
      </label>

      <button type="submit" className="h-16 w-full rounded-2xl bg-accent text-xl font-semibold text-accent-ink">Save recipe</button>
    </form>
  )
}
