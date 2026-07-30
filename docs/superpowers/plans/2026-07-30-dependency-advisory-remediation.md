# Dependency Advisory Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clear the six pre-existing npm package findings without changing Casa Marrone’s approved page, media, behavior, or launch scope.

**Architecture:** Keep the current static Next.js App Router site intact. Pin `next` and `eslint-config-next` together to the patched `16.2.12` release, then let npm perform only non-breaking transitive lockfile updates. Add two exact manifest assertions to the existing Node test instead of creating a new test framework or security script.

**Tech Stack:** Node.js `>=22.13.0`, npm, Next.js `16.2.x`, React `19.2.6`, ESLint, Node test runner.

## Current Evidence

- Local `main` baseline: `745fbb0fb64e2c9b12c33a16ffd2c429c5cfdb68`.
- The standard-Next migration is locally merged and passes `npm run lint`, the production build, and all six rendered-site tests.
- `npm audit --json` reports six affected package groups: one low, five high, zero critical; these expand to 19 upstream advisory records.
- Static reachability review found no current path from public input to an affected feature. The site has one static route and no middleware/proxy, i18n, Server Actions, `use cache`, route handlers, custom server, dynamic rewrites, remote image configuration, YAML input, glob input, Babel compilation endpoint, or uploaded CSS/image processing.
- The findings are therefore not currently actionable as exploitable site paths, but should be patched before public launch because npm offers non-major fixes.

| Package group | Installed evidence | Current exposure | Planned resolution |
| --- | --- | --- | --- |
| `next` | Direct runtime `16.2.6`; 9 advisory records | Affected features are absent | Pin `next` and `eslint-config-next` to `16.2.12` |
| `@babel/core` | Dev-only `7.29.0` through ESLint | No untrusted JavaScript compilation | Refresh lock to `>=7.29.7` |
| `brace-expansion` | Dev-only `1.1.14` and `5.0.6` | No untrusted glob input | Refresh lock to `>=1.1.18` and `>=5.0.9` |
| `js-yaml` | Dev-only `4.1.1` through ESLint | No YAML ingestion | Refresh lock to `>=4.3.0` |
| `postcss` | Next-bundled `8.4.31`; root `8.5.14` | Trusted repository CSS at build time only | Next update plus lock refresh to patched copies |
| `sharp` | Optional `0.34.5` through Next | No `next/image` or untrusted image processing | Resolve transitively to `>=0.35.0` |

## Global Constraints

- This is one dependency-patching task only.
- Modify only `package.json`, `package-lock.json`, and `tests/rendered-html.test.mjs`.
- Preserve React, React DOM, Tailwind, TypeScript, ESLint, and type-package pins.
- Add no dependency, override, custom audit script, or alternate package manager.
- Never run `npm audit fix --force`.
- Leave `.superpowers/` and `next.config.ts` untouched and uncommitted.
- Preserve `app/**` and `public/property/**` byte-for-byte.
- Stop if the ordinary Next upgrade and non-force lock refresh do not produce a clean audit; do not improvise a direct `sharp` dependency or `overrides` block.
- Do not push, open a PR, deploy, or begin SEO/GEO work.

---

### Task 1: Apply the smallest safe dependency patch

**Files:**

- Modify: `tests/rendered-html.test.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**

- Consumes: the existing exact-version manifest, npm lockfile, and rendered-site contract.
- Produces: a reproducible install using patched Next/ESLint packages, no npm advisory findings, and an unchanged property-site render.

- [ ] **Step 1: Create the implementation branch and record the clean baseline**

Run:

```bash
git switch -c codex/patch-dependency-advisories
git rev-parse HEAD
git status --short
npm audit --json
git diff --exit-code 745fbb0 -- app public/property
```

Expected:

- The new branch starts at `745fbb0fb64e2c9b12c33a16ffd2c429c5cfdb68`.
- Only the known user-owned `.superpowers/` directory and `next.config.ts` are untracked.
- The audit reports six affected package groups and no critical findings.
- The approved application and property media are unchanged.

- [ ] **Step 2: Write the failing exact-version contract**

In the existing `uses standard Next scripts without starter runtime dependencies` test in `tests/rendered-html.test.mjs`, add:

```js
assert.equal(manifest.dependencies.next, "16.2.12");
assert.equal(manifest.devDependencies["eslint-config-next"], "16.2.12");
```

Run:

```bash
node --test --test-name-pattern="uses standard Next scripts" tests/rendered-html.test.mjs
```

Expected: FAIL because both packages are still pinned to `16.2.6`.

- [ ] **Step 3: Update only the aligned direct packages**

In `package.json`, change:

```json
"next": "16.2.12"
```

and:

```json
"eslint-config-next": "16.2.12"
```

Do not change any other manifest entry.

Run:

```bash
npm install
node --test --test-name-pattern="uses standard Next scripts" tests/rendered-html.test.mjs
```

Expected: npm refreshes `package-lock.json`; the focused test passes.

- [ ] **Step 4: Apply only npm's non-breaking transitive fixes**

Run:

```bash
npm audit fix
```

Expected:

- No `--force` prompt or major-version proposal is accepted.
- Only `package-lock.json` and installed transitive packages change.
- `package.json` still differs from the baseline only at the two aligned `16.2.12` pins.

Review the direct manifest diff:

```bash
git diff -- package.json
npm ls --depth=0
```

Expected: no direct dependency was added, removed, or changed beyond `next` and `eslint-config-next`.

- [ ] **Step 5: Verify the resolved tree and audit**

Run:

```bash
npm ls next eslint-config-next @babel/core brace-expansion js-yaml postcss sharp
npm audit --json
```

Expected:

- `next` and `eslint-config-next` both resolve to `16.2.12`.
- The vulnerable `@babel/core`, `brace-expansion`, `js-yaml`, PostCSS, and Sharp copies are replaced by patched versions.
- The audit exits successfully with zero vulnerabilities.

If the audit is not clean, stop and report the remaining package, installed path, advisory, and npm-proposed fix. Do not add overrides, direct transitive dependencies, or use `--force`.

- [ ] **Step 6: Run the existing quality gate**

Run:

```bash
npm run lint
npm test
git diff --exit-code 745fbb0 -- app public/property
git diff --check
```

Expected:

- ESLint passes.
- The production build succeeds and all six rendered-site tests pass.
- No approved application or property-media file changed.
- No whitespace errors are introduced.

- [ ] **Step 7: Check runtime parity at the existing launch widths**

Start the production server:

```bash
npm start
```

Using the existing browser-automation environment, inspect `1440×900`, `768×1024`, and `390×844`, plus reduced motion at desktop width. At each viewport verify:

- the hero video or fallback renders;
- the eight story images and all six gallery groups render;
- navigation and the inquiry link work;
- there is no horizontal overflow;
- there are no console errors, page errors, failed requests, or broken images.

Stop the server after the checks.

- [ ] **Step 8: Review and commit only the dependency patch**

Run:

```bash
git status --short
git diff --stat
git diff -- package.json package-lock.json tests/rendered-html.test.mjs
git diff --exit-code 745fbb0 -- app public/property
git add package.json package-lock.json tests/rendered-html.test.mjs
git diff --cached --check
git commit -m "chore: patch dependency advisories"
git status --short --branch
```

Expected:

- The commit contains exactly the three planned files.
- `.superpowers/` and `next.config.ts` remain untracked.
- The branch is ready for Nick's manual PR/integration decision.
- Stop here: no push, PR, merge, deployment, or next phase.
