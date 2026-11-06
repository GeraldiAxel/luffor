# Maritime engraving

Generated with the built-in image generation tool, then encoded as WebP without altering the composition.

Original archived asset: `dist/assets/ocean-engraving.webp`

Production prompt:

> Use case: illustration-story. Asset type: very wide decorative illustration for a luxury maritime editorial portfolio website footer, designed to be cropped along lower edge. Create an exceptionally intricate antique copperplate engraving of a dramatic ocean with overlapping organic rolling wave crests, irregular sea foam, dense delicate curved hand-hatched lines, and a slender old stone lighthouse rising from a rocky outcrop positioned at 65 percent of canvas width. Palette strictly two colors: fine warm ivory #F9F5EB engraved ink on a completely flat solid deep navy #02204F background. The sea occupies the bottom 65 percent of the image. Above the horizon is completely empty flat navy, no sky texture, no clouds, no stars. Aspect ratio wide 3:1 landscape. Style: authentic nineteenth-century maritime copperplate engraving, extraordinarily fine linework, varied line weight, not smooth digital sine waves, no comic style, no gradients, no photography. The lighthouse is elegantly small and isolated in dramatic negative space. Full bleed ocean at left right and bottom, no frame, no text, no lettering, no logos, no watermarks. High detail, premium quiet editorial art direction, generous dark space between ink hatching so navy remains dominant.

The current version uses the maritime engraving as the principal footer composition. It is decorative, hidden from assistive technology, and ignores pointer events.

## Current revision: sailboat and dolphins

Final asset: `dist/assets/ocean-sail-dolphins.webp`

Edited with the built-in image generation tool. The lighthouse and its rocky outcrop were replaced with a sailboat, and exactly three small dolphins were added. The earlier, smaller-dolphin composition has been restored at the user's request.

Restored version's production prompt:

> Use case: precise-object-edit. Image 1 is the edit target: the existing wide ivory-on-navy engraved ocean artwork for the Luffor portfolio. Edit this exact composition with only two changes. First, completely replace the lighthouse AND its rocky island at about 65% of the width with a graceful single-masted sailboat afloat on the sea, with one prominent elegant ivory triangular sail, a smaller jib, delicate engraved rigging, and a modest dark hull nestled naturally in the waves. Keep the boat at approximately the lighthouse's original visual scale and position; no lighthouse, tower, island or rock may remain there. Second, add EXACTLY THREE clearly recognizable dolphins leaping above or through the waves, each anatomically correct with a beak-like snout, curved dorsal fin, pectoral fins, and fluked tail. Distribute them at approximately 30%, 46%, and 75% of canvas width, in the middle-depth ocean area, large enough to read as dolphins while remaining elegant secondary details. Render boat and all three dolphins in precisely the same fine antique copperplate engraving, intricate ivory hatching, and restrained maritime illustration style as the original waves. Preserve the original overlapping wave composition, detailed foam and curved hatching, original 3:1 landscape dimensions, flat deep navy #02204F background, warm ivory #F9F5EB ink, and the empty navy upper sky. No extra dolphins, no extra boats, no text, no logos, no stars, no clouds, no new colors, no photographic rendering. Everything else remains visually unchanged.

## Ship-led agency hero

Asset: `dist/assets/hero-ship.webp`, 1122 × 1402, with the generated alpha channel preserved.

Tool: built-in `image_gen` with transparent background. The footer engraving was a style reference. The generated PNG was copied into the project as WebP; the footer composition was not changed.

Generation brief:

> An isolated antique three-masted sailing ship for the Luffor digital agency hero. A detailed nineteenth-century copperplate engraving, warm ivory sails and fine navy hatching, seen from a graceful three-quarter angle with the bow facing left. Elaborate rigging, billowing sails, a small pennant, a carefully engraved wooden hull, and elegant proportions. Match the fine maritime linework of the footer reference. Transparent background, with no sea, no sky, no land, no frame, no lettering, no skulls, and no watermark. Keep the entire vessel and its rigging inside the image so it can move independently above coded waves.

The sea, globe chart, book geometry, paper transition, and irregular ink reveal are native SVG/CSS/JavaScript. Digital interface concepts are original, editable SVG compositions from `scripts/make-digital-concepts.mjs`; they are not screenshots of real client products.
