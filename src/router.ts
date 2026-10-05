import { useEffect, useState } from 'react'

export type Route =
  | { name: 'library' }
  | { name: 'recipe'; id: string }
  | { name: 'new' }
  | { name: 'duplicate'; id: string }
  | { name: 'edit'; id: string }

function parse(hash: string): Route {
  if (hash === '#/new') return { name: 'new' }
  const m = /^#\/(recipe|duplicate|edit)\/(.+)$/.exec(hash)
  return m ? { name: m[1] as 'recipe' | 'duplicate' | 'edit', id: decodeURIComponent(m[2]!) } : { name: 'library' }
}

export function hrefFor(r: Route): string {
  if (r.name === 'library') return '#/'
  if (r.name === 'new') return '#/new'
  return `#/${r.name}/${encodeURIComponent(r.id)}`
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(window.location.hash))
  useEffect(() => {
    const onChange = () => {
      setRoute(parse(window.location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export function navigate(r: Route): void {
  window.location.hash = hrefFor(r)
}
