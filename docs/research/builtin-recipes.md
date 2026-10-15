# Built-in recipe research (primary sources only)

Researched 2026-10-05. Rule applied: values are "verified" only if stated on the author's own page/channel, a publisher page that presents the author's own recipe text under his name, or an official championship page. Anything else is UNVERIFIED. All ZP6 numbers are ESTIMATES.

Tooling caveat: WebFetch cannot read YouTube directly. YouTube pages were read through the `r.jina.ai` text proxy and then summarised by the fetch tool's small model, so descriptions are paraphrase-risk. Video transcripts (spoken steps) could NOT be obtained. Where a recipe lives only in a spoken video, it is UNVERIFIED.

## Summary

| # | Recipe | Verified? | ZP6 estimate (ESTIMATE) |
|---|---|---|---|
| 1a | Kasuya 4:6, current Philocoffea page (2022) | Yes, mostly (temp/grind/timing/60% rule verified; 40/80 and 80/40 gram splits UNVERIFIED) | 5.2 (range 4.8-5.6) |
| 1b | Kasuya 4:6, Hario Europe Q&A version (92 C, 50/70/60/60/60) | Yes as his text, but older/third-party hosted | 5.2 |
| 1c | Kasuya "10 pour" (2026) | NO, only fan-channel/blog sources | not given |
| 2a | Hoffmann Ultimate V60 (2019), 30 g / 500 g | Partial: numbers from Hario pages attributing text to him; his own YouTube description has no numbers | 4.3 (4.0-4.6) |
| 2b | Hoffmann "A Better 1 Cup V60" (15 g / 250 g) | Partial: YouTube description via proxy, fragmentary | 4.3 (4.0-4.6) |
| 2c | Hoffmann Ultimate AeroPress (11 g / 200 g) | Partial: YouTube description via proxy; press time UNVERIFIED | 4.2 (3.8-4.8) |
| 3a | Hedrick "Last V60 Recipe You'll Ever Need" | NO: his description has no numbers; transcript unreachable | 4.5 (4.2-4.9), and dial by drawdown |
| 3b | Hedrick "A Different AeroPress Recipe" (2024) | Yes (own channel description, via proxy) | 5.3-5.6 / 5.0-5.4 (see section) |
| 3c | Hedrick Kalita Wave | NO: none found on his own channel | n/a |
| 4 | WAC 2025 champion Nemo Pop | Yes (official WAC page) | 5.5 (5.0-5.9) |

## ZP6 Special: what 1Zpresso itself publishes

- Dial (1Zpresso grind-setting page, user manual, product page): "9 numbers", 90 clicks per rotation, 10 clicks per number, 0.022 mm (22 micron) per click. Examples on the page: "#1 and 5 clicks (15 clicks)", "#3 and 2 clicks (32 clicks)", "one full round to #0 and 1 number (100 clicks)".
- CORRECTION to the brief's assumption: the dial is NOT "10 numbers with 5 sub-clicks". It is 10 clicks per number. So a setting like 4.7 means number 4, 7 clicks (47 clicks from zero). The reference chart axis runs 0 to 10; a rotation is 90 clicks, and the page counts past it ("100 clicks" = one round plus 1 number).
- Official "ZP6 Special Grind Setting Reference" chart (image, read directly): Siphon / Pour Over = 4.0 to 5.0. French Press = 5.0 to 6.0. No V60-specific or AeroPress band is drawn.
- 1Zpresso "How to dial in pour over" post: ZP6 pour-over start "around 40-50 clicks" (= 4.0-5.0, agrees with chart). Says "not fixed rules".
- 1Zpresso champion-recipe page lists ZP6 Special settings: Carlos Medina WBrC 2023, Origami Air = 4.1; Karim Abdul Jawad English AeroPress Champion 2023, inverted = 5.5; Daniel Grinemaer German AeroPress Champion 2024, upright = "1st grind coarsest setting, 2nd grind at 5.5". Sherry Hsu review page: flat-bottom dripper = 4.8. These are other people's recipes, used here only as 1Zpresso-published anchors.
- 1Zpresso gives no first-party micron-to-particle-size table. 22 um/click is burr movement, not a guaranteed particle size. Any micron-to-click conversion below is ESTIMATE.

Method for estimates: place the author's grind word inside the official bands (pour over 4.0-5.0; French press 5.0-6.0), using the AeroPress 5.5 anchors only for AeroPress. 1 point = 10 clicks = about 220 um of burr movement, so a +-0.3 error is about +-66 um of burr gap. All grinder-to-grinder translation is uncertain; dial by drawdown time and taste.

---

## 1. Tetsu Kasuya, 4:6 Method

Author: Tetsu Kasuya (2016 World Brewers Cup champion, Philocoffea). Brewer: Hario V60 (the page recommends the Kasuya-model dripper).

### 1a. Philocoffea page "How to Make Coffee Using the 4:6 Brewing Method" (byline Tetsu Kasuya, dated March 7, 2022)

- Dose 20 g, water 300 g, ratio 1:15 (page: "1:15 ratio ... e.g. 20 g ... 300 g").
- Water temperature (his words): light roast "around 93 C", medium "around 88 C", dark "around 83 C".
- Grind: "medium-coarse to coarse". No micron or click figure given on the page.
- 40% portion (first two pours): "If the first pour is less than the second, the coffee will taste sweeter. If the first pour is more than the second, the coffee will taste brighter." Equal split (60 + 60) is the balanced baseline. Exact gram splits for sweeter/brighter (e.g. 40/80, 80/40): NOT stated on this page, UNVERIFIED.
- 60% portion: "Pouring all of it at once will make a lighter coffee, while dividing it into two pours will make it stronger, and three pours even more so." Standard recipe uses three pours.
- Total brew time 3:30 (dripper removed).

| Start | Type | Water (g) | Cumulative | Instruction |
|---|---|---|---|---|
| 0:00 | pour (40% part 1) | 60 | 60 | pour |
| 0:45 | pour (40% part 2) | 60 | 120 | pour |
| 1:30 | pour (60% part 1) | 60 | 180 | pour |
| 2:15 | pour (60% part 2) | 60 | 240 | pour |
| 2:45 | pour (60% part 3) | 60 | 300 | pour |
| 3:30 | drawdown ends | 0 | 300 | remove dripper |

Stronger/lighter 60% variants: lighter = one 180 g pour; stronger = two 90 g pours; strongest = three 60 g pours. The page states the effect but not the 90 g / 180 g amounts, so those gram figures are arithmetic (180 / n), not quoted. The page's own table shows the step timing above, including the 30 s gap between the last two pours (2:15 to 2:45) as published.

### 1b. Hario Europe "V60 Ambassador Q&A" (Hario-hosted, attributed to Kasuya)
20 g coarse, 300 mL at 92 C, 3:30. Pours: 0:00 50 mL, 0:45 70 mL, 1:30 60 mL, 2:10 60 mL, 2:40 60 mL, remove at 3:30. Quote: first pour "defines the coffee's acidity and sweetness (more water = more acidity, less water = more sweetness)." This is an older, differently timed version and gives 50/70 for the first 40%. Page hosted by Hario, not Kasuya. Confidence: medium.

### 1c. "Later/updated" version
Philocoffea pages fetched (4:6 page, V60 beginner guide, book page) mention no updated 4:6. A 2026 "10 pour" Kasuya recipe is being circulated (20 g, 300 g, 95-96 C, 30 g x 10, super-coarse). Every source found is a fan channel (The Quiet Cup, Chemicoffea) or blog. Hedrick's channel describes it as "Tetsu Kasuya's 10 pour recipe" but gives no numbers. Not verified from Kasuya himself; do not ship.

### 1d. Flash-chilled iced coffee with the 4:6 (his YouTube channel, in Japanese)

Source: Tetsu Kasuya's own channel, "【レシピ】世界チャンピオンが解説「急冷式アイスコーヒー」の作り方｜4：6メソッド" (https://www.youtube.com/watch?v=TfSBzFeoL4s, recipe from about 2:58 to 9:50). Read on 2026-10-15 from the video's Japanese auto-captions and its frames. The on-screen titles confirm 90 °C and the fifth pour (to 150 g at 2:10). Everything else below is what he says on camera.

- Ice: about 80 g in the server before brewing ("80 g分ぐらい"; he tops 70 g up to "a bit over 80"). Freezer ice is fine; bought ice is ideal. It does not need to melt fully.
- Coffee 20 g ("1人分だけど贅沢に"). The coffee and ice go on the scale and he tares with them in place.
- Water 90 °C. He prefers 90 °C or higher, even for dark roasts, for the aroma and the bitterness; some brew at about 80 °C to avoid bitterness, which he also does sometimes.
- Water 150 g, half the hot 4:6's 300 g, as five pours of 30 g.
- Grind: "fine" (細かい), so the water drains slowly. If it takes more than about 3:00 to drain, grind a little coarser.
- Swirl (shake) the dripper after the first pour so all the grounds wet, or stir with a spoon. Swirling after the second pour is fine too.
- Finish: it drains at about 3:00 (his ran 2:57). Then swirl the server to melt the ice. The result is about 180 to 200 g of iced coffee.
- Taste: like the hot 4:6, make the first two pours 20 + 40 for a sweeter cup, or 40 + 20 for a brighter one, keeping their total at 60. Those variants are not shipped (ADR 0001 ships them as separate recipes).

| Start | Type | Water (g) | Scale target | Note |
|---|---|---|---|---|
| 0:00 | bloom | 30 | 30 | swirl to wet everything |
| 0:40 | pour | 30 | 60 | may swirl again |
| 1:10 | pour | 30 | 90 | |
| 1:40 | pour | 30 | 120 | |
| 2:10 | pour | 30 | 150 | drains by about 3:00 |

Verified: yes, from the author's own channel. Caveat: the captions are auto-generated, so the numbers were read through them and checked against the frames where possible. ZP6 ESTIMATE: 4.2 (3.9-4.5), in the lower half of the 1Zpresso pour-over band, because he calls it fine and noticeably finer than the hot 4:6 (5.2). Confidence: low. Dial in by the 3:00 drain.

ZP6 ESTIMATE for 4:6: 5.2 (range 4.8-5.6). Reasoning: "medium-coarse to coarse" is at the top of 1Zpresso's pour-over band (4.0-5.0) and just into French press (5.0-6.0). Confidence: low-medium.
Confidence in recipe: high for 1a (single author page with byline and date).

---

## 2. James Hoffmann

### 2a. "The Ultimate V60 Technique" (YouTube, Aug 5 2019) - brewer: Hario V60 (plastic)
- His YouTube description (via proxy): "This is my recommended technique for making coffee with the Hario V60, and any other cone-shaped brewer with a large open area." It contains no recipe numbers (chapters: Kit List, Technique, Final Thoughts).
- Numbers come from Hario USA and Hario Europe pages that present the recipe text under his name: 30 g coffee, 500 mL water, grind "Fine-medium" (Hario Europe) / "medium fine" (Hario USA), temperature 97 C (Hario Europe) / "the hotter, the better (especially with lighter roasts)" (Hario USA). Ratio 60 g/L = 1:16.7.

| Start | Type | Water (g) | Cumulative | Instruction (page wording) |
|---|---|---|---|---|
| 0:00 | bloom | 60 | 60 | "2x coffee weight = 60 g"; wet all grounds |
| 0:00-0:05 | swirl | 0 | 60 | swirl slurry until evenly mixed; bloom up to 45 s |
| 0:45 | pour | 240 | 300 | get to 60% of total (300) within 30 s, i.e. by 1:15 |
| 1:15 | pour | 200 | 500 | slower, gentler; reach 100% (500) within next 30 s, i.e. by 1:45 |
| 1:45 | stir | 0 | 500 | spoon: one stir each direction |
| after | swirl, wait | 0 | 500 | let drain, one final swirl; drawdown done by ~3:30 |

Pre-step: rinse filter with hot water, make a well in the grounds. Total time about 3:30. Confidence: medium (author-attributed text on retailer pages; Hario Europe and Hario USA agree on the numbers; his own video page does not state them; transcript not read).
Note: a GitHub gist and HackMD note (third-party, not cited as authority) show an 18 g/300 g and 15 g scaling variant at 60 g/L; not used.

### 2b. "A Better 1 Cup V60 Technique" (YouTube) - 15 g / 250 g
YouTube page via proxy shows (fragmentary extraction, treat as PARTIAL): 15 g coffee, 250 g soft filtered water, freshly boiled, grind medium-fine; bloom 50 g at 0:00; swirl at 0:10-0:15; pours to 100 g (0:45-1:00), 150 g (1:10-1:20), 200 g (1:30-1:40), 250 g (1:50-2:00); swirl 2:00-2:05; drawdown about 3:00. Description states a bloom plus four pours with pauses and a roughly 3:00 finish. The tool said the extraction was incomplete. Temperature beyond "freshly boiled": UNVERIFIED. Confidence: low-medium; check against the video before shipping.

### 2c. "The Ultimate AeroPress Technique" (YouTube, Apr 21 2021) - standard orientation, paper filter
- 11 g coffee "ground at the finer end of medium, assuming this is light roasted coffee", 200 g boiling water (description via proxy). No rinse or preheat. Ratio about 1:18.
- Steps: add coffee; start timer and pour 200 g to wet all grounds (0:00); insert plunger about 1 cm to stop dripping; wait 2:00; gentle swirl; wait 30 s (about 2:30); press gently to the end. Total roughly 3:00 plus press time.
- Press duration and the 11 g vs other-dose guidance: press time UNVERIFIED (only secondary sites state it). Water temperature wording is "boiling" only.
Confidence: medium (his description, proxy-read).

ZP6 ESTIMATES: V60 "medium fine" = 4.3 (4.0-4.6), lower half of the official 4.0-5.0 pour-over band. 1-cup "medium-fine" = 4.3. AeroPress "finer end of medium" = 4.2 (3.8-4.8): 1Zpresso publishes no AeroPress band, only champion recipes at 5.5 (inverted, different recipes), so this is a guess anchored on the pour-over band. Confidence: low-medium for V60, low for AeroPress.

---

## 3. Lance Hedrick

Lance's own site (lancehedrick.coffee) is a bare homepage (Home/About/Work), no recipes. His channel (@LanceHedrick) is the primary source.

### 3a. V60 - "The Last V60 Recipe You'll Ever Need" (his channel; recipe chapter at 5:04)
His description frames it as a recipe "that transcends grinders and coffees"; it states no dose, water, temperature, grind or pour times, and the spoken recipe could not be read. All values UNVERIFIED. I could not confirm whether this or a later video is his "current standard" (a 2026 "One & Done" clip exists only on a fan channel, The Quiet Cup, which credits him: 15 g, 225 g, 96 C, three pours with a second bloom at 0:30, drawdown 2:00-2:30. That is NOT a primary source and is shown only as a lead).
Third-party lead only: 20 g / 340 g (1:17) "Easy and Effective" recipe at 210 F; 1-2-1 pour structure at 20/300. Unverified.
ZP6 ESTIMATE: 4.5 (4.2-4.9), mid-pour-over band; Hedrick selects grind by drawdown time, so this value is only a start. Confidence: low.

### 3b. AeroPress - "A Different AeroPress Recipe: A New World of Flavor" (his channel, Jan 15 2024) - description via proxy
- Recipe 1 (dark/decaf/aged): 30 g coffee, 120 g water at 80 C, coarse grind (~1200 microns), all water at once, stir 10 s at 1:00, lid on, press for 1 minute, then dilute with 80-120 g water (adjust bypass to dose).
- Recipe 2 (underdeveloped/lighter): 20 g coffee, 120 g water at 85 C, medium-coarse (~1000 microns), same procedure, dilute to taste.
- Press-start time after the stir is not stated beyond "press for 1 minute". Grinder not named. Confidence: medium-high.
ZP6 ESTIMATE (ESTIMATE only, no 1Zpresso micron table): Recipe 1 coarse = 5.6 (5.2-6.0); Recipe 2 medium-coarse = 5.2 (4.8-5.6), by placing them in the French press / top pour-over band. Confidence: low.

### 3c. Kalita Wave
No Hedrick-authored Kalita recipe found on a primary page. UNVERIFIED (a "Kalita Wave Brew Guide" video found belongs to another channel).

---

## 4. Champion recipe: 2025 World AeroPress Championship, Nemo Pop (Australia)
Source: official worldaeropresschampionship.com recipes page (fetched twice, consistent). Coffee Ecuador, Finca la Carolina, Sidra, washed, 1,300 masl, roasted by Stereoscope Coffee. Brewer: AeroPress, upright, Flow Control Filter Cap with 2 paper filters. Dose 18 g. Grinder: Comandante Trailmaster, 31 clicks, sifted at 200 um. Water 125 ppm: brewing water 84 C, bypass water 50 C. Kettle Varia Aura.

| Start | Type | Water (g) | Instruction |
|---|---|---|---|
| before | prep | 70 (bypass) | pour 70 g bypass water into carafe; grind, blow chaff, sift fines |
| 0:00 | pour | 100 | pour 100 g brewing water, wet all grounds (AeroPress on carafe) |
| 0:25 | stir | 0 | stir NSNS-WEWE |
| 0:50 | press | 0 | gently press for about 20 s |
| ~1:10 | serve | 0 | serve |

Ratio: 18 g to 100 g brewing water (1:5.6), plus 70 g bypass, 170 g total in cup (1:9.4). Total brew time about 1:10 (derived from "50 s + about 20 s"). Confidence: high.
ZP6 ESTIMATE: 5.5 (5.0-5.9). Reasoning: 1Zpresso lists AeroPress champion recipes at 5.5 on the ZP6 Special. The recipe sifts to 200 um, which removes fines and may justify a slightly finer unsifted setting; no 1Zpresso data covers Comandante-to-ZP6 translation. Confidence: low.
Other WAC pages: the 2024 winner is listed as George Stanica on the official page; its recipe was not fetched from the official page (only a YouTube proxy summary), so it is not used.

---

## Could not verify

- Kasuya: exact 40/80 and 80/40 gram splits and 90 g / 180 g 60% amounts (page states effects, not amounts); any micron or click figure; Kasuya's own 2026 "10 pour" recipe (only fan channels and blogs); any published update to 4:6 on Philocoffea. Philocoffea's 1:15 / 20 g example is stated; the 3:30 schedule gap at 2:15 to 2:45 is as published.
- Hoffmann: spoken technique details from transcripts of all three videos; V60 numbers rest on Hario-hosted text, not his own page; grind in clicks or microns (none stated); press duration for AeroPress; 1-cup V60 water temperature and exact pour amounts (partial proxy read); an updated "1-cup" description in his own words.
- Hedrick: any V60 numbers on his own page or channel description; which V60 video is his current standard; Kalita Wave recipe; AeroPress step beyond the description (grinder, press start time). lancehedrick.com did not resolve, lancehedrick.coffee has no recipes.
- 1Zpresso: no first-party AeroPress band, no V60-only band, no micron-to-particle-size table; ZP6 chart shows only Pour Over/Siphon (4.0-5.0) and French Press (5.0-6.0). The chart text was read from the published image.
- WAC 2024 official recipe text (not fetched from the official page).
- Grinder translation from Comandante and DF64 settings: no first-party data.

## Sources (pages actually fetched)

- https://en.philocoffea.com/blogs/blog/coffee-brewing-method (Kasuya 4:6, byline and date, temps, grind, 60% rule, timings)
- https://en.philocoffea.com/blogs/blog/hario-v60-beginner-brewing-guide (Kasuya V60 guide, same schedule, "coarse")
- https://en.philocoffea.com/products/signed-book-by-tetsu-kasuya-anyone-can-make-great-coffee-the-worlds-best-4-6-method-for-getting-addicted-to-good-coffee (book page, no numbers)
- https://www.hario-europe.com/blogs/hario-community/v60-ambassadors-tetsu-kasuya (Kasuya 92 C, 50/70/60/60/60)
- https://www.hario-europe.com/blogs/hario-community/v60-ambassadors-james-hoffmann (Hoffmann V60 steps, 30 g/500 mL/97 C)
- https://www.hario-usa.com/blogs/recipes-and-more-from-friends/james-hoffmann-uitimate-v60-technique (Hoffmann V60 timings, "medium fine")
- https://www.youtube.com/watch?v=AI4ynXzkSQo (Hoffmann Ultimate V60, description only; via r.jina.ai proxy)
- https://www.youtube.com/watch?v=1oB1oDrDkHM (Hoffmann Better 1 Cup V60; proxy, partial)
- https://www.youtube.com/watch?v=j6VlT_jUVPc (Hoffmann Ultimate AeroPress; proxy)
- https://www.facebook.com/jameshoffmanncoffee/videos/the-ultimate-v60-coffee-technique/708019493359515/ (his page, one-line description only)
- https://www.jameshoffmann.co.uk/ (no recipes)
- https://lancehedrick.coffee/ (no recipes)
- https://www.youtube.com/watch?v=PNFVCmxBjQQ (Hedrick, Last V60 Recipe, description only; proxy)
- https://www.youtube.com/watch?v=jz9fH5ODVFU (Hedrick, A Different AeroPress Recipe; proxy)
- https://www.youtube.com/watch?v=62OQtajQ1kg (Hedrick, Tetsu Kasuya 10 Pour video; no numbers)
- https://www.youtube.com/@LanceHedrick/videos (channel listing)
- https://worldaeropresschampionship.com/pages/recipes (WAC 2025 Nemo Pop recipe)
- https://1zpresso.coffee/grind-setting/ (ZP6 Special dial structure and chart link)
- https://i0.wp.com/1zpresso.coffee/wp-content/uploads/2022/10/ZP6-special-Grind-Setting-Reference-20221031.jpg (official chart, viewed directly)
- https://1zpresso.coffee/zp6/ (9 numbers, 90 clicks)
- https://1zpresso.coffee/manual-k-en/ (90 clicks, 22 um)
- https://1zpresso.coffee/product/zp6-special/ (90 clicks, 22 micron)
- https://1zpresso.coffee/how-to-dial-in-the-perfect-grind-size-for-pour-over-coffee/ (ZP6 40-50 clicks start)
- https://1zpresso.coffee/recipe/ (ZP6 Special settings of champion recipes: 4.1, 5.5)
- Fetched only to check, NOT cited as authority: YouTube pages of third-party channels (Quiet Cup, Chemicoffea, Brewing Habits, 2024 WAC proxy), https://gist.github.com/fluency03/7fb305b8110dde5739d14697af97a99a, https://hackmd.io/@-FmOJnmnS_ymDzHvWu-yEA/HyR5g-9WL
