/**
 * A native select with our own chevron. The browser's arrow sits flush against
 * the control's edge and cannot be moved, so we hide it (`.field-select`) and
 * overlay this one, inset from the edge and coloured by the current theme.
 */
export function Select({ className = '', children, ...props }: React.ComponentProps<'select'>) {
  return (
    <span className="relative block">
      <select {...props} className={`field-select ${className}`}>
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-accent"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  )
}
