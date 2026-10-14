# Step instructions carry technique, not numbers

A Step's instruction used to repeat its grams and times in prose ("Pour 60 g", "Pour to 300 g by 1:15"). Scaling a Recipe to a new dose changed each Pour's water but not that text, so a 15 g brew of the 4:6 still said "Pour 60 g". Now the numbers live only in the Step's fields. The Session shows a title built from them, led by the Scale target ("Pour to 120 g · +60 g"), and the instruction holds only the technique ("Wet all the grounds"). A time the fields don't carry, such as when a Pour should finish ("finishing by 1:15"), may stay, since timings never scale. An instruction may be empty when the Author gave no technique beyond the numbers, as with the 4:6's middle Pours, rather than inventing one. Built-in recipes are reworded to match, and the Editor tells the user not to repeat numbers.

## Considered Options

- **Substitute numbers into the prose when scaling.** Rejected: it means finding and rewriting grams inside free text an Author or the user wrote, which breaks on any phrasing we didn't anticipate.
- **Hide the instruction while brewing.** Rejected: some lines carry real technique ("swirl hard so no dry pockets remain") that the title can't express.

## Consequences

Personal recipes saved before this change may still have grams in their wording. They are left as written rather than rewritten automatically; the user cleans them up in the Editor.
