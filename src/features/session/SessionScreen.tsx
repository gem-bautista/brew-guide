import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import type { Recipe, Step } from '../../domain/schema'
import { cumulativeWater, ratio, totalWater } from '../../domain/cumulative'
import { scaleRecipe } from '../../domain/scale'
import { formatClock } from '../../domain/clock'
import { fillFraction, POUR_SEC } from '../../domain/fill'
import { RecipePhoto } from '../../ui/RecipePhoto'
import { Ring, Rule, Sparkle } from '../../ui/Ornaments'
import { Star, Wordmark } from '../library/Library'
import { useBrewSession } from './useBrewSession'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
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
        <span key={i} aria-hidden className={`inline-block text-center ${c === ':' ? 'w-[0.3em]' : 'w-[0.64em]'}`}>
          {c}
        </span>
      ))}
    </span>
  )
}

const primaryClass = 'flex h-14 flex-[1.5] items-center justify-center gap-2.5 rounded-sm bg-ink text-base font-bold text-bg transition-transform active:scale-[0.98]'
const secondaryClass = 'grid h-14 flex-1 place-items-center rounded-sm border border-ink text-base font-bold transition-transform active:scale-[0.98]'

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function BackLink({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) return <span />
  return (
    <a href={href} className="-ml-1 flex h-11 min-w-0 items-center gap-1.5 pr-2 font-medium">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <path d="M19 12H5M11 6l-6 6 6 6" />
      </svg>
      <span className="truncate">{children}</span>
    </a>
  )
}

/** Longer names step down a size, so the hairline title never needs more than two lines. */
function titleSize(name: string) {
  return name.length <= 12 ? 'text-[clamp(44px,15vw,66px)]' : name.length <= 22 ? 'text-[clamp(36px,11vw,48px)]' : 'text-[clamp(30px,9vw,38px)]'
}

function Pill({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <li className="flex min-w-0 items-center gap-2 rounded-xl bg-surface p-1">
      <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[9px] bg-bg">
        <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={icon} />
        </svg>
      </span>
      <span className="min-w-0 leading-tight">
        <span className="font-figure block truncate text-[13px]">{value}</span>
        <span className="block truncate text-[11px] text-ink-soft">{label}</span>
      </span>
    </li>
  )
}

const ICON = {
  temp: 'M10 4a2 2 0 1 1 4 0v9.5a4 4 0 1 1-4 0zM12 15V9',
  grind: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 12l4-4M12 4v2M20 12h-2M12 20v-2M4 12h2',
  time: 'M12 6a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM12 13V9.5M10 3h4',
}

function Preview({ recipe, backHref, extra, favorite, onStart, resumable, onResume, onDiscard }: {
  recipe: Recipe
  backHref?: string
  extra?: React.ReactNode
  favorite?: { on: boolean; onToggle: () => void }
  onStart: (r: Recipe) => void
  resumable: ReturnType<typeof useBrewSession>['resumable']
  onResume: () => void
  onDiscard: () => void
}) {
  const [dose, setDose] = useState(recipe.doseG)
  const scaled = useMemo(() => (recipe.scalable ? scaleRecipe(recipe, dose) : recipe), [recipe, dose])
  const water = totalWater(scaled)
  const grind = recipe.grind.zp6Clicks !== undefined
    ? { value: `ZP6 ${recipe.grind.zp6Clicks}`, label: recipe.grind.zp6Estimated ? 'estimate' : 'your setting' }
    : { value: recipe.grind.scale, label: 'grind' }

  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col overflow-x-clip px-5 pb-6 pt-[18px]">
      <header className="flex h-11 items-center justify-between">
        <BackLink href={backHref}>Library</BackLink>
        {favorite && (
          <button
            aria-pressed={favorite.on}
            aria-label={favorite.on ? `Remove ${recipe.name} from favorites` : `Add ${recipe.name} to favorites`}
            onClick={favorite.onToggle}
            className="grid h-11 w-11 place-items-center rounded bg-ink text-accent"
          >
            <Star on={favorite.on} className="h-[19px] w-[19px]" />
          </button>
        )}
      </header>

      <p className="mt-2 text-center text-[19px] font-bold text-accent-text">{recipe.author} · {recipe.brewer}</p>
      <h1 className={`font-display relative z-10 text-center leading-[1.05] [text-wrap:balance] ${titleSize(recipe.name)}`}>{recipe.name}</h1>

      <div className="relative z-20 -mt-2.5 grid h-[292px] place-items-center">
        <div aria-hidden className="glow absolute left-1/2 top-[52%] h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
        <Sparkle size={20} className="absolute left-[6%] top-6 text-ink" />
        <Sparkle size={12} className="absolute left-[12%] top-14 text-accent" />
        <RecipePhoto
          recipe={recipe}
          markSize={72}
          className="relative h-[292px] w-[236px] rounded-b-[18px] rounded-t-[118px] shadow-[0_24px_50px_rgb(150_60_10/0.22)]"
        />
      </div>

      <ul className="mt-[18px] grid grid-cols-3 gap-2">
        <Pill icon={ICON.temp} value={`${recipe.tempC} °C`} label="water" />
        <Pill icon={ICON.grind} value={grind.value} label={grind.label} />
        <Pill icon={ICON.time} value={formatClock(recipe.totalSec)} label="total" />
      </ul>

      {resumable && (
        <div className="mt-5 rounded-2xl bg-accent-tint p-4">
          <p className="font-semibold">A brew of {resumable.recipe.name} is still running.</p>
          <div className="mt-3 flex gap-3">
            <button className={primaryClass} onClick={onResume}>Resume brew</button>
            <button className={secondaryClass} onClick={onDiscard}>Discard</button>
          </div>
        </div>
      )}

      {(recipe.grind.authorText || recipe.timingNote || recipe.notes) && (
        <div className="mt-4 space-y-2 text-[15px] leading-relaxed text-ink-soft [text-wrap:pretty]">
          {recipe.notes && <p>{recipe.notes}</p>}
          {recipe.timingNote && <p>{recipe.timingNote}</p>}
          {recipe.grind.authorText && <p><span className="font-semibold text-ink">Author&rsquo;s grind:</span> {recipe.grind.authorText}</p>}
        </div>
      )}

      {recipe.source && (
        <p className="mt-3 text-sm text-ink-soft">
          {VERIFICATION[recipe.verification ?? 'verified']}{' '}
          {recipe.source.url ? (
            <a className="underline underline-offset-4" href={recipe.source.url} target="_blank" rel="noreferrer">{recipe.source.label}</a>
          ) : recipe.source.label}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-4 pt-6">
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink-soft">Dose</span>
          <Rule className="h-[30px]" />
          <span className="leading-none">
            <span className="font-display block text-[38px] font-light tracking-[-0.03em]"><Digits text={`${dose}`} /> g</span>
            <span className="font-figure mt-1 block text-xs text-ink-soft">{water} g water · 1:{+ratio(scaled).toFixed(1)}</span>
          </span>
        </div>
        <div className="flex gap-2">
          <button aria-label="Less coffee" disabled={!recipe.scalable} onClick={() => setDose((d) => Math.max(5, d - 1))}
            className="font-figure h-11 w-11 rounded-sm border border-ink text-2xl font-light disabled:opacity-30">−</button>
          <button aria-label="More coffee" disabled={!recipe.scalable} onClick={() => setDose((d) => Math.min(60, d + 1))}
            className="font-figure h-11 w-11 rounded-sm border border-ink text-2xl font-light disabled:opacity-30">+</button>
        </div>
      </div>
      {!recipe.scalable && <p className="mt-2 text-sm text-ink-soft">This recipe is fixed, so the dose can&rsquo;t be changed.</p>}

      <button className={`${primaryClass} mt-[18px] w-full flex-none text-[17px]`} onClick={() => onStart(scaled)}>
        Start brew <Arrow />
      </button>
      {extra && <div className="mt-3 flex gap-3">{extra}</div>}
    </div>
  )
}

function Brewing({ recipe, elapsed, paused, position, backHref, onPause, onNext, onStop }: {
  recipe: Recipe
  elapsed: number
  paused: boolean
  position: NonNullable<ReturnType<typeof useBrewSession>['position']>
  backHref?: string
  onPause: () => void
  onNext: () => void
  onStop: () => void
}) {
  const cumulative = cumulativeWater(recipe.steps)
  const total = totalWater(recipe)
  const upcoming = position.stepIndex < 0
  const index = Math.max(position.stepIndex, 0)
  const step = recipe.steps[index]!
  const following = recipe.steps[position.stepIndex + 1]
  const isLast = position.stepIndex === recipe.steps.length - 1
  const reducedMotion = useMediaQuery(REDUCED_MOTION)
  // Short phones get smaller rings so every control stays on screen.
  const short = useMediaQuery('(max-height: 760px)')
  const big = short ? 220 : 280
  const small = short ? 100 : 120

  // Grams on the scale: this Pour's target, or what the last Pour reached.
  const onScale = upcoming ? 0 : (cumulative[index] ?? 0)
  const fill = fillFraction(recipe, elapsed, reducedMotion ? 0 : POUR_SEC)
  const intervalStart = upcoming ? 0 : step.startSec
  const intervalEnd = following?.startSec ?? recipe.totalSec
  const countdown = intervalEnd > intervalStart ? position.secondsToNext / (intervalEnd - intervalStart) : 0
  const tagline = paused ? 'Paused' : upcoming ? 'Get ready' : `Step ${index + 1} of ${recipe.steps.length}`

  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col overflow-x-clip px-5 pb-6 pt-[18px]">
      <header className="flex h-11 items-center justify-between gap-3">
        <BackLink href={backHref}>{recipe.name}</BackLink>
        <button
          className="h-11 shrink-0 rounded-sm border border-ink px-3.5 text-sm font-medium"
          onClick={() => window.confirm('End this brew?') && onStop()}
        >
          End brew
        </button>
      </header>

      <p className="mt-2 text-center text-[19px] font-bold text-accent-text" aria-live="polite">{tagline}</p>

      <main className="flex flex-1 flex-col items-center" aria-live="polite">
        <div className="relative mt-3">
          <Ring size={big} fraction={fill} gap={12}>
            <span className="font-display font-light leading-[0.9]" style={{ fontSize: big * 0.34 }}>
              <Digits text={`${onScale}`} /><span className="ml-1 text-[0.32em] tracking-normal">g</span>
            </span>
            <span className="mt-2 text-sm text-ink-soft">on the scale, of {total} g</span>
            {!upcoming && (
              <span className="mt-3 rounded-full bg-accent-tint px-3 py-1.5 text-[13px] font-bold">
                {step.waterG !== undefined ? `Add ${step.waterG} g now` : `${VERB[step.kind]} now`}
              </span>
            )}
          </Ring>
          <Sparkle size={12} className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-accent" />
        </div>

        <div className="mt-[18px] flex gap-[22px]">
          <div role="progressbar" aria-label="Brew progress" aria-valuemin={0} aria-valuemax={recipe.totalSec} aria-valuenow={Math.round(elapsed)}>
            <Ring size={small} fraction={elapsed / recipe.totalSec}>
              <Digits text={formatClock(elapsed)} className="font-figure text-[30px] font-light leading-none" />
              <span className="mt-1 text-xs text-ink-soft">elapsed</span>
            </Ring>
          </div>
          <Ring size={small} fraction={countdown}>
            <Digits text={formatClock(position.secondsToNext)} className="font-figure text-[30px] font-light leading-none" />
            <span className="mt-1 text-xs text-ink-soft">{following ? `to next ${VERB[following.kind].toLowerCase()}` : 'to done'}</span>
          </Ring>
        </div>

        <h1 className="mt-5 text-center font-heading text-[30px] leading-tight">
          {upcoming ? `Next: ${VERB[step.kind]}` : VERB[step.kind]}{step.waterG !== undefined ? ` ${step.waterG} g` : ''}
        </h1>
        <p className="mt-1.5 max-w-[34ch] text-center text-[15px] leading-snug text-ink-soft [text-wrap:pretty]">{step.instruction}</p>

        <div className="relative mt-5 flex w-full items-center justify-between px-3.5 py-3">
          <span aria-hidden className="absolute left-0 top-0 h-[30px] w-[46px] rounded-tl-[14px] border-l-[1.5px] border-t-[1.5px] border-accent" />
          <span aria-hidden className="absolute bottom-0 right-0 h-[30px] w-[46px] rounded-br-[14px] border-b-[1.5px] border-r-[1.5px] border-accent" />
          <span className="leading-tight">
            <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">Up next</span>
            <span className="font-heading text-[19px]">
              {following
                ? `${VERB[following.kind]}${following.waterG !== undefined ? ` to ${cumulative[position.stepIndex + 1]} g` : ''}`
                : 'Brew done'}
            </span>
          </span>
          <span className="flex items-center gap-2.5">
            <Rule />
            <span className="font-figure text-[28px] font-light">{formatClock(following?.startSec ?? recipe.totalSec)}</span>
          </span>
        </div>
      </main>

      <div className="mt-6 flex gap-2.5">
        <button className={secondaryClass} onClick={onPause}>{paused ? 'Resume' : 'Pause'}</button>
        <button className={primaryClass} onClick={onNext}>{isLast ? 'Finish' : 'Next step'} <Arrow /></button>
      </div>
    </div>
  )
}

function Finished({ recipe, backHref, onAgain }: { recipe: Recipe; backHref?: string; onAgain: () => void }) {
  const stats = [
    { value: `${recipe.doseG} g`, label: 'coffee', fraction: 0 },
    { value: `${totalWater(recipe)} g`, label: 'water', fraction: 1 },
    { value: formatClock(recipe.totalSec), label: 'brew time', fraction: 0 },
  ]
  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col overflow-x-clip px-5 pb-6 pt-[18px]">
      <header className="flex h-11 items-center justify-between">
        <Wordmark />
        {backHref && (
          <a href={backHref} aria-label="Close and go to the Library" className="grid h-11 w-11 place-items-center rounded bg-ink text-bg">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </a>
        )}
      </header>

      <p className="mt-2.5 text-center text-[19px] font-bold text-accent-text">{recipe.name} · {recipe.author}</p>
      <h1 className="font-display relative z-10 text-center text-[clamp(52px,17vw,76px)] leading-[1.05]">Brew done</h1>

      <div className="relative -mt-1.5 grid h-[236px] place-items-center">
        <div aria-hidden className="glow absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
        <Sparkle size={22} className="absolute left-[8%] top-3.5 text-ink" />
        <Sparkle size={14} className="absolute bottom-7 right-[12%] text-accent" />
        <RecipePhoto recipe={recipe} markSize={64} className="relative h-[210px] w-[210px] rounded-full object-[50%_30%] shadow-[0_20px_44px_rgb(150_60_10/0.22)]" />
      </div>

      <ul aria-label="This brew" className="mt-[22px] flex justify-between">
        {stats.map((s) => (
          <li key={s.label}>
            <Ring size={104} fraction={s.fraction} gap={6}>
              <span className="font-figure text-[26px] font-light leading-none">{s.value}</span>
              <span className="mt-1 text-xs text-ink-soft">{s.label}</span>
            </Ring>
          </li>
        ))}
      </ul>

      <p className="mt-3.5 flex items-center justify-center gap-3 text-sm text-ink-soft">
        Ratio<Rule className="h-[22px]" /><span className="font-figure text-2xl font-light text-ink">1:{+ratio(recipe).toFixed(1)}</span>
      </p>

      <div className="mt-auto flex gap-2.5 pt-6">
        {backHref && <a href={backHref} className={secondaryClass}>Library</a>}
        <button className={primaryClass} onClick={onAgain}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" />
          </svg>
          Brew again
        </button>
      </div>
    </div>
  )
}

export function SessionScreen({ recipe, backHref, extra, favorite }: {
  recipe: Recipe
  backHref?: string
  extra?: React.ReactNode
  favorite?: { on: boolean; onToggle: () => void }
}) {
  const b = useBrewSession()
  // Each screen starts at the top. Otherwise starting a brew from a scrolled
  // Preview opens the Brewing screen with its rings out of view.
  const screen = !b.recipe || !b.position ? 'preview' : b.finished ? 'finished' : 'brewing'
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen])

  if (!b.recipe || !b.position) {
    return (
      <Preview recipe={recipe} backHref={backHref} extra={extra} favorite={favorite}
        onStart={b.start} resumable={b.resumable} onResume={b.resume} onDiscard={b.discard} />
    )
  }
  if (b.finished) return <Finished recipe={b.recipe} backHref={backHref} onAgain={b.stop} />
  return (
    <Brewing recipe={b.recipe} elapsed={b.elapsed} paused={b.paused} position={b.position} backHref={backHref}
      onPause={b.togglePause} onNext={b.next} onStop={b.stop} />
  )
}
