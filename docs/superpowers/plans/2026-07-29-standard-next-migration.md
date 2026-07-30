# Standard Next.js Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the vinext/Cloudflare starter runtime with standard Next.js 16 while preserving the approved Casa Marrone page, media, rendering, accessibility, and behavior exactly.

**Architecture:** Keep the existing App Router components and static `public/property` media unchanged. Replace only the host-specific scripts, dependencies, unused Sites files, documentation, and Worker-coupled test harness. The rendered-HTML suite will start one production `next start` process with Node standard-library APIs and reuse it for every assertion.

**Tech Stack:** Node.js `>=22.13.0`, Next.js `16.2.6`, React `19.2.6`, TypeScript `5.9.3`, Tailwind/PostCSS, ESLint, Node test runner.

## Global Constraints

- This is Unit 1 only: do not change the story, asking price, inquiry flow, SEO/GEO metadata, crawler policy, or deployment.
- Preserve `app/page.tsx`, `app/HeroVideo.tsx`, `app/layout.tsx`, `app/globals.css`, and all 92 `public/property/**` files byte-for-byte.
- Preserve one responsive hero video, its still fallbacks and pause control, eight rendered story images, six gallery groups, and all 36 gallery images.
- Add no dependency. Use the native Next.js runtime and Node standard library.
- Keep Tailwind and PostCSS because the current CSS imports Tailwind and depends on its reset.
- Treat every currently untracked file as user-owned. Inspect it before adoption; never use `git add .`.
- Leave ignored vinext/Cloudflare residue local and untouched. Do not force-add or delete it.
- Do not push, open a PR, merge, deploy, or begin Unit 2.

---

## Current Evidence

- Approved Design commit: `cb69da3`.
- Current branch at planning time: `main`.
- Tracked Sites-only files: `.openai/hosting.json` and unused `app/chatgpt-auth.ts`.
- Untracked files to adopt: `README.md`, `tsconfig.json`, `eslint.config.mjs`, and `postcss.config.mjs`.
- Inspected untracked-file SHA-256 values: `next.config.ts` `614bce25b089c3f19b1e17a6346c74b858034040154c6621e7d35303004767cc`; `tsconfig.json` `be18523b23b78b6e1a876ddd107d330f0168bddf09d751b57e0b5edce69c66f3`; `eslint.config.mjs` `870f1adccecf3051cbcd9fd307cef51d7633cf510979c181a81f4b1797273493`; `postcss.config.mjs` `dfac7ac2d86d326a0e5adb024e7943c181393ed17a5fcb8f0315b24c7da6ddde`; `README.md` `76f39b34f619da8133734e8a864b8075f6ec546211da9acb1d86a666fc480ff2`.
- `next.config.ts` is empty boilerplate. Leave it untouched and uncommitted; an empty config is not required.
- Ignored `vite.config.ts`, `worker/`, `.vinext/`, `.wrangler/`, `dist/`, `build/`, `db/`, `drizzle/`, `examples/`, and `output/` are outside this unit.

## File Map

**Create by adopting existing untracked files:**

- `README.md` — replace vinext starter instructions with Casa Marrone and standard Next commands.
- `tsconfig.json` — adopt the inspected standard Next TypeScript configuration unchanged.
- `eslint.config.mjs` — adopt the inspected Next core-web-vitals and TypeScript configuration unchanged.
- `postcss.config.mjs` — adopt the inspected Tailwind PostCSS configuration unchanged.

**Modify:**

- `package.json` — standard Next scripts, project name, and minimal dependency set.
- `package-lock.json` — regenerate from the reduced manifest.
- `tests/rendered-html.test.mjs` — replace the Cloudflare Worker renderer with one bounded `next start` harness and strengthen story-path preservation.

**Delete:**

- `.openai/hosting.json` — obsolete Sites binding declaration; both bindings are `null`.
- `app/chatgpt-auth.ts` — unused Sites authentication helper.

**Must not change:**

- `.gitignore`
- `app/page.tsx`
- `app/HeroVideo.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `public/property/**`
- `next.config.ts`

---

### Task 1: Migrate the runtime without changing the property site

**Files:**

- Create: `README.md`
- Create: `tsconfig.json`
- Create: `eslint.config.mjs`
- Create: `postcss.config.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `tests/rendered-html.test.mjs`
- Delete: `.openai/hosting.json`
- Delete: `app/chatgpt-auth.ts`

**Interfaces:**

- Consumes: the current App Router page, client-only `HeroVideo`, global CSS, and static property media.
- Produces: `npm run dev`, `npm run build`, and `npm start` backed by standard Next.js; `render()` in `tests/rendered-html.test.mjs` backed by one reusable production HTTP server.

- [ ] **Step 1: Create the implementation branch and record protected-file evidence**

Run:

```bash
git switch -c codex/standard-next-migration
git status --short
shasum -a 256 next.config.ts tsconfig.json eslint.config.mjs postcss.config.mjs README.md
cp README.md /private/tmp/casa-marrone-vinext-readme.md
git diff --exit-code cb69da3 -- app/page.tsx app/HeroVideo.tsx app/layout.tsx app/globals.css public/property
```

Expected:

- The branch is `codex/standard-next-migration`.
- Only the known user-owned untracked files appear.
- The protected application and media paths have no diff from `cb69da3`.
- All five SHA-256 values match the recorded evidence above.
- The original untracked README is preserved at `/private/tmp/casa-marrone-vinext-readme.md` before replacement.

- [ ] **Step 2: Capture a private pre-migration visual baseline**

Start the existing preview using its current script and exact URL printed by the server:

```bash
npm run dev
```

Using the existing browser-automation environment without adding a project dependency, capture private temporary screenshots at:

```text
/private/tmp/casa-marrone-vinext-1440.png
/private/tmp/casa-marrone-vinext-768.png
/private/tmp/casa-marrone-vinext-390.png
```

Use viewports `1440×900`, `768×1024`, and `390×844`. At each width record:

- section order and visible copy;
- eight story images;
- six gallery groups and 36 gallery items;
- hero poster/video state;
- no horizontal overflow;
- console errors, page errors, failed requests, and broken images.

Also record the reduced-motion hero fallback at `1440×900`. Stop the baseline server before changing scripts.

- [ ] **Step 3: Write the failing standard-Next contract and production-server harness**

In `tests/rendered-html.test.mjs`, add these imports:

```js
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createRequire } from "node:module";
import { readFile, stat } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import assert from "node:assert/strict";
import test, { after } from "node:test";
```

Add the exact script and dependency contract:

```js
test("uses standard Next scripts without starter runtime dependencies", async () => {
  const manifest = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  );

  assert.equal(manifest.name, "casa-marrone");
  assert.equal(manifest.scripts.dev, "next dev");
  assert.equal(manifest.scripts.build, "next build");
  assert.equal(manifest.scripts.start, "next start");
  assert.equal(manifest.scripts.lint, "eslint .");
  assert.equal("db:generate" in manifest.scripts, false);

  for (const name of [
    "drizzle-orm",
    "react-loading-skeleton",
    "@cloudflare/vite-plugin",
    "@vitejs/plugin-react",
    "@vitejs/plugin-rsc",
    "drizzle-kit",
    "react-server-dom-webpack",
    "vinext",
    "vite",
    "wrangler",
  ]) {
    assert.equal(name in (manifest.dependencies ?? {}), false, name);
    assert.equal(name in (manifest.devDependencies ?? {}), false, name);
  }
});
```

Replace the current `dist/server/index.js` Worker import and `ASSETS` binding with one lazy production server:

```js
const require = createRequire(import.meta.url);
let nextServer;
let nextOrigin;

async function startNextServer() {
  if (nextServer && nextOrigin) return;

  const nextBin = require.resolve("next/dist/bin/next");
  const child = spawn(
    process.execPath,
    [nextBin, "start", "--hostname", "127.0.0.1", "--port", "0"],
    {
      cwd: new URL("..", import.meta.url),
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: "1",
        NO_COLOR: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  let output = "";
  const collect = (chunk) => {
    output += String(chunk);
    const match = output.match(/Local:\s+(https?:\/\/[^\s]+)/);
    if (match) nextOrigin = match[1];
  };
  child.stdout.on("data", collect);
  child.stderr.on("data", collect);
  nextServer = child;

  for (let attempt = 0; attempt < 150; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`next start exited with ${child.exitCode}\n${output}`);
    }
    if (nextOrigin) {
      try {
        const response = await fetch(nextOrigin);
        if (response.status === 200) return;
      } catch {
        // The production server has announced its URL but is not accepting requests yet.
      }
    }
    await delay(100);
  }

  child.kill("SIGTERM");
  throw new Error(`next start did not become ready\n${output}`);
}

after(async () => {
  if (!nextServer || nextServer.exitCode !== null) return;
  nextServer.kill("SIGTERM");
  await Promise.race([
    once(nextServer, "exit"),
    delay(5_000).then(() => nextServer?.kill("SIGKILL")),
  ]);
});

async function render(path = "/") {
  await startNextServer();
  return fetch(new URL(path, nextOrigin), {
    headers: { accept: "text/html" },
  });
}
```

Keep every existing gallery, video, truthfulness, responsive, and media-budget assertion. Add rendered-path coverage for all eight story images:

```js
for (const name of [
  "property-plan",
  "front-arrival",
  "rear-pond",
  "covered-porch",
  "kitchen",
  "copper-sink",
  "primary-bedroom",
  "pond-garden",
]) {
  assert.match(html, new RegExp(`/property/story/${name}-1920\\.webp`));
}
```

- [ ] **Step 4: Run the focused test and confirm the intended red state**

Run:

```bash
node --test --test-name-pattern="uses standard Next scripts" tests/rendered-html.test.mjs
```

Expected: FAIL because the current manifest still uses the vinext package name and vinext scripts. Do not proceed if the test passes.

- [ ] **Step 5: Replace the starter manifest with the minimal standard-Next manifest**

Change only the project name, scripts, and dependency lists in `package.json` so they are exactly:

```json
{
  "name": "casa-marrone",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": ">=22.13.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "npm run build && node --test tests/rendered-html.test.mjs",
    "lint": "eslint ."
  },
  "dependencies": {
    "next": "16.2.6",
    "react": "19.2.6",
    "react-dom": "19.2.6"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "4.2.1",
    "@types/node": "22.19.19",
    "@types/react": "19.2.14",
    "@types/react-dom": "19.2.3",
    "eslint": "9.39.4",
    "eslint-config-next": "16.2.6",
    "tailwindcss": "4.2.1",
    "typescript": "5.9.3"
  },
  "type": "module"
}
```

Regenerate `package-lock.json` and local installed packages:

```bash
npm install
```

Expected: install exits `0`; no new direct dependency appears beyond the manifest above.

- [ ] **Step 6: Adopt the standard configs, remove unused Sites files, and rewrite the README**

Do not edit `tsconfig.json`, `eslint.config.mjs`, or `postcss.config.mjs`; their inspected contents already match standard Next.js, TypeScript, ESLint, and the current Tailwind import.

Delete only:

```text
.openai/hosting.json
app/chatgpt-auth.ts
```

Replace the vinext starter README with:

````markdown
# Casa Marrone

Single-property website for 1309 Queens Bush Road in Wellesley, Ontario.

## Requirements

- Node.js `>=22.13.0`

## Local development

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js.

## Verification

```bash
npm run lint
npm test
```

`npm test` builds the production Next.js application and verifies the rendered
property story, responsive hero media, gallery, and optimized asset budgets.

## Production

```bash
npm run build
npm start
```

Public deployment and domain configuration are handled in a later approved
phase.
````

Leave `next.config.ts` and all ignored vinext/Cloudflare residue untouched and uncommitted.

- [ ] **Step 7: Run the complete green gate and protected-path check**

Run:

```bash
npm run lint
npm test
npm ls --depth=0
git diff --check
git diff --exit-code cb69da3 -- app/page.tsx app/HeroVideo.tsx app/layout.tsx app/globals.css public/property
```

Expected:

- ESLint exits `0`.
- `next build` completes.
- Every Node test passes with zero failures.
- The production test server starts and stops cleanly.
- No removed starter package remains as a direct dependency.
- The protected application, styling, and media paths remain unchanged from `cb69da3`.

- [ ] **Step 8: Verify visual parity and runtime behavior**

Start the standard production build on the fixed QA port:

```bash
npm start -- --hostname 127.0.0.1 --port 3100
```

At `http://127.0.0.1:3100`, use the existing browser-automation environment without adding Playwright to the project. Repeat the pre-migration checks at `1440×900`, `768×1024`, and `390×844`.

Acceptance:

- section order and visible copy match the pre-migration baseline;
- all eight story images and all 36 gallery images load;
- each of six gallery groups keeps complete responsive rows;
- Casa Marrone colours, typography, spacing, and crops show no material visual change;
- no horizontal overflow, console errors, page errors, failed requests, or broken images;
- normal motion requests only the intended desktop or mobile MP4 and the pause/play control toggles both ways;
- reduced motion keeps the poster fallback and does not request or reveal the autoplay video.

Save post-migration screenshots only under `/private/tmp`; do not stage them. Stop the production server after the checks.

- [ ] **Step 9: Stage the exact product set, commit, and stop**

Run:

```bash
git add -- package.json package-lock.json README.md tsconfig.json eslint.config.mjs postcss.config.mjs tests/rendered-html.test.mjs .openai/hosting.json app/chatgpt-auth.ts
git diff --cached --name-status
git diff --cached --stat
```

Expected staged shape:

- Added: `README.md`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`
- Modified: `package.json`, `package-lock.json`, `tests/rendered-html.test.mjs`
- Deleted: `.openai/hosting.json`, `app/chatgpt-auth.ts`
- No `app/page.tsx`, `app/HeroVideo.tsx`, `app/layout.tsx`, `app/globals.css`, `public/property/**`, `next.config.ts`, ignored starter residue, media masters, or `.superpowers/**`

Commit:

```bash
git commit -m "chore: migrate Casa Marrone to standard Next.js"
```

The Compute Squad Executor then appends its required two short evidence paragraphs under `## Executor` in `COMPUTE_SQUAD_LOG.md` and commits that log update separately. A fresh Verifier independently reruns the green gate, browser parity, dependency, protected-path, and commit-scope checks. On PASS it clears the active log and commits the empty state.

Stop at the review/integration boundary. Do not push, open a PR, merge, deploy, or start the private-sale story unit.

---

## Unit 1 Acceptance Checklist

- [ ] Standard `next dev`, `next build`, and `next start` replace vinext.
- [ ] No new dependency is added; unused vinext, Vite, Cloudflare, Drizzle, skeleton, and direct RSC packages are removed.
- [ ] Standard Next config files are adopted without overwriting unrelated user work.
- [ ] Current page, layout, client video component, CSS, and 92 property assets remain byte-for-byte unchanged.
- [ ] Existing rendered-content/media tests plus eight rendered story paths pass against `next start`.
- [ ] Desktop, tablet, mobile, reduced-motion, video-control, console, and request checks match the baseline.
- [ ] Product and evidence commits contain only the approved paths.
- [ ] Nothing is pushed, merged, deployed, or advanced into Unit 2.
