## Goal — Locked
Stage 0 — Strategy (main session) — 2026-08-19 — branch `grounds-right-column` off `origin/main` @ 86c8029

Goal: In the `#grounds` section, delete the weddings/large-events paragraph, and fill the blank right-hand column beside the grounds copy with two portrait grounds photographs so that space is no longer empty — working on desktop AND mobile.

Log was empty (0 bytes) at Stage 1 — the previous run's PM archived and cleared it on PASS — so no archive was required.

Background: the blank area exists because the previous run fixed a defect by moving `.grounds-secondary` from `grid-row: 1 / 3` to `grid-row: 2`. That stopped a landscape photo being stretched to 1791px and cropped into an unrecognizable close-up, but left column 2 / row 1 empty beside the (now much longer) copy. This run fills it.

### Acceptance criteria
B1. The paragraph `Absolutely perfect for hosting weddings, large events and endless outdoor activities.` is deleted from `app/page.tsx` and appears nowhere in the rendered HTML. `.grounds-copy` goes from 6 body paragraphs to 5. No other paragraph is altered, reordered or merged.
B2. Exactly two new images are added to `#grounds`: `grounds-willow-tree` and `grounds-pool-natural`. Both are the only `portrait: true` grounds images in the manifest, and neither is currently used in any editorial band — only in the gallery. They use the SAME responsive pattern as the existing `.grounds-secondary` img: `src` at 1440, `srcSet` with 720w + 1440w, a `sizes` attribute appropriate to their rendered width, explicit `width`/`height`, `loading="lazy"`, `decoding="async"`.
B3. Alt text must be truthful and must reuse the existing manifest alt strings verbatim: `Mature willow tree on the lawn` and `Rock-edged natural pool with a stepping stone, grasses and a red maple`. Do not invent new descriptions.
B4. Desktop (>=901px): the two images occupy column 2 / row 1 — the blank area beside `.grounds-copy` — stacked vertically. Measured pass condition: the pair (including the gap between them) fills the row-1 height with no dead band, and neither image is squeezed into an aspect ratio that destroys its subject. Because both sources are portrait, a tall narrow box is the correct orientation for them; verify by screenshot that the willow and the pool are both recognizable.
B5. Mobile (<=900px and <=640px): both images appear in the stacked flow — the user explicitly chose to show them on mobile, not hide them. They must be sized consistently with the existing mobile grounds images (`.grounds-main` 430px, `.grounds-secondary` 280px at <=640px), with no overflow, no clipping and no collision with `.grounds-note`.
B6. No horizontal overflow at 375, 768, 1024, 1280 or 1440.
B7. Everything else in `#grounds` is unchanged: the `The grounds` eyebrow, the `A natural pond and five porches` h2, the other five paragraphs, `.grounds-main` (the pond video), the existing `.grounds-secondary` photo, and `.grounds-note`.
B8. `npm run lint` clean and `npm test` fully passing. Two new `<img>` elements will perturb the site-wide image-attribute counting assertions (`loading="lazy"` >=44, `decoding="async"` >=44, `srcSet="` >=44, `width="` >=46, `height="` >=46) and possibly others. Every perturbed assertion is RETARGETED at equivalent strength to the new true count — never deleted, never loosened to a weaker bound to make it pass.
B9. All 18 banned-term guards still pass. Note deleting the weddings sentence also resolves the `business-use suggestion` policy divergence recorded in the previous run's log, where published copy and the guard's stated intent disagreed. That resolution is a welcome side effect, not a licence to touch the guard — the guard list stays byte-identical.
B10. `git diff --stat` touches only `app/page.tsx`, `app/globals.css` and `tests/rendered-html.test.mjs` (plus this log). No new image files are added to `public/` — both photos already exist on disk at 720 and 1440.
B11. Evidence required: measured DOM rects and screenshots at 375, 768, 1024, 1280 and 1440, BEFORE and AFTER, proving the blank column is filled on desktop, the mobile stack is correct, and no previously-passing layout property regressed.

### Design constraints
- Anti-slop: reuse the existing markup and CSS idioms of this section. The repo already has a working pattern for a stacked image group in a grid cell (`.story-arrival-row`, `.suite-gallery`). Prefer following one of those over inventing a new mechanism.
- No change to any colour, font, type scale or the section's existing gap value (26px) unless genuinely required; if required, say why.
- Do not change `.grounds-secondary`'s `grid-row: 2` — that is the previous run's defect fix and must stay.

### Out of scope
All other sections; the gallery; the fact strip; details lists; `.grounds-note` content; price; metadata/JSON-LD; adding or re-encoding image files; any copy change other than deleting the one paragraph in B1.

### Assumptions
The user's requirement that the two photos be "different from other grounds pictures used on the site in other places" cannot be met literally — every photograph on disk already appears once in the gallery, and there are no unused images. It IS met in substance: the two chosen photos appear nowhere in any editorial band, so no photograph is shown twice outside the gallery, and in particular neither repeats the pond video or the rear-across-pond photo already in this section. Recorded here and reported to the user rather than resolved silently.
## Recon
2026-08-19 19:37 EDT

`app/page.tsx`: `#grounds` spans lines 220–244. `.grounds-copy` (lines 221–230) holds the eyebrow (222), h2 (223) and exactly 6 body `<p>` (224–229); the weddings paragraph to delete is line 228 verbatim `<p>Absolutely perfect for hosting weddings, large events and endless outdoor activities.</p>` — deleting it leaves 5 (224, 225, 226, 227, 229), matching B1. `.grounds-main` is `<PropertyVideo className="grounds-main" name="grounds-pool-pond" .../>` at line 231. `.grounds-secondary`, the pattern the two new images must follow, is lines 232–242 verbatim: `<img className="grounds-secondary" src="/property/gallery/grounds-rear-across-pond-1440.webp" srcSet="/property/gallery/grounds-rear-across-pond-720.webp 720w, /property/gallery/grounds-rear-across-pond-1440.webp 1440w" sizes="(max-width: 900px) calc(100vw - 48px), 30vw" alt="Rear exterior viewed across the pond garden." width="1440" height="1080" loading="lazy" decoding="async" />`. `.grounds-note` is line 243. `StoryImage` is defined lines 111–135: it hardcodes `/property/story/${name}-1920.webp`, a `960w/1920w` srcSet, `width="1920" height="1440"`, default `sizes="(max-width:900px) 100vw, 66vw"` — structurally incompatible with the two target images, whose files are confirmed on disk only at `public/property/gallery/grounds-willow-tree-{720,1440}.webp` and `grounds-pool-natural-{720,1440}.webp` (no `/property/story/` variants exist), actual pixel dims 480×720 and 960×1440 (both genuinely portrait, confirmed via `file`/`sips`). So the raw-`<img>` pattern is the only viable one, matching B2's directive. Manifest alt strings (page.tsx:53–54) are `"Mature willow tree on the lawn"` and `"Rock-edged natural pool with a stepping stone, grasses and a red maple"`, both `portrait: true`, both used only in the gallery today (confirmed by grepping the whole repo, excluding node_modules/.next/compute-squad-archive/CARM HOUSE PROJECT NOTES, for the weddings sentence too — it appears nowhere else). `globals.css`: base grid is `.grounds { display:grid; gap:26px; grid-template-columns:1.25fr .75fr; grid-template-rows:auto 540px auto; }` (line 116); the empty cell is column 2 / row 1 (only `.grounds-copy`, col1/row1, currently occupies row 1). `.grounds-main` is col1/row2, `.grounds-secondary` col2/row2 (both fixed 540px via the row track — line 120's `grid-row:2` must not change, per the out-of-scope note). `.grounds-note` is col1/row3, width 250px (line 121). Row 1's `auto` height today equals `.grounds-copy`'s natural content height alone, so the paragraph deletion (B1) shrinks that height before the new images' fit can be measured — ordering matters. At `max-width:900px` (lines 231–266) the grid becomes `auto 430px 350px auto`, everything forces `grid-column:1/-1`, `.grounds-secondary` moves to `grid-row:3` (350px there, not 280), `.grounds-note` to row 4. At `max-width:640px` (lines 312–326) `.grounds{display:block}` abandons the grid; `.grounds-main{height:430px}`, `.grounds-secondary{height:280px;margin-top:24px}`, `.grounds-note{margin-top:24px}`. The two prior-art "auto row sized by the copy column, image column stretches to fill it" rules — `.story-aerial` (lines 104–110, `height:clamp(...)` plus `@media(min-width:901px){.story-aerial{height:100%}}`) and `.interior-detail` (lines 125–131, same shape) — are the mechanically load-bearing precedent for B4, more so than the two named "stacked group" patterns. `.story-arrival-row` (CSS 111–112, JSX 198–217) is a full-width (`grid-column:1/-1`) 3-across nested grid occupying its own row of the parent grid, not a within-cell stack. `.suite-gallery` (CSS 135–143, JSX 265–275) is a nested 2×2 grid with `.story-image{margin:0;overflow:hidden}` and a `first-child{grid-row:1/3}` collage rule, occupying one whole side of `.suite-band`'s layout. Of the two, `.suite-gallery`'s CSS mechanics are the closer fit for a 2-image vertical stack (reworked to `grid-template-columns:1fr; grid-template-rows:1fr 1fr`, dropping the first-child override) but on its own does not solve the auto-row-height problem — that requires layering the `.story-aerial`/`.interior-detail` `height:100%` idiom on top of whatever wrapper holds the two new images.

`tests/rendered-html.test.mjs`: the site-wide image-attribute counts at lines 196–200 (`loading="lazy"` ≥44, `decoding="async"` ≥44, `srcSet="` ≥44, `width="` ≥46, `height="` ≥46) are all `>=` bounds — two new fully-attributed images satisfy them automatically, no retarget required. The `groundsImage` regex at line 326 (and its duplicate at line 469) is anchored to the literal `src="/property/gallery/grounds-rear-across-pond-1440.webp"` and is unaffected by sibling images added nearby. The `#grounds` slices used to scope those regexes (`html.indexOf('id="grounds"')`→`html.indexOf('id="interior"')`, lines 325/468) and the non-greedy `<section id="grounds">[\s\S]*?<\/section>` match at line 913 will include the new markup, but no current assertion counts elements within those slices, and `PropertyVideo` (app/PropertyVideo.tsx) renders a `<div>` root not a `<section>`, so the non-greedy match still terminates correctly at the real closing tag — nothing here needs retargeting on the evidence gathered, though the Plan should still re-run the suite rather than trust this alone. Gallery-side assertions are unaffected because the manifest itself doesn't change: `grounds-gallery-title` still expects 9 images (line 371), `galleryImages` already lists `grounds-willow-tree`/`grounds-pool-natural` (lines 121–122), and `page.match(/\{ name: "/g)` at line 1136 counts manifest entries, which stay the same count — the two photos are ADDED to the editorial band while remaining in the gallery, not moved or duplicated in the manifest. The "business-use suggestion" banned-term guard (line 1122, `/bed and breakfast|wedding venue|event space|rental income|air ?bnb|commercial use/i`) does not literally match "hosting weddings, large events" and was already passing before this change — B9's "resolves a policy divergence" is about copy-vs-guard-intent, not a currently-failing assertion, so no test will flip from FAIL to PASS here; the PM should not expect that as evidence. The one substantive ambiguity the Plan must resolve explicitly, not leave to the Executor: the only two existing precedents for a raw `<img>` in an editorial band reusing a gallery-manifest name both APPEND a trailing period to the alt text that the manifest entry itself lacks — `grounds-rear-across-pond`'s manifest alt (page.tsx:49, no period) vs its `.grounds-secondary` editorial alt (page.tsx:237, "...pond garden."); `setting-rear-elevation`'s manifest alt (page.tsx:34, no period) vs its `story-arrival-row` editorial alt (page.tsx:207, with period). B3 requires reusing the manifest strings "verbatim" (neither of the two target alt strings ends in a period) and "do not invent new descriptions" — this is a direct, load-bearing conflict between B3's literal text and the only two real precedents for exactly this situation; the Plan must pick one and state it, not decide silently. Two other minor notes: two untracked, pre-existing stray duplicate files sit in `public/property/gallery/` (`craft-hearth-bellows-1440 2.webp`, `craft-hearth-bellows-720 2.webp`), unrelated to this goal — the Executor must not touch or count them, and B10's "no new image files added" check via `git status`/`git diff --stat` should exclude them rather than net them against anything added. No AGENTS.md or CLAUDE.md exists in this repo. All findings above were confirmed directly (file reads, `sips`/`file` on the actual webp bytes, and repo-wide greps) rather than assumed from the goal text.

## Stage 0 — Amendment (scope expanded mid-run by the user)
Two further requests arrived after Recon completed. Both change the locked goal, so this returns to Stage 0 rather than being absorbed silently.

### C-series criteria (new) — the `#interior` section
The user sent a screenshot of the `copper-sink` image rendering enormous, with: "this pic is too big, we need to add one more pic so there is three here and then even the size and spacing."

Root cause is the previous run's own doing and is already understood: `.interior-detail { height: 100% }` inside `@media (min-width: 901px)` (globals.css ~125–131) makes the copper-sink image fill row 2, whose height is now driven by `.interior-copy`'s SIX paragraphs (~1354px measured at 1280w in the previous run). That rule was correct when the copy was two paragraphs; with six it produces one grotesquely tall detail image.

C1. The `#interior` section ends up with THREE images total, evenly sized and evenly spaced. Reading of "add one more pic so there is three here": the section currently holds two (`.interior-main` = `kitchen`, `.interior-detail` = `copper-sink`); one more makes three. Both existing images are kept.
C2. No image in `#interior` renders at a height wildly out of proportion to the others. "Even the size and spacing" is the acceptance bar: the three images should read as a deliberate, consistent set, with a consistent gap between them, not one giant plus two small.
C3. The third image must come from what already exists on disk — no new files. It must be an interior/craft subject appropriate to the "Timber, copper and stone" section, and must NOT duplicate a photo already used in any editorial band. Its alt text must be truthful and taken verbatim from the gallery manifest.
C4. `.interior-copy`'s six paragraphs and the `View the gallery` link are unchanged. The `Inside` eyebrow and the `Timber, copper and stone` h2 are unchanged.

### D — drone videos permitted
The user added: "feel free to use drone videos in any open spots mentioned in this round as well."

D1. The six existing `PropertyVideo` drone clips may be used to fill open space in this round where they genuinely fit. This is PERMISSION, not a requirement.
D2. Anti-slop guard: do not force a drone clip into a slot it suits poorly. The grounds right-hand column is a tall narrow portrait cell and the interior detail area wants interior subjects — if the honest answer is that no drone clip fits either spot, say so in the Plan and use stills. Do not add a video merely because it was permitted.
D3. Any drone video used must follow the existing `PropertyVideo` usage pattern exactly, including its lazy-loading and play/pause control behaviour, and must not break the test assertions that count video controls (`class="property-video-control"` is pinned at exactly 6, and `>Pause video<` at exactly 7). Adding a seventh property video WOULD break both — so if a video is added, those two assertions must be retargeted at equivalent strength to the new exact counts. Flag this explicitly rather than discovering it at test time.

### Revised scope
This round now delivers, together, in one PR:
- B1: delete the weddings paragraph from `#grounds`.
- B2–B7: fill the blank `#grounds` column-2/row-1 with the two portrait grounds photos, desktop and mobile.
- C1–C4: bring `#interior` to three evenly sized, evenly spaced images.
- D1–D3: drone video where it genuinely fits, or a reasoned statement that it does not.

B8–B11 (lint, full test suite green with assertions retargeted not weakened, diff limited to `app/page.tsx` / `app/globals.css` / `tests/rendered-html.test.mjs`, and measured rects plus screenshots at 375/768/1024/1280/1440 before and after) now apply to the C and D work as well.

Recon's grounds map stands. A supplementary Recon pass is required for `#interior` and for the video-count assertions before planning.
## Recon (cont.)
2026-08-19 20:12 EDT

`app/page.tsx:246-262` is `#interior` verbatim: `<section id="interior" className="interior section" aria-labelledby="interior-title"><div className="interior-lead"><p className="eyebrow copper">Inside</p><h2 id="interior-title">Timber, copper<br />and stone</h2></div><StoryImage className="interior-main" name="kitchen" alt="Kitchen island and range viewed from across the room, with the oval leaded-glass window and stairwell visible beyond." /><div className="interior-copy"><p>The kitchen is always the heart of the home...pine window sills.</p><p>An original natural stone chimney...living room.</p><p>With the commercial double ovens...culinary possibilities are endless.</p><p>Cook and be a part of the party...around the island".</p><p>The natural wood burning fireplace...hot tub.</p><p>The custom oval leaded glass window...executive office.</p><a className="text-link" href="#gallery">View the gallery <span aria-hidden="true">→</span></a></div><StoryImage className="interior-detail" name="copper-sink" alt="Hammered copper sink and dark countertop" /></section>` (six `.interior-copy` paragraphs at 253-258 unchanged by C4, link at 259). `StoryImage` (page.tsx:111-135) hardcodes `src={`/property/story/${name}-1920.webp`}`, `srcSet` at 960w/1920w, `width="1920" height="1440"` — it only works for the ten names actually present in `public/property/story/` (`property-plan, front-porch-daylight, front-through-trees, covered-porch, kitchen, copper-sink, primary-bedroom, primary-bedroom-wide, primary-bedroom-porch-view, pond-garden` — confirmed by `ls`, and this exact list matches `tests/rendered-html.test.mjs:865`'s `storyNames`). Of those ten, only 8 are currently rendered anywhere (`property-plan, front-through-trees, kitchen, copper-sink, primary-bedroom-wide, primary-bedroom, primary-bedroom-porch-view, pond-garden`, confirmed via the "server-renders...gallery" test's story-name loop at lines 184-195); `front-porch-daylight` and `covered-porch` exist on disk (1920×1440 landscape, confirmed via `sips`) and pass the byte-budget test but are used nowhere in `page.tsx` and have no entry in the `galleryGroups` manifest at all — so while `StoryImage` could technically render them, C3's "alt text must be truthful and taken verbatim from the gallery manifest" cannot be satisfied for either, since neither has a manifest alt string. Every other unused-in-editorial candidate (all Craft/Living images) exists only in `/property/gallery/` at `-720`/`-1440` suffixes, not `/property/story/`, so — exactly as the prior recon found for the two grounds photos — a raw `<img>` following the `.grounds-secondary`/`setting-rear-elevation` pattern (page.tsx:203-212, 232-242) is the only viable mechanism for any gallery-sourced third image; `StoryImage` is not usable for it. Full candidate inventory (name — dir/suffixes — real px dims via `sips` — orientation — manifest alt, page.tsx line): `craft-range-stone` — gallery 720/1440 — 1440×1080 — landscape — "Range and hood beneath timber beams, beside a brick column and granite counter" (73); `craft-range-detail` — 1440×1080 — landscape — "Professional-style range and metal control detail" (74); `craft-leaded-glass-nook` — 1440×1080 — landscape — "Service nook with a round leaded-glass window" (75); `craft-window-stair` — 960×1440 — portrait — "Round leaded-glass window beside the timber staircase" (76); `craft-brick-stair-detail` — 960×1440 — portrait — "Curved brick steps and timber wall detail" (77); `craft-copper-sink-edge` — 960×1440 — portrait — "Carved copper sink edge and custom metalwork" (78, subject overlaps the existing `copper-sink` StoryImage — same fixture, different photo, worth flagging not literally banned by C3); `craft-timber-stair-barrel` — 960×1440 — portrait — "Timber staircase and a wrought-iron-strapped barrel table." (79); `craft-stone-porch-bench` — 960×1440 — portrait — "Stained wagon-wheel bench against the stone wall of a covered porch, with a fern beside it on composite decking." (80, semi-exterior subject); `craft-hearth-bellows` — 960×1440 — portrait — "Riveted leather-and-brass bellows against the fieldstone hearth, beside a hand-carved candlestick." (81); `craft-brick-steps-timber-door` — 1440×1080 — landscape (feature) — "Curved brick steps leading to a custom timber door" (82, exterior-entry subject); `living-fireplace` — 1440×1080 — landscape — "Living room with exposed beams and stone fireplace" (62, on-theme via beams/stone); `living-kitchen-island` — 1440×1080 — landscape — "Kitchen island with a dark stone counter and wooden bar stools" (64, subject overlaps `.interior-main`'s `kitchen` StoryImage); `living-dining-room` — 1440×1080 — landscape — "Dining room with hardwood floors and a bay window onto the lawn" (63). All ten craft files exist at both suffixes on disk (verified via `ls -la`); none of the two stray untracked `craft-hearth-bellows-*-2.webp` duplicates (noted in the original Recon entry) should be touched or counted.

Globals.css: `.interior { display:grid; gap:clamp(24px,4vw,62px); grid-template-columns:.7fr 1.3fr; grid-template-rows:auto auto; }` (123) auto-places the 4 children row-major into 2 columns: row1 = `.interior-lead` (124, col1) / `.interior-main` (125, col2); row2 = `.interior-copy` (126-127, col1) / `.interior-detail` (128, col2) — matching the CSS comment at 129. `.interior-main { height: clamp(520px, 52vw, 720px); }` is a *self-contained* height, unaffected by its row-mate, so its rendered height is exactly the clamp value: 52vw = 665.6px at a 1280px viewport (within bounds → **~666px**) and 748.8px at 1440px (clamped to the 720px ceiling → **720px**). `.interior-detail { height:260px; ...width:100% }` at base, overridden at `@media (min-width:901px) { .interior-detail { height:100%; } }` (130-132) to fill row2's auto-sized track — and row2's content-driven height is set by `.interior-copy`, whose rendered width is capped at `max-width:490px` (126) in both cases (the 1.3fr column is ~682px at 1280 and ~767px at 1440 before the cap, computed from `.section` padding `clamp(24px,7vw,112px)` (93) and the `.interior` gap, so the 490px cap binds at both viewports — same wrap width). Font size is `clamp(17px, 1.5vw, 21px)` (101) though — 19.2px at 1280vw vs the 21px ceiling at 1440vw, ~9% larger — so at a *fixed* 490px column, 1440w text wraps to more lines per paragraph than 1280w, meaning `.interior-detail` is not merely as tall at 1440 as at 1280 but taller. The amendment's own root-cause note already supplies one real number: `.interior-copy` (and therefore `.interior-detail`) measured **~1354px at 1280w** in the previous run with all six paragraphs present (unchanged today, since C4 keeps the six paragraphs). No browser-automation tool was available to this recon pass to remeasure directly; extrapolating from the clamp math above, 1440w should land noticeably higher — a rough estimate is **~1420-1460px**, but this is computed, not tool-measured, and the Plan/Executor should re-measure live before finalizing. Net: at 1280w the ratio is ~666:1354 (interior-detail ≈2.03× interior-main); at 1440w it's ~720:~1440 (≈2×) — this is the "grotesquely tall" defect C1/C2 target. Mobile is a third, *different* disproportion the C-criteria don't explicitly name: inside `@media (max-width:900px)` (231-310), `.story, .interior, .features { grid-template-columns:1fr; gap:48px; }` and `.story, .interior { grid-template-rows:auto; }` (254-255) collapse to a single stacked column (no override of the two image heights there, so between 641-900px `.interior-main` falls back to its clamp — pinned at its 520px floor since 52vw≤900 is under 520 — and `.interior-detail` falls back to its unqualified base `height:260px`, since the ≥901px query no longer applies); inside `@media (max-width:640px)` (312-338), `.interior-main { height:450px }` (327) and `.interior-detail { height:200px }` (328) are explicit and fixed — main is *larger* than detail there (opposite of desktop's imbalance), a ~2.25× ratio the other direction. No test asserts on `.interior`/`.interior-main`/`.interior-copy`/`.interior-detail` CSS content directly except the shared-selector lines `.story, .interior, .features` (mobile grid-columns, test line 755, part of a loop) and the combined `#top, #story, #grounds, #interior, #details, #gallery, #inquire` scroll-margin-top selector (line 718) — both are selector-list membership checks unaffected by adding a third image or by resizing the two heights, so CSS is free to change here.

`tests/rendered-html.test.mjs` — every image-attribute count that a third `#interior` image or a video promotion could touch: the sitewide counts at 196-200 are all `>=` bounds (`loading="lazy"`≥44, `decoding="async"`≥44, `srcSet="`≥44, `width="`≥46, `height="`≥46) — a new fully-attributed `<img>` only helps these, no retarget needed. `page.match(/\{ name: "/g)` at 1136 counts `galleryGroups` manifest entries against `galleryImages.length + galleryVideos.length` (109-153) — reusing an EXISTING manifest name (any craft/living candidate above) for the third interior image adds zero manifest entries, so this stays untouched; it would only need retargeting if the Plan invented a brand-new manifest entry, which C3 forbids anyway ("must come from what already exists on disk — no new files"). `settingBlock`/craft-block slices (277-296) and the group-span "fills 12 columns" loop (284-296) are scoped to `#gallery`, not `#interior`, and count `class="gallery-item ..."` occurrences — completely unaffected by an editorial-band `<img>` reuse since that markup never carries the `gallery-item` class. `html.slice(html.indexOf('id="grounds"'), html.indexOf('id="interior"'))` (325, 468) scopes to `#grounds` only and stops at `#interior`'s opening tag, so it's unaffected by anything inside `#interior`; conversely nothing currently slices `#interior` off from `#grounds`/suite-band for a similarly scoped assertion, so a badly-placed third image inside `#interior` risks no existing regex boundary break, but also has no existing "shape" assertion to catch a wrong placement — the Plan should have the Executor add one. THE VIDEO ASSERTIONS (D3): `class="hero-video-control"` is pinned at exactly **1** (line 506, from `HeroVideo.tsx`, unaffected by any `PropertyVideo` change); `class="property-video-control"` is pinned at exactly **6** (line 507); `>Pause video<` is pinned at exactly **7** twice — once standalone at line 275 (in "renders scroll-gated property video tiles...") and once inside the button test at line 508 — both `HeroVideo` and `PropertyVideo` render literally `{paused ? "Play video" : "Pause video"}` (PropertyVideo.tsx:112, HeroVideo.tsx equivalent), so the 7 = 1 hero + 6 property; line 512-513 independently re-derives the count by filtering `<button>` tags for `hero-video-control|property-video-control` and asserts `videoButtons.length === 7`, and 514-517 asserts every one of those 7 buttons has `type="button"` and no `aria-pressed` — a 7th `PropertyVideo` instance turns 6→7 and 7→8 in FOUR places (507, 275, 508, 513), all of which the Plan must retarget together, at equivalent (exact-count) strength. `PropertyVideo` (`app/PropertyVideo.tsx:10-116`) is a client component rendering a `<div className="property-video...">` root (NOT `<section>`, confirmed — so it never interferes with any non-greedy `<section>` regex), an `<img className="property-video-fallback">` poster, a `<video>` with a single `<source data-src=.../>` (lazy-promoted to a real `src` on IntersectionObserver at `threshold:0.5`, staggerable via `staggerMs`), and the `<button className="property-video-control">` play/pause toggle gated by `hidden={!ready}`/`disabled={!ready}`. The six existing `PropertyVideo` call sites (page.tsx:200 `front-driveway-arrival` in `#story`; 231 `grounds-pool-pond` in `#grounds`; 340, once per `galleryVideos` entry inside the gallery map — `setting-wide-context, setting-facade-flyby, setting-high-establishing, setting-street-approach`, staggered 0/180/360/540ms) are the only 6 sources with real `.mp4`/`-poster.webp` pairs on disk in `public/property/video/` for this purpose (plus the two `property-overview-*` hero files consumed only by `HeroVideo.tsx`, and two unused `hero-*-desktop.mp4` files the hero test explicitly asserts are NOT referenced by the hero `<video>`, lines 215-218). `EVERY other video-touching assertion`: line 270's loop (`[...galleryVideos, "grounds-pool-pond", "front-driveway-arrival"]`) checks `data-src`, absence of an eager `src`, and poster presence per named clip — this is a semantic list, not a count, so promoting one of the four gallery-only clips to a second DOM location needs no change here (the name is already in the list) but promoting/reusing it means that SAME clip now appears twice in the DOM, which the byte-budget test (836-869) does not forbid (it only ceilings file sizes, not usage count) but which does mean literal footage duplication outside the gallery — the same tension the prior Recon flagged for photos.

BLOCKERS/RISKS/AMBIGUITIES for the PM: (1) C3's "verbatim from the gallery manifest" alt-text requirement, combined with StoryImage's hardcoded `/property/story/` path, together **rule out** `front-porch-daylight`/`covered-porch` (on-disk, unused, but no manifest alt) even though they'd otherwise be the only candidates not needing the raw-`<img>` pattern — the Plan must pick from the manifest-listed craft/living candidates above and use the raw-`<img>` pattern, exactly as `.grounds-secondary` does; recommend explicitly which one in the Plan rather than leaving it to the Executor, since at least two candidates (`craft-copper-sink-edge`, `living-kitchen-island`) create a thematic near-duplicate against images already inside `#interior` even though they're not literal file duplicates. (2) The precise fix mechanism for "even sizing" is unresolved and load-bearing: `.interior-detail`'s `height:100%` filling an auto row driven by six paragraphs of copy is the root cause per the amendment; simply adding a third image inside the existing 2-column/2-row grid does not by itself fix the disproportion — the Plan must decide whether the third image joins `.interior-detail`'s cell as a stacked pair (à la the `.suite-gallery`/`.story-aerial` idioms the original Recon already flagged as the closest precedent), replaces the `height:100%` rule with a fixed/clamped height matching `.interior-main`, or restructures the grid — and must specify exact target height(s) per breakpoint (901+, 641-900, ≤640) since the three breakpoints currently disagree on which image is bigger. (3) My 1440w interior-copy/interior-detail height (~1420-1460px) is a computed extrapolation from the confirmed 1280w figure (1354px, from the amendment) via the clamp/font-size math — not a live measurement, since no browser-automation tool was available to this recon pass; the Plan should treat it as directional only and have the Executor re-measure before locking exact pixel targets. (4) On D1-D3: the only way to "use" a drone video without violating B10's diff-scope/no-new-files constraint (which the amendment says applies to C/D too) is to render a SECOND `<PropertyVideo>` instance pointing at one of the six existing clips' files — i.e., literal footage reuse, not a new video — and every genuinely "gallery-only" clip among the six (`setting-wide-context, setting-facade-flyby, setting-high-establishing, setting-street-approach`) is an exterior/aerial establishing shot, thematically mismatched to `#interior`'s "Timber, copper and stone" subject; meanwhile the `#grounds` "open spot" this round is already fully spoken for by B2's two named photographs, leaving no blank cell for a video there either without contradicting B2. On the evidence gathered, D2's own escape hatch ("if no drone clip fits either spot, say so... use stills") looks like the honest outcome, but this is a judgment call the Plan should make explicitly and state, not decide silently — it is not a fact Recon can resolve unilaterally.

DELEGATE:
- Task: Once a `next dev`/`next start` server is reachable, load `/` in a headless browser at 1280×900 and 1440×900, and report the computed pixel height (`getBoundingClientRect().height`) of `.interior-copy`, `.interior-main`, and `.interior-detail` at both widths, plus the same three at 900×900, 768×900, and 640×900. Report raw numbers only, no interpretation. Target tier: intern. NOT BLOCKING — Recon's clamp-formula computation and the amendment's already-known 1280w figure (1354px) are sufficient for the Plan to proceed; this is a sanity-check the Executor can equally do during implementation.
## PM — Plan
2026-08-19 21:40 EDT

Spec below was built and verified empirically in a disposable git worktree (`git worktree add` off this branch, removed after use; a symlinked/copied `node_modules`, `next build` + `next start -p 4173`, Playwright — `playwright@1.61.1` resolved from `/Users/Nick/.npm/_npx/705bc6b22212b352/node_modules/playwright` — driving headless Chromium). Three real layout defects were found and fixed this way, exactly as the assignment warned pure reasoning would miss: (1) a nested nested-grid `height:100%` fill inflated `.interior-gallery` to 3121px against `.interior-copy`'s real 1354px at 1280w when three images shared one spanning cell; (2) a `position:absolute`/grid-area-as-containing-block workaround silently used the wrong containing block in this Chromium build, pushing `.grounds-gallery` to the viewport edge (measured x+width = 1280 exactly, eating the section's own right padding); (3) pairing a 4:3 image (`copper-sink`, via `StoryImage`'s hardcoded 1920×1440) with a 2:3 image (`craft-hearth-bellows`, real 960×1440) in one `minmax(0,1fr)` stack caused BOTH tracks to inflate to the taller ratio (1023px each instead of ~512/1023), which only showed up in measured pixel output, not in the rendered screenshot. The design below is the one that survived measurement, not the first draft.

### B — `#grounds`: delete weddings paragraph, fill column 2 / row 1

**B1.** Delete line `<p>Absolutely perfect for hosting weddings, large events and endless outdoor activities.</p>` from `.grounds-copy` in `app/page.tsx`. Confirmed via `grep` that this sentence is not pinned by any test assertion, so nothing else needs retargeting for the deletion itself.

**B2–B7 mechanism.** Follow `.story-aerial`/`.interior-detail`'s existing "auto row sized by sibling column, this column fills it via `height:100%`" idiom (Recon's own call — the more load-bearing precedent than `.suite-gallery`), with `.suite-gallery`'s "wrapper + `minmax(0,1fr)`" shape for the two-image stack inside it. Add a new `<div className="grounds-gallery">` between `.grounds-copy` and `<PropertyVideo className="grounds-main" .../>`, containing the two new `<img>` elements, following `.grounds-secondary`'s exact attribute pattern (B2's directive — `StoryImage` is structurally incompatible, confirmed by Recon: no `/property/story/` variants exist for these two names).

Exact JSX to insert in `app/page.tsx`, immediately after the `.grounds-copy` closing `</div>` and before the existing `<PropertyVideo className="grounds-main" .../>` line — and delete the weddings `<p>` from inside `.grounds-copy` — apply this diff exactly:

```diff
             <p>The grounds were professionally graded for water drainage and beauty. It was designed to keep water away from the house and yet effectively capture naturally all rain water from eavestroughs and downspouts directly into the ponds.</p>
-            <p>Absolutely perfect for hosting weddings, large events and endless outdoor activities.</p>
             <p>Feel at ease and secure with the Generac 22 kW built-in generator. Powerful enough to run the entire property. No blackouts for you.</p>
           </div>
+          <div className="grounds-gallery">
+            <img
+              src="/property/gallery/grounds-willow-tree-1440.webp"
+              srcSet="/property/gallery/grounds-willow-tree-720.webp 720w, /property/gallery/grounds-willow-tree-1440.webp 1440w"
+              sizes="(max-width: 900px) calc(100vw - 48px), 30vw"
+              alt="Mature willow tree on the lawn"
+              width="960"
+              height="1440"
+              loading="lazy"
+              decoding="async"
+            />
+            <img
+              src="/property/gallery/grounds-pool-natural-1440.webp"
+              srcSet="/property/gallery/grounds-pool-natural-720.webp 720w, /property/gallery/grounds-pool-natural-1440.webp 1440w"
+              sizes="(max-width: 900px) calc(100vw - 48px), 30vw"
+              alt="Rock-edged natural pool with a stepping stone, grasses and a red maple"
+              width="960"
+              height="1440"
+              loading="lazy"
+              decoding="async"
+            />
+          </div>
           <PropertyVideo className="grounds-main" name="grounds-pool-pond" alt="Aerial view descending toward the natural pool and rear deck" />
```

**B3 decision (Recon's flagged ambiguity):** use the manifest alt strings VERBATIM — no trailing period added, even though the two existing precedents (`grounds-secondary`, `story-arrival-row`'s `setting-rear-elevation`) both append one. B3's own text says "verbatim" and "do not invent new descriptions" twice; that instruction is the locked acceptance criterion and outranks an unstated repo convention neither precedent was told to follow either. Recorded, not guessed.

**Exact CSS** (`app/globals.css`) — apply exactly this diff:

```diff
 .dark { background: var(--umber); color: var(--plaster); }
 #grounds { padding-block: clamp(60px, 7vw, 110px); }
 .grounds { display: grid; gap: 26px; grid-template-columns: 1.25fr .75fr; grid-template-rows: auto 540px auto; }
-.grounds-copy { align-self: end; max-width: 620px; padding: 0 0 55px; }
+.grounds-copy { align-self: end; grid-column: 1; grid-row: 1; max-width: 620px; padding: 0 0 55px; }
 .grounds-copy > p:not(.eyebrow) { color: #dbcdb9; margin: 38px 0 0; }
+.grounds-gallery { display: grid; gap: clamp(12px, 2vw, 28px); grid-column: 2; grid-row: 1; grid-template-columns: 1fr; grid-template-rows: repeat(2, minmax(0, 1fr)); }
 .grounds-main { grid-column: 1; grid-row: 2; }
 .grounds-secondary { grid-column: 2; grid-row: 2; }
 .grounds-note { border-top: 1px solid var(--copper); color: var(--gold); font: italic 16px/1.6 var(--serif); grid-column: 1; margin: 8px 0 0; padding-top: 18px; width: 250px; }
+.grounds-gallery img { height: 260px; min-height: 0; width: 100%; }
+/* Row 1 sizes to .grounds-copy's real content on desktop, so .grounds-gallery fills it instead of
+   leaving dead space beside the copy. A stacked pair of portrait photos is naturally taller than
+   the copy needs, so the row ends up taller than .grounds-copy alone would be; the extra room lands
+   above the (bottom-aligned, dark-background) copy block, where it reads as ordinary section
+   whitespace rather than a gap — confirmed by screenshot, not assumed. minmax(0, 1fr) keeps the two
+   photos an exact, equal 1/2 share of that height regardless of their own aspect ratio. */
+@media (min-width: 901px) {
+  .grounds-gallery { height: 100%; }
+  .grounds-gallery img { height: 100%; }
+}
```

`.grounds-secondary`'s own base rule (`grid-column: 2; grid-row: 2;`) is untouched — the out-of-scope constraint holds.

In the `@media (max-width: 900px)` block, apply exactly this diff (adds one new row track, renumbers everything after `.grounds-copy`, adds placement for `.grounds-gallery` — `.grounds-main`/`.grounds-secondary`/`.grounds-note` shift by exactly one row each):

```diff
   #grounds { padding-block: 72px; }
-  .grounds { gap: 24px; grid-template-rows: auto 430px 350px auto; }
+  .grounds { gap: 24px; grid-template-rows: auto auto 430px 350px auto; }
   /* Grid gap plus this padding is the 48px copy-to-media separation. */
-  .grounds-copy { grid-column: 1 / -1; padding-bottom: 24px; }
-  .grounds-main { grid-column: 1 / -1; }
+  .grounds-copy { grid-column: 1 / -1; grid-row: 1; padding-bottom: 24px; }
+  /* The two grounds photos move directly under the copy, ahead of the pond video,
+     instead of beside it — there is no side column left once the grid is one wide. */
+  .grounds-gallery { grid-column: 1 / -1; grid-row: 2; }
+  .grounds-main { grid-column: 1 / -1; grid-row: 3; }
   /* Full content width: a partial width left an empty band of the section colour
      beside the photograph, since the grid row is the full gutter-to-gutter span. */
-  .grounds-secondary { grid-column: 1 / -1; grid-row: 3; }
-  .grounds-note { grid-row: 4; margin-top: 0; }
+  .grounds-secondary { grid-column: 1 / -1; grid-row: 4; }
+  .grounds-note { grid-row: 5; margin-top: 0; }
```

In the `@media (max-width: 640px)` block, apply exactly this diff:

```diff
   .grounds { display: block; }
   .grounds-copy { padding-bottom: 48px; }
-  .grounds-main { height: 430px; }
+  .grounds-gallery { gap: 16px; }
+  .grounds-gallery img { height: 220px; }
+  .grounds-main { height: 430px; margin-top: 24px; }
   .grounds-secondary { height: 280px; margin-top: 24px; }
   .grounds-note { margin-top: 24px; }
```

(`.grounds-main` gains `margin-top: 24px` here because it's no longer the element directly after `.grounds-copy`'s own `padding-bottom: 48px` — `.grounds-gallery` is now first, and needs no margin of its own since it inherits that same 48px separation from `.grounds-copy`'s padding.)

**Measured results (real numbers, headless Chromium, `getBoundingClientRect`, images forced to decode before measuring):**

| width | `.grounds-copy` h | `.grounds-gallery` h | willow h | pool h | horiz. overflow |
|---|---|---|---|---|---|
| 375 | 1145 | 456 | 220 | 220 | none |
| 768 | 793 | 535 | 260 | 260 | none |
| 1024 | 908 | 982 | 481 | 481 | none |
| 1280 | 1004 | 1235 | 605 | 605 | none |
| 1440 | 1113 | 1392 | 682 | 682 | none |

At ≥1024, `.grounds-gallery` is taller than `.grounds-copy` (the two portrait photos' natural combined height exceeds the (now 5-paragraph) copy's need) — the extra height lands above the bottom-aligned copy block and is invisible against `.dark`'s solid background; confirmed by screenshot at 1280 that this reads as ordinary section whitespace, not a defect, and both photos render at very close to their true 2:3 ratio (e.g. 403×605 at 1280 vs a true 2:3 crop of 403×604.5) — fully recognizable, satisfying B4's "tall narrow box... verify by screenshot" bar directly. At 768 (641–900 tier) both photos are cropped to a wide ~2.77:1 strip (720×260) — a real, visible crop (more of the willow's canopy than its base, less of the pool's water) but not a broken or unrecognizable one; flagged here as an honest visual tradeoff, not glossed over.

### C — `#interior`: three evenly sized, evenly spaced images

**C3 decision (third image):** `craft-hearth-bellows` — alt (verbatim, already ends in a period in the manifest, no invented punctuation needed) "Riveted leather-and-brass bellows against the fieldstone hearth, beside a hand-carved candlestick." Reasoning: the h2 is literally "Timber, copper and stone" — `kitchen` (existing) shows timber (reclaimed beams), `copper-sink` (existing) shows copper, but neither shows stone, even though `.interior-copy`'s own second paragraph describes "an original natural stone chimney." `craft-hearth-bellows` is a fieldstone hearth — it completes the section's own named triad and it illustrates copy that currently has no matching photo. It does not duplicate `kitchen` or `copper-sink` (different fixture, different photo) and was previously used only in the gallery. Rejected candidates and why: `craft-copper-sink-edge` and `living-kitchen-island` (Recon's own flags — thematic near-duplicates of the two images already in this section); `craft-window-stair` (risks reading as the same "oval leaded glass window" already named in `.interior-main`'s alt and copy paragraph 6, even though it's a different, "round" window per the manifest — too likely to confuse); `craft-stone-porch-bench` (semi-exterior porch subject, not "inside"); `front-porch-daylight`/`covered-porch` (ruled out categorically — on disk but no manifest alt, so C3's "verbatim from the gallery manifest" cannot be satisfied, and `StoryImage`'s hardcoded `/property/story/` path doesn't serve them anyway).

**C1/C2 mechanism — the actual fix, after two failed empirical attempts (recorded above), is the simplest one:** do NOT put all three images in one spanning wrapper. Keep `.interior-main` (`kitchen`) exactly where it already is — row 1 / col 2, self-contained via its own existing `height: clamp(520px, 52vw, 720px)`, completely unchanged, zero new risk. Replace `.interior-detail` (the single `copper-sink`) with a new `.interior-secondary` wrapper in the SAME cell (row 2 / col 2) holding `copper-sink` + `craft-hearth-bellows` stacked, using the exact same proven "row sizes to `.interior-copy`, this fills it via `height:100%`" mechanism `.interior-detail` already used successfully for one image — verified this stays non-inflating for two images at every measured width (see table). The one addition needed beyond `.grounds-gallery`'s pattern: `.interior-photo { aspect-ratio: 4 / 3; ... }`. Without it, `copper-sink` (`StoryImage`, hardcoded 1920×1440 → 4:3) and `craft-hearth-bellows` (real 960×1440 → 2:3) have different natural ratios, and — verified empirically, this is not guessable — a `minmax(0,1fr)` pair with mismatched ratios both inflate to match the TALLER one, doubling the stack's natural height past `.interior-copy`'s real need (measured 2072px vs 1354px at 1280w). Forcing both to the same 4:3 ratio (matching `kitchen`'s own native ratio) makes the pair's combined natural height stay under `.interior-copy` at every width tested, so `height: 100%` correctly fills without inflating — exactly like the original single-image case did.

Exact JSX to change in `app/page.tsx` — replace the old `interior-detail` `StoryImage` (previously directly after `.interior-copy`'s closing `</div>`) with the new `.interior-secondary` wrapper in the same position, and remove the old `className="interior-gallery"`/`"interior-photo"` wrapper that previously replaced `.interior-main` — apply exactly this diff (net result vs. the CURRENT, unmodified file on this branch):

```diff
           <StoryImage className="interior-main" name="kitchen" alt="Kitchen island and range viewed from across the room, with the oval leaded-glass window and stairwell visible beyond." />
           <div className="interior-copy">
             ...(six paragraphs and the "View the gallery" link — UNCHANGED, do not touch)...
             <a className="text-link" href="#gallery">View the gallery <span aria-hidden="true">→</span></a>
           </div>
-          <StoryImage className="interior-detail" name="copper-sink" alt="Hammered copper sink and dark countertop" />
+          <div className="interior-secondary">
+            <StoryImage className="interior-photo" name="copper-sink" alt="Hammered copper sink and dark countertop" />
+            <img
+              className="interior-photo"
+              src="/property/gallery/craft-hearth-bellows-1440.webp"
+              srcSet="/property/gallery/craft-hearth-bellows-720.webp 720w, /property/gallery/craft-hearth-bellows-1440.webp 1440w"
+              sizes="(max-width: 900px) 100vw, 66vw"
+              alt="Riveted leather-and-brass bellows against the fieldstone hearth, beside a hand-carved candlestick."
+              width="960"
+              height="1440"
+              loading="lazy"
+              decoding="async"
+            />
+          </div>
```

`.interior-main`'s own JSX line and `.interior-lead`/`.interior-copy`'s content are untouched (satisfies C4).

**Exact CSS** (`app/globals.css`) — apply exactly this diff:

```diff
 .interior { display: grid; gap: clamp(24px, 4vw, 62px); grid-template-columns: .7fr 1.3fr; grid-template-rows: auto auto; }
-.interior-lead { align-self: center; }
-.interior-main { height: clamp(520px, 52vw, 720px); }
-.interior-copy { align-self: start; max-width: 490px; }
+.interior-lead { align-self: center; grid-column: 1; grid-row: 1; }
+.interior-main { grid-column: 2; grid-row: 1; height: clamp(520px, 52vw, 720px); }
+.interior-copy { align-self: start; grid-column: 1; grid-row: 2; max-width: 490px; }
 .interior-copy p { margin: 0 0 28px; }
-.interior-detail { height: 260px; justify-self: end; width: 100%; }
-/* Row 2 sizes to .interior-copy's real content on desktop, so .interior-detail fills it instead of leaving dead space. */
+.interior-secondary { display: grid; gap: clamp(12px, 2vw, 28px); grid-column: 2; grid-row: 2; grid-template-columns: 1fr; grid-template-rows: repeat(2, minmax(0, 1fr)); }
+.interior-photo { aspect-ratio: 4 / 3; height: 260px; min-height: 0; width: 100%; }
+/* Row 2 sizes to .interior-copy's real content on desktop (six paragraphs plus the link), so
+   .interior-secondary fills it instead of leaving dead space. .interior-main keeps its own
+   self-contained clamp() height in row 1, unrelated to either column's content, so it cannot
+   inflate row 2. Forcing both secondary photos to the same 4:3 aspect-ratio (matching kitchen's
+   own native ratio) keeps their combined natural height under .interior-copy's real height at
+   every width measured (375/768/1024/1280/1440), so row 2 stays driven by the copy exactly as it
+   already was for the single copper-sink image before this change. */
 @media (min-width: 901px) {
-  .interior-detail { height: 100%; }
+  .interior-secondary { height: 100%; }
+  .interior-photo { height: 100%; }
 }
```

In the `@media (max-width: 900px)` block, ADD these four lines (new — there was no interior override at this tier before; add immediately after the `.grounds-note` line):

```diff
   .grounds-note { grid-row: 5; margin-top: 0; }
+  .interior-lead { grid-column: 1 / -1; }
+  .interior-main { grid-column: 1 / -1; grid-row: 2; }
+  .interior-copy { grid-column: 1 / -1; grid-row: 3; }
+  .interior-secondary { gap: 24px; grid-column: 1 / -1; grid-row: 4; }
```
(Mobile stacking order: eyebrow/h2, then kitchen photo, then the six paragraphs + link, then the copper-sink/hearth-bellows pair.)

In the `@media (max-width: 640px)` block, apply exactly this diff:

```diff
   .interior-main { height: 450px; }
-  .interior-detail { height: 200px; }
+  .interior-secondary { gap: 16px; }
+  .interior-photo { height: 220px; }
```

**Measured results:**

| width | `.interior-main` h | `.interior-copy` h | `.interior-secondary` h | each photo h |
|---|---|---|---|---|
| 375 | 450 | 1224 | 456 | 220 |
| 768 | 520 | 956 | 544 | 260 |
| 1024 | 532 | 1372 | 1372 (exact match) | 676 |
| 1280 | 666 | 1354 | 1354 (exact match) | 664 |
| 1440 | 720 | 1425 | 1425 (exact match) | 698 |

At every desktop width `.interior-secondary` fills `.interior-copy`'s height exactly (no dead band). `.interior-main` vs. each secondary photo: 1024 is the widest gap (532 vs 676, main ~21% smaller — main is self-contained via its own clamp and was never tuned against a 6-paragraph copy, so some looseness here is expected and was screenshot-checked as still reading like one deliberate set, not "one giant plus two small"); 1280 and 1440 are within 3% of each other (666/664, 720/698) — confirmed by screenshot at 1280: three images read as one even, deliberate set, no dead space below "View the gallery," all three subjects (kitchen, copper sink, hearth/bellows) fully recognizable. No horizontal overflow at any width for either section.

### D — drone video: NOT added

D2's own escape hatch is the honest outcome here, confirmed rather than assumed: the `#grounds` open spot is fully claimed by B2's two photographs (D1 is permission, not obligation, and B2 already fills the only blank cell this round touches there); the four gallery-only clips (`setting-wide-context`, `setting-facade-flyby`, `setting-high-establishing`, `setting-street-approach`) are all exterior/aerial establishing shots and none suit `#interior`'s "Timber, copper and stone" interior-craft subject; and every genuinely open interior slot in this round is now filled by C1–C3's three still photographs. Using a drone clip here would mean rendering the SAME clip a second time in the DOM for no content reason, purely to exercise the permission — that is exactly what D2 forbids ("do not add a video merely because it was permitted"). **No video is added. The four video-count assertions (`class="property-video-control"` = 6, `>Pause video<` = 7 in two places, `videoButtons.length` = 7) are NOT touched** — confirmed by running the full suite against the built change: all four still pass unmodified (see B8 below).

### B8/B9/B10 — tests, lint, guards, diff scope

Ran against the actual built change in the worktree:
- `npm run lint` — clean, zero output.
- `npm test` (`next build` + `node --test tests/rendered-html.test.mjs`) — **33/33 pass, zero retargets needed.** Recon's prediction held: every sitewide image-attribute count (`loading="lazy"`, `decoding="async"`, `srcSet="`, `width="`, `height="`) is a `>=` bound, satisfied automatically by the three new fully-attributed `<img>` elements (two grounds, one interior — `craft-hearth-bellows` reuses an existing manifest entry, so `page.match(/\{ name: "/g)` stays unchanged); the `groundsImage`/`interior` regex slices are anchored to unrelated literal strings and unaffected; the weddings sentence is not pinned anywhere; all 18 banned-term guards still pass, guard list untouched (byte-identical); the four video-count assertions are untouched per D above.
- **`git diff --stat` touches only `app/page.tsx` and `app/globals.css`** — no test file changes were needed, satisfying B10 more strongly than required (B10 permitted `tests/rendered-html.test.mjs` to change; it didn't need to). No new image files added to `public/` — `craft-hearth-bellows` already exists at both suffixes, confirmed via `ls`. The two untracked stray duplicate files (`craft-hearth-bellows-1440 2.webp`, `craft-hearth-bellows-720 2.webp`) are pre-existing, unrelated, and must not be touched or counted by the Executor.

### Ordered task list (zero judgment calls)

1. In `app/page.tsx`, inside `#grounds`, delete the weddings `<p>` and insert the new `.grounds-gallery` `<div>` exactly as diffed above.
2. In `app/page.tsx`, inside `#interior`, replace the `.interior-detail` `StoryImage` with the new `.interior-secondary` `<div>` exactly as diffed above. Do not touch `.interior-lead`, `.interior-main`'s own line, or any text inside `.interior-copy`.
3. In `app/globals.css`, apply the `.grounds`/`.grounds-copy`/`.grounds-gallery` diff (desktop block) exactly as given.
4. In `app/globals.css`, apply the `.interior`/`.interior-lead`/`.interior-main`/`.interior-copy`/`.interior-secondary`/`.interior-photo` diff (desktop block) exactly as given.
5. In the `@media (max-width: 900px)` block, apply the `.grounds` row-renumbering diff and add the four new `.interior-*` lines, exactly as given, in the position given (immediately after `.grounds-note`).
6. In the `@media (max-width: 640px)` block, apply the `.grounds-gallery`/`.grounds-main` diff and the `.interior-secondary`/`.interior-photo` diff exactly as given.
7. Run `npm run lint` — expect clean, zero output.
8. Run `npm test` — expect `33/33 pass`, zero failures. Do not retarget, weaken, or delete any assertion; none should need it (confirmed above). If ANY test fails, stop and report — do not edit the test file to make it pass.
9. Run `git diff --stat` — expect exactly `app/page.tsx` and `app/globals.css`, no others (excluding this log).
10. Do not add, remove, or re-encode any file under `public/`. Do not touch the two stray untracked `craft-hearth-bellows-*-2.webp` duplicates.
11. Do not add a drone video anywhere. Do not touch `class="property-video-control"`, `>Pause video<`, or the `videoButtons` assertions.

### Verification plan (B11)

1. `npm run build && npm start -- -p <free-port>` (or `next start`) in a real or worktree checkout with the change applied.
2. Using a headless browser (Playwright or equivalent), for each width in `375, 768, 1024, 1280, 1440`: load `/`, set `loading="lazy"` images to eager (or scroll + wait) so natural sizes are decoded, then read `getBoundingClientRect()` for `.grounds-copy`, `.grounds-gallery`, `.grounds-gallery img` (both), `.grounds-main`, `.grounds-secondary`, `.grounds-note`, `.interior-lead`, `.interior-main`, `.interior-copy`, `.interior-secondary`, `.interior-photo` (both), plus `document.body.scrollWidth` and `document.documentElement.clientWidth`.
3. Pass conditions, numeric:
   - `document.body.scrollWidth === document.documentElement.clientWidth` at all five widths (no horizontal overflow — B6).
   - At ≥901px: `.grounds-gallery`'s two `img` heights are equal to each other (±1px rounding) and their sum plus the gap equals `.grounds-gallery`'s own height (no internal dead band — B4). Expect figures within a few px of the table above.
   - At ≥901px: `.interior-secondary`'s own height equals `.interior-copy`'s own height (±2px rounding — no dead band below the copy/link — C2), and its two `.interior-photo` heights are equal to each other.
   - At all five widths: no element's computed rect overlaps another's in the same column (no collision — B5).
4. Screenshot `#grounds` and `#interior` (element-level screenshot, not full-page, to avoid the sticky-header overlay artifact seen in mobile full-page captures) at all five widths. Visually confirm: willow tree and natural pool are both recognizable subjects (not just texture/color blobs) at every width; the three interior photos read as one evenly sized, evenly spaced set with no large gap between the last paragraph/link and the row of photos beside it.
5. Before/after comparison: diff the "before" numbers (this branch, unmodified: `.grounds-gallery` does not exist; `.interior-detail` alone was measured at ~1354px tall at 1280w per the Stage 0 Amendment) against the "after" table above — confirm the blank column is filled (B4/B5) and the interior disproportion (previously ~2.03× at 1280w, `.interior-detail` vs `.interior-main`) is resolved to within ~3% at 1280/1440 and ~21% at 1024 (still far inside "evenly sized," nowhere near "one giant plus two small").

### Classification: STANDARD

Not MECHANICAL: although every line of JSX/CSS above is exact and transcription-ready, the change spans two coordinated sections across two files with three synchronized breakpoints each, and a wrong grid-row number in one place silently breaks stacking order without erroring — this needs an executor capable of applying a diff correctly and re-running the given verification commands, not just blind copy-paste of an isolated single-file change. Not COMPLEX: no concurrency, no cross-cutting invariants beyond what's fully specified here, no ambiguity left unresolved — every design decision Recon flagged has been made and justified above, and the CSS mechanism has been proven correct by direct measurement rather than left for the Executor to discover.

### Risks

- The two "even sizing" ratios (grounds row-1 vs. copy; interior 1024w main-vs-secondary) are close but not pixel-identical by design (they're driven by real, irregular copy-length text wrapping, not a formula) — Accept should re-measure rather than assume the table above is exactly reproducible to the pixel if content/fonts ever change.
- `.interior-photo { aspect-ratio: 4/3 }` deliberately crops `craft-hearth-bellows` away from its native 2:3 framing; screenshot-confirmed the crop still reads clearly (bellows + candlestick both visible), but this is a real, intentional trade — flagged, not hidden.
- The 641–900px tier crops the two grounds portrait photos to a wide ~2.77:1 strip — a bigger crop than at desktop; still recognizable, confirmed by measurement, but a genuine visual compromise at that tier specifically.

### Non-goals

Everything in the locked goal's "Out of scope" list still applies unchanged (gallery, fact strip, details lists, `.grounds-note` content, price, metadata/JSON-LD, image file re-encoding, any copy change beyond B1's single deletion). No drone video is added anywhere (D, above). No test file changes (none needed). No change to `.grounds`'s 26px gap, to `.grounds-secondary`'s `grid-row: 2`, to any color/font/type-scale token, or to `.interior-copy`'s six paragraphs, the `View the gallery` link, the `Inside` eyebrow, or the `Timber, copper and stone` h2.

### Blockers

None. Both ambiguities Recon flagged (B3's verbatim-vs-precedent-period question; the interior fix mechanism) and the one judgment call the Amendment added (C3's third-image pick; D's video-or-not decision) are resolved and justified above — none are product-level, irreversible, or cost-bearing in a way that needs the main session's sign-off before implementation.
## Executor
2026-08-19 21:58 EDT

Implemented the PM's spec exactly, byte-for-byte against the diffs given: (1) deleted the weddings `<p>` from `.grounds-copy` and inserted the `.grounds-gallery` `<div>` (willow + pool `<img>`s, `.grounds-secondary`'s attribute pattern, alt text verbatim from the manifest with no added period, per the PM's B3 decision) immediately before `<PropertyVideo className="grounds-main" .../>`; (2) replaced the lone `.interior-detail` `StoryImage` with the `.interior-secondary` wrapper holding `copper-sink` (`StoryImage`) + `craft-hearth-bellows` (raw `<img>`, alt verbatim with its existing manifest period); (3) applied all four CSS diffs verbatim in `app/globals.css` — the desktop `.grounds`/`.grounds-copy`/`.grounds-gallery` block, the desktop `.interior`/`.interior-secondary`/`.interior-photo` block, the `@media (max-width:900px)` row-renumbering plus four new `.interior-*` lines, and the `@media (max-width:640px)` block. Verification: `npm run lint` — clean, zero output. `npm test` (`next build` + `node --test`) — **33/33 pass, 0 fail**, run twice (once mid-work, once fresh after cleanup) with identical results; no test file was touched or needed retargeting, confirming the PM's claim. `git diff --stat` touches only `app/globals.css` (+58/-16... net which is the CSS diffs) and `app/page.tsx` (the JSX diffs), plus this log — no other files. `grep -c "weddings"` against the built `.next/server/app/index.html` returns 0 — the sentence is gone from the rendered output. All 18 banned-term-guard assertions pass because `tests/rendered-html.test.mjs` is byte-identical (not in the diff) and the full suite (which includes those assertions) is green. Visual/DOM verification per B11 was done empirically, not assumed: built and ran this branch on `next start -p 4173`, and separately built/ran the unmodified `HEAD` commit in a disposable `git worktree` (symlinked `node_modules`, since Turbopack rejects a `/private/tmp`-rooted worktree with an out-of-filesystem-root symlink error — resolved by placing the worktree under the repo's own parent directory instead) on `next start -p 4174`, then drove both with Playwright (`chromium@1.61.1` resolved from the cached `~/.npm/_npx/705bc6b22212b352` install, using the already-installed `~/Library/Caches/ms-playwright` Chromium) at 375/768/1024/1280/1440, reading `getBoundingClientRect()` for every element the PM's plan named plus `scrollWidth`/`clientWidth`, and capturing before/after element screenshots of `#grounds` and `#interior` at all five widths. My independently measured numbers match the PM's reported table to within ~1px rounding at every cell (e.g. 1280w: `.grounds-copy` 1003.875 vs PM's 1004, `.grounds-gallery` 1234.78 vs 1235, each image 604.59 vs 605; `.interior-secondary` 1354.19 vs `.interior-copy` 1354.19 — an exact match, confirming zero dead band). `document.body.scrollWidth === document.documentElement.clientWidth` at all five widths, both before and after (no horizontal overflow, B6). No element overlaps any sibling in the same column at any width; gaps between stacked elements match the CSS-declared values exactly (e.g. 24px/48px margins at ≤640/641–900). Screenshots confirm: the willow tree and natural pool are both fully recognizable at every width (only cropped to a wide strip at 641–900, as the PM flagged); the three interior photos (kitchen/copper-sink/hearth-bellows) read as one deliberate, evenly sized set at ≥901px with the copper-sink defect visibly and completely resolved (before: kitchen 665.59px vs copper-sink 1354.19px at 1280w, an unrecognizably tall crop filling most of the viewport; after: kitchen 665.59px vs each of two photos at 664.30px, a ~0.2% difference); and the previously-blank grid cell beside `.grounds-copy` is now visibly filled by the stacked willow/pool pair with no dead space, confirmed against the "before" screenshot which shows nothing but the section's dark background in that cell.

No deviations from the plan — every JSX/CSS diff was applied exactly as specified, and I confirmed this by diffing my working tree against the plan's literal diff text before running any tests. One finding for the PM's acceptance review to scrutinize, surfaced honestly rather than glossed over per my verification mandate: at the **641–900px tier**, `.interior-main` (measured 520px) is still **exactly 2× the height of each `.interior-photo`** (measured 260px, identical to `.interior-detail`'s pre-existing 260px at that same tier) — the PM's own measured table captured this number (768w row: 520/260) but its prose only characterizes the ≥901px ratios and the "widest gap" at 1024w; the CSS diffs add no height override for `.interior-main` or `.interior-photo` in the `@media (max-width:900px)` block (only `grid-column`/`grid-row` placement), so this tier's disparity is numerically **unchanged from before the fix**, despite the Stage-0-Amendment Recon's explicit blocker note demanding the Plan "specify exact target height(s) per breakpoint (901+, 641-900, ≤640) since the three breakpoints currently disagree on which image is bigger." At ≤640px the ratio improves only marginally (450:200 → 450:220, i.e. 2.25× → 2.05×). I did not treat this as a BLOCKER or attempt to fix it myself — the plan is fully, exactly implementable as written (verified by diff comparison), lint/tests are green, and the originally-reported desktop defect (the "enormous" copper-sink) is genuinely and precisely resolved (2.03×→~1.003× at 1280/1440, ~21% at 1024, screenshot-confirmed); unilaterally adding a breakpoint-specific height override would be improvising a design the plan didn't specify. Screenshots at 768/375 (`after-interior-768.png`, `after-interior-375.png` vs `before-interior-768.png`, `before-interior-375.png` in the session scratchpad) show this plainly: three images are shown at every width and nothing is broken or clipped, but at 641–900px specifically the "evenly sized" bar (C2) is not actually met — it inherited the pre-existing single-image proportions unchanged. Also note per the PM's own flagged, accepted tradeoff: the 641–900px grounds tier crops both new portrait photos to a wide ~2.77:1 strip (confirmed identical crop behavior via screenshot), a real but previously-disclosed visual compromise, not a new finding.
## PM — Plan (cont.)
2026-08-19 21:15 EDT — mobile gap supplement for `#interior` (C2), plus a required `#grounds` mobile-evenness check

Scope: this entry covers ONLY the gap the Executor's own entry flagged — no height override existed for the two mobile tiers (641–900px and <=640px), so `.interior-main` vs `.interior-photo` stayed at the pre-existing, untouched 2.00x/2.05x ratio through this whole round. The desktop fix (>=901px) is confirmed GOOD and is UNCHANGED by anything below. B/grounds is UNCHANGED except for the verification in section 1, which found no defect there.

Method: built and measured empirically in a disposable git worktree (`git worktree add --detach <parent-dir>/carm-mobile-worktree e4b831c`, symlinked `node_modules`, removed after use — same technique the original Plan used, for the same Turbopack-symlink reason the Executor documented). `next build` + `next start -p 4180` (unmodified baseline) and `-p 4181` (candidate), driven by Playwright (`chromium@1.61.1`, cached `~/Library/Caches/ms-playwright`) at 375 and 768px, reading `getBoundingClientRect()` and `document.body.scrollHeight`, plus element screenshots of `#interior` and `#grounds` at both widths, before and after. Desktop invariance (1024/1280/1440) was checked the same way. The worktree is gone; the real working tree was never touched (`git status --short` before and after this session is identical — only the four pre-existing untracked items).

### 1. `.grounds-gallery` mobile evenness — CHECKED, NO DEFECT, NO CHANGE

Measured on the unmodified branch (both mobile tiers use the same rule today — `.grounds-gallery img { height: 260px }` base rule at 641–900px, `.grounds-gallery img { height: 220px }` override at <=640px, `globals.css:123` and `:352`):

| tier | willow h | pool h | gap | ratio |
|---|---|---|---|---|
| 768w (641–900) | 260 | 260 | 15.36px (single `gap` value) | 1.00 (identical) |
| 375w (<=640) | 220 | 220 | 16px (single `gap` value) | 1.00 (identical) |

Both images are exactly equal height, share one consistent gap, and screenshot-confirmed both remain recognizable (willow canopy against sky; rock-edged pool with plantings) at both widths — the same wide-strip crop the original Plan already disclosed and the user accepted (~2.77:1 at 768w, ~1.49:1 at 375w). `.grounds-gallery` already satisfies "evenly sized and evenly spaced" at both mobile tiers exactly as it does at desktop. **No CSS change proposed or needed here.**

### 2. `#interior` mobile tiers — FIX (not no-change), with reasoning

**What "even" means at these widths, and why:** at both mobile tiers the three images are never on screen together — `.interior-main` sits above roughly 1200px of six-paragraph copy before the two `.interior-photo` elements appear, so unlike desktop (where the three are one simultaneous right-column glance and near-numeric-parity is what makes them read as "one set"), the relevant same-frame comparison here is only between the two stacked `.interior-photo` elements to each other — and those were ALREADY exactly equal (260/260, 220/220) before this supplement, same mechanism as `.grounds-gallery`. Because they're not viewed side-by-side with `.interior-main`, strict 1:1 parity between main and the photos is not required for "even" to hold, and I did not target it.

However, C2's own text — "the three images should read as a deliberate, consistent set... not one giant plus two small" — is not scoped to simultaneous viewing, and a 2.00x/2.05x ratio is materially outside the variance this same round already accepted as "evenly sized" at desktop (its own stated ceiling was ~21% at 1024w, explicitly called "still far inside 'evenly sized'"; 100%+ is double that ceiling). I looked at the actual rendering before touching anything (`before-interior-768.png`, `before-interior-375.png` in this session's scratchpad): it is not broken, clipped, or overlapping — it reads as a competent lead-photo-then-detail-shots layout, and a reasonable case for "no change" exists. But it is also not a deliberately tuned hierarchy — it's simply whatever fell out of never assigning the mobile tiers their own values, which is exactly Recon's original, unaddressed blocker note ("specify exact target height(s) per breakpoint... since the three breakpoints currently disagree"). Given the round already established and accepted a much tighter band at desktop, leaving mobile at more than double that variance is the "convenient no-change," not the defensible one. I am recommending a fix.

**Design choice:** keep `.interior-main` as the visible lead (do not shrink it to match the photos — it is treated as the section's premier shot at every other breakpoint, including desktop, and collapsing it to thumbnail scale to force numeric equality would be a worse visual trade than the disproportion it fixes). Instead, split the adjustment: trim `.interior-main` modestly and raise `.interior-photo` substantially, landing both mobile tiers at essentially the same ~1.29x ratio the desktop 1024w gap already validated as acceptable (532/676 = 0.79, i.e. ~27% either direction) — this makes `.interior-main` deliberately, consistently ~29% larger than each detail photo at both tiers (not equal, not 2x — a stated, chosen hierarchy), and the ~29% figure is nearly identical at both tiers (1.294 at 768w, 1.286 at 375w), so nothing jars crossing the 640px boundary. Screenshot-confirmed (`candidate1-interior-768.png`, `candidate1-interior-375.png`, this session's scratchpad): both detail photos are now visibly bigger and easier to read as real images rather than thumbnails, the kitchen photo still unmistakably leads the section, and nothing overflows or collides.

**Bonus, measured, not the reason for the change but worth recording:** raising `.interior-photo`'s height also reduces its own object-fit:cover crop severity (less of each photo is cut away) — 768w: ~2.77:1 crop becomes ~2.12:1; 375w: ~1.49:1 crop becomes ~1.17:1 (closer to the images' native framing either way).

### Exact CSS diff (`app/globals.css`, the ONLY file touched)

In the `@media (max-width: 900px)` block, at the existing `.interior-*` lines (currently lines 290–293):

```diff
   .interior-lead { grid-column: 1 / -1; }
-  .interior-main { grid-column: 1 / -1; grid-row: 2; }
+  /* Interior-main stays the visual lead at both mobile tiers, but at a deliberate ~1.29x
+     over each interior-photo rather than the previous unset 2.00x/2.05x, which read as
+     "one giant plus two small" — exactly what C2 forbids. */
+  .interior-main { grid-column: 1 / -1; grid-row: 2; height: 440px; }
   .interior-copy { grid-column: 1 / -1; grid-row: 3; }
   .interior-secondary { gap: 24px; grid-column: 1 / -1; grid-row: 4; }
+  .interior-photo { height: 340px; }
```

In the `@media (max-width: 640px)` block, at the existing `.interior-*` lines (currently lines 356–358):

```diff
-  .interior-main { height: 450px; }
+  .interior-main { height: 360px; }
   .interior-secondary { gap: 16px; }
-  .interior-photo { height: 220px; }
+  .interior-photo { height: 280px; }
```

Net diff: 2 lines changed, 2 lines added (one is a comment), inside the two already-existing mobile media-query blocks. `.grounds-*` rules are untouched (section 1 above — no defect found). No change to `app/page.tsx` or `tests/rendered-html.test.mjs`.

### Measured results (real numbers, headless Chromium, both tiers)

| width | tier | `.interior-main` h (before → after) | `.interior-photo` h each (before → after) | ratio (before → after) |
|---|---|---|---|---|
| 768 | 641–900 | 520 → 440 | 260 → 340 | 2.000 → 1.294 |
| 375 | <=640 | 450 → 360 | 220 → 280 | 2.045 → 1.286 |

No horizontal overflow at either width, before or after (`scrollWidth === clientWidth` in both cases). No overlap between any stacked elements; gaps between `.interior-main`/`.interior-copy`/`.interior-secondary` remain exactly the pre-existing 48px (900px tier) rhythm, unchanged.

### 3. Desktop invariance (901+ px) — CONFIRMED UNCHANGED

Measured `.interior-main`, `.interior-copy`, `.interior-secondary`, `.grounds-gallery`, `.grounds-copy` rects at 1024/1280/1440 on the unmodified build and on the candidate build: **byte-for-byte identical** at every width (e.g. 1280w interior-secondary/interior-copy both 1354.19 in both builds). Expected and by construction — every changed declaration lives inside `@media (max-width: 900px)` or `@media (max-width: 640px)`, neither of which ever applies at >=901px.

### 4. Tests and lint

Ran against the candidate build in the worktree: `npm run lint` — clean, zero output. `npm test` (`next build` + `node --test`) — **33/33 pass, 0 fail**, no retargeting, no test file touched (none of the existing assertions read CSS pixel heights for `.interior-*`, confirmed by the original Recon and unaffected by this supplement). `git diff --stat` in the worktree showed exactly `app/globals.css`, 4 insertions(+), 3 deletions(-) — matches the diff above once the added comment line is counted.

### 5. Tradeoff, with numbers

Full-page `scrollHeight` (i.e. how much longer the page scrolls), measured before/after on the same builds:

| width | before | after | delta |
|---|---|---|---|
| 375 | 25451px | 25481px | +30px (+0.12%) |
| 768 | 23726px | 23806px | +80px (+0.34%) |

`.interior-main` shrinks (−80 to −90px) while the two `.interior-photo` elements grow more (+120 to +160px combined), for a small net increase in page length — under 0.4% at both widths, not a meaningful scroll-length cost for a materially better proportion.

### Ordered task list (zero judgment calls)

1. In `app/globals.css`, inside `@media (max-width: 900px)`, add `height: 440px;` to the existing `.interior-main` declaration and add a new `.interior-photo { height: 340px; }` line immediately after `.interior-secondary`, exactly as diffed above (comment optional but recommended, exact text given).
2. In `app/globals.css`, inside `@media (max-width: 640px)`, change `.interior-main`'s height from `450px` to `360px` and `.interior-photo`'s height from `220px` to `280px`, exactly as diffed above.
3. Do not touch any `.grounds-*` rule — section 1 found no defect.
4. Do not touch `app/page.tsx` or `tests/rendered-html.test.mjs`.
5. Run `npm run lint` — expect clean. Run `npm test` — expect 33/33, unchanged.
6. Re-measure `.interior-main`/`.interior-photo` at 375/768 — expect 440/340 and 360/280 respectively (±1px). Re-measure at 1024/1280/1440 — expect byte-identical to the pre-supplement branch.

### Classification: MECHANICAL

Every value is chosen, tested, and pinned; the change is two small, non-interacting blocks in one file with no cross-file coordination and no remaining design judgment. Transcription-grade.

### Risks

- The ~1.29x target is a deliberate design choice (this PM's judgment call, not a formula) — if `.interior-copy`'s text ever changes length, nothing here recomputes automatically (these are fixed px values, same as the pre-existing `.grounds-gallery img`/`.interior-main` mobile pattern), so Accept should treat 440/340/360/280 as intended constants, not derived ones.
- `.interior-photo`'s crop is still real (object-fit:cover on a fixed box) at both tiers, just less severe than before — not eliminated.

### Non-goals

No change to `.grounds-*` anywhere (confirmed even, section 1). No change to any desktop (>=901px) rule or rendering (confirmed identical, section 3). No change to `app/page.tsx` or `tests/rendered-html.test.mjs`. No change to `.interior-copy`'s content, the `View the gallery` link, the eyebrow/h2, or any color/font/type-scale token.

### Blockers

None. The two questions this supplement was asked to resolve (grounds-gallery mobile evenness; the interior mobile-tier fix-or-no-fix call) are both answered and justified above from actual rendered screenshots, not reasoned about — neither is product-level, irreversible, or cost-bearing.
## Executor (cont.)
2026-08-19 21:35 EDT

Implemented the PM's `## PM — Plan (cont.)` mobile-supplement task list exactly, and only that: in `app/globals.css`, inside `@media (max-width: 900px)`, added `height: 440px;` to the existing `.interior-main` declaration (plus the PM's exact explanatory comment) and added a new `.interior-photo { height: 340px; }` line immediately after `.interior-secondary`; inside `@media (max-width: 640px)`, changed `.interior-main`'s height from `450px` to `360px` and `.interior-photo`'s height from `220px` to `280px`. No other line in either block was touched. `git diff app/globals.css` matches the PM's diff text byte-for-byte (7 insertions / 3 deletions, including the added comment). `app/page.tsx` and `tests/rendered-html.test.mjs` were not opened for editing. Verification: `npm run lint` — clean, zero output. `npm test` (`next build` + `node --test`) — 33/33 pass, 0 fail, run twice (once before, once after worktree cleanup) with identical results. `git diff --stat` touches only `app/globals.css` (plus this log) — confirmed via `git diff --stat -- app/globals.css` (1 file changed) and `git status --short` showing no other tracked-file changes (the four pre-existing untracked items — `CARM HOUSE PROJECT NOTES/`, `compute-squad-archive/`, and the two stray `craft-hearth-bellows-*-2.webp` duplicates — were left untouched throughout). Measured live with Playwright (cached Chromium at `~/Library/Caches/ms-playwright`, `playwright` package resolved from `~/.npm/_npx/705bc6b22212b352`) against two `next build && next start` servers: the current branch tip `e4b831c` unmodified in a disposable detached worktree (`git worktree add --detach ../carm-mobile-before-worktree e4b831c`, symlinked `node_modules`, removed after use — `git worktree list` and `git status --short` confirm the real working tree was never touched by it) on port 4191 as "before", and this candidate build on port 4190 as "after". Confirmed exactly the PM's pinned numbers: `.interior-main` 360px at 375w (before: 450px) and 440px at 768w (before: 520px); each `.interior-photo` 280px at 375w (before: 220px) and 340px at 768w (before: 260px); ratio main/photo = 1.2857 at 375w and 1.2941 at 768w, both ~1.29x as specified. `document.body.scrollWidth === document.documentElement.clientWidth` at all five widths (375/768/1024/1280/1440), both before and after — no horizontal overflow anywhere. Desktop invariance (901px+) confirmed by comparing every measured rect (`.interior-main`, `.interior-photo`, `.interior-copy`, `.interior-secondary`, `.grounds-gallery`, `.grounds-gallery img`, `.grounds-copy`) at 1024/1280/1440 between the before and after builds: byte-for-byte identical at every width — zero regression, exactly as expected since every changed declaration lives inside a `max-width: 900px` or `max-width: 640px` query. `.grounds-*` rects and screenshots were also captured at all five widths as an extra check (the plan said grounds is unchanged) and were identical file sizes/dimensions before vs after at every width, confirming no incidental grounds regression. Element-level screenshots of `#interior` at 375 and 768 (both before and after) confirm visually: the copper-sink and hearth-bellows photos are both noticeably larger and easier to read than before, the kitchen photo still unmistakably leads the section, and nothing overflows, clips, or collides with `.interior-copy`'s text.

No deviations from the plan — every value (440/340/360/280) and every line placement was applied exactly as the PM's diff specified, confirmed by direct diff comparison against the plan's literal text before running any tests. No blockers. One thing worth the PM's/reviewer's attention, not a defect: this task's own scope explicitly excluded `.grounds-*`, and my independent re-check confirms the PM's section-1 finding (grounds mobile evenness) was correct — both `.grounds-gallery img` elements are already exactly equal height at 641–900px and at <=640px, so there was genuinely nothing to fix there, and I made no grounds edits. Screenshots and raw JSON measurements from this verification pass are in this session's scratchpad and were not committed (per the "no drive-by files" discipline); the numbers above are transcribed directly from that output.
