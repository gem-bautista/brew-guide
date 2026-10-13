import { useState } from 'react'
import type { Recipe } from '../../domain/schema'
import type { ThemeChoice } from '../../storage/theme'
import { RecipePhoto } from '../../ui/RecipePhoto'
import { Sheet } from '../../ui/Sheet'

const THEMES: { value: ThemeChoice; label: string }[] = [
  { value: 'system', label: 'Device' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' },
]

/** Where each author's photo comes from. Keep this in step with public/photos/recipes. */
const PHOTO_SOURCES: Record<string, string> = {
  'Tetsu Kasuya': 'still from HARIO’s “4:6 method” video',
  'James Hoffmann': 'stills from his YouTube videos',
  'Lance Hedrick': 'stills from his YouTube videos',
  'Nemo Pop': 'World AeroPress Championship 2025',
}

function Label({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 mt-6 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft first:mt-3">{children}</h3>
}

function RowIcon({ path }: { path: string }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-bg">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
      </svg>
    </span>
  )
}

const rowClass = 'flex h-14 items-center gap-3 rounded-[14px] bg-surface pl-2 pr-3.5 text-[15px] font-semibold'

export function SettingsSheet({ open, onClose, theme, onThemeChange, onExport, onImport, recipes }: {
  open: boolean
  onClose: () => void
  theme: ThemeChoice
  onThemeChange: (choice: ThemeChoice) => void
  onExport: () => void
  /** Receives the chosen file's text and returns a message to show the user. */
  onImport: (text: string) => string
  recipes: readonly Recipe[]
}) {
  const [backupMessage, setBackupMessage] = useState('')
  // One credit per author, illustrated with their first built-in photo.
  const credits = Object.keys(PHOTO_SOURCES).flatMap((author) => {
    const recipe = recipes.find((r) => r.origin === 'built-in' && r.author === author && r.photo)
    return recipe ? [{ author, recipe }] : []
  })

  return (
    <Sheet open={open} title="Settings" onClose={onClose}>
      <Label>Appearance</Label>
      <div role="group" aria-label="Theme" className="flex rounded-[14px] bg-surface p-1">
        {THEMES.map((t) => (
          <button
            key={t.value}
            type="button"
            aria-pressed={theme === t.value}
            onClick={() => onThemeChange(t.value)}
            className={`h-11 flex-1 rounded-[10px] text-[15px] transition-colors ${
              theme === t.value ? 'bg-ink font-semibold text-bg' : 'font-medium'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[13px] text-ink-soft">Device follows your phone&rsquo;s light or dark setting.</p>

      <Label>Your recipes</Label>
      <p className="text-sm leading-relaxed text-ink-soft">
        Your recipes and favorites live only in this browser. Save a file to keep them safe or move them to another device.
      </p>
      <div className="mt-3 flex flex-col gap-2">
        <button type="button" className={rowClass} onClick={onExport}>
          <RowIcon path="M12 4v11M7 10l5 5 5-5M5 20h14" />
          <span className="flex-1 text-left">Save backup</span>
          <span aria-hidden>›</span>
        </button>
        <label className={`${rowClass} cursor-pointer focus-within:outline focus-within:outline-[3px] focus-within:outline-accent`}>
          <RowIcon path="M12 15V4M7 9l5-5 5 5M5 20h14" />
          <span className="flex-1">Import backup</span>
          <span aria-hidden>›</span>
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) setBackupMessage(onImport(await file.text()))
            }}
          />
        </label>
      </div>
      {backupMessage && <p role="status" className="mt-3">{backupMessage}</p>}

      <Label>Photo credits</Label>
      <ul className="flex flex-col gap-3 pb-4">
        {credits.map(({ author, recipe }) => (
          <li key={author} className="flex items-center gap-3">
            <RecipePhoto recipe={{ ...recipe, photoAlt: '' }} markSize={20} className="h-10 w-10 shrink-0 rounded-full object-[50%_22%]" />
            <span className="text-[13px] leading-snug text-ink-soft">
              <span className="font-bold text-ink">{author}</span> · {PHOTO_SOURCES[author]}
            </span>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}
