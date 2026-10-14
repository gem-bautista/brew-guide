import { useEffect, useRef } from 'react'
import type { Recipe } from '../../domain/schema'
import { stepRows } from '../../domain/stepRows'
import { formatClock } from '../../domain/clock'

/**
 * Every Step of the brew in order, ending with "Brew done". Live, a Step is
 * struck through once the next one starts, the current Step is enlarged with
 * its technique and a countdown, and later Steps are dimmed. Without `live`
 * it is the read-only route shown on the Preview.
 *
 * When the list is taller than its scroll box, the current Step is kept in
 * view without anyone touching the screen.
 */
export function StepList({ recipe, live, className = '' }: {
  recipe: Pick<Recipe, 'steps' | 'totalSec'>
  live?: { stepIndex: number; secondsToNext: number; reducedMotion: boolean }
  className?: string
}) {
  const rows = stepRows(recipe.steps)
  const box = useRef<HTMLOListElement>(null)
  const current = live?.stepIndex ?? -1

  useEffect(() => {
    const list = box.current
    const row = list?.querySelector<HTMLElement>('[aria-current="step"]')
    if (!list || !row || list.scrollHeight <= list.clientHeight) return
    list.scrollTo({ top: row.offsetTop - list.clientHeight * 0.2, behavior: live?.reducedMotion ? 'auto' : 'smooth' })
  }, [current, live?.reducedMotion])

  const all = [...rows, { id: 'done', startSec: recipe.totalSec, title: 'Brew done', addedG: undefined, instruction: '' }]

  return (
    <ol ref={box} aria-label="Steps" className={`relative ${className}`}>
      {all.map((row, i) => {
        const state = !live ? 'route' : i < current ? 'done' : i === current ? 'now' : 'later'
        const now = state === 'now'
        return (
          <li
            key={row.id}
            aria-current={now ? 'step' : undefined}
            className={`grid grid-cols-[3.4em_minmax(0,1fr)_auto] items-baseline gap-x-3 rounded-xl px-3 transition-colors duration-300 tab:px-4 ${
              now ? 'bg-surface py-3.5 tab:py-5' : 'py-2 tab:py-2.5'
            } ${state === 'later' ? 'opacity-55' : ''}`}
          >
            <span className={`font-figure text-[15px] tab:text-lg ${state === 'done' ? 'text-ink-soft' : ''} ${now ? 'text-accent-text font-bold' : ''}`}>
              {formatClock(row.startSec)}
            </span>
            <span className="min-w-0">
              <span className={`relative inline-block leading-tight ${state === 'done' ? 'text-ink-soft' : ''} ${
                now ? 'font-heading text-[26px] tab:text-[34px]' : 'font-heading text-lg tab:text-[22px]'
              }`}>
                {row.title}
                {row.addedG !== undefined && (
                  <span className="font-figure ml-2 align-[0.1em] text-[0.62em] font-medium text-ink-soft">+{row.addedG} g</span>
                )}
                {live && (
                  <span aria-hidden className={`strike absolute left-0 right-0 top-[55%] h-[2px] bg-ink-soft ${state === 'done' ? 'scale-x-100' : 'scale-x-0'}`} />
                )}
                {state === 'done' && <span className="sr-only"> (done)</span>}
              </span>
              {row.instruction && (now || state === 'route') && (
                <span className={`block max-w-[46ch] text-ink-soft [text-wrap:pretty] ${now ? 'mt-1.5 text-base leading-snug tab:text-xl' : 'mt-0.5 text-sm leading-snug tab:text-[15px]'}`}>
                  {row.instruction}
                </span>
              )}
            </span>
            {now && live && (
              <span className="text-right leading-none">
                <span className="font-figure block text-[26px] font-light tab:text-[34px]">{formatClock(live.secondsToNext)}</span>
                <span className="mt-1 block text-xs text-ink-soft tab:text-sm">{i === rows.length - 1 ? 'to done' : 'to next'}</span>
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
