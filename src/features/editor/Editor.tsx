import { useState } from 'react'
import { BREWERS, GRIND_SCALE, STEP_KINDS, type Recipe } from '../../domain/schema'
import { carriesWater, draftToRecipe, newStepDraft, type RecipeDraft, type StepDraft } from '../../domain/draft'
import { Select } from '../../ui/Select'
import { photoFromFile } from '../../ui/photoFromFile'
import { Wordmark } from '../library/Library'

const KIND_LABEL: Record<(typeof STEP_KINDS)[number], string> = {
  pour: 'Pour', bloom: 'Bloom', stir: 'Stir', swirl: 'Swirl', wait: 'Wait', press: 'Press', drawdown: 'Drain',
}

const input = 'h-[50px] w-full rounded-xl bg-surface px-3.5 text-base text-ink placeholder:text-ink-soft/70'
const figure = `${input} font-figure text-[17px]`
const area = 'w-full resize-none rounded-xl bg-surface px-3.5 py-3 text-base leading-snug text-ink'
const stepInput = 'h-[46px] w-full rounded-[10px] bg-bg px-2.5 text-[15px] text-ink'

function Field({ label, hint, optional, children }: { label: string; hint?: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold">
        {label}{optional && <span className="font-normal text-ink-soft"> (optional)</span>}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-xs leading-relaxed text-ink-soft">{hint}</span>}
    </label>
  )
}

/** A number box with its unit drawn inside, at the right edge. */
function Unit({ unit, children }: { unit: string; children: React.ReactNode }) {
  return (
    <span className="relative block">
      {children}
      <span aria-hidden className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft">{unit}</span>
    </span>
  )
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3.5 mt-9 font-heading text-2xl">{children}</h2>
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: (on: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3">
      <input type="checkbox" className="h-6 w-6 shrink-0 accent-[var(--accent)]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
  )
}

function PhotoPicker({ photo, onChange }: { photo: string; onChange: (photo: string) => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const pick = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      onChange(await photoFromFile(file))
    } catch {
      setError('That file could not be read as a photo. Try a JPEG or PNG.')
    } finally {
      setBusy(false)
    }
  }

  const fileInput = (
    <input type="file" accept="image/*" className="sr-only" onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = '' }} />
  )

  if (photo) {
    return (
      <div className="mt-[22px] flex items-center gap-4">
        <img src={photo} alt="This recipe's photo" className="h-[150px] w-[120px] shrink-0 rounded-2xl object-cover" />
        <div className="flex flex-1 flex-col gap-2">
          <label className="grid h-11 cursor-pointer place-items-center rounded-sm border border-ink font-bold focus-within:outline focus-within:outline-[3px] focus-within:outline-accent">
            {busy ? 'Resizing…' : 'Change photo'}
            {fileInput}
          </label>
          <button type="button" className="h-11 font-medium text-ink-soft underline underline-offset-4" onClick={() => onChange('')}>
            Remove photo
          </button>
          {error && <p role="alert" className="text-sm">{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <>
      <label
        className="mt-[22px] flex h-[168px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-[18px] bg-surface focus-within:outline focus-within:outline-[3px] focus-within:outline-accent"
        style={{ backgroundImage: 'radial-gradient(circle at 50% 120%, rgb(242 107 31 / 0.32), transparent 62%)' }}
      >
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-bg">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
        </span>
        <span className="text-base font-bold">{busy ? 'Resizing…' : 'Add a photo'}</span>
        <span className="text-[13px] text-ink-soft">Optional. It shows on the recipe&rsquo;s card.</span>
        {fileInput}
      </label>
      {error && <p role="alert" className="mt-2 text-sm">{error}</p>}
    </>
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
    <form onSubmit={save} className="mx-auto flex max-w-xl flex-col px-5 pb-16 pt-[18px]" noValidate>
      <header className="flex h-11 items-center justify-between">
        <a href={cancelHref} className="-ml-1 flex h-11 items-center gap-1.5 pr-2 font-medium">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
          Cancel
        </a>
        <Wordmark className="text-lg" />
      </header>

      <p className="mt-3.5 text-[19px] font-bold text-accent-text">Write down your own</p>
      <h1 className="font-display text-[clamp(44px,16vw,64px)] leading-[1.05]">{title}</h1>

      {errors.length > 0 && (
        <div role="alert" className="mt-5 rounded-2xl bg-accent-tint p-4">
          <p className="font-semibold">Fix {errors.length === 1 ? 'this' : 'these'} before saving:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">{errors.map((m) => <li key={m}>{m}</li>)}</ul>
        </div>
      )}

      <PhotoPicker
        photo={d.photo}
        // A new photo is the user's own, so a copied built-in's description no longer fits it.
        onChange={(photo) => setD((prev) => ({ ...prev, photo, keep: { ...prev.keep, photoAlt: undefined } }))}
      />

      <Heading>Basics</Heading>
      <div className="space-y-3.5">
        <Field label="Name"><input className={input} placeholder="Name your recipe" value={d.name} onChange={(e) => set({ name: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-x-3 gap-y-3.5">
          <Field label="Brewer">
            <Select className={input} value={d.brewer} onChange={(e) => set({ brewer: e.target.value as RecipeDraft['brewer'] })}>
              {BREWERS.map((b) => <option key={b}>{b}</option>)}
            </Select>
          </Field>
          <Field label="Coffee">
            <Unit unit="g"><input className={`${figure} pr-9`} inputMode="decimal" value={d.dose} onChange={(e) => set({ dose: e.target.value })} /></Unit>
          </Field>
          <Field label="Water temperature">
            <Unit unit="°C"><input className={`${figure} pr-11`} inputMode="numeric" value={d.temp} onChange={(e) => set({ temp: e.target.value })} /></Unit>
          </Field>
          <Field label="Total brew time" hint="Like 3:30">
            <input className={figure} value={d.total} onChange={(e) => set({ total: e.target.value })} />
          </Field>
        </div>
      </div>

      <Heading>Grind</Heading>
      <div className="space-y-3.5">
        <Field label="Grind size">
          <Select className={input} value={d.grindScale} onChange={(e) => set({ grindScale: e.target.value as RecipeDraft['grindScale'] })}>
            {GRIND_SCALE.map((g) => <option key={g}>{g}</option>)}
          </Select>
        </Field>
        <Field label="ZP6 Special setting" hint="Number and clicks, so 4.7 is number 4, click 7. Leave empty if you don't know.">
          <input className={figure} inputMode="decimal" placeholder="4.7" value={d.zp6} onChange={(e) => set({ zp6: e.target.value })} />
        </Field>
        <Check checked={d.zp6Estimated} onChange={(on) => set({ zp6Estimated: on })}>This setting is a guess, not dialed in</Check>
        <Field label="Author's grind wording or grinder setting">
          <input className={input} value={d.authorText} onChange={(e) => set({ authorText: e.target.value })} />
        </Field>
        <Field label="Microns" optional><input className={figure} inputMode="numeric" value={d.microns} onChange={(e) => set({ microns: e.target.value })} /></Field>
      </div>

      <Heading>Steps</Heading>
      <p className="-mt-1.5 text-sm leading-relaxed text-ink-soft">Start times count from the beginning of the brew. Steps are saved in time order.</p>
      <ol className="mt-4 space-y-3.5">
        {d.steps.map((s, i) => (
          <li key={s.key} className="rounded-[18px] bg-surface/60 p-3.5 ring-1 ring-line">
            <div className="flex items-center gap-3">
              <span className="font-figure relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-bg text-[15px]">
                <span aria-hidden className="absolute inset-0 -rotate-[30deg] rounded-full border-[1.5px] border-accent border-l-transparent" />
                {i + 1}
              </span>
              <span className="flex-1 font-heading text-[19px]">{KIND_LABEL[s.kind]}</span>
              <span className="font-figure text-lg font-light">{s.start}</span>
              <button type="button" aria-label={`Remove step ${i + 1}`} className="-mr-2 grid h-11 w-11 place-items-center text-ink-soft"
                onClick={() => setD((prev) => ({ ...prev, steps: prev.steps.filter((x) => x.key !== s.key) }))}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
                </svg>
              </button>
            </div>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              <Field label="Type">
                <Select className={`${stepInput} pr-8`} value={s.kind}
                  onChange={(e) => {
                    const kind = e.target.value as StepDraft['kind']
                    setStep(s.key, { kind, water: carriesWater(kind) ? s.water || '50' : '' })
                  }}>
                  {STEP_KINDS.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
                </Select>
              </Field>
              <Field label="Starts at"><input className={`${stepInput} font-figure`} value={s.start} placeholder="0:45" onChange={(e) => setStep(s.key, { start: e.target.value })} /></Field>
              {carriesWater(s.kind) && (
                <Field label="Water">
                  <Unit unit="g"><input className={`${stepInput} font-figure pr-7`} inputMode="numeric" value={s.water} onChange={(e) => setStep(s.key, { water: e.target.value })} /></Unit>
                </Field>
              )}
            </div>
            <div className="mt-2.5">
              <Field label="Technique (optional)">
                <textarea className="w-full resize-none rounded-[10px] bg-bg px-2.5 py-2.5 text-[15px] leading-snug text-ink" rows={2} value={s.instruction}
                  placeholder="Slow circles from the centre out. Grams and times are shown for you."
                  onChange={(e) => setStep(s.key, { instruction: e.target.value })} />
              </Field>
            </div>
          </li>
        ))}
      </ol>
      <button type="button" className="mt-3.5 flex h-[54px] items-center justify-center gap-2 rounded-sm border border-ink text-base font-bold"
        onClick={() => setD((prev) => ({ ...prev, steps: [...prev.steps, newStepDraft()] }))}>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 4v16M4 12h16" /></svg>
        Add step
      </button>

      <Heading>Notes</Heading>
      <div className="space-y-3.5">
        <Field label="Temperature or timing note" optional>
          <textarea className={area} rows={2} value={d.timingNote} onChange={(e) => set({ timingNote: e.target.value })} />
        </Field>
        <Field label="Notes" optional>
          <textarea className={area} rows={3} value={d.notes} onChange={(e) => set({ notes: e.target.value })} />
        </Field>
        <Check checked={d.scalable} onChange={(on) => set({ scalable: on })}>Water amounts scale with the coffee dose</Check>
      </div>

      <button type="submit" className="mt-8 h-[58px] rounded-sm bg-ink text-[17px] font-bold text-bg">Save recipe</button>
    </form>
  )
}
