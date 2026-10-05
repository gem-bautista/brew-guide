import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BUILT_IN_RECIPES } from './data/builtInRecipes'
import { uid } from './domain/clock'
import { duplicateDraft, recipeToDraft, templateDraft } from './domain/draft'
import type { Recipe } from './domain/schema'
import { exportJson, mergeImported, parseImport } from './domain/transfer'
import { Editor } from './features/editor/Editor'
import { Library } from './features/library/Library'
import { SessionScreen } from './features/session/SessionScreen'
import { loadFavorites, loadPersonalRecipes, saveFavorites, savePersonalRecipes } from './storage/library'
import { applyTheme, loadTheme, type ThemeChoice } from './storage/theme'
import { loadActiveSession } from './storage/activeSession'
import { hrefFor, navigate, useRoute } from './router'

const BUILT_IN_IDS: ReadonlySet<string> = new Set(BUILT_IN_RECIPES.map((r) => r.id))

function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  a.click()
  URL.revokeObjectURL(url)
}

function NotFound() {
  return (
    <div className="mx-auto max-w-xl p-6">
      <p className="font-display text-3xl font-normal">That recipe is not in your library.</p>
      <a className="mt-4 inline-block underline underline-offset-4" href={hrefFor({ name: 'library' })}>Back to the Library</a>
    </div>
  )
}

const actionClass = 'grid h-14 flex-1 place-items-center rounded-2xl border-2 border-line bg-surface text-lg font-semibold'

export function App() {
  const route = useRoute()
  const [favorites, setFavorites] = useState(loadFavorites)
  const [personal, setPersonal] = useState(loadPersonalRecipes)
  const [theme, setTheme] = useState(loadTheme)
  const recipes = useMemo(() => [...BUILT_IN_RECIPES, ...personal], [personal])

  // Read on each visit to the Library, so the banner reflects a brew that was
  // started, finished or discarded on another screen.
  const resumable = route.name === 'library' ? loadActiveSession() : null

  const changeTheme = useCallback((choice: ThemeChoice) => {
    applyTheme(choice)
    setTheme(choice)
  }, [])

  // Skip the first run so loading never rewrites storage (an entry that fails validation stays on disk until the user changes something).
  const loaded = useRef(false)
  useEffect(() => {
    if (loaded.current) savePersonalRecipes(personal)
    loaded.current = true
  }, [personal])

  const updateFavorites = useCallback((next: Set<string>) => {
    saveFavorites(next)
    setFavorites(next)
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    const next = new Set(favorites)
    if (!next.delete(id)) next.add(id)
    updateFavorites(next)
  }, [favorites, updateFavorites])

  const savePersonal = useCallback((recipe: Recipe) => {
    setPersonal((prev) => (prev.some((r) => r.id === recipe.id) ? prev.map((r) => (r.id === recipe.id ? recipe : r)) : [...prev, recipe]))
    navigate({ name: 'recipe', id: recipe.id })
  }, [])

  const deletePersonal = useCallback((recipe: Recipe) => {
    if (!window.confirm(`Delete "${recipe.name}"? This cannot be undone.`)) return
    setPersonal((prev) => prev.filter((r) => r.id !== recipe.id))
    if (favorites.has(recipe.id)) {
      const next = new Set(favorites)
      next.delete(recipe.id)
      updateFavorites(next)
    }
    navigate({ name: 'library' })
  }, [favorites, updateFavorites])

  const exportBackup = useCallback(() => {
    downloadText('brew-guide-backup.json', exportJson(personal, favorites))
  }, [personal, favorites])

  const importBackup = useCallback((text: string): string => {
    const result = parseImport(text)
    if (!result.ok) return result.error
    setPersonal((prev) => mergeImported(prev, result.recipes, BUILT_IN_IDS, uid))
    updateFavorites(new Set([...favorites, ...result.favorites]))
    const n = result.recipes.length
    const skipped = result.skipped ? ` ${result.skipped} could not be read and were skipped.` : ''
    return `Imported ${n} ${n === 1 ? 'recipe' : 'recipes'}.${skipped}`
  }, [favorites, updateFavorites])

  const library = hrefFor({ name: 'library' })

  if (route.name === 'new') {
    return <Editor key="new" title="New recipe" initial={templateDraft()} cancelHref={library} onSave={savePersonal} />
  }

  if (route.name === 'duplicate' || route.name === 'edit' || route.name === 'recipe') {
    const recipe = recipes.find((r) => r.id === route.id)
    if (!recipe || (route.name === 'edit' && recipe.origin !== 'personal')) return <NotFound />
    const here = hrefFor({ name: 'recipe', id: recipe.id })
    if (route.name === 'duplicate') {
      return <Editor key={`dup-${recipe.id}`} title="Duplicate and edit" initial={duplicateDraft(recipe)} cancelHref={here} onSave={savePersonal} />
    }
    if (route.name === 'edit') {
      return <Editor key={`edit-${recipe.id}`} title="Edit recipe" initial={recipeToDraft(recipe)} cancelHref={here} onSave={savePersonal} />
    }
    return (
      <SessionScreen
        key={recipe.id}
        recipe={recipe}
        backHref={library}
        extra={
          recipe.origin === 'personal' ? (
            <>
              <a className={actionClass} href={hrefFor({ name: 'edit', id: recipe.id })}>Edit</a>
              <button className={actionClass} onClick={() => deletePersonal(recipe)}>Delete</button>
            </>
          ) : (
            <a className={actionClass} href={hrefFor({ name: 'duplicate', id: recipe.id })}>Duplicate and edit</a>
          )
        }
      />
    )
  }

  return (
    <Library
      recipes={recipes}
      favorites={favorites}
      onToggleFavorite={toggleFavorite}
      onExport={exportBackup}
      onImport={importBackup}
      theme={theme}
      onThemeChange={changeTheme}
      resumable={resumable}
    />
  )
}
