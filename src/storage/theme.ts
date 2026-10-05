const THEME_KEY = 'brew-guide:theme'

/** 'system' follows the device; the other two override it. */
export type ThemeChoice = 'system' | 'light' | 'dark'

export function loadTheme(): ThemeChoice {
  try {
    const raw = localStorage.getItem(THEME_KEY)
    return raw === 'light' || raw === 'dark' ? raw : 'system'
  } catch {
    return 'system'
  }
}

/**
 * Writes the choice to the <html> element, which is what the CSS reads, and
 * saves it. `index.html` runs the same attribution before first paint so the
 * page never flashes the wrong theme.
 */
export function applyTheme(choice: ThemeChoice): void {
  const root = document.documentElement
  if (choice === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', choice)
  try {
    if (choice === 'system') localStorage.removeItem(THEME_KEY)
    else localStorage.setItem(THEME_KEY, choice)
  } catch {
    /* storage unavailable: the choice lasts until the page closes */
  }
}
