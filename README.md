# Brew Guide

Manual-brewing recipes from well-known coffee professionals, with a live timer that walks you through each brew step by step.

Pick a recipe, set your dose, and follow along. The Brewing screen shows the whole brew as a list. Each step is crossed out as the next one starts. Beside the list, a drawing of the brewer fills as you pour and drains into the server at the end. Pours are given as the reading your scale should reach, and grind is given as 1Zpresso ZP6 Special clicks.

It's built for one counter: an iPad propped up while you pour, with a phone or laptop also working.

## Recipes

Every built-in recipe credits its Author and links to its source. Each carries a label saying how well its numbers are backed:

| Recipe | Author | Brewer | Numbers |
| --- | --- | --- | --- |
| [4:6 Method](https://en.philocoffea.com/blogs/blog/coffee-brewing-method) | Tetsu Kasuya | V60 | Verified |
| [Ultimate V60 Technique](https://www.hario-europe.com/blogs/hario-community/v60-ambassadors-james-hoffmann) | James Hoffmann | V60 | Partly checked |
| A Better 1 Cup V60 Technique | James Hoffmann | V60 | User-supplied |
| 1-2-1 V60 | Lance Hedrick | V60 | User-supplied |
| One & Done V60 | Lance Hedrick | V60 | User-supplied |
| [A Different AeroPress](https://www.youtube.com/watch?v=jz9fH5ODVFU) (two variants) | Lance Hedrick | AeroPress | Verified |
| [2025 World AeroPress Championship recipe](https://worldaeropresschampionship.com/pages/recipes) | Nemo Pop | AeroPress | Verified |

Every ZP6 click value for a built-in recipe is an estimate based on the Author's grind description, and the app labels it as one. Sources, gaps and reasoning are in [`docs/research/builtin-recipes.md`](docs/research/builtin-recipes.md).

You can also write your own recipes, or copy a built-in one and change it. Doses scale proportionally; timings stay fixed.

## Running it

```sh
npm install
npm run dev      # start the dev server
npm test         # run the tests
npm run build    # type-check and build the installable app into dist/
```

There's no backend and no account. Recipes, favourites and settings live in your browser's local storage, and you can export or import them as a JSON backup. Once built, it installs as a PWA and works offline.

Built with React, TypeScript, Vite, Tailwind CSS and Zod.

## Project docs

- [`PRODUCT.md`](PRODUCT.md): who it's for, what it does and the principles it follows.
- [`GLOSSARY.md`](GLOSSARY.md): the words the code and docs use (Recipe, Step, Pour, Scale target, Session and so on).
- [`docs/adr/`](docs/adr/): decisions worth knowing the reasons for.

## Photos

Each built-in recipe shows a photo of its Author. They are stills from the Authors' own videos and a World AeroPress Championship photo, and they belong to their owners.
