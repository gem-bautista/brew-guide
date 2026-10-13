import { BREWERS, type Brewer } from '../../domain/schema'
import { DEFAULT_QUERY, type LibraryQuery, type SortKey, type TimeBucket } from '../../domain/library'
import { Sheet } from '../../ui/Sheet'

const TIMES: { value: TimeBucket; label: string }[] = [
  { value: 'any', label: 'Any time' }, { value: 'under-3', label: 'Under 3 min' },
  { value: '3-4', label: '3 to 4 min' }, { value: 'over-4', label: 'Over 4 min' },
]
const SORTS: { value: SortKey; label: string }[] = [
  { value: 'name', label: 'Name' }, { value: 'time', label: 'Brew time' }, { value: 'recent', label: 'Recently added' },
]

/**
 * Brewer, author and time narrow the list; sort only reorders it. Only the
 * first three count as "active", which is what the button's badge shows.
 */
export function activeFilterCount(q: LibraryQuery): number {
  return Number(q.brewer !== 'any') + Number(q.author !== 'any') + Number(q.time !== 'any')
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`h-11 rounded-full px-4 text-[15px] transition-colors ${
        on ? 'bg-ink font-semibold text-bg' : 'bg-surface font-medium text-ink'
      }`}
    >
      {children}
    </button>
  )
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="pt-[18px]" aria-label={label}>
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">{label}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  )
}

export function FilterSheet({ open, onClose, query, onChange, recipes, shownCount }: {
  open: boolean
  onClose: () => void
  query: LibraryQuery
  onChange: (patch: Partial<LibraryQuery>) => void
  /** Only the brewers and authors actually present become chips. */
  recipes: readonly { brewer: Brewer; author: string }[]
  shownCount: number
}) {
  const brewers = BREWERS.filter((b) => recipes.some((r) => r.brewer === b))
  const authors = [...new Set(recipes.map((r) => r.author))].sort()
  const count = activeFilterCount(query)

  return (
    <Sheet
      open={open}
      title="Filters"
      onClose={onClose}
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onChange({ brewer: 'any', author: 'any', time: 'any' })}
            disabled={count === 0}
            className="h-14 flex-1 rounded-sm border border-ink text-base font-bold disabled:opacity-40"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-14 flex-[2] rounded-sm bg-ink text-base font-bold text-bg"
          >
            Show {shownCount} {shownCount === 1 ? 'recipe' : 'recipes'}
          </button>
        </div>
      }
    >
      <p className="text-sm text-ink-soft">The list updates as you choose.</p>

      <Group label="Brewer">
        <Chip on={query.brewer === 'any'} onClick={() => onChange({ brewer: 'any' })}>Any brewer</Chip>
        {brewers.map((b) => (
          <Chip key={b} on={query.brewer === b} onClick={() => onChange({ brewer: b })}>{b}</Chip>
        ))}
      </Group>

      <Group label="Author">
        <Chip on={query.author === 'any'} onClick={() => onChange({ author: 'any' })}>Any author</Chip>
        {authors.map((a) => (
          <Chip key={a} on={query.author === a} onClick={() => onChange({ author: a })}>{a}</Chip>
        ))}
      </Group>

      <Group label="Brew time">
        {TIMES.map((t) => (
          <Chip key={t.value} on={query.time === t.value} onClick={() => onChange({ time: t.value })}>{t.label}</Chip>
        ))}
      </Group>

      <Group label="Sort by">
        {SORTS.map((s) => (
          <Chip key={s.value} on={query.sort === s.value} onClick={() => onChange({ sort: s.value })}>{s.label}</Chip>
        ))}
      </Group>

      <p className="pb-2 pt-5 text-[13px] leading-relaxed text-ink-soft">
        Search and All / Favorites / Mine stay on the Library.
        {' '}Reset clears {DEFAULT_QUERY.sort === query.sort ? 'the filters' : 'the filters but keeps your sort'}.
      </p>
    </Sheet>
  )
}
