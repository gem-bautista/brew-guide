import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import type { Recipe, Step } from '../../domain/schema'
import { cumulativeWater, ratio, totalWater } from '../../domain/cumulative'
import { scaleRecipe } from '../../domain/scale'
import { formatClock } from '../../domain/clock'
import { fillFraction, POUR_SEC } from '../../domain/fill'
import { brewerPhoto, Mark } from '../../ui/BrewerArt'
import { BrewerFill, Steam } from '../../ui/BrewerFill'
import { useBrewSession } from './useBrewSession'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION)
      query.addEventListener('change', onChange)
      return () => query.removeEventListener('change', onChange)
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
  )
}

const VERB: Record<Step['kind'], string> = {
  pour: 'Pour', bloom: 'Bloom', stir: 'Stir', swirl: 'Swirl', wait: 'Wait', press: 'Press', drawdown: 'Let it drain',
}

const VERIFICATION = {
  verified: 'Source:',
  partial: 'Partly checked. Confirm against the original before relying on it. Source:',
  'user-supplied': '',
} as const

/** Fixed-width cells keep the digits from shifting as the clock ticks. */
function Digits({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {[...text].map((c, i) => (
        <span key={i} aria-hidden className={`inline-block text-center ${c === ':' ? 'w-[0.35em]' : 'w-[0.62em]'}`}>
          {c}
        </span>
      ))}
    </span>
  )
}

function Button({ children, onClick, primary = false }: { children: React.ReactNode; onClick: () => void; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`h-16 flex-1 rounded-2xl text-xl font-semibold transition-transform active:scale-[0.98] ${
        primary ? 'bg-accent text-accent-ink' : 'border-2 border-line bg-surface text-ink'
      }`}
    >
      {children}
    </button>
  )
}

function Timeline({ recipe, elapsed }: { recipe: Recipe; elapsed: number }) {
  const pct = (sec: number) => `${Math.min(100, (sec / recipe.totalSec) * 100)}%`
  return (
    <div
      role="progressbar"
      aria-label="Brew progress"
      aria-valuemin={0}
      aria-valuemax={recipe.totalSec}
      aria-valuenow={Math.round(elapsed)}
      className="relative h-10"
    >
      <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-line" />
      <div className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-accent" style={{ width: pct(elapsed) }} />
      {recipe.steps.map((s) => (
        <span
          key={s.id}
          className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${
            s.waterG ? 'h-4 w-4' : 'h-2 w-2'
          } ${s.startSec <= elapsed ? 'bg-accent' : 'border-2 border-line bg-bg'}`}
          style={{ left: pct(s.startSec) }}
        />
      ))}
    </div>
  )
}

/**
 * The Preview's header: the Brewer's photo under a dark scrim, or the drawn
 * mark on a tinted panel for Brewers without one. The name sits over either.
 */
function Hero({ recipe, backHref }: { recipe: Recipe; backHref?: string }) {
  const photo = brewerPhoto(recipe.brewer)
  return (
    <header
      className={`relative flex min-h-[clamp(14rem,34vh,20rem)] flex-col justify-between gap-6 overflow-hidden p-6 sm:mt-4 sm:rounded-3xl ${
        photo ? 'text-white' : 'bg-line/60'
      }`}
    >
      {photo ? (
        <>
          <img src={photo.src} alt="" decoding="async" className="absolute inset-0 h-full w-full object-cover brightness-[var(--photo-dim)]" />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-black/20" />
        </>
      ) : (
        <div className="absolute right-5 top-5 text-ink-soft/70">
          <Mark brewer={recipe.brewer} size={96} />
        </div>
      )}
      <div className="relative">
        {backHref && (
          <a
            href={backHref}
            className={`-ml-1 inline-flex h-11 items-center gap-1 rounded-full pl-2 pr-4 ${
              photo ? 'bg-black/45 backdrop-blur-sm' : 'border-2 border-line bg-surface'
            }`}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m15 5-7 7 7 7" />
            </svg>
            Library
          </a>
        )}
      </div>
      <div className="relative">
        <p className={photo ? 'text-white/85' : 'text-ink-soft'}>{recipe.author} · {recipe.brewer}</p>
        <h1 className="mt-1 font-display text-4xl leading-tight">{recipe.name}</h1>
      </div>
    </header>
  )
}

function Preview({ recipe, backHref, extra, onStart, resumable, onResume, onDiscard }: {
  recipe: Recipe
  backHref?: string
  extra?: React.ReactNode
  onStart: (r: Recipe) => void
  resumable: ReturnType<typeof useBrewSession>['resumable']
  onResume: () => void
  onDiscard: () => void
}) {
  const [dose, setDose] = useState(recipe.doseG)
  const scaled = useMemo(() => (recipe.scalable ? scaleRecipe(recipe, dose) : recipe), [recipe, dose])
  const water = totalWater(scaled)
  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col">
      <Hero recipe={recipe} backHref={backHref} />
      <div className="flex flex-1 flex-col justify-between gap-8 p-6">
        {resumable && (
          <div className="rounded-2xl border-2 border-accent p-4">
            <p className="font-medium">A brew of {resumable.recipe.name} is still running.</p>
            <div className="mt-3 flex gap-3">
              <Button primary onClick={onResume}>Resume brew</Button>
              <Button onClick={onDiscard}>Discard</Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <button aria-label="Less coffee" disabled={!recipe.scalable} onClick={() => setDose((d) => Math.max(5, d - 1))}
            className="h-16 w-16 rounded-full border-2 border-line bg-surface text-3xl disabled:opacity-40">−</button>
          <div className="text-center">
            <Digits text={`${dose}`} className="text-7xl font-bold" />
            <span className="text-2xl text-ink-soft"> g coffee</span>
            <p className="mt-1 text-xl text-ink-soft">{water} g water · {recipe.tempC} °C</p>
          </div>
          <button aria-label="More coffee" disabled={!recipe.scalable} onClick={() => setDose((d) => Math.min(60, d + 1))}
            className="h-16 w-16 rounded-full border-2 border-line bg-surface text-3xl disabled:opacity-40">+</button>
        </div>

        <dl className="grid grid-cols-2 gap-y-2 text-lg">
          <dt className="text-ink-soft">Grind</dt>
          <dd className="text-right">
            {recipe.grind.zp6Clicks !== undefined ? `ZP6 ${recipe.grind.zp6Clicks} clicks${recipe.grind.zp6Estimated ? ' (estimated)' : ''}` : recipe.grind.scale}
          </dd>
          <dt className="text-ink-soft">Total time</dt>
          <dd className="text-right">{formatClock(recipe.totalSec)}</dd>
          <dt className="text-ink-soft">Pours</dt>
          <dd className="text-right">{scaled.steps.filter((s) => s.waterG).length}</dd>
        </dl>

        {(recipe.grind.authorText || recipe.timingNote || recipe.notes) && (
          <div className="space-y-2 text-lg leading-snug">
            {recipe.grind.authorText && <p><span className="text-ink-soft">Author's grind: </span>{recipe.grind.authorText}</p>}
            {recipe.timingNote && <p>{recipe.timingNote}</p>}
            {recipe.notes && <p>{recipe.notes}</p>}
          </div>
        )}

        {recipe.source && (
          <p className="text-base text-ink-soft">
            {VERIFICATION[recipe.verification ?? 'verified']}{' '}
            {recipe.source.url ? (
              <a className="underline underline-offset-4" href={recipe.source.url} target="_blank" rel="noreferrer">{recipe.source.label}</a>
            ) : recipe.source.label}
          </p>
        )}
        {!recipe.scalable && <p className="text-base text-ink-soft">This recipe is fixed, so the dose can't be changed.</p>}

        <Button primary onClick={() => onStart(scaled)}>Start brew</Button>
        {extra && <div className="flex gap-3">{extra}</div>}
      </div>
    </div>
  )
}

function Brewing({ recipe, elapsed, paused, position, onPause, onNext, onStop }: {
  recipe: Recipe
  elapsed: number
  paused: boolean
  position: NonNullable<ReturnType<typeof useBrewSession>['position']>
  onPause: () => void
  onNext: () => void
  onStop: () => void
}) {
  const cumulative = cumulativeWater(recipe.steps)
  const upcoming = position.stepIndex < 0
  const index = Math.max(position.stepIndex, 0)
  const step = recipe.steps[index]!
  const following = recipe.steps[position.stepIndex + 1]
  const isLast = position.stepIndex === recipe.steps.length - 1
  const reducedMotion = useReducedMotion()
  const fill = fillFraction(recipe, elapsed, reducedMotion ? 0 : POUR_SEC)

  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col gap-5 px-6 py-4">
      <header className="flex items-baseline justify-between text-ink-soft">
        <span className="min-w-0 truncate pr-4">{recipe.name}</span>
        <Digits text={formatClock(elapsed)} className="shrink-0 whitespace-nowrap text-2xl text-ink" />
      </header>

      <main className="flex flex-1 flex-col justify-center" aria-live="polite">
        {/* Takes whatever height the text leaves over, so a short phone keeps
            every control on screen and a tall one gets a bigger drawing. */}
        <div className="relative mb-3 max-h-52 min-h-16 flex-1">
          <BrewerFill brewer={recipe.brewer} fraction={fill} className="absolute inset-0 h-full w-full" />
        </div>
        <p className="text-3xl font-semibold">{upcoming ? `Next: ${VERB[step.kind]}` : VERB[step.kind]}</p>
        {step.waterG !== undefined ? (
          <>
            <p className="mt-2 leading-none">
              <Digits text={`${cumulative[index]}`} className="text-[clamp(4.5rem,min(34vw,14vh),13rem)] font-bold tracking-tight" />
              <span className="ml-1 text-4xl font-medium text-ink-soft">g</span>
            </p>
            <p className="mt-2 text-2xl text-ink-soft">on the scale · add {step.waterG} g</p>
          </>
        ) : (
          <p className="mt-4 text-5xl font-bold leading-tight">{step.instruction}</p>
        )}
        {step.waterG !== undefined && <p className="mt-4 max-w-[34ch] text-xl leading-snug">{step.instruction}</p>}
      </main>

      <section className="rounded-2xl bg-surface p-4">
        {following ? (
          <p className="text-lg text-ink-soft">
            {paused ? 'Paused. ' : ''}
            {VERB[following.kind]}{following.waterG !== undefined ? ` to ${cumulative[position.stepIndex + 1]} g` : ''} in{' '}
            <Digits text={formatClock(position.secondsToNext)} className="text-xl text-ink" />
          </p>
        ) : (
          <p className="text-lg text-ink-soft">
            {paused ? 'Paused. ' : ''}{isLast ? 'Done in ' : ''}
            <Digits text={formatClock(position.secondsToNext)} className="text-xl text-ink" />
          </p>
        )}
      </section>

      <Timeline recipe={recipe} elapsed={elapsed} />

      <div className="flex gap-3">
        <Button onClick={onPause}>{paused ? 'Resume' : 'Pause'}</Button>
        <Button primary onClick={onNext}>{isLast ? 'Finish' : 'Next step'}</Button>
      </div>
      <button className="self-center py-2 text-ink-soft underline underline-offset-4" onClick={() => window.confirm('End this brew?') && onStop()}>
        End brew
      </button>
    </div>
  )
}

function Finished({ recipe, backHref, onAgain }: { recipe: Recipe; backHref?: string; onAgain: () => void }) {
  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col justify-center gap-8 p-6">
      <div className="flex flex-col items-center">
        <Steam className="h-10" />
        <BrewerFill brewer={recipe.brewer} fraction={1} className="h-[24vh] max-h-56 min-h-28 w-auto" />
      </div>

      <div>
        <h1 className="font-display text-6xl">Brew done</h1>
        <p className="mt-2 text-xl text-ink-soft">{recipe.name}</p>
      </div>

      <dl className="grid grid-cols-2 gap-y-2 text-lg">
        <dt className="text-ink-soft">Coffee</dt>
        <dd className="text-right">{recipe.doseG} g</dd>
        <dt className="text-ink-soft">Water</dt>
        <dd className="text-right">{totalWater(recipe)} g</dd>
        <dt className="text-ink-soft">Ratio</dt>
        <dd className="text-right">1:{+ratio(recipe).toFixed(1)}</dd>
        <dt className="text-ink-soft">Total time</dt>
        <dd className="text-right">{formatClock(recipe.totalSec)}</dd>
      </dl>

      <div className="grid gap-3">
        <Button primary onClick={onAgain}>Brew again</Button>
        {backHref && (
          <a href={backHref} className="grid h-16 place-items-center rounded-2xl border-2 border-line bg-surface text-xl font-semibold text-ink">
            Back to Library
          </a>
        )}
      </div>
    </div>
  )
}

export function SessionScreen({ recipe, backHref, extra }: { recipe: Recipe; backHref?: string; extra?: React.ReactNode }) {
  const b = useBrewSession()
  // Each screen starts at the top. Otherwise starting a brew from a scrolled
  // Preview opens the Brewing screen with its clock and drawing out of view.
  const screen = !b.recipe || !b.position ? 'preview' : b.finished ? 'finished' : 'brewing'
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen])

  if (!b.recipe || !b.position) {
    return <Preview recipe={recipe} backHref={backHref} extra={extra} onStart={b.start} resumable={b.resumable} onResume={b.resume} onDiscard={b.discard} />
  }
  if (b.finished) return <Finished recipe={b.recipe} backHref={backHref} onAgain={b.stop} />
  return (
    <Brewing recipe={b.recipe} elapsed={b.elapsed} paused={b.paused} position={b.position}
      onPause={b.togglePause} onNext={b.next} onStop={b.stop} />
  )
}

