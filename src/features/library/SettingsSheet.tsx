import { useState } from 'react'
import type { ThemeChoice } from '../../storage/theme'
import { Sheet } from '../../ui/Sheet'

const THEMES: { value: ThemeChoice; label: string }[] = [
  { value: 'system', label: 'Device' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' },
]

export function SettingsSheet({ open, onClose, theme, onThemeChange, onExport, onImport }: {
  open: boolean
  onClose: () => void
  theme: ThemeChoice
  onThemeChange: (choice: ThemeChoice) => void
  onExport: () => void
  /** Receives the chosen file's text and returns a message to show the user. */
  onImport: (text: string) => string
}) {
  const [backupMessage, setBackupMessage] = useState('')

  return (
    <Sheet open={open} title="Settings" onClose={onClose}>
      <section className="py-3" aria-label="Appearance">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-soft">Appearance</h3>
        <div role="group" aria-label="Theme" className="flex gap-2">
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              aria-pressed={theme === t.value}
              onClick={() => onThemeChange(t.value)}
              className={`h-12 flex-1 rounded-xl text-base transition-colors ${
                theme === t.value ? 'bg-accent font-semibold text-accent-ink' : 'border-2 border-line bg-surface'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-ink-soft">Device follows your phone's light or dark setting.</p>
      </section>

      <section className="border-t border-line py-4" aria-label="Back up your recipes">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-soft">Your recipes</h3>
        <p className="text-ink-soft">
          Your recipes and favorites live only in this browser. Save a file to keep them safe or move them to another device.
        </p>
        <div className="mt-3 flex gap-3">
          <button
            type="button"
            className="h-14 flex-1 rounded-2xl border-2 border-line bg-surface font-semibold"
            onClick={onExport}
          >
            Save backup
          </button>
          <label className="grid h-14 flex-1 cursor-pointer place-items-center rounded-2xl border-2 border-line bg-surface font-semibold focus-within:outline focus-within:outline-[3px] focus-within:outline-accent">
            Import backup
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
      </section>

      <section className="border-t border-line py-4" aria-label="Photo credits">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-soft">Photo credits</h3>
        <p className="text-sm leading-relaxed text-ink-soft">
          AeroPress photo by Craft Coffee Spot,{' '}
          <a className="underline underline-offset-4" href="https://creativecommons.org/licenses/by/2.0" target="_blank" rel="noreferrer">CC BY 2.0</a>,
          via Wikimedia Commons. V60 photo supplied by the app's owner.
        </p>
      </section>
    </Sheet>
  )
}
