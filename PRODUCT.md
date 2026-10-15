# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One person: the owner, brewing manual coffee at their own counter with a 1Zpresso ZP6 Special grinder. They pick a recipe, set the dose, and follow a live timer while pouring, usually holding a kettle and standing over a scale with an iPad propped nearby.

Other users are not a target for now. Public hosting may come later but has not been decided, so nothing should be designed for strangers, onboarding or sharing yet.

## Product Purpose

Brew Guide collects manual-brewing recipes from well-known coffee professionals and walks the user through a brew step by step on a timer. Success means picking a recipe and getting through a full brew without reading a video description, doing pour maths, or touching the screen with wet hands more than needed.

## Positioning

Pro recipes from named Authors (Tetsu Kasuya, James Hoffmann, Lance Hedrick, and the 2025 World AeroPress Championship winner Nemo Pop), each with its source and an honest verification label, combined with a hands-free live timer that says exactly what to pour and when, with grind given as ZP6 Special clicks.

## Operating Context

- Brewing happens mostly on an **iPad** propped on the counter (either orientation), read from arm's length with wet fingers. The owner also uses a phone and a laptop; both must work, but the iPad is the primary brewing screen (confirmed 2026-10-15).
- A brew lasts roughly 2 to 5 minutes. The Session runs on a continuous clock, cues each Step with sound and vibration, keeps the screen awake, and survives a reload or the phone sleeping.
- The physical setup is a Brewer (V60 or AeroPress among the built-ins), a scale that reads cumulative grams, a kettle, and the ZP6 Special grinder.

## Capabilities and Constraints

- **Screens:** Library (browse, search, filter by Brewer, Author and time, favourites), recipe preview, Editor, and the brewing Session with a Finished screen.
- **Recipes:** 8 Built-in recipes (read-only, attributed, with a source link) and Personal recipes the user creates or duplicates from a built-in. The 4:6 ships as fixed variants (ADR 0001). Doses scale proportionally and timings stay fixed.
- **Grind:** shown as a ZP6 Special click value. Built-in values are estimates and labelled as such; Personal recipes carry the user's own value. No micron-to-click converter.
- **Units:** metric only (g, ml, °C).
- **iPad-first, at the counter (confirmed 2026-10-15, replacing phone-first):** design for the iPad first, upright and sideways, then keep the phone and laptop working. The Session screen stays calm, fits without scrolling, and is readable from a distance.
- **Works offline (confirmed):** client-only installable PWA with no backend and no accounts. Data lives in this browser's localStorage, with JSON backup export and import.
- **Photos belong to Recipes (ADR 0003):** a Built-in recipe shows a photo of its Author; a Personal recipe can carry one uploaded photo stored inline; a recipe without a photo falls back to its Brewer's drawing.
- **Vocabulary:** use the terms in `GLOSSARY.md` (Recipe, Built-in recipe, Personal recipe, Author, Brewer, Step, Pour, Grind setting, Session, Library).
- **Hosting (2026-10-15):** GitHub Pages at https://gem-bautista.github.io/brew-guide/, deployed on every push to `main`, so the iPad gets HTTPS and can install the app.
- **App icon (2026-10-15):** a Fellow Stagg EKG, outlined in black with an orange knob and handle, pouring from the left into a centred V60 on a white ground with the orange glow. The source is `public/icon.svg`; the PNG icons beside it are rendered from it.

## Brand Commitments

- The product is named **Brew Guide**.
- Recipes are always credited to their Author, with a link to the source.

## Evidence on Hand

- Recipe research with sources: `docs/research/builtin-recipes.md`. Each built-in carries `verification: 'verified' | 'partial' | 'user-supplied'`. Hedrick's V60 recipes and Hoffmann's 1-cup V60 are user-supplied, and Hoffmann's Ultimate V60 is partial. Hoffmann's AeroPress and Kasuya's Sweeter/Brighter variants are held back until a primary source or the user's own numbers exist.
- Author photos: `public/photos/recipes/` (YouTube thumbnails and frames, plus a World AeroPress Championship photo). None is licensed for redistribution; this is acceptable only while the app stays local.
- There are no testimonials, user counts or reviews. Do not invent them.

## Product Principles

1. **Honest numbers.** A value that has not been verified is never shown as verified, and estimates are labelled as estimates.
2. **Credit the Author.** Every Built-in recipe names the person behind it and links to where it came from.
3. **Hands stay on the kettle.** During a Session the app leads and the user follows; touching the screen is optional.
4. **Built for one counter.** Optimise for the owner's real setup (ZP6 Special, phone at the counter) rather than a hypothetical general audience.
