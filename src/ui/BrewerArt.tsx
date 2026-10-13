import type { Brewer } from '../domain/schema'

/** Flat-bottom brewers read wrong as a cone, so they get their own outline. */
export const FLAT_BOTTOM: ReadonlySet<Brewer> = new Set<Brewer>(['Kalita Wave', 'Orea'])

export function Mark({ brewer, size = 40 }: { brewer: Brewer; size?: number }) {
  const flat = FLAT_BOTTOM.has(brewer)
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {flat ? (
        <path d="M11 13h26l-3 16a4 4 0 0 1-4 3.4H18a4 4 0 0 1-4-3.4L11 13Z" />
      ) : (
        <path d="M9 13h30L25.8 31.6a2.2 2.2 0 0 1-3.6 0L9 13Z" />
      )}
      <path d="M21 36h6" />
      <path d="M24 36v5" />
      <path d="M17 41h14" />
    </svg>
  )
}
