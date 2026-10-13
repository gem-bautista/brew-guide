import { useId } from 'react'
import type { Brewer } from '../domain/schema'
import { FLAT_BOTTOM } from './BrewerArt'

/**
 * Line drawings of each Brewer, in a 120 x 100 box. `inside` is the hollow
 * the water fills: `top`/`bottom` are its vertical extent, and
 * `topWidth`/`bottomWidth` its width at each end.
 */
interface Shape {
  inside: string
  top: number
  bottom: number
  topWidth: number
  bottomWidth: number
  /** Everything drawn over the water: rim, base, markings. */
  details: string[]
}

const CONE: Shape = {
  inside: 'M18 22H102L70 80H50Z',
  top: 22,
  bottom: 80,
  topWidth: 84,
  bottomWidth: 20,
  details: ['M12 22H108', 'M50 80V88M70 80V88', 'M38 88H82'],
}

const FLAT: Shape = {
  inside: 'M20 22H100L90 74Q89 78 85 78H35Q31 78 30 74Z',
  top: 22,
  bottom: 78,
  topWidth: 80,
  bottomWidth: 60,
  details: ['M14 22H106', 'M46 78V88M74 78V88', 'M36 88H84'],
}

const PRESS: Shape = {
  inside: 'M40 14H80V82H40Z',
  top: 14,
  bottom: 82,
  topWidth: 40,
  bottomWidth: 40,
  details: ['M32 14H88', 'M36 82H84L82 90H38Z', 'M40 32h7M40 48h7M40 64h7'],
}

/**
 * Height of water that covers `fraction` of the hollow's drawn area. A cone
 * is narrow at the bottom, so a bloom drawn at a fifth of the height would
 * look like far less than a fifth of the water.
 */
function levelFor({ top, bottom, topWidth, bottomWidth }: Shape, fraction: number): number {
  const depth = bottom - top
  const area = (fraction * depth * (topWidth + bottomWidth)) / 2
  const flare = (topWidth - bottomWidth) / depth
  if (flare === 0) return area / bottomWidth
  // Solve flare/2 * h^2 + bottomWidth * h = area for h.
  return (Math.sqrt(bottomWidth ** 2 + 2 * flare * area) - bottomWidth) / flare
}

function shapeFor(brewer: Brewer): Shape {
  if (brewer === 'Aeropress') return PRESS
  return FLAT_BOTTOM.has(brewer) ? FLAT : CONE
}

/**
 * The Brewer with water in it, holding `fraction` (0 to 1) of what it holds
 * when full, measured by drawn area rather than height. Decorative only:
 * the gram reading beside it always carries the number in text.
 */
export function BrewerFill({ brewer, fraction, className = '' }: { brewer: Brewer; fraction: number; className?: string }) {
  const clip = useId()
  const shape = shapeFor(brewer)
  const { inside, top, bottom, details } = shape
  const depth = bottom - top
  const f = Math.min(1, Math.max(0, fraction))
  const level = levelFor(shape, f)
  return (
    <svg
      viewBox="0 0 120 100"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-ink ${className}`}
    >
      <defs>
        <clipPath id={clip}>
          <path d={inside} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        {/* Moves as one piece; the ticks are 200 ms apart, so a matching linear transition keeps the rise smooth. */}
        <g className="transition-transform duration-200 ease-linear" style={{ transform: `translateY(${depth - level}px)` }}>
          <rect x="0" y={top} width="120" height={depth} className="fill-accent/30" stroke="none" />
          {f > 0 && <path d={`M0 ${top}H120`} className="stroke-accent" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />}
        </g>
      </g>
      <path d={inside} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      {details.map((d) => (
        <path key={d} d={d} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  )
}

/** Three wisps rising off a finished brew. Held still under reduced motion. */
export function Steam({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" aria-hidden fill="none" stroke="currentColor" strokeLinecap="round" className={`w-auto text-ink-soft ${className}`}>
      {[44, 60, 76].map((x, i) => (
        <path
          key={x}
          d={`M${x} 38c-5-6 5-10 0-16s5-10 0-16`}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          className="animate-steam"
          style={{ animationDelay: `${i * 0.7}s` }}
        />
      ))}
    </svg>
  )
}
