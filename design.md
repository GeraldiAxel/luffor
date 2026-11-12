# Portfolio Design Brief

## Purpose

Design an exceptionally polished portfolio inspired by the [MotionSites Tide Footer reference](https://motionsites.ai/?prompt=tide-engraving-footer), adapted to the supplied sail logo and its navy-and-ivory palette.

Extend the reference's engraved ocean illustration, delicate structural lines, quiet typography, and dramatic negative space into a complete portfolio. The site should feel like a contemporary creative portfolio published as a carefully crafted maritime journal: confident, atmospheric, precise, and memorable.

This document records the design direction. Website implementation is outside the current request.

## Reference and Brand

### Visual principles

- Use intricate engraved artwork as the signature visual element.
- Balance expressive illustrations with restrained typography and a disciplined grid.
- Give the work generous space and strong visual hierarchy.
- Suggest direction, clarity, and craft through the sail mark and lighthouse.
- Keep maritime associations understated and relevant to the brand.
- Carry one coherent visual language through the full page, including project views.

### Color palette

The primary colors are approximate samples from the supplied logo. Supporting colors extend that palette.

| Role | Color | Use |
| --- | --- | --- |
| Brand navy | `#02204F` | Primary background and brand color |
| Warm ivory | `#F9F5EB` | Main text, engraved illustrations, and light sections |
| Deep navy | `#011733` | Subtle surface depth and selected backgrounds |
| Slate blue | `#91A2B8` | Secondary information where contrast permits |

Navy and ivory should dominate. Use warm ivory in place of pure white. Create depth through tonal variation, fine linework, and subtle texture. Avoid additional accent colors, bright gradients, glass effects, and heavy shadows.

### Logo

Use the supplied sail logo as the only real brand asset. Preserve its proportions and silhouette, provide generous clear space, and avoid redrawing or embellishing it. If the asset is unavailable during a mockup, reserve a clearly replaceable `[LOGO]` slot.

## Art Direction

Translate the reference's monochrome engraving into ivory ink on deep navy. The signature artwork should depict a richly detailed sea with overlapping wave crests, intricate hatching, irregular foam, and a slender lighthouse on a rocky outcrop.

Aim for antique copperplate engraving or woodcut illustration interpreted with contemporary restraint. The artwork should feel handcrafted, with varied organic contours and detailed linework.

Use one major maritime composition in the footer and a smaller cropped fragment near the hero. Let the remaining sections focus on the portfolio. Avoid repeating the lighthouse or a large wave illustration throughout the page.

Introduce almost imperceptible paper grain, hairline rules, small section numbers, and occasional vertical guides. Keep texture and decoration clear of readable content.

## Layout and Typography

### Grid and spacing

- Use a disciplined 12-column desktop grid.
- At approximately 1440px wide, allow 64-88px outer gutters and 120-180px between major sections.
- Adapt spacing fluidly to viewport size and content length.
- Align text, images, captions, and structural rules deliberately.
- Alternate expansive visual moments with quieter editorial sections.
- Compose distinct spreads rather than repeating a uniform card grid.

### Type system

Pair an elegant, high-contrast editorial serif for large statements with a refined sans serif for navigation, body copy, and project information. Reserve a restrained monospaced style for small index numbers or metadata.

Create hierarchy through scale, proportion, and placement:

- Large headlines with deliberate line breaks and tight but comfortable leading.
- Short supporting paragraphs with readable line lengths.
- Small, precise labels with modest letter spacing.
- Body copy that remains comfortable to read on mobile.
- Headlines that adapt gracefully when placeholder text is replaced.

## Page Structure

### 1. Navigation

Place the sail logo and `[NAME / STUDIO]` at the left, with Work, About, and Contact links at the right. Keep the navigation lightweight. Use fine underline transitions or small arrow movements for interaction feedback.

Provide a concise, accessible mobile menu with the same visual care.

### 2. Hero

Create a spacious, asymmetric opening dominated by a beautifully typeset statement:

> [A DISTINCTIVE HEADLINE ABOUT YOUR WORK]

Pair it with a compact introduction in a narrower column:

> [NAME] is a [DISCIPLINE], creating [TYPE OF WORK] with clarity, character, and care.

Include understated **Explore selected work** and **Get in touch** links. Place a restrained engraved wave fragment along the lower edge, separated from the text.

The opening should feel complete on an ordinary laptop screen, with meaningful content visible and a clear invitation to explore.

### 3. Selected Work

Present four projects with varied scale and rhythm:

1. One large featured project.
2. Two complementary projects in an asymmetric two-column composition.
3. One broad closing project.

Each project includes `[PROJECT TITLE]`, `[DISCIPLINE / CATEGORY]`, `[YEAR]`, and `[A SHORT, SPECIFIC PROJECT DESCRIPTION]`.

Use generous image areas, restrained captions, clean rectangular crops, fine borders, and minimal corner rounding. Let imagery and typography establish the hierarchy.

Each project should lead to a consistent case-study view with placeholders for overview, role, challenge, approach, outcome, and supporting imagery. Do not invent clients, awards, results, testimonials, or performance statistics.

### 4. About

Introduce a warm ivory section with navy typography to create a deliberate change of pace. Balance a strong editorial heading against a narrower biography column and an optional portrait placeholder.

Use `[LOCATION]`, `[SPECIALTY]`, and `[AVAILABILITY]` only as clearly replaceable content. Do not fabricate personal information.

### 5. Capabilities

Use a refined numbered list separated by hairline rules:

1. `[CAPABILITY 01]` - one useful sentence.
2. `[CAPABILITY 02]` - one useful sentence.
3. `[CAPABILITY 03]` - one useful sentence.

Add a fourth entry only if the eventual content warrants it. Keep the section direct and spacious.

### 6. Contact and Signature Footer

Make the footer the page's most memorable visual moment. Return to deep navy and place an oversized ivory invitation above the artwork:

> [LET'S MAKE SOMETHING WORTH REMEMBERING.]

Provide a prominent `[EMAIL ADDRESS]`, a short contact line, and compact social links. Arrange the logo, navigation, contact information, and copyright in a precise grid with faint vertical rules that echo the reference.

Let the engraved ocean rise across the bottom, with the lighthouse positioned off-center. Build depth through overlapping wave layers and detailed linework. Keep all functional text in a calm, readable area above the illustration.

## Placeholder Assets and Content

All visuals other than the supplied logo must be intentional, replaceable placeholders.

- Use considered compositions such as abstract editorial layouts, typography studies, identity mockups, interface compositions, or architectural forms appropriate to the eventual project.
- Maintain the navy-and-ivory art direction across the placeholder set.
- Avoid broken images, random stock photography, empty gray rectangles, and prominent "image goes here" labels.
- Use discreet asset identifiers when helpful.
- Define consistent aspect ratios so real assets can be substituted without rebuilding the layout.
- Keep placeholder assets and project content easy to locate and replace.
- Use a high-quality replaceable illustration placeholder for the engraved sea.
- If constructing the engraving as SVG, use varied organic contours, dense hatching, irregular foam, and layered depth. A few smooth sine waves will not capture the intended character.

All personal details, project claims, and contact destinations must remain explicit placeholders until supplied.

## Motion and Interaction

Motion should support the composition and remain restrained:

- Gentle text and image reveals on entry.
- Subtle image scaling within project boundaries on hover.
- Fine underline transitions and small directional arrow movements.
- Almost imperceptible drift between decorative wave layers, only if it improves the composition.

Keep text stable and interactions responsive. Avoid continuous movement across the entire page, excessive stagger, scroll hijacking, and long loading sequences.

Respect reduced-motion preferences. All content and navigation must remain available without animation. These motion ideas are proposed extensions of the visual direction, rather than verified behavior from the reference.

## Responsive Design and Accessibility

- Give mobile the same level of art direction as desktop.
- Recompose the page into a deliberate single-column sequence.
- Preserve hierarchy and readable typography as headlines wrap.
- Simplify decorative details where necessary while retaining the engraved character.
- Maintain accessible text contrast, visible keyboard focus, semantic structure, and comfortable touch targets.
- Ensure navigation and project interactions work with a keyboard and without hover.
- Keep decorative artwork clear of text, links, and controls.
- Prevent horizontal overflow and reserve media dimensions to avoid layout shifts.

## Implementation Quality

When implementation is authorized, use the existing project stack where suitable. Keep the site fast and avoid unnecessary animation dependencies. Every visible interaction should have a meaningful behavior. Placeholder destinations should be clearly handled and must not produce broken navigation or imply a completed contact action.

## Design Review Criteria

- The logo, palette, typography, artwork, and spacing form one coherent identity.
- The page remains compelling with placeholder content and assets.
- The hero, selected work, and footer each have a distinct composition.
- Project imagery and captions establish a clear browsing rhythm.
- The ivory About section provides a purposeful change of pace.
- The footer captures the reference's engraved sea, fine grid, and generous negative space.
- The site feels carefully composed at desktop, tablet, and mobile widths.
- Motion remains subtle, optional, and accessible.
- No fabricated professional claims or personal details appear.
- Any section that feels generic or visually disconnected is refined before completion.
