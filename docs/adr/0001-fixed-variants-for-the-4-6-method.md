# The 4:6 is shipped as fixed Recipe variants, not a parametric generator

Kasuya's 4:6 is adjustable by taste, with the first 40% of the water setting sweetness vs. acidity and the last 60% setting strength. We ship the standard variants (Balanced, Sweeter, Brighter, Stronger) as separate Built-in recipes in one Recipe family, rather than a taste selector that regenerates Steps. This keeps a Recipe as plain structured data, which the editor, scaling and validation all rely on; a generator can be added later on top of it.
