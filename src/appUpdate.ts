import { registerSW } from 'virtual:pwa-register'

const HOUR_MS = 60 * 60 * 1000

/** Set while a brew is on screen, from its Count-in to Brew done. */
let brewing = false
let applyIfReady = () => {}

/** The brewing screen reports here, so an update waits for the brew to end. */
export function setBrewing(on: boolean): void {
  brewing = on
  if (!on) applyIfReady()
}

/**
 * Keeps the installed app on the latest version without a reinstall or two
 * relaunches. It looks for a new version on launch, whenever the app comes
 * back to the front, and hourly while it stays open. Once one has downloaded
 * it takes over by reloading the page, unless a brew is on screen: then it
 * waits until the brew ends.
 */
export function keepUpToDate(): void {
  let waiting = false
  const update = registerSW({
    immediate: true,
    onNeedRefresh() {
      waiting = true
      applyIfReady()
    },
    onRegisteredSW(_url, registration) {
      if (!registration) return
      const check = () => {
        if (navigator.onLine) registration.update().catch(() => {})
      }
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check()
      })
      setInterval(check, HOUR_MS)
    },
    onRegisterError(error) {
      console.warn('Brew Guide could not set up offline use and updates', error)
    },
  })
  applyIfReady = () => {
    if (waiting && !brewing) void update(true)
  }
}
