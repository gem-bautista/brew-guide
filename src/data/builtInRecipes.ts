import { RecipeSchema, type Recipe } from '../domain/schema'

type Raw = Record<string, unknown>
/** Every built-in carries a portrait from its author's video or event, cropped to 4:5 in public/photos/recipes. */
const build = (r: Raw): Recipe =>
  RecipeSchema.parse({ origin: 'built-in', scalable: true, photo: `photos/recipes/${String(r.id)}.jpg`, ...r })
const pour = (id: string, startSec: number, waterG: number, instruction: string, kind: 'pour' | 'bloom' = 'pour') =>
  ({ id, kind, startSec, waterG, instruction })
const act = (id: string, kind: 'swirl' | 'stir' | 'wait' | 'press' | 'drawdown', startSec: number, instruction: string) =>
  ({ id, kind, startSec, instruction })

const PHILO = 'https://en.philocoffea.com/blogs/blog/coffee-brewing-method'
const HARIO_JH = 'https://www.hario-europe.com/blogs/hario-community/v60-ambassadors-james-hoffmann'
const HEDRICK_AP = 'https://www.youtube.com/watch?v=jz9fH5ODVFU'
const WAC = 'https://worldaeropresschampionship.com/pages/recipes'

/**
 * Built-in recipes. Every ZP6 click value is an ESTIMATE derived from the author's grind wording and
 * 1Zpresso's published ZP6 Special bands (pour-over 4.0 to 5.0, French press 5.0 to 6.0); see
 * docs/research/builtin-recipes.md for sources, gaps and reasoning.
 */
export const BUILT_IN_RECIPES: Recipe[] = [
  build({
    id: 'kasuya-46-balanced',
    photoAlt: 'Tetsu Kasuya pouring water into a V60',
    name: '4:6 Method',
    author: 'Tetsu Kasuya',
    family: '4:6 Method',
    brewer: 'V60',
    verification: 'verified',
    source: { label: 'Philocoffea, "How to Make Coffee Using the 4:6 Brewing Method"', url: PHILO },
    doseG: 20, tempC: 93, totalSec: 210,
    grind: { scale: 'medium-coarse', zp6Clicks: 5.2, zp6Estimated: true, authorText: 'Medium-coarse to coarse' },
    timingNote: 'Kasuya gives 93 °C for light roasts, about 88 °C for medium and about 83 °C for dark.',
    notes: 'The first two pours set sweetness and acidity; the last three set strength. This is the balanced version with equal pours.',
    steps: [
      pour('p1', 0, 60, 'Wet all the grounds.', 'bloom'),
      pour('p2', 45, 60, ''),
      pour('p3', 90, 60, ''),
      pour('p4', 135, 60, ''),
      pour('p5', 165, 60, 'The last pour. Then let it drain.'),
    ],
  }),
  build({
    id: 'hoffmann-ultimate-v60',
    photoAlt: 'James Hoffmann talking to camera at his desk',
    name: 'Ultimate V60 Technique',
    author: 'James Hoffmann',
    brewer: 'V60',
    verification: 'partial',
    source: { label: 'Hario Europe, V60 Ambassadors: James Hoffmann (his video page states no numbers)', url: HARIO_JH },
    doseG: 30, tempC: 97, totalSec: 210,
    grind: { scale: 'medium-fine', zp6Clicks: 4.3, zp6Estimated: true, authorText: 'Fine-medium' },
    notes: 'Rinse the filter first and make a small well in the grounds. Numbers come from Hario pages that carry his recipe; check them against his video.',
    steps: [
      pour('p1', 0, 60, 'Wet all the grounds.', 'bloom'),
      act('s1', 'swirl', 5, 'Swirl until the slurry is even, and let it bloom.'),
      pour('p2', 45, 240, 'Pour steadily, finishing by 1:15.'),
      pour('p3', 75, 200, 'Pour more gently, finishing by 1:45.'),
      act('s2', 'stir', 105, 'Stir once each way with a spoon, then let it drain and give one last gentle swirl.'),
    ],
  }),
  build({
    id: 'hoffmann-better-1-cup-v60',
    photoAlt: 'A gooseneck kettle pouring into a plastic V60 on a glass server',
    name: 'A Better 1 Cup V60 Technique',
    author: 'James Hoffmann',
    brewer: 'V60',
    verification: 'user-supplied',
    source: { label: 'Supplied by you; matches the pulse timings in his video description' },
    doseG: 15, tempC: 100, totalSec: 180,
    grind: { scale: 'medium-fine', zp6Clicks: 4.3, zp6Estimated: true, authorText: 'Medium-fine, finer than for a 2-cup V60' },
    timingNote: 'Light roasts 100 °C, medium about 95 °C, dark 85 to 90 °C.',
    notes: 'Make a small well in the dry grounds first. Pulsing keeps the water hot in a small dose. It should finish draining between 2:30 and 3:00.',
    steps: [
      pour('p1', 0, 50, 'Pour into the well.', 'bloom'),
      act('s1', 'swirl', 10, 'Swirl gently to mix, then let it bloom.'),
      pour('p2', 45, 50, 'Pour slowly in circles, finishing by 1:00.'),
      pour('p3', 70, 50, 'Slow circles, finishing by 1:20.'),
      pour('p4', 90, 50, 'Slow circles, finishing by 1:40.'),
      pour('p5', 110, 50, 'The last pour, finishing by 2:00.'),
      act('s2', 'swirl', 120, 'Give one gentle swirl to level the bed, then let it drain.'),
    ],
  }),
  build({
    id: 'hedrick-1-2-1-v60',
    photoAlt: 'Lance Hedrick at his kitchen counter with a V60',
    name: '1-2-1 V60',
    author: 'Lance Hedrick',
    brewer: 'V60',
    verification: 'user-supplied',
    source: { label: 'Supplied by you; no primary page found to check it against' },
    doseG: 18, tempC: 100, totalSec: 230,
    grind: { scale: 'medium-fine', zp6Clicks: 4.5, zp6Estimated: true, authorText: 'Medium-fine, about 720 microns (about 24 clicks on a Comandante C40)', microns: 720 },
    notes: 'Made for light roasts. The long bloom lets the coffee degas fully. If the total time is well off 3:50 to 4:00, change the grind.',
    steps: [
      pour('p1', 0, 54, 'Pour briskly to saturate the bed.', 'bloom'),
      act('s1', 'swirl', 10, 'Pick up the V60 and swirl hard so no dry pockets remain.'),
      act('w1', 'wait', 15, 'Let it bloom. The bed will settle flat.'),
      pour('p2', 120, 252, 'One continuous, slow spiral pour.'),
      act('s2', 'swirl', 165, 'One gentle swirl to catch grounds on the filter wall, then let it drain.'),
    ],
  }),
  build({
    id: 'hedrick-one-and-done-v60',
    photoAlt: 'Lance Hedrick pouring a kettle into a gold V60',
    name: 'One & Done V60',
    author: 'Lance Hedrick',
    brewer: 'V60',
    verification: 'user-supplied',
    source: { label: 'Supplied by you; no primary page found to check it against' },
    doseG: 15, tempC: 95, totalSec: 150,
    grind: { scale: 'medium-fine', zp6Clicks: 4.5, zp6Estimated: true, authorText: 'Medium-fine' },
    timingNote: '93 to 96 °C for light and medium roasts, below 90 °C for dark.',
    notes: 'Too bitter: grind coarser. Lacking body: grind finer. It should finish draining around 2:30.',
    steps: [
      pour('p1', 0, 45, 'Wet the grounds.', 'bloom'),
      act('s1', 'swirl', 10, 'Swirl hard, then let the bloom finish.'),
      pour('p2', 35, 180, 'Once it stops bubbling, pour in one continuous stream of small circles in the centre.'),
      act('s2', 'swirl', 90, 'Give a gentle swirl to level the bed, then let it drain.'),
    ],
  }),
  build({
    id: 'hedrick-aeropress-1',
    photoAlt: 'Two AeroPress chambers and a filter cap on a white counter',
    name: 'A Different AeroPress: dark or aged coffee',
    author: 'Lance Hedrick',
    family: 'A Different AeroPress',
    brewer: 'Aeropress',
    verification: 'verified',
    source: { label: 'Lance Hedrick, "A Different AeroPress Recipe" (YouTube, 2024)', url: HEDRICK_AP },
    doseG: 30, tempC: 80, totalSec: 130, scalable: false,
    grind: { scale: 'coarse', zp6Clicks: 5.6, zp6Estimated: true, authorText: 'Coarse, about 1200 microns', microns: 1200 },
    notes: 'For dark, decaf or aged coffee. After pressing, dilute with 80 to 120 g of water to taste.',
    steps: [
      pour('p1', 0, 120, 'Pour all the water at once.'),
      act('s1', 'stir', 60, 'Stir for 10 seconds, then put the lid on.'),
      act('s2', 'press', 70, 'Press for about a minute.'),
    ],
  }),
  build({
    id: 'hedrick-aeropress-2',
    photoAlt: 'Lance Hedrick standing behind an AeroPress',
    name: 'A Different AeroPress: lighter coffee',
    author: 'Lance Hedrick',
    family: 'A Different AeroPress',
    brewer: 'Aeropress',
    verification: 'verified',
    source: { label: 'Lance Hedrick, "A Different AeroPress Recipe" (YouTube, 2024)', url: HEDRICK_AP },
    doseG: 20, tempC: 85, totalSec: 130, scalable: false,
    grind: { scale: 'medium-coarse', zp6Clicks: 5.2, zp6Estimated: true, authorText: 'Medium-coarse, about 1000 microns', microns: 1000 },
    notes: 'For underdeveloped or lighter coffee. After pressing, dilute to taste.',
    steps: [
      pour('p1', 0, 120, 'Pour all the water at once.'),
      act('s1', 'stir', 60, 'Stir for 10 seconds, then put the lid on.'),
      act('s2', 'press', 70, 'Press for about a minute.'),
    ],
  }),
  build({
    id: 'wac-2025-nemo-pop',
    photoAlt: 'Nemo Pop lifting the 2025 World AeroPress Championship trophy',
    name: '2025 World AeroPress Championship recipe',
    author: 'Nemo Pop',
    brewer: 'Aeropress',
    verification: 'verified',
    source: { label: 'World AeroPress Championship, official recipes page', url: WAC },
    doseG: 18, tempC: 84, totalSec: 70, scalable: false,
    grind: { scale: 'medium-fine', zp6Clicks: 5.5, zp6Estimated: true, authorText: 'Comandante, 31 clicks, sifted at 200 microns' },
    notes: 'Upright, with a Flow Control cap and two paper filters. First pour 70 g of 50 °C water into the server. Add that to the 100 g in the brew for a 170 g cup.',
    steps: [
      pour('p1', 0, 100, 'Wet all the grounds, with the AeroPress on the server.'),
      act('s1', 'stir', 25, 'Stir north-south, north-south, west-east, west-east.'),
      act('s2', 'press', 50, 'Press gently for about 20 seconds, then serve.'),
    ],
  }),
]
