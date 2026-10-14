import { Fragment, useMemo, useState } from 'react'
import type { Recipe } from '../../domain/schema'
import { DEFAULT_QUERY, isFiltered, queryRecipes, type LibraryQuery, type SourceFilter } from '../../domain/library'
import { hrefFor } from '../../router'
import { formatClock } from '../../domain/clock'
import type { ThemeChoice } from '../../storage/theme'
import type { StoredSession } from '../../storage/activeSession'
import { RecipePhoto } from '../../ui/RecipePhoto'
import { Rule, Sparkle } from '../../ui/Ornaments'
import { FilterSheet, activeFilterCount } from './FilterSheet'
import { SettingsSheet } from './SettingsSheet'

const SOURCES: { value: SourceFilter; label: string }[] = [
  { value: 'all', label: 'All' }, { value: 'favorites', label: 'Favorites' }, { value: 'mine', label: 'Mine' },
]

export function Star({ on, className = '' }: { on: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden className={className} fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="m12 3.2 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" />
    </svg>
  )
}

/** The wordmark: thin Montserrat with an orange full stop. */
export function Wordmark({ className = 'text-[21px]' }: { className?: string }) {
  return (
    <span className={`font-figure tracking-[-0.03em] ${className}`}>
      Brew Guide<span aria-hidden className="ml-[3px] inline-block h-1.5 w-1.5 rounded-full bg-accent" />
    </span>
  )
}

function RecipeCard({ recipe, starred, onToggleFavorite }: {
  recipe: Recipe
  starred: boolean
  onToggleFavorite: () => void
}) {
  return (
    <li className="relative">
      <a href={hrefFor({ name: 'recipe', id: recipe.id })} className="relative block">
        {/* Author photos are 4:5 portraits, so the card keeps that shape at every width. */}
        <span className="relative block">
          {/* The orange corner bracket that frames each photo in the reference. */}
          <span aria-hidden className="absolute -bottom-1 -right-1.5 h-16 w-8 rounded-br-2xl border-b-[1.5px] border-r-[1.5px] border-accent" />
          <RecipePhoto recipe={recipe} className="relative aspect-[4/5] w-full rounded-2xl" />
        </span>
        <span className="mt-2.5 block font-heading text-[17px] leading-tight [text-wrap:balance] tab:mt-3 tab:text-xl">{recipe.name}</span>
        <span className="mt-0.5 block text-[13px] text-ink-soft tab:text-[15px]">{recipe.author}</span>
        <span className="font-figure mt-1.5 flex items-center gap-2 text-[13px] tab:text-[15px]">
          {recipe.doseG} g<Rule className="h-3.5" />{formatClock(recipe.totalSec)}
        </span>
      </a>
      <button
        aria-pressed={starred}
        aria-label={starred ? `Remove ${recipe.name} from favorites` : `Add ${recipe.name} to favorites`}
        onClick={onToggleFavorite}
        className="absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-accent"
      >
        <Star on={starred} />
      </button>
    </li>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
      <path d="M12 4v16M4 12h16" />
    </svg>
  )
}

function Empty({ query }: { query: LibraryQuery }) {
  const onlySource = !isFiltered({ ...query, source: 'all' })
  const message =
    query.source === 'favorites' && onlySource
      ? 'No favorites yet. Tap the star on a recipe to keep it here.'
      : query.source === 'mine' && onlySource
        ? 'You have no recipes of your own yet. Use New recipe to write one down.'
        : 'No recipes match. Try fewer filters or a different search.'
  return (
    <div className="animate-fade-in grid place-items-center px-6 py-16 text-center">
      <Sparkle size={28} className="text-accent" />
      <p className="mt-4 max-w-[28ch] text-lg text-ink-soft">{message}</p>
    </div>
  )
}

export function Library({ recipes, favorites, onToggleFavorite, onExport, onImport, theme, onThemeChange, resumable, storageError }: {
  recipes: readonly Recipe[]
  favorites: ReadonlySet<string>
  onToggleFavorite: (id: string) => void
  onExport: () => void
  /** Receives the chosen file's text and returns a message to show the user. */
  onImport: (text: string) => string
  theme: ThemeChoice
  onThemeChange: (choice: ThemeChoice) => void
  /** A brew left running, so the Library can offer to go back to it. */
  resumable: StoredSession | null
  /** The browser refused to save the personal recipes, most likely because photos filled its storage. */
  storageError: boolean
}) {
  const [query, setQuery] = useState<LibraryQuery>(DEFAULT_QUERY)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const set = (patch: Partial<LibraryQuery>) => setQuery((q) => ({ ...q, ...patch }))
  const shown = useMemo(() => queryRecipes(recipes, query, favorites), [recipes, query, favorites])
  const filterCount = activeFilterCount(query)

  return (
    <div className="mx-auto max-w-2xl px-5 pb-32 pt-[18px] tab:max-w-5xl tab:px-10 tab:pb-16 tab:pt-6">
      <header className="flex h-11 items-center justify-between">
        <Wordmark />
        <div className="flex gap-2">
          {/* On an iPad the header has room for it, so it stops floating over the cards. */}
          <a href={hrefFor({ name: 'new' })} className="hidden h-11 items-center gap-2 rounded-sm bg-ink px-4 text-sm font-bold text-bg tab:flex">
            <PlusIcon />
            New recipe
          </a>
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex h-11 items-center gap-2 rounded-sm border border-ink px-3.5 text-sm font-medium"
          >
            Filters
            {filterCount > 0 && (
              <span className="font-figure grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-xs font-medium text-ink">{filterCount}</span>
            )}
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
            className="grid h-11 w-11 place-items-center rounded bg-ink text-bg"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
              <circle cx="16" cy="7" r="2" />
              <circle cx="8" cy="17" r="2" />
            </svg>
          </button>
        </div>
      </header>

      <div role="group" aria-label="Show" className="mt-1 flex items-center gap-3">
        {SOURCES.map((s, i) => (
          <Fragment key={s.value}>
            {i > 0 && <span aria-hidden className="text-ink-soft/60">/</span>}
            <button
              aria-pressed={query.source === s.value}
              onClick={() => set({ source: s.value })}
              className={`h-11 ${query.source === s.value ? 'font-bold text-ink' : 'font-medium text-ink-soft'}`}
            >
              {s.label}
            </button>
          </Fragment>
        ))}
      </div>

      {storageError && (
        <p role="alert" className="mt-3 rounded-2xl bg-accent-tint px-4 py-3 text-[15px]">
          Your latest change could not be saved because this browser&rsquo;s storage is full. Remove a photo from one of your recipes, or save a backup from Settings.
        </p>
      )}

      <section className="relative mt-1.5 text-center">
        <Sparkle size={24} className="absolute left-0.5 top-0 text-ink" />
        <h1 className="font-display pt-[30px] text-[clamp(64px,21vw,96px)] leading-none">
          Recipes<sup className="font-figure ml-1 align-[2.6em] text-lg font-normal tracking-normal text-accent-text">{recipes.length}</sup>
        </h1>
      </section>

      {resumable && (
        <a
          href={hrefFor({ name: 'recipe', id: resumable.recipe.id })}
          className="mt-4 flex items-center gap-3 rounded-2xl bg-surface p-2 pr-4"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-ink text-bg">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden><path d="M8 5.5v13l11-6.5z" /></svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-bold">Brew in progress</span>
            <span className="block truncate font-heading text-[17px]">{resumable.recipe.name}</span>
          </span>
          <span aria-hidden className="text-accent">→</span>
        </a>
      )}

      <label className="mt-3.5 flex h-[52px] items-center gap-2.5 rounded-[14px] bg-surface px-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-bg">
          <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
        </span>
        <input
          type="search"
          aria-label="Search recipes"
          placeholder="Search by recipe, author or note"
          value={query.search}
          onChange={(e) => set({ search: e.target.value })}
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-soft"
        />
      </label>

      <p className="mt-4 text-sm text-ink-soft" aria-live="polite">
        {shown.length} {shown.length === 1 ? 'recipe' : 'recipes'}
        {isFiltered(query) && (
          <button className="ml-3 h-11 font-medium text-ink underline underline-offset-4" onClick={() => setQuery((q) => ({ ...DEFAULT_QUERY, sort: q.sort }))}>
            Clear filters
          </button>
        )}
      </p>

      {/* Reserving the height keeps a shorter filtered list from shifting the page. */}
      <div className="mt-2 min-h-[60vh]">
        {shown.length === 0 ? (
          <Empty query={query} />
        ) : (
          <ul key={`${query.source}-${filterCount}`} className="animate-fade-in grid grid-cols-2 gap-x-3.5 gap-y-6 sm:grid-cols-3 tab:gap-x-6 tab:gap-y-9 land:grid-cols-4">
            {shown.map((r) => (
              <RecipeCard
                key={r.id}
                recipe={r}
                starred={favorites.has(r.id)}
                onToggleFavorite={() => onToggleFavorite(r.id)}
              />
            ))}
          </ul>
        )}
      </div>

      <a
        href={hrefFor({ name: 'new' })}
        className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-5 flex h-[54px] items-center gap-2.5 rounded-sm bg-ink px-6 text-base font-bold text-bg shadow-[0_12px_30px_rgb(0_0_0/0.22)] tab:hidden"
      >
        <PlusIcon />
        New recipe
      </a>

      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        query={query}
        onChange={set}
        recipes={recipes}
        shownCount={shown.length}
      />
      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        onThemeChange={onThemeChange}
        onExport={onExport}
        onImport={onImport}
        recipes={recipes}
      />
    </div>
  )
}
