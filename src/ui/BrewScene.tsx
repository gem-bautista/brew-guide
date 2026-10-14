import { useId } from 'react'
import type { Brewer } from '../domain/schema'
import type { SceneState } from '../domain/scene'
import { FLAT_BOTTOM } from './BrewerArt'

/*
 * The brewing scene: the Recipe's Brewer sitting on a Server, drawn in a
 * 400 x 500 box. Levels move by CSS transition between clock ticks, so the
 * water rises smoothly though the clock only updates five times a second.
 * Decorative only: the grams and the clock beside it carry the numbers.
 */

const LINE = 'var(--scene-line)'
const EASE = { transition: 'transform 260ms linear' }

/** The glass Server every Brewer stands on. Its mouth is at y 318. */
const SERVER = 'M140 318H260C262 336 292 346 292 380V448Q292 466 274 466H126Q108 466 108 448V380C108 346 138 336 140 318Z'
const SERVER_BOTTOM = 462
const SERVER_TOP = 352

/** The hollow a drip Brewer's water fills: its outline, and the trapezoid it spans. */
interface Hollow {
  outer: string
  inner: string
  /** Highest the water is drawn, and the hollow's floor. */
  top: number
  bottom: number
  topWidth: number
  bottomWidth: number
  bed: string
  tip: { x: number; y: number; w: number }
}

const widthAt = (y: number, rimY: number, rimW: number, floorY: number, floorW: number) =>
  floorW + ((floorY - y) / (floorY - rimY)) * (rimW - floorW)

const CONE: Hollow = {
  outer: 'M80 128L182 302H218L320 128Z',
  inner: 'M92 136L186 294H214L308 136Z',
  top: 150,
  bottom: 294,
  topWidth: widthAt(150, 136, 216, 294, 28),
  bottomWidth: 28,
  bed: 'M150 238Q200 222 250 238L214 294H186Z',
  tip: { x: 176, y: 300, w: 48 },
}

const FLAT: Hollow = {
  outer: 'M80 128L140 296H260L320 128Z',
  inner: 'M92 136L148 288H252L308 136Z',
  top: 150,
  bottom: 288,
  topWidth: widthAt(150, 136, 216, 288, 104),
  bottomWidth: 104,
  bed: 'M126 252Q200 238 274 252L252 288H148Z',
  tip: { x: 146, y: 296, w: 108 },
}

/**
 * Height of water covering `fraction` of the hollow's drawn area. A cone is
 * narrow at the bottom, so a bloom drawn at a fifth of the height would look
 * like far less than a fifth of the water.
 */
function levelFor({ top, bottom, topWidth, bottomWidth }: Hollow, fraction: number): number {
  const depth = bottom - top
  const area = (fraction * depth * (topWidth + bottomWidth)) / 2
  const flare = (topWidth - bottomWidth) / depth
  const h = flare === 0 ? area / bottomWidth : (Math.sqrt(bottomWidth ** 2 + 2 * flare * area) - bottomWidth) / flare
  return bottom - h
}

/** The filter paper's pleated edge, standing just above the rim. */
const CRIMP = `M96 122${'l8 8 8-8'.repeat(13)}V136H96Z`

const clamp = (n: number) => Math.min(1, Math.max(0, n))

function Steam({ y }: { y: number }) {
  return (
    <g fill="none" stroke="var(--scene-steam)" strokeWidth="4" strokeLinecap="round">
      {[168, 200, 232].map((x, i) => (
        <path key={x} className="scene-steam" style={{ animationDelay: `${i * -1.05}s` }}
          d={`M${x} ${y}c-9-12 9-20 0-32c-9-12 9-20 0-32`} />
      ))}
    </g>
  )
}

/** A gooseneck kettle spout reaching in from the top left, and its stream down to `surface`. */
function Kettle({ pouring, surface }: { pouring: boolean; surface: number }) {
  return (
    <g style={{ transition: 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms', transform: pouring ? 'none' : 'translate(-150px, -120px)', opacity: pouring ? 1 : 0 }}>
      <g fill="none" strokeLinecap="round">
        <path d={`M122 98C150 104 192 ${Math.min(surface, 170) - 40} 197 ${surface}`} stroke="var(--scene-water)" strokeWidth="6" />
        <path className="scene-flow" d={`M122 98C150 104 192 ${Math.min(surface, 170) - 40} 197 ${surface}`} stroke="var(--scene-shine)" strokeWidth="2" strokeDasharray="6 8" />
        <path d="M-30 18C40 30 70 58 112 86" stroke={LINE} strokeWidth="16" />
        <path d="M112 86l12 10" stroke={LINE} strokeWidth="10" />
        <path d="M-20 22C38 32 62 54 96 76" stroke="var(--scene-shine)" strokeWidth="2.5" opacity="0.5" />
      </g>
    </g>
  )
}

function Bubbles({ x, y }: { x: number; y: number }) {
  return (
    <g fill="none" stroke="var(--scene-coffee-top)" strokeWidth="2">
      {[[-26, 0, 4], [-6, -2, 5.5], [18, 1, 3.5], [34, -1, 4.5]].map(([dx, dy, r], i) => (
        <circle key={i} className="scene-bubble" style={{ animationDelay: `${i * -0.4}s` }} cx={x + dx!} cy={y + dy! - 4} r={r} />
      ))}
    </g>
  )
}

/** A spoon dipping into the Brewer and stirring from its handle end. */
function Spoon({ tipY }: { tipY: number }) {
  return (
    <g className="scene-stir" style={{ transformOrigin: '262px 40px' }}>
      <path d={`M262 40L210 ${tipY}`} stroke={LINE} strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="208" cy={tipY + 8} rx="9" ry="14" fill={LINE} transform={`rotate(25 208 ${tipY + 8})`} />
    </g>
  )
}

function Server({ fill, drips, from, stream, clip }: { fill: number; drips: boolean; from: number; stream: boolean; clip: string }) {
  const level = SERVER_BOTTOM - clamp(fill) * (SERVER_BOTTOM - SERVER_TOP)
  return (
    <g>
      <ellipse cx="200" cy="472" rx="128" ry="9" fill="var(--scene-shadow)" />
      <path d={SERVER} fill="var(--scene-glass)" />
      <g clipPath={`url(#${clip})`}>
        <g style={{ ...EASE, transform: `translateY(${fill > 0.002 ? level : SERVER_BOTTOM + 10}px)` }}>
          <rect x="100" y="0" width="200" height="140" fill="var(--scene-coffee-deep)" />
          <rect x="100" y="0" width="200" height="5" fill="var(--scene-coffee-top)" />
        </g>
        {stream && <rect x="197" y={from} width="6" height={Math.max(0, level - from)} rx="3" fill="var(--scene-coffee)" />}
        {drips && [0, 1].map((i) => (
          <circle key={i} className="scene-drip" cx="200" cy={from} r="3.5" fill="var(--scene-coffee)"
            style={{ animationDelay: `${i * -0.55}s`, ['--fall' as string]: `${Math.max(8, level - from)}px` }} />
        ))}
      </g>
      <path d={SERVER} fill="none" stroke={LINE} strokeWidth="3" strokeLinejoin="round" />
      <path d="M292 380C330 380 334 440 292 440" fill="none" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
      <path d="M118 400h12M118 420h8M118 440h12" stroke={LINE} strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      <path d="M268 392V446" stroke="var(--scene-shine)" strokeWidth="6" strokeLinecap="round" />
    </g>
  )
}

function DripBrewer({ shape, scene, ids }: { shape: Hollow; scene: SceneState; ids: { inner: string; coffee: string } }) {
  const surface = levelFor(shape, clamp(scene.inBrewer))
  const wet = scene.inBrewer > 0.002
  const { tip } = shape
  return (
    <g className={scene.swirling ? 'scene-swirl' : undefined} style={{ transformOrigin: '200px 316px' }}>
      <rect x={tip.x} y={tip.y - 4} width={tip.w} height="14" rx="3" fill="var(--bg)" stroke={LINE} strokeWidth="3" />
      <ellipse cx="200" cy="314" rx="78" ry="9" fill="var(--bg)" stroke={LINE} strokeWidth="3" />
      <path d={shape.outer} fill="var(--scene-glass)" />
      <path d={shape.inner} fill="var(--scene-paper)" stroke="var(--scene-paper-line)" strokeWidth="2" />
      <path d={CRIMP}
        fill="var(--scene-paper)" stroke="var(--scene-paper-line)" strokeWidth="1.5" strokeLinejoin="round" />
      <g clipPath={`url(#${ids.inner})`}>
        <path d={shape.bed} fill="var(--scene-bed)" className={scene.blooming ? 'scene-puff' : undefined} />
        <g style={{ ...EASE, transform: `translateY(${wet ? surface : shape.bottom + 10}px)` }}>
          <rect x="80" y="0" width="240" height="200" fill={`url(#${ids.coffee})`} opacity="0.86" />
          <rect x="80" y="0" width="240" height="4" fill="var(--scene-coffee-top)" />
        </g>
      </g>
      {scene.blooming && wet && <Bubbles x={200} y={surface} />}
      <path d="M128 150Q150 210 186 286M174 140Q186 210 196 290M272 150Q250 210 214 286M226 140Q214 210 204 290" fill="none" stroke={LINE} strokeWidth="1.5" opacity="0.12" />
      <path d={shape.outer} fill="none" stroke={LINE} strokeWidth="3" strokeLinejoin="round" />
      <path d="M296 160H326Q338 160 338 172V190Q338 202 326 202H264" fill="none" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="200" cy="128" rx="122" ry="9" fill="none" stroke={LINE} strokeWidth="3" />
      <path d="M108 146L150 216" stroke="var(--scene-shine)" strokeWidth="6" strokeLinecap="round" />
      {scene.stirring && <Spoon tipY={Math.max(surface, 170) + 12} />}
    </g>
  )
}

/** The AeroPress chamber, upright on the Server, with its plunger during the press. */
function AeroPress({ scene, ids }: { scene: SceneState; ids: { chamber: string; coffee: string } }) {
  const top = 120
  const bottom = 294
  const surface = bottom - clamp(scene.inBrewer) * (bottom - top)
  const wet = scene.inBrewer > 0.002
  return (
    <g className={scene.swirling ? 'scene-swirl' : undefined} style={{ transformOrigin: '200px 316px' }}>
      <path d="M134 296H266V306Q266 314 258 314H142Q134 314 134 306Z" fill="var(--scene-cap)" />
      <rect x="152" y="96" width="96" height="200" fill="var(--scene-glass)" />
      <g clipPath={`url(#${ids.chamber})`}>
        <g style={{ ...EASE, transform: `translateY(${wet ? surface : bottom + 10}px)` }}>
          <rect x="150" y="0" width="100" height="220" fill={`url(#${ids.coffee})`} />
          <rect x="150" y="0" width="100" height="5" fill="var(--scene-coffee-top)" />
        </g>
      </g>
      {scene.blooming && wet && <Bubbles x={200} y={surface} />}
      <g fontFamily="var(--font-display)" fontSize="12" fill={LINE} opacity="0.45">
        {[4, 3, 2, 1].map((n, i) => (
          <g key={n}>
            <path d={`M158 ${146 + i * 36}h10`} stroke={LINE} strokeWidth="2" />
            <text x="172" y={150 + i * 36}>{n}</text>
          </g>
        ))}
      </g>
      <rect x="152" y="96" width="96" height="200" fill="none" stroke={LINE} strokeWidth="3" />
      <rect x="144" y="88" width="112" height="10" rx="4" fill="var(--bg)" stroke={LINE} strokeWidth="3" />
      <path d="M236 110V282" stroke="var(--scene-shine)" strokeWidth="6" strokeLinecap="round" />
      <g style={{
        transition: 'transform 300ms linear, opacity 300ms',
        transform: `translateY(${scene.pressing ? surface - 104 : -260}px)`,
        opacity: scene.pressing ? 1 : 0,
      }}>
        <rect x="162" y="-150" width="76" height="246" fill="var(--scene-glass)" stroke={LINE} strokeWidth="3" />
        <rect x="148" y="-162" width="104" height="16" rx="6" fill={LINE} />
        <rect x="156" y="92" width="88" height="12" rx="3" fill="var(--scene-cap)" />
      </g>
      {scene.stirring && <Spoon tipY={Math.max(surface, 150) + 12} />}
    </g>
  )
}

export function BrewScene({ brewer, scene, className = '' }: { brewer: Brewer; scene: SceneState; className?: string }) {
  const id = useId().replace(/:/g, '')
  const ids = { inner: `${id}-inner`, chamber: `${id}-chamber`, server: `${id}-server`, coffee: `${id}-coffee` }
  const press = brewer === 'Aeropress'
  const shape = FLAT_BOTTOM.has(brewer) ? FLAT : CONE
  const surface = press
    ? 294 - clamp(scene.inBrewer) * 174
    : scene.inBrewer > 0.002 ? levelFor(shape, clamp(scene.inBrewer)) : shape.bottom
  const brewerTop = press ? 84 : 112

  return (
    <svg viewBox="0 0 400 500" aria-hidden className={className}>
      <defs>
        <clipPath id={ids.inner}><path d={shape.inner} /></clipPath>
        <clipPath id={ids.chamber}><rect x="155" y="98" width="90" height="196" /></clipPath>
        <clipPath id={ids.server}><path d={SERVER} /></clipPath>
        <linearGradient id={ids.coffee} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--scene-coffee)" />
          <stop offset="0.7" stopColor="var(--scene-coffee-deep)" />
        </linearGradient>
      </defs>
      <Server fill={scene.inServer} clip={ids.server} from={324}
        drips={scene.draining && !press} stream={scene.pressing} />
      {press ? <AeroPress scene={scene} ids={ids} /> : <DripBrewer shape={shape} scene={scene} ids={ids} />}
      {scene.inBrewer > 0.02 && <Steam y={brewerTop - 6} />}
      <Kettle pouring={scene.pouring} surface={surface} />
    </svg>
  )
}
