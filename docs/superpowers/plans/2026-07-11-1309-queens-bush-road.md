# 1309 Queens Bush Road Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a premium, responsive single-property website using original copy, verified facts, and curated supplied photography.

**Architecture:** Use the Sites starter as a one-route static site. Keep content in the page component, presentation in one stylesheet, and optimized media under `public/property/`; no data layer, form backend, carousel library, or speculative components.

**Tech Stack:** Sites starter, React, TypeScript, CSS, responsive images, Git.

## Global Constraints

- Preserve all 215 source photographs unchanged.
- Use verified facts and original copy; never reuse the Lambert Group listing prose.
- Never invent price, lot size, contact details, upgrades, neighbourhood claims, testimonials, or disclosures.
- Add no runtime dependency unless the Sites starter requires it.
- Meet responsive, contrast, focus, alt-text, touch-target, and reduced-motion basics.
- Keep delivery private until publication is explicitly approved.

---

### Task 1: Initialize and Select the Visual Direction

**Files:**
- Create through Sites initializer: `package.json`, `package-lock.json`, `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `.openai/hosting.json`
- Create outside product source: `/private/tmp/1309-design-options/direction-{a,b,c}.html`

**Interfaces:**
- Consumes: approved spec and `COMPUTE_SQUAD_LOG.md`
- Produces: initialized project and one selected visual brief

- [ ] **Step 1: Initialize once**

```bash
/Users/Nick/.codex/plugins/cache/openai-bundled/sites/0.1.27/scripts/init-site.sh "$PWD"
```

Expected: starter created without replacing photos or planning documents.

- [ ] **Step 2: Start the retained preview**

```bash
npm run dev
```

Expected: Local URL prints and server remains running.

- [ ] **Step 3: Generate three comparable concepts**

Dispatch exactly three fresh agents in parallel. Each creates one 1600×1000 HTML direction with identical facts and imagery:

```text
A — Heritage Editorial: limestone, deep olive, refined serif, archival warmth.
B — Modern Country: soft ivory, charcoal, cinematic photography, generous space.
C — Gallery Residence: near-black, parchment, art-book composition, high contrast.
```

Expected: three valid previews without copied prose, invented facts, SVG illustrations, or browser chrome.

- [ ] **Step 4: Render once and call the Sites design picker**

Expected: user selects one direction. Stop until selection.

- [ ] **Step 5: Commit setup**

```bash
git add package.json package-lock.json app .openai
git commit -m "chore: initialize property website"
```

Expected: no source photos or temporary previews are committed.

### Task 2: Curate Media and Build the Page

**Files:**
- Modify: `app/page.tsx`, `app/globals.css`, `app/layout.tsx`
- Create: `public/property/*.{webp,jpg}`
- Create only if validated: `public/og.png`
- Delete after removing imports: `app/_sites-preview/`

**Interfaces:**
- Consumes: selected brief, verified facts, approved CTA details, source photos
- Produces: complete responsive property page

- [ ] **Step 1: Inspect the starter**

```bash
sed -n '1,240p' app/page.tsx
sed -n '1,240p' app/layout.tsx
sed -n '1,320p' app/globals.css
cat .openai/hosting.json
```

Expected: starter surface and metadata are understood.

- [ ] **Step 2: Select and optimize 18–24 images**

Cover aerial setting, approach, architecture, porches, pools, living spaces, kitchen, primary suite, garage, and details. Create 2400 px hero and 1600 px below-fold derivatives with descriptive lowercase names.

Expected: originals remain untouched; no original multi-megabyte file is copied unchanged.

- [ ] **Step 3: Build semantic page regions**

```tsx
<main>
  <section aria-labelledby="property-title">...</section>
  <section aria-label="Property facts">...</section>
  <section id="story" aria-labelledby="story-title">...</section>
  <section id="gallery" aria-labelledby="gallery-title">...</section>
  <section id="features" aria-labelledby="features-title">...</section>
  <section id="inquire" aria-labelledby="inquire-title">...</section>
</main>
```

Write concise original copy around architectural character, scale, privacy, and indoor-outdoor living. Omit unconfirmed price, lot size, brokerage, and contact details. Use `mailto:` only with an approved email; otherwise show “Contact details coming soon” in the private preview.

Expected: hero, facts, story, curated gallery, feature summary, optional approved iGuide link, and inquiry section replace the starter.

- [ ] **Step 4: Implement the selected CSS system**

Use CSS variables, Grid/Flexbox, visible `:focus-visible`, readable image overlays, content-driven breakpoints, and a `prefers-reduced-motion` override.

Expected: selected direction works at phone, tablet, and desktop sizes without client layout state or animation libraries.

- [ ] **Step 5: Replace metadata and create one social preview**

Update the address-led title and original description. Generate exactly one matching social card; wire `public/og.png` only if all visible text is correct. Remove starter metadata.

Expected: no generic starter metadata or unusable social artwork ships.

- [ ] **Step 6: Build and commit**

```bash
npm run build
git add app public package.json package-lock.json
git commit -m "feat: build 1309 Queens Bush Road property site"
```

Expected: build exits 0 and the commit contains only product files and optimized derivatives.

### Task 3: Verify the Private Preview

**Files:**
- Modify only for verified defects: `app/page.tsx`, `app/globals.css`, `app/layout.tsx`

**Interfaces:**
- Consumes: completed page and retained preview
- Produces: evidence-backed acceptance or focused defect list

- [ ] **Step 1: Verify copy and facts**

Compare every numeric and feature claim to `COMPUTE_SQUAD_LOG.md`. Search for copied superlatives, placeholders, and unsupported claims.

Expected: all facts are supported and all sales copy is original.

- [ ] **Step 2: Review responsive layouts**

Inspect at 390×844, 768×1024, and 1440×1000.

Expected: no overflow, clipped text, unusable crop, collision, or weak CTA hierarchy.

- [ ] **Step 3: Review accessibility**

Keyboard through links; check focus, headings, alt text, contrast, touch targets, and reduced motion.

Expected: the experience remains understandable and operable without a mouse.

- [ ] **Step 4: Check assets and links**

Confirm image requests, lazy loading, approved iGuide URL, and approved inquiry action.

Expected: no broken asset, link, or misleading action.

- [ ] **Step 5: Final build and diff check**

```bash
npm run build
git status --short
git diff --check HEAD~1..HEAD
```

Expected: build exits 0, tree is clean, and diff check prints nothing.

- [ ] **Step 6: Run the fresh Compute Squad Verifier**

On PASS it records browser/build evidence and clears `COMPUTE_SQUAD_LOG.md`; on FAIL it preserves the log and identifies the stage to rerun.

Expected: evidence-backed result. Stop before publication, PR, merge, or deployment.

