/** The four-point star the design scatters near its hero words. Decorative only. */
export function Sparkle({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className={className}>
      <path d="M12 0C12.6 7 17 11.4 24 12 17 12.6 12.6 17 12 24 11.4 17 7 12.6 0 12 7 11.4 11.4 7 12 0Z" fill="currentColor" />
    </svg>
  )
}

/**
 * A stat circle: a filled disc with a thin orange arc around it showing
 * `fraction` (0 to 1) clockwise from the top. Its children sit in the middle.
 */
export function Ring({ size, fraction, stroke = 2.5, gap, children, className = '' }: {
  size: number
  fraction: number
  stroke?: number
  /** Space between the arc and the disc; defaults to a size-relative gap. */
  gap?: number
  children?: React.ReactNode
  className?: string
}) {
  const deg = Math.max(0, Math.min(1, fraction)) * 360
  const inner = size / 2 - stroke
  const inset = gap ?? Math.round(size * 0.045)
  const mask = `radial-gradient(circle, transparent ${inner - 0.5}px, #000 ${inner}px)`
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(var(--accent) 0deg ${deg}deg, transparent ${deg}deg 360deg)`,
          WebkitMask: mask,
          mask,
        }}
      />
      <div className="absolute flex flex-col items-center justify-center rounded-full bg-surface text-center" style={{ inset }}>
        {children}
      </div>
    </div>
  )
}

/** The divider in "Dose | 20 g": a short orange rule between a label and its figure. */
export function Rule({ className = 'h-7' }: { className?: string }) {
  return <span aria-hidden className={`w-px shrink-0 bg-accent ${className}`} />
}
