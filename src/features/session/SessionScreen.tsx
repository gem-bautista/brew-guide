import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import type { Recipe } from '../../domain/schema'
import { cumulativeWater, ratio, totalWater } from '../../domain/cumulative'
import { scaleRecipe } from '../../domain/scale'
import { formatClock } from '../../domain/clock'
import { POUR_SEC } from '../../domain/fill'
import { sceneAt } from '../../domain/scene'
import { BrewScene } from '../../ui/BrewScene'
import { StepList } from './StepList'
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

const primaryClass = 'flex h-14 flex-[1.5] items-center justify-center gap-2.5 rounded-sm bg-ink text-base font-bold text-bg transition-transform active:scale-[0.98] tab:h-16 tab:text-lg'
const secondaryClass = 'grid h-14 flex-1 place-items-center rounded-sm border border-ink text-base font-bold transition-transform active:scale-[0.98] tab:h-16 tab:text-lg'

/** The page column: phone-narrow, wider on an iPad, two columns' worth sideways. */
const pageClass = 'mx-auto flex min-h-full w-full max-w-xl flex-col overflow-x-clip px-5 pb-6 pt-[18px] tab:max-w-3xl tab:px-10 tab:pb-10 tab:pt-6 land:max-w-6xl'

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

/**
 * Longer names step down a size, so the hairline title never needs more than
 * two lines. On a phone the title shares its row with the photo, so it starts smaller.
 */
function titleSize(name: string) {
  return name.length <= 12
    ? 'text-[clamp(34px,10vw,44px)] tab:text-[84px]'
    : name.length <= 22
      ? 'text-[clamp(28px,8vw,36px)] tab:text-[64px]'
      : 'text-[clamp(24px,6.6vw,30px)] tab:text-[52px] land:text-[46px]'
}

function Pill({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <li className="flex min-w-0 items-center gap-2 rounded-xl bg-surface p-1 tab:gap-3 tab:p-1.5">
      <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-bg tab:size-11 tab:rounded-[11px]">
        <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-[17px] tab:size-5">
          <path d={icon} />
        </svg>
      </span>
      <span className="min-w-0 leading-tight">
        <span className="font-figure block truncate text-[13px] tab:text-base">{value}</span>
        <span className="block truncate text-[11px] text-ink-soft tab:text-[13px]">{label}</span>
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

  const stepButton = 'font-figure size-11 rounded-sm border border-ink text-2xl font-light disabled:opacity-30 tab:size-14 tab:text-3xl'

  return (
    <div className={pageClass}>
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

      {/* One column on a phone or an upright iPad. Sideways, the photo takes the
          left column and the title and details share the right one. */}
      <div className="flex flex-1 flex-col land:grid land:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] land:grid-rows-[auto_auto] land:content-center land:gap-x-16 land:py-4">
        {/* On a phone the photo shrinks to a small arch beside the title, so the
            Steps show without scrolling. From an upright iPad up this wrapper
            steps aside and the title and photo lay out as before. */}
        <div className="mt-3 flex flex-row-reverse items-center gap-4 tab:contents">
        <div className="min-w-0 flex-1 tab:mt-4 tab:flex-none tab:text-center land:col-start-2 land:row-start-1 land:mt-0 land:self-end land:text-left">
          <p className="text-[19px] font-bold text-accent-text tab:text-[22px]">{recipe.author} · {recipe.brewer}</p>
          <h1 className={`font-display mt-1 leading-[1.05] [text-wrap:balance] ${titleSize(recipe.name)}`}>{recipe.name}</h1>
        </div>

        {/* The photo sits clear of the title: a two-line name used to run under it. */}
        <div className="relative aspect-[236/292] w-[92px] shrink-0 tab:mx-auto tab:mt-8 tab:w-[260px] land:col-start-1 land:row-span-2 land:row-start-1 land:mt-0 land:h-[min(70svh,560px)] land:w-auto land:self-center">
          <div aria-hidden className="glow absolute left-1/2 top-[52%] aspect-square w-[170%] -translate-x-1/2 -translate-y-1/2 rounded-full" />
          <Sparkle size={20} className="absolute -left-[26%] top-[4%] hidden text-ink tab:block" />
          <Sparkle size={12} className="absolute -left-[14%] top-[16%] hidden text-accent tab:block" />
          <RecipePhoto
            recipe={recipe}
            markSize={72}
            className="relative size-full rounded-b-[10px] rounded-t-[50%_40.4%] shadow-[0_12px_28px_rgb(150_60_10/0.22)] tab:rounded-b-[18px] tab:shadow-[0_24px_50px_rgb(150_60_10/0.22)]"
          />
        </div>
        </div>

        <div className="flex flex-1 flex-col land:col-start-2 land:row-start-2 land:flex-none">
          <ul className="mt-5 grid grid-cols-3 gap-2 tab:mt-8 tab:gap-3 land:mt-5">
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
            <div className="order-1 mt-5 max-w-[62ch] space-y-2 text-[15px] leading-relaxed text-ink-soft [text-wrap:pretty] tab:order-none tab:mt-5 tab:text-base">
              {recipe.notes && <p>{recipe.notes}</p>}
              {recipe.timingNote && <p>{recipe.timingNote}</p>}
              {recipe.grind.authorText && <p><span className="font-semibold text-ink">Author&rsquo;s grind:</span> {recipe.grind.authorText}</p>}
            </div>
          )}

          {recipe.source && (
            <p className="order-1 mt-3 text-sm text-ink-soft tab:order-none tab:text-[15px]">
              {VERIFICATION[recipe.verification ?? 'verified']}{' '}
              {recipe.source.url ? (
                <a className="underline underline-offset-4" href={recipe.source.url} target="_blank" rel="noreferrer">{recipe.source.label}</a>
              ) : recipe.source.label}
            </p>
          )}

          {/* The route, scaled with the dose, in the same rows the brew will follow. */}
          <section aria-labelledby="route" className="mt-5 tab:mt-8">
            <h2 id="route" className="text-[13px] font-bold uppercase tracking-[0.12em] text-ink-soft">Steps</h2>
            {scaled.iceG !== undefined && (
              <p className="mt-2 rounded-xl bg-accent-tint px-3 py-2.5 text-[15px] tab:px-4 tab:text-base">
                <span className="font-semibold">Before you start:</span> put <span className="font-figure">{scaled.iceG} g</span> of ice in the server, then tare the scale with it there.
              </p>
            )}
            <StepList recipe={scaled} className="-mx-3 mt-1.5 tab:-mx-4" />
          </section>

          <div className="mt-auto flex items-center justify-between gap-4 pt-6 tab:pt-8 land:mt-6 land:pt-0">
            <div className="flex items-center gap-3">
              <span className="text-sm text-ink-soft tab:text-base">Dose</span>
              <Rule className="h-[30px] tab:h-10" />
              <span className="leading-none">
                <span className="font-display block text-[38px] font-light tracking-[-0.03em] tab:text-[52px]"><Digits text={`${dose}`} /> g</span>
                <span className="font-figure mt-1 block text-xs text-ink-soft tab:text-sm">{water} g water · {scaled.iceG !== undefined ? `${scaled.iceG} g ice` : `1:${+ratio(scaled).toFixed(1)}`}</span>
              </span>
            </div>
            <div className="flex gap-2 tab:gap-3">
              <button aria-label="Less coffee" disabled={!recipe.scalable} onClick={() => setDose((d) => Math.max(5, d - 1))} className={stepButton}>−</button>
              <button aria-label="More coffee" disabled={!recipe.scalable} onClick={() => setDose((d) => Math.min(60, d + 1))} className={stepButton}>+</button>
            </div>
          </div>
          {!recipe.scalable && <p className="mt-2 text-sm text-ink-soft">This recipe is fixed, so the dose can&rsquo;t be changed.</p>}

          {/* Pinned to the bottom of a phone screen, so Start is always in reach. */}
          <div className="sticky bottom-0 order-2 -mx-5 mt-4 bg-bg px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 tab:static tab:order-none tab:mx-0 tab:mt-5 tab:bg-transparent tab:p-0">
            <button className={`${primaryClass} w-full text-[17px]`} onClick={() => onStart(scaled)}>
              Start brew <Arrow />
            </button>
          </div>
          {extra && <div className="order-3 mt-3 flex gap-3 tab:order-none">{extra}</div>}
        </div>
      </div>
    </div>
  )
}

function Brewing({ recipe, elapsed, countIn, paused, position, backHref, onPause, onNext, onStop }: {
  recipe: Recipe
  elapsed: number
  countIn: number
  paused: boolean
  position: NonNullable<ReturnType<typeof useBrewSession>['position']>
  backHref?: string
  onPause: () => void
  onNext: () => void
  onStop: () => void
}) {
  const reducedMotion = useMediaQuery(REDUCED_MOTION)
  const cumulative = cumulativeWater(recipe.steps)
  const total = totalWater(recipe)
  const counting = countIn > 0
  const index = Math.max(position.stepIndex, 0)
  const isLast = position.stepIndex === recipe.steps.length - 1
  const scene = sceneAt(recipe, elapsed, reducedMotion ? 0 : POUR_SEC)
  // The Scale target: what the current Pour should bring the scale to, or what the last one reached.
  const target = cumulative[index] ?? 0
  const tagline = counting ? (recipe.iceG !== undefined ? 'Ice in the server?' : 'Get ready') : paused ? 'Paused' : `Step ${index + 1} of ${recipe.steps.length}`

  return (
    <div className="mx-auto flex h-svh w-full max-w-xl flex-col overflow-hidden px-5 pb-5 pt-[18px] tab:max-w-3xl tab:px-10 tab:pb-8 tab:pt-6 land:max-w-6xl">
      <header className="flex h-11 shrink-0 items-center justify-between gap-3">
        <BackLink href={backHref}>{recipe.name}</BackLink>
        <button
          className="h-11 shrink-0 rounded-sm border border-ink px-3.5 text-sm font-medium"
          onClick={() => window.confirm('End this brew?') && onStop()}
        >
          End brew
        </button>
      </header>

      {/* Stacked on a phone or an upright iPad: the scene on top, the list
          below. Sideways, the scene takes the left column and the list the right. */}
      <main className="flex min-h-0 flex-1 flex-col land:grid land:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] land:gap-x-14">
        <section aria-label="Brew" className="flex min-h-0 shrink-0 flex-col items-center land:h-full land:justify-center">
          <div className="relative h-[33svh] tab:h-[38svh] land:h-auto land:min-h-0 land:w-full land:flex-1 land:max-h-[62svh]">
            <div aria-hidden className="glow absolute left-1/2 top-[55%] aspect-square h-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full" />
            <BrewScene brewer={recipe.brewer} iced={recipe.iceG !== undefined} scene={scene} className="relative h-full w-full" />
            {counting && (
              <div className="absolute inset-0 grid place-items-center" aria-live="assertive">
                <span key={Math.ceil(countIn)} className="animate-count-in font-display grid size-[clamp(96px,16svh,160px)] place-items-center rounded-full bg-bg/90 text-[clamp(64px,11svh,110px)] font-light leading-none shadow-[0_12px_40px_rgb(150_60_10/0.25)]">
                  <span className="sr-only">Starting in </span>{Math.ceil(countIn)}
                </span>
              </div>
            )}
          </div>
          <div className="mt-2 flex w-full items-end justify-center gap-5 tab:mt-4 tab:gap-8">
            <p className="text-right leading-none">
              <span className="font-display block text-[44px] font-light tab:text-[64px]">
                <Digits text={`${target}`} /><span className="ml-1 text-[0.4em] tracking-normal">g</span>
              </span>
              <span className="mt-1.5 block text-[13px] text-ink-soft tab:text-[15px]">on the scale, of {total} g</span>
            </p>
            <Rule className="h-12 tab:h-16" />
            <p className="leading-none" role="timer" aria-label={`${formatClock(elapsed)} elapsed`}>
              <Digits text={formatClock(elapsed)} className="font-display block text-[44px] font-light tab:text-[64px]" />
              <span className="mt-1.5 block text-[13px] text-ink-soft tab:text-[15px]">elapsed</span>
            </p>
          </div>
        </section>

        <section aria-label="Steps" className="mt-3 flex min-h-0 flex-1 flex-col tab:mt-6 land:mt-0 land:justify-center">
          <p className="shrink-0 text-[17px] font-bold text-accent-text tab:text-[22px]" aria-live="polite">{tagline}</p>
          <StepList
            recipe={recipe}
            live={{ stepIndex: index, secondsToNext: position.secondsToNext, reducedMotion }}
            className="-mx-3 mt-1.5 min-h-0 overflow-y-auto overscroll-contain tab:-mx-4 tab:mt-3 land:flex-none land:max-h-[62svh]"
          />
          <div className="mt-auto flex w-full shrink-0 gap-2.5 pt-4 tab:gap-3 tab:pt-6 land:mt-6 land:pt-0">
            {counting ? (
              <>
                <button className={secondaryClass} onClick={onStop}>Cancel</button>
                <button className={primaryClass} onClick={onNext}>Start now <Arrow /></button>
              </>
            ) : (
              <>
                <button className={secondaryClass} onClick={onPause}>{paused ? 'Resume' : 'Pause'}</button>
                <button className={primaryClass} onClick={onNext}>{isLast ? 'Finish' : 'Next step'} <Arrow /></button>
              </>
            )}
          </div>
        </section>
      </main>
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
    <div className={pageClass}>
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

      <div className="flex flex-1 flex-col tab:justify-center tab:pb-[6svh] land:grid land:grid-cols-2 land:grid-rows-[repeat(4,auto)] land:content-center land:gap-x-16 land:pb-0">
        <div className="mt-2.5 text-center tab:mt-4 land:col-start-2 land:row-start-1 land:mt-0 land:text-left">
          <p className="text-[19px] font-bold text-accent-text tab:text-[22px]">{recipe.name} · {recipe.author}</p>
          <h1 className="font-display mt-1 text-[clamp(52px,17vw,76px)] leading-[1.05] tab:text-[96px]">Brew done</h1>
        </div>

        <div className="relative mx-auto mt-7 size-[210px] tab:mt-10 tab:size-[300px] land:col-start-1 land:row-span-4 land:row-start-1 land:mt-0 land:size-[min(56svh,420px)] land:self-center">
          <div aria-hidden className="glow absolute left-1/2 top-1/2 aspect-square w-[170%] -translate-x-1/2 -translate-y-1/2 rounded-full" />
          <Sparkle size={22} className="absolute -left-[22%] top-[2%] text-ink land:-left-[6%]" />
          <Sparkle size={14} className="absolute -right-[14%] bottom-[10%] text-accent" />
          <RecipePhoto recipe={recipe} markSize={64} className="relative size-full rounded-full object-[50%_30%] shadow-[0_20px_44px_rgb(150_60_10/0.22)]" />
        </div>

        <ul aria-label="This brew" className="mt-8 flex justify-between tab:mt-12 tab:justify-center tab:gap-8 land:col-start-2 land:row-start-2 land:mt-8 land:justify-start">
          {stats.map((s) => (
            <li key={s.label}>
              <Ring fraction={s.fraction} gap="6%" className="size-[104px] tab:size-[140px]">
                <span className="font-figure text-[25cqi] font-light leading-none">{s.value}</span>
                <span className="mt-1 text-[max(12px,9cqi)] text-ink-soft">{s.label}</span>
              </Ring>
            </li>
          ))}
        </ul>

        <p className="mt-3.5 flex items-center justify-center gap-3 text-sm text-ink-soft tab:mt-6 tab:text-base land:col-start-2 land:row-start-3 land:justify-start">
          {recipe.iceG !== undefined ? 'Over ice' : 'Ratio'}<Rule className="h-[22px] tab:h-8" />
          <span className="font-figure text-2xl font-light text-ink tab:text-[32px]">{recipe.iceG !== undefined ? `${recipe.iceG} g` : `1:${+ratio(recipe).toFixed(1)}`}</span>
        </p>

        <div className="mt-auto flex gap-2.5 pt-6 tab:mt-12 tab:gap-3 tab:pt-0 land:col-start-2 land:row-start-4 land:mt-10">
          {backHref && <a href={backHref} className={secondaryClass}>Library</a>}
          <button className={primaryClass} onClick={onAgain}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" />
            </svg>
            Brew again
          </button>
        </div>
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
    <Brewing recipe={b.recipe} elapsed={b.elapsed} countIn={b.countIn} paused={b.paused} position={b.position} backHref={backHref}
      onPause={b.togglePause} onNext={b.next} onStop={b.stop} />
  )
}
