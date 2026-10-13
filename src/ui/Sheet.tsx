import { useEffect, useId, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * A panel that slides up from the bottom edge — the reachable place for a
 * thumb on a phone. Owns the modal behaviour (focus trap, Escape, backdrop,
 * scroll lock) so each sheet's own file is just its content.
 */
export function Sheet({ open, title, onClose, children, footer }: {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  /** Pinned below the scrolling content, clear of the phone's home indicator. */
  footer?: React.ReactNode
}) {
  const panel = useRef<HTMLDivElement>(null)
  const headingId = useId()

  useEffect(() => {
    if (!open) return
    // Return focus to whatever opened the sheet once it closes.
    const opener = document.activeElement as HTMLElement | null
    panel.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panel.current) return
      const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (items.length === 0) return
      const first = items[0]!
      const last = items[items.length - 1]!
      // Wrap at the ends so Tab cannot reach the page behind the sheet.
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      opener?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        aria-label={`Close ${title}`}
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-black/50"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="animate-slide-up relative mx-auto flex max-h-[90vh] w-full max-w-2xl flex-col rounded-t-[26px] bg-bg"
      >
        <span aria-hidden className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line" />
        <div className="flex items-center justify-between gap-4 px-5 pb-2 pt-3">
          <h2 id={headingId} className="font-heading text-3xl">{title}</h2>
          <button
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="grid h-11 w-11 shrink-0 place-items-center rounded bg-ink text-bg"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2">{children}</div>
        {footer && (
          <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">{footer}</div>
        )}
      </div>
    </div>
  )
}
