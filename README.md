# Luffor

## Current hero: the cockpit studio

The page now opens on a single-deck ship's wheelhouse adapted into a developer studio. Three original low-poly developers work at the helm desk, the chart table and the starboard window seat, and a lighthouse outside the starboard window sweeps its beam through the room.

- `dist/cockpit-studio.js` drives the hero. It reads everything about the scene from `dist/assets/cockpit-studio/scene_manifest.json`: cameras, hotspots, destinations, animation clips, lightmap mapping and the opening timeline.
- `dist/assets/cockpit-studio/` holds the exported scene (`luffor_cockpit.glb`), the line model for the opening (`luffor_cockpit_wire.glb`), four WebP lightmaps, `camera_routes.json` (reference; not loaded at runtime) and `poster.webp`.
- Seven destinations: Bridge (home), Work (work locker), Services (chart table), About (lookout), Contact (radio station), plus Helm and Look aft. Work, Services, About and Contact open a content panel; panel copy and the four interface concepts live in `cockpit-studio.js`.
- Camera journeys run in a straight line from wherever the camera is to the destination pose, with an eased start and stop. Every authored route was ray-tested clear of geometry in Blender.
- The opening draws the line model on black, then reveals the lit scene in pixel blocks through a 1-bit dither stage. It is skippable and is skipped under reduced motion.
- Static lighting is baked into the lightmaps. Only the two lighthouse spot lights are live, with shadows on desktop widths. `config` at the top of `cockpit-studio.js` sets beam intensity, shadows and pixel ratio.
- The existing markup, `cockpit.css`, panels, pause control, look buttons, motion switch and WebGL fallback are reused unchanged in behaviour.
- The scene is authored in a separate project (`luffor-claude`); `cockpit-assets/HANDOFF.md` documents coordinates, cameras, clips and the export. To update the scene, re-export there and replace the files in `dist/assets/cockpit-studio/`.
- `npm run check` validates the GLB containers, cameras, destinations, clips, crew rigs, lightmaps and poster.

## Agency sections and languages

Below the hero, in order: **one concept inspected** (`#work`), **the other three concepts**, **Packages** (`#pricing`), a short **first-message note**, then the existing contact footer.

- `dist/body.css` and `dist/body.js` hold the inspected concept, the concept index and the first-message note. Every selector starts with `.lb-`, so these files do not touch the hero, packages or footer.
- The inspector shows the whole Common Ground screen beside a square crop. Each decision button carries `data-crop="x,y,size"` in the artwork's 1280 × 800 coordinates; choosing one moves the crop and its outline. To inspect a different screen, change the two image paths and the three crops in `index.html`.
- All four interfaces are labelled as Luffor's own concepts. Replace them, and the "nearest package" links, when there is commissioned work to show.

- **Prices, WhatsApp and the launch offer** are set in `dist/site-data.js`. Prices are plain rupiah numbers; until set, cards show a visible `[Price]`. Without a WhatsApp number every chat button falls back to email. The launch-offer banner stays hidden until `discountPercent` is a number. `npm run check` lists anything still missing.
- **English and Bahasa Indonesia.** English is written in `dist/index.html`. Indonesian lives in `dist/i18n.js`, keyed by each element's `data-i18n`. The EN / ID switch in the header remembers the choice; `?lang=id` opens in Indonesian. `npm run check` fails if any page text lacks an Indonesian entry.
- `dist/sections.css` holds the styles, `dist/sections.js` fills prices and WhatsApp links (with a prefilled message per package, in the visitor's language), runs the launch offer and the card spotlight.
- Package contents and revision counts are written as defaults. Edit them in `index.html` and `i18n.js` to match what Luffor actually offers.

The earlier two-deck cruise-ship hero is archived, not deleted: `dist/cockpit.js`, `dist/ship-layout.js`, `dist/assets/luffor-wheelhouse.glb`, `dist/assets/ship-blockout.glb`, `dist/assets/cockpit-poster.png` and `artwork/` are no longer loaded by the page. `archive/` holds the pre-change copies of `dist/index.html`, `scripts/check.mjs` and this README. The description below refers to that archived hero.

## Archived: two-deck cruise ship

The earlier page contained an original, explorable two-deck cruise-ship studio and the animated contact footer. A rotating lighthouse shines through the right-hand bridge window. Ten authored viewpoints connect the bridge, chart table, instruments, radio, lighthouse, aft atrium, stairway, upper developer workspace, bridge overlook, and crew lounge. Three original adult low-poly developers—two men and one woman, all with black hair—work around the ship. The earlier standalone project ribbon and agency sections remain archived. Lenis smooth scrolling and the footer drawing remain active.

The bridge uses walnut, dark enamel, warm instrument lamps and an open view across the water. A tablet operator works at the helm, a second developer sits at the aft monitor pair, and a third works on the upper deck. The port stair, wraparound watch desk and window mullions give the cameras shared landmarks.

## Wheelhouse source

- `artwork/luffor-wheelhouse.blend` is the editable Blender 5.2 source. All ship geometry, chart linework, lettering, lighthouse, timber texture, and three developer characters are original and generated by `scripts/build-cockpit.py`. It includes an independently editable architectural blockout and an entrance camera with keyed movement.
- Rebuild with Blender in background mode: `blender --background --factory-startup --python scripts/build-cockpit.py`. This saves the Blender source, exports `dist/assets/luffor-wheelhouse.glb`, and renders `dist/assets/cockpit-poster.png` for loading and fallback.
- `dist/ship-layout.js` is exported from Blender and supplies desktop/mobile camera poses, stair waypoints, crew metadata, and the entrance movement. `dist/cockpit.js` owns direct camera interpolation, quaternion camera turns, raycast hit areas, projected HTML hotspots, content panels, sea and beam shaders, and lighting. Its `config` object sets the beacon period, intensity, and rendering resolution. The scene uses the existing Three.js 0.160.0 bundle and matching locally vendored GLTFLoader utilities.
- The layout also exports the ship's horizontal proportions. Runtime lights, radar, object hit areas use the same transform. A separate opening camera handles tall desktop side panels. The sun's shadow map is cached for the static interior, while the lighthouse keeps its own moving shadow.
- `dist/cockpit.css` defines the scene, controls, introduction, and responsive layouts. Desktop and mobile use separate authored camera positions.
- The pause control holds ambient animation while navigation stays available. The existing site motion switch and system reduced-motion preference disable ambient movement and camera travel. Rendering sleeps offscreen and in hidden tabs. WebGL failures keep the rendered poster and functional HTML destination panels.
- The editable Blender introduction occupies frames 1–61 at 24 fps. Its compositor exposes the edge extraction, five-pixel cells, stepped monochrome ramp and color reveal. The browser renders the architectural outline and detailed ship from one camera, using two temporary render targets during the reveal. The entrance is skippable and reduced motion opens on the color view.
- Drag horizontally to turn all the way around and vertically to look up/down within comfortable bounds. Look-left/right buttons provide the same exploration to keyboard users. World-axis yaw keeps the horizon level. Camera journeys interpolate along a straight line to the destination, with an eased start and stop and a simultaneous turn toward the arrival view. They pass through scene geometry and can be interrupted by selecting another destination. Ordinary vertical touch scrolling remains available.
- The four chart-table examples are explicitly independent interface concepts, not commissioned client work. Their copy and image paths are in `cockpit.js`. Contact links use `site-data.js`.

Earlier implementation details below describe archived source and assets unless stated otherwise.

A buildless digital agency website in deep navy and warm ivory. Luffor's offer is website design and development, custom applications, UI / UX, and digital strategy.

## Run locally

```sh
npm run dev
```

Open `http://localhost:4173`. Node 18 or newer is required. No installation is needed.
`npm run build` validates the ready-to-publish `dist/` directory. `npm run check` runs the same source, asset, and case-study checks.

## Personalise

- `dist/site-data.js`: studio name, original logo asset path, location, specialty, availability, genuine email/social links, and all four project titles, descriptions, images, and case-study content. Set these once; project information updates on both the homepage and its study.
- `dist/index.html`: headline, introduction, biography, capability entries, and other editorial copy. Update the page description, social metadata, and canonical URL if hosting elsewhere.
- `dist/technology.css`: interface-led hero, browser-window project views, and responsive overrides. `dist/ribbon.css` styles the WebGL archive. `dist/edition.css` holds the agency sections; `dist/styles.css` holds the original palette and base components.
- `dist/assets/`: locally served artwork, project SVGs, fonts, and font licenses.

The supplied brief referred to a sail logo, but the attachment contained only text. The site therefore uses a temporary typographic wordmark. Add the original logo to `dist/assets/`, then set `brand.logo` in `site-data.js`. It will be displayed in its original proportions.

All four examples are original, independent digital concepts: a company website, content website, team application, and reporting dashboard. They include business questions, interface directions, and explicitly illustrative outcomes. No clients, awards, launches, or performance claims are invented. Replace the entries in `site-data.js` with commissioned work when available. Unconfirmed location and availability are replaced with useful agency information in the interface. Email and social destinations remain replaceable; adding genuine details activates the normal email and external profile links.

## Images

The current ocean engraving features a sailboat and three small dolphins, restored to the earlier, subtler composition. It was edited with the built-in image generation tool and saved as `dist/assets/ocean-sail-dolphins.webp` (2172 × 724). The original lighthouse composition remains archived as `dist/assets/ocean-engraving.webp`. Production prompts are in `ARTWORK.md`.

The hero now uses original HTML/CSS interface compositions: an application dashboard, a responsive company website, and a mobile workspace. The earlier generated ship asset remains archived in `dist/assets/hero-ship.webp`, and is no longer loaded by the page.

Website and application mockups, landscape screens, and portrait interface previews are editable SVG generated by `node scripts/make-digital-concepts.mjs`. The earlier `make-archive-covers.mjs` and its covers are archived and are no longer used by the page. The older `make-project-assets.mjs` remains as the original branding-art generator; running it would overwrite the current digital mockups.

## Interaction and accessibility

The site has a mobile navigation menu, four shareable hash-based case-study views, next-study links, contact/profile notices, visible focus, native modal focus containment, Escape dismissal, and restored focus after dismissal.

`dist/archive.js` creates a curved WebGL ribbon adapted from the supplied Marika Lindfors reference. Three.js 0.160.0 is bundled locally with its MIT license. Custom GLSL bends subdivided interface planes into an S-curve, adds scroll-responsive depth and twist, and draws a receding grid floor with a reflected card pass. Mobile layouts use a vertical ribbon without the floor. The ribbon uses Luffor's four original SVG concept previews, repeated for continuous navigation; it does not use the reference's third-party videos or fictional project credits.

Horizontal drag, horizontal/Shift-wheel input, arrow keys, project buttons, filters, and an index view remain available. Native vertical page scrolling stays with Lenis and adds subtle motion to the visible ribbon. Clicking a card opens its existing project dialog; Escape returns to the ribbon. A static interface preview is the fallback if WebGL is unavailable. Rendering sleeps offscreen, in hidden tabs, and after motion settles. Reduced motion disables inertia, twist, hover effects, and entrances.

`dist/interfaces.js` adds a small, event-driven pointer response to the hero. Entrance animations run once. There is no ambient hero movement and no scroll interception. `dist/voyage.js` is retained as archived source and is no longer loaded. Device and visitor motion preferences disable automated movement and project flight.

`dist/motion.js` and `dist/motion.css` provide the motion system: masked word entrances, rolling link labels, spring-following project cursors in the index view, subtle image tilt and parallax, magnetic controls, animated rules and capability rows, case-study entrances, a reading-progress line, and chapter navigation. All motion uses native CSS and Web Animations; no animation dependency is required.

`dist/ink.js` adds the signature footer drawing. A short WebGL pass reveals the artwork from left to right, tracing the bright contours before filling in the fine hatching and shading. It plays on entry and can be restarted with **Replay the tide**. Rendering pauses offscreen and in background tabs, and stops completely once finished. A simple native reveal is the fallback when WebGL is unavailable; the original image remains the static, reduced-motion version.

The footer's **Motion on/off** control saves an explicit visitor preference locally. Device reduced-motion preferences take precedence and disable the effects automatically. Touch layouts retain simple, direct interactions. Pointer-follow animation stops when it settles, scroll work is scheduled only after a relevant event, and offscreen decorative motion pauses. All editorial content remains available with motion disabled or JavaScript unavailable.

Fonts and imagery are local. There are no analytics, forms, or third-party requests at runtime. Lenis and Three.js are bundled locally. The hero and interface transitions use native CSS and Web Animations.

## Hosting

Lenis 1.3.27 provides smooth wheel and section-link scrolling. It is pinned in `package.json` and bundled locally with its MIT license under `dist/assets/vendor/`. After `npm install`, run `npm run vendor:lenis` to refresh the bundled files. `dist/smooth-scroll.js` respects reduced motion and the visitor motion control, preserves native touch and modal scrolling, and leaves horizontal archive gestures to the archive.

Three.js is pinned to 0.160.0. Run `npm run vendor:three` after installing dependencies to refresh its local browser module and license.

`dist/` is the complete static website. `.openai/hosting.json` retains the private Sites project identity. The local preview server is development-only and is not part of the published website.
