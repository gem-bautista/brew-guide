import type { Brewer } from '../domain/schema'

/**
 * Photographs exist for the two brewers the built-in recipes use. Every other
 * brewer falls back to a drawn mark on a tinted panel, which fills the same
 * slot and follows the theme, rather than a stand-in photo of the wrong gear.
 */
const PHOTOS: Partial<Record<Brewer, { src: string; alt: string }>> = {
  V60: {
    src: 'photos/brewer-v60.jpg',
    alt: 'A gooseneck kettle pouring into a Hario V60 on a scale',
  },
  Aeropress: {
    src: 'photos/brewer-aeropress.jpg',
    alt: 'An AeroPress being pressed into a glass carafe',
  },
}

/** Flat-bottom brewers read wrong as a cone, so they get their own outline. */
const FLAT_BOTTOM: ReadonlySet<Brewer> = new Set<Brewer>(['Kalita Wave', 'Orea'])

function Mark({ brewer }: { brewer: Brewer }) {
  const flat = FLAT_BOTTOM.has(brewer)
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

/**
 * Fills the card's left edge, top to bottom. The caller sets the width; this
 * stretches to whatever height the card's text column ends up being.
 */
export function BrewerArt({ brewer, className = '' }: { brewer: Brewer; className?: string }) {
  const photo = PHOTOS[brewer]
  if (photo) {
    return (
      <img
        src={photo.src}
        alt={photo.alt}
        loading="lazy"
        decoding="async"
        className={`block h-auto self-stretch bg-line object-cover brightness-[var(--photo-dim)] ${className}`}
      />
    )
  }
  return (
    <div
      role="img"
      aria-label={brewer}
      className={`grid shrink-0 self-stretch place-items-center bg-line/60 text-ink-soft ${className}`}
    >
      <Mark brewer={brewer} />
    </div>
  )
}
