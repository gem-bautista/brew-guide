# Photos belong to Recipes, not Brewers

The Library used one photo per Brewer, so every V60 recipe showed the same picture and the cards were hard to tell apart. Each Recipe now carries its own optional photo. Built-in recipes bundle a 4:5 portrait of their Author (from the Author's video or event) in `public/photos/recipes/<id>.jpg`. A Personal recipe can store one the user adds; it is cropped to 4:5 and shrunk to a JPEG of roughly 30 to 90 KB, then kept inline in the recipe as a data URL so it travels with backups. The schema accepts only those two forms, so an imported backup can never make the app load an image from another site. A Recipe without a photo shows its Brewer's drawing on a tinted tile.

Inline photos fill localStorage far faster than recipe text, so saving now reports failure and the Library tells the user when storage is full instead of dropping the change silently.

The bundled Author photos are thumbnails and stills from the Authors' YouTube videos and a World AeroPress Championship press photo. None is licensed for redistribution; clear them before the app is hosted publicly.
