import { useMemo, useState } from 'react'
import type { Recipe } from '../../domain/schema'
import { totalWater } from '../../domain/cumulative'
import { DEFAULT_QUERY, isFiltered, queryRecipes, type LibraryQuery, type SourceFilter } from '../../domain/library'
import { hrefFor } from '../../router'
import { formatClock } from '../../domain/clock'
import type { ThemeChoice } from '../../storage/theme'
import type { StoredSession } from '../../storage/activeSession'
import { BrewerArt } from '../../ui/BrewerArt'
import { FilterSheet, activeFilterCount } from './FilterSheet'
import { SettingsSheet } from './SettingsSheet'

const SOURCES: { value: SourceFilter; label: string }[] = [
  { value: 'all', label: 'All' }, { value: 'favorites', label: 'Favorites' }, { value: 'mine', label: 'Mine' },
]

function Star({ on, name, onToggle }: { on: boolean; name: string; onToggle: () => void }) {
  return (
    <button
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
      onClick={onToggle}
      className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-accent"
    >
      <svg viewBox="0 0 24 24" width="26" height="26" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
        <path d="m12 3.2 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" />
      </svg>
    </button>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-line px-2.5 py-1 text-sm tabular-nums text-ink-soft">{children}</span>
}

function RecipeCard({ recipe, starred, onToggleFavorite }: {
  recipe: Recipe
  starred: boolean
  onToggleFavorite: () => void
}) {
  return (
    <li className="flex items-stretch overflow-hidden rounded-2xl border border-line bg-surface">
      <BrewerArt brewer={recipe.brewer} className="w-[88px] sm:w-[108px]" />
      <a href={hrefFor({ name: 'recipe', id: recipe.id })} className="min-w-0 flex-1 py-3 pl-4 pr-1">
        <span className="font-display block text-xl leading-tight">{recipe.name}</span>
        <span className="mt-1 block text-sm text-ink-soft">{recipe.author} · {recipe.brewer}</span>
        <span className="mt-2 flex flex-wrap gap-1.5">
          <Chip>{recipe.doseG} g</Chip>
          <Chip>{totalWater(recipe)} g</Chip>
          <Chip>{formatClock(recipe.totalSec)}</Chip>
        </span>
      </a>
      <div className="pr-1 pt-2">
        <Star on={starred} name={recipe.name} onToggle={onToggleFavorite} />
      </div>
    </li>
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
      <svg viewBox="0 0 48 48" width="56" height="56" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-ink-soft/60">
        <path d="M9 13h30L25.8 31.6a2.2 2.2 0 0 1-3.6 0L9 13Z" />
        <path d="M24 36v5M17 41h14" />
      </svg>
      <p className="mt-4 max-w-[28ch] text-lg text-ink-soft">{message}</p>
    </div>
  )
}

export function Library({ recipes, favorites, onToggleFavorite, onExport, onImport, theme, onThemeChange, resumable }: {
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
}) {
  const [query, setQuery] = useState<LibraryQuery>(DEFAULT_QUERY)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const set = (patch: Partial<LibraryQuery>) => setQuery((q) => ({ ...q, ...patch }))
  const shown = useMemo(() => queryRecipes(recipes, query, favorites), [recipes, query, favorites])
  const filterCount = activeFilterCount(query)

  return (
    <div className="mx-auto max-w-2xl px-5 pb-28 pt-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl leading-none">Brew Guide</h1>
          <p className="mt-1.5 text-ink-soft">Your recipes, timed pour by pour.</p>
        </div>
        <button
          onClick={() => setSettingsOpen(true)}
          aria-label="Settings"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-line bg-surface"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3.2" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
          </svg>
        </button>
      </header>

      {resumable && (
        <a
          href={hrefFor({ name: 'recipe', id: resumable.recipe.id })}
          className="mt-5 flex items-center gap-3 rounded-2xl border-2 border-accent bg-surface px-4 py-3"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-accent-ink">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden><path d="M8 5.5v13l11-6.5z" /></svg>
          </span>
          <span className="min-w-0">
            <span className="block font-semibold">Brew in progress</span>
            <span className="block truncate text-sm text-ink-soft">{resumable.recipe.name}</span>
          </span>
        </a>
      )}

      <div className="mt-5 flex flex-col gap-3">
        <input
          type="search"
          aria-label="Search recipes"
          placeholder="Search by recipe, author or note"
          value={query.search}
          onChange={(e) => set({ search: e.target.value })}
          className="h-14 rounded-2xl border-2 border-line bg-surface px-4 text-lg text-ink"
        />
        <div className="flex gap-2">
          <div role="group" aria-label="Show" className="flex flex-1 gap-2">
            {SOURCES.map((s) => (
              <button
                key={s.value}
                aria-pressed={query.source === s.value}
                onClick={() => set({ source: s.value })}
                className={`h-12 flex-1 rounded-xl text-base transition-colors ${
                  query.source === s.value ? 'bg-accent font-semibold text-accent-ink' : 'border-2 border-line bg-surface'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex h-12 shrink-0 items-center gap-2 rounded-xl border-2 border-line bg-surface px-3.5 text-base"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M3 6h18M6 12h12M10 18h4" />
            </svg>
            Filters
            {filterCount > 0 && (
              <span className="grid h-6 min-w-6 place-items-center rounded-full bg-accent px-1.5 text-sm font-semibold text-accent-ink">
                {filterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <p className="mt-5 text-sm text-ink-soft" aria-live="polite">
        {shown.length} {shown.length === 1 ? 'recipe' : 'recipes'}
        {isFiltered(query) && (
          <button className="ml-3 underline underline-offset-4" onClick={() => setQuery((q) => ({ ...DEFAULT_QUERY, sort: q.sort }))}>
            Clear filters
          </button>
        )}
      </p>

      {/* Reserving the height keeps a shorter filtered list from shifting the page. */}
      <div className="mt-3 min-h-[60vh]">
        {shown.length === 0 ? (
          <Empty query={query} />
        ) : (
          <ul key={`${query.source}-${filterCount}`} className="animate-fade-in flex flex-col gap-3">
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
        className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 flex h-14 items-center gap-2 rounded-full bg-accent pl-4 pr-5 text-lg font-semibold text-accent-ink shadow-lg shadow-black/20"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
          <path d="M12 5v14M5 12h14" />
        </svg>
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
      />
    </div>
  )
}
