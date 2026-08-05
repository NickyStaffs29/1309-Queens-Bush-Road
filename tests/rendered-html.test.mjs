import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createRequire } from "node:module";
import { readFile, stat } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import test, { after } from "node:test";

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
  assert.equal(manifest.dependencies.next, "16.2.12");
  assert.equal(manifest.devDependencies["eslint-config-next"], "16.2.12");

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
  const forceKill = setTimeout(() => nextServer?.kill("SIGKILL"), 5_000);
  try {
    await once(nextServer, "exit");
  } finally {
    clearTimeout(forceKill);
  }
});

async function render(path = "/") {
  await startNextServer();
  return fetch(new URL(path, nextOrigin), {
    headers: { accept: "text/html" },
  });
}

const galleryImages = [
  "setting-rural-context",
  "setting-aerial-overview",
  "setting-rear-elevation",
  "setting-house-lawn-aerial",
  "setting-full-property",
  "grounds-natural-pool-aerial",
  "grounds-pond-deck",
  "grounds-rear-across-pond",
  "grounds-lawn-fountain",
  "grounds-lawn-deck-pond",
  "grounds-opposite-aerial",
  "grounds-willow-tree",
  "grounds-pool-natural",
  "grounds-pool-deck-view",
  "living-fireplace",
  "living-dining-room",
  "living-kitchen-island",
  "living-piano-room",
  "living-kitchen-piano-connection",
  "craft-range-stone",
  "craft-range-detail",
  "craft-leaded-glass-nook",
  "craft-window-stair",
  "craft-brick-stair-detail",
  "craft-copper-sink-edge",
  "craft-timber-stair-barrel",
  "craft-stone-porch-bench",
  "craft-brick-steps-timber-door",
  "rooms-timber-entry",
  "rooms-office-library",
  "rooms-sitting-room",
  "rooms-double-vanity",
  "rooms-powder-room",
  "rooms-bedroom",
  "quiet-pool-clearing",
  "quiet-willow-balcony",
  "quiet-stone-waterfall",
  "quiet-lily-pads",
  "quiet-balcony-cafe",
  "quiet-pond-fountain",
];

const galleryVideos = ["setting-wide-context", "setting-facade-flyby", "setting-high-establishing", "setting-street-approach"];

test("server-renders the approved six-part property gallery", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /id="gallery"/);
  assert.equal((html.match(/class="gallery-group"/g) ?? []).length, 6);
  assert.equal((html.match(/class="gallery-item /g) ?? []).length, galleryImages.length + galleryVideos.length);
  for (const heading of ["The setting", "The grounds", "Living &amp; kitchen", "Craft", "Rooms", "Serene corners"]) {
    assert.match(html, new RegExp(`>${heading}<`));
  }
  // Sentence case, matching the other five headings. Title case is the old wording.
  assert.doesNotMatch(html, />Serene Corners</);
  assert.doesNotMatch(html, />Quiet views</);
  // The slugs are the group IDs, the anchor targets and the media prefixes, so their
  // identity and their order are part of the contract, not just their count.
  assert.deepEqual(
    [...html.matchAll(/id="([a-z]+)-gallery-title"/g)].map(([, slug]) => slug),
    ["setting", "grounds", "living", "craft", "rooms", "quiet"],
  );
  for (const image of galleryImages) {
    assert.match(html, new RegExp(`/property/gallery/${image}-1440\\.webp`));
  }
  for (const name of [
    "property-plan",
    "front-through-trees",
    "kitchen",
    "copper-sink",
    "primary-bedroom",
    "primary-bedroom-wide",
    "primary-bedroom-porch-view",
    "pond-garden",
  ]) {
    assert.match(html, new RegExp(`/property/story/${name}-1920\\.webp`));
  }
  assert.equal((html.match(/loading="lazy"/g) ?? []).length >= 44, true);
  assert.equal((html.match(/decoding="async"/g) ?? []).length >= 44, true);
  assert.equal((html.match(/srcSet="/g) ?? []).length >= 44, true);
  assert.equal((html.match(/width="/g) ?? []).length >= 46, true);
  assert.equal((html.match(/height="/g) ?? []).length >= 46, true);
});

test("sets manual scroll restoration before any page content renders", async () => {
  const html = await (await render()).text();
  assert.match(html, /history\.scrollRestoration\s*=\s*['"]manual['"]/);
  assert.equal(html.indexOf("history.scrollRestoration") < html.indexOf('class="site-header"'), true);
});

test("renders the responsive hero video with still-image fallbacks", async () => {
  const html = await (await render()).text();
  const video = html.match(/<video[^>]+class="hero-video"[\s\S]*?<\/video>/)?.[0] ?? "";

  // One looping film, not a rotation: no clip descriptor and no rotating clip survives here.
  assert.doesNotMatch(video, /data-hero-clips/);
  assert.doesNotMatch(video, /hero-front-driveway-arrival-desktop\.mp4/);
  assert.doesNotMatch(video, /hero-setting-street-approach-desktop\.mp4/);
  assert.doesNotMatch(video, /front-driveway-arrival\.mp4/);
  assert.doesNotMatch(video, /setting-street-approach\.mp4/);

  // Exactly two responsive sources, mobile first, neither eagerly fetched during server rendering.
  const sources = video.match(/<source\b[^>]*>/g) ?? [];
  assert.equal(sources.length, 2);
  assert.match(sources[0], /data-src="\/property\/video\/property-overview-mobile\.mp4"/);
  assert.match(sources[0], /data-media="\(max-width: 640px\)"/);
  assert.match(sources[1], /data-src="\/property\/video\/property-overview-desktop\.mp4"/);
  assert.doesNotMatch(sources[1], /data-media=/);
  assert.equal((video.match(/<source\b[^>]*\ssrc=/g) ?? []).length, 0);

  assert.match(html, /media="\(max-width: 640px\)"/);
  assert.match(html, /poster="\/property\/video\/property-overview-desktop-poster\.webp"/);
  assert.match(html, /muted=""[^>]*playsInline=""|playsInline=""[^>]*muted=""/);
  assert.match(video, /preload="none"/);
  assert.match(video, /\sloop=""/);
  assert.match(video, /aria-hidden="true"/);
  assert.match(video, /class="hero-video"/);
  assert.doesNotMatch(video, /class="hero-video is-ready"/);
  assert.match(html, />Pause video</);
  assert.match(html, /class="hero-video-fallback"/);
});

test("preserves the hero source bytes and approved generated video ceilings", async () => {
  const exactBytes = new Map([
    ["video/property-overview-mobile.mp4", 3283385],
    ["video/setting-street-approach.mp4", 1756445],
  ]);
  for (const [file, expected] of exactBytes) {
    assert.equal((await stat(new URL(`../public/property/${file}`, import.meta.url))).size, expected, file);
  }

  const ceilings = new Map([
    ["video/property-overview-desktop.mp4", 65_000_000],
    ["video/property-overview-desktop-poster.webp", 300 * 1024],
    ["video/front-driveway-arrival.mp4", 6.8 * 1024 * 1024],
  ]);
  for (const [file, maxBytes] of ceilings) {
    assert.equal((await stat(new URL(`../public/property/${file}`, import.meta.url))).size <= maxBytes, true, file);
  }
});

test("renders scroll-gated property video tiles with poster fallbacks", async () => {
  const html = await (await render()).text();
  for (const name of [...galleryVideos, "grounds-pool-pond", "front-driveway-arrival"]) {
    assert.match(html, new RegExp(`data-src="/property/video/${name}\\.mp4"`));
    assert.doesNotMatch(html, new RegExp(`(?<!data-)src="/property/video/${name}\\.mp4"`));
    assert.match(html, new RegExp(`/property/video/${name}-poster\\.webp`));
  }
  assert.equal((html.match(/>Pause video</g) ?? []).length, 7);

  const settingBlock = html.slice(html.indexOf('id="setting-gallery-title"'), html.indexOf('id="grounds-gallery-title"'));
  assert.equal((settingBlock.match(/class="gallery-item /g) ?? []).length, 9);
  assert.equal((settingBlock.match(/class="gallery-item landscape"/g) ?? []).length, 3);
  assert.equal((settingBlock.match(/class="gallery-item landscape feature"/g) ?? []).length, 6);

  // A group's final row must fill the 12-column grid, or come within a quarter of it.
  // Anything shorter reads as an unfinished row rather than a deliberate edge.
  const groupBlocks = html.split('class="gallery-group"').slice(1);
  assert.equal(groupBlocks.length, 6);
  for (const block of groupBlocks) {
    const spans = [...block.matchAll(/class="gallery-item ([a-z ]+)"/g)]
      .map(([, cls]) => (cls.includes("feature") ? 6 : cls.includes("portrait") ? 3 : 4))
      .reduce((total, span) => total + span, 0);
    const lastRow = spans % 12;
    assert.equal(
      lastRow === 0 || lastRow >= 9,
      true,
      `group spans ${spans}: final row fills only ${lastRow}/12 columns`,
    );
  }

  const arrivalRow = html.slice(html.indexOf('class="story-arrival-row"'), html.indexOf('id="grounds"'));
  assert.equal((arrivalRow.match(/class="story-image"/g) ?? []).length, 3);
});

// Everything above the first breakpoint: the desktop declarations the mobile blocks
// override. Scoping to it keeps a desktop assertion from being satisfied by a mobile rule.
function desktopBlock(css) {
  const end = css.indexOf("@media (max-width: 1180px)");
  assert.notEqual(end, -1, "missing the first breakpoint");
  return css.slice(0, end);
}

test("applies the approved still-image and gallery treatments", async () => {
  const [css, html] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    (async () => (await render()).text())(),
  ]);
  const desktop = desktopBlock(css);

  const arrivalRow = html.slice(html.indexOf('class="story-arrival-row"'), html.indexOf('id="grounds"'));
  const arrivalImage = arrivalRow.match(/<img[^>]+src="\/property\/gallery\/setting-rear-elevation-1440\.webp"[^>]*>/)?.[0] ?? "";
  assert.match(arrivalImage, /srcSet="\/property\/gallery\/setting-rear-elevation-720\.webp 720w, \/property\/gallery\/setting-rear-elevation-1440\.webp 1440w"/);
  assert.match(arrivalImage, /alt="Rear elevation with covered porches and upper balcony\."/);
  assert.match(arrivalImage, /width="1440"[^>]*height="1080"/);
  assert.match(arrivalImage, /loading="lazy"/);
  assert.match(arrivalImage, /decoding="async"/);

  const grounds = html.slice(html.indexOf('id="grounds"'), html.indexOf('id="interior"'));
  const groundsImage = grounds.match(/<img[^>]+src="\/property\/gallery\/grounds-rear-across-pond-1440\.webp"[^>]*>/)?.[0] ?? "";
  assert.match(groundsImage, /srcSet="\/property\/gallery\/grounds-rear-across-pond-720\.webp 720w, \/property\/gallery\/grounds-rear-across-pond-1440\.webp 1440w"/);
  assert.match(groundsImage, /alt="Rear exterior viewed across the pond garden\."/);
  assert.match(groundsImage, /width="1440"[^>]*height="1080"/);
  assert.match(groundsImage, /loading="lazy"/);
  assert.match(groundsImage, /decoding="async"/);

  const suite = html.slice(html.indexOf('class="suite-band"'), html.indexOf('id="details"'));
  const primary = suite.match(/<figure class="story-image suite-primary"[\s\S]*?<\/figure>/)?.[0] ?? "";
  assert.match(primary, /src="\/property\/story\/primary-bedroom-wide-1920\.webp"/);
  assert.match(primary, /srcSet="\/property\/story\/primary-bedroom-wide-960\.webp 960w, \/property\/story\/primary-bedroom-wide-1920\.webp 1920w"/);
  assert.match(primary, /sizes="\(max-width: 900px\) 100vw, 32vw"/);
  assert.match(suite, /\/property\/story\/primary-bedroom-1920\.webp/);
  assert.match(suite, /\/property\/story\/primary-bedroom-porch-view-1920\.webp/);
  assert.equal((suite.match(/sizes="\(max-width: 900px\) 100vw, 20vw"/g) ?? []).length, 2);

  // The band's own copy, as served: eyebrow, the approved two-line heading, and the description.
  assert.match(suite, /<p class="eyebrow gold">The primary suite<\/p>/);
  assert.match(suite, /<h2>A private<br\s*\/?>retreat<\/h2>/);
  assert.match(
    suite,
    /<p>A fireplace, a walk-in closet, an ensuite and a covered porch, all of them belonging to this room alone\.<\/p>/,
  );
  // The superseded heading is gone in every form, including split across the line break.
  assert.doesNotMatch(suite, /A house within/);
  assert.doesNotMatch(suite, /the house/);
  const suiteText = suite.replace(/<br\s*\/?>/g, " ").replace(/\s+/g, " ");
  assert.doesNotMatch(suiteText, /A house within the house/);

  // Desktop-scoped: the mobile block now carries its own `.suite-primary img` rule.
  assert.match(cssRule(desktop, ".suite-primary"), /background:\s*var\(--tobacco\)/);
  assert.match(cssRule(desktop, ".suite-primary img"), /object-fit:\s*contain/);
  assert.match(cssRule(desktop, ".suite-primary img"), /object-position:\s*center/);

  const serene = html.slice(html.indexOf('id="quiet-gallery-title"'), html.indexOf('id="inquire"'));
  assert.equal((serene.match(/class="gallery-item landscape/g) ?? []).length, 6);
  assert.equal((serene.match(/class="gallery-item portrait/g) ?? []).length, 0);
  assert.equal((serene.match(/class="gallery-item landscape feature/g) ?? []).length, 0);

  const expectedGroups = new Map([
    ["setting-gallery-title", 9],
    ["grounds-gallery-title", 9],
    ["living-gallery-title", 5],
    ["craft-gallery-title", 9],
    ["rooms-gallery-title", 6],
    ["quiet-gallery-title", 6],
  ]);
  for (const [headingId, count] of expectedGroups) {
    const start = html.indexOf(`id="${headingId}"`);
    const end = html.indexOf('class="gallery-group"', start + 1);
    const block = html.slice(start, end === -1 ? html.indexOf('id="inquire"') : end);
    assert.equal((block.match(/class="gallery-item /g) ?? []).length, count, headingId);
  }

  for (const name of ["kitchen", "copper-sink"]) {
    assert.match(html, new RegExp(`/property/story/${name}-1920\\.webp`));
    assert.doesNotMatch(html, new RegExp(`/property/gallery/${name}-`));
  }
});

test("stacks all primary-suite images at full mobile width", async () => {
  const [css, html] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    (async () => (await render()).text())(),
  ]);
  const desktop = desktopBlock(css);
  const mobile = cssBlock(css, "@media (max-width: 900px)");
  const small = cssBlock(css, "@media (max-width: 640px)");

  // Each figure spans the viewport below 901px, so every candidate must be picked for 100vw.
  const suite = html.slice(html.indexOf('class="suite-band"'), html.indexOf('id="details"'));
  const suiteSizes = [...suite.matchAll(/sizes="([^"]*)"/g)].map(([, value]) => value);
  assert.deepEqual(suiteSizes, [
    "(max-width: 900px) 100vw, 32vw",
    "(max-width: 900px) 100vw, 20vw",
    "(max-width: 900px) 100vw, 20vw",
  ]);
  for (const value of suiteSizes) {
    assert.equal(value.startsWith("(max-width: 900px) 100vw"), true, value);
  }

  // One full-width column: no collage rows, no fixed height, no inherited band padding.
  // `.suite-band > div` also selects the gallery, so this rule has to outweigh it.
  const gallery = cssRule(mobile, ".suite-band > .suite-gallery");
  assert.match(gallery, /grid-template-columns: 1fr/);
  assert.match(gallery, /grid-template-rows: none/);
  assert.match(gallery, /height: auto/);
  assert.match(gallery, /padding: 0/);
  assert.match(gallery, /align-self: stretch/);
  assert.match(gallery, /gap: 24px/);
  assert.match(cssRule(mobile, ".suite-gallery .story-image:first-child"), /grid-row: auto/);
  assert.match(cssRule(mobile, ".suite-gallery .story-image"), /aspect-ratio: 4 \/ 3/);

  // The copy, not the gallery, owns the mobile content padding.
  assert.match(cssRule(mobile, ".suite-band > div"), /padding: 72px var\(--mobile-gutter\)/);

  // Only the primary image crops on mobile; nothing else in the band changes fit.
  assert.deepEqual(
    [...mobile.matchAll(/(?:^|\n)\s*([^\n{}]*suite[^\n{}]*)\{[^}]*object-fit:/g)]
      .map(([, selector]) => selector.trim()),
    [".suite-primary img"],
  );
  assert.match(cssRule(mobile, ".suite-primary img"), /object-fit: cover/);

  // Desktop keeps the letterboxed centred primary, the two-column band and the collage.
  assert.match(cssRule(desktop, ".suite-primary img"), /object-fit: contain/);
  assert.match(cssRule(desktop, ".suite-primary img"), /object-position: center/);
  assert.match(cssRule(desktop, ".suite-primary"), /background: var\(--tobacco\)/);
  assert.match(cssRule(desktop, ".suite-band"), /grid-template-columns: 1\.25fr \.75fr/);
  assert.match(cssRule(desktop, ".suite-gallery"), /grid-template-columns: 1\.5fr 1fr/);
  assert.match(cssRule(desktop, ".suite-gallery"), /grid-template-rows: 1fr 1fr/);
  assert.match(cssRule(desktop, ".suite-gallery .story-image:first-child"), /grid-row: 1 \/ 3/);
  assert.match(cssRule(desktop, ".suite-band > div"), /align-self: center/);

  // The 640 block no longer re-imposes a fixed gallery height or its own band padding.
  assert.equal(/(?:^|\n)\s*\.suite-gallery \{/.test(small), false, "640 re-sets the gallery height");
  assert.doesNotMatch(small, /\.suite-band > div \{[^}]*padding-block/, "640 re-sets the band padding");
});

test("fills the mobile grounds photograph to the full content width", async () => {
  const [css, html] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    (async () => (await render()).text())(),
  ]);
  const desktop = desktopBlock(css);
  const mobile = cssBlock(css, "@media (max-width: 900px)");
  const small = cssBlock(css, "@media (max-width: 640px)");

  // A partial width is what left the brown column beside the photograph, and the `auto`
  // left margin is what pushed that gap to one side. Neither may survive on mobile.
  for (const [name, block] of [["900", mobile], ["640", small]]) {
    const rule = cssRule(block, ".grounds-secondary");
    assert.doesNotMatch(rule, /(?:^|[\s;{])width:/, `${name} block still sets a partial width`);
    assert.doesNotMatch(rule, /margin[^;]*auto/, `${name} block still right-aligns the photograph`);
  }

  // The figure spans gutter to gutter now, so `sizes` has to say so — otherwise the
  // browser keeps picking a candidate for a box narrower than the one it paints.
  const grounds = html.slice(html.indexOf('id="grounds"'), html.indexOf('id="interior"'));
  const groundsImage = grounds.match(/<img[^>]+src="\/property\/gallery\/grounds-rear-across-pond-1440\.webp"[^>]*>/)?.[0] ?? "";
  assert.match(groundsImage, /sizes="\(max-width: 900px\) calc\(100vw - 48px\), 30vw"/);
  // Intrinsic dimensions, alt text and lazy loading are untouched by the width change.
  assert.match(groundsImage, /alt="Rear exterior viewed across the pond garden\."/);
  assert.match(groundsImage, /width="1440"[^>]*height="1080"/);
  assert.match(groundsImage, /loading="lazy"/);

  // Desktop keeps the narrow right-hand column of the two-column grounds grid.
  assert.match(cssRule(desktop, ".grounds"), /grid-template-columns: 1\.25fr \.75fr/);
  assert.match(cssRule(desktop, ".grounds-secondary"), /grid-column: 2/);
  assert.match(cssRule(desktop, ".grounds-secondary"), /grid-row: 1 \/ 3/);
});

test("puts the primary-suite copy above its photographs on mobile", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const desktop = desktopBlock(css);
  const mobile = cssBlock(css, "@media (max-width: 900px)");

  // Source order paints the collage first, which is what the desktop band wants. Mobile
  // reorders the single-column grid it already has rather than restating the markup.
  // `border:` contains the substring, so every probe here has to be boundary-anchored.
  assert.match(cssRule(mobile, ".suite-band > .suite-gallery"), /(?:^|[\s;{])order: 1/);
  // The copy keeps the initial order, so nothing has to be restated to stay ahead of it.
  assert.doesNotMatch(cssRule(mobile, ".suite-band > div"), /(?:^|[\s;{])order:/);

  // Desktop never orders the band: the 1.25fr/.75fr columns place copy beside collage.
  assert.equal(/(?:^|[\s;{])order:/.test(desktop), false, "desktop introduces an order declaration");
  assert.match(cssRule(desktop, ".suite-band"), /grid-template-columns: 1\.25fr \.75fr/);
});

test("exposes video controls as plain buttons rather than toggle buttons", async () => {
  const html = await (await render()).text();
  // The label already carries the state, so aria-pressed would announce it twice, and invert it.
  assert.doesNotMatch(html, /aria-pressed/);

  // Exact counts, not mere presence: one hero control, six secondary controls, and seven
  // independently operable controls in total, each with its own server-rendered label.
  assert.equal((html.match(/class="hero-video-control"/g) ?? []).length, 1);
  assert.equal((html.match(/class="property-video-control"/g) ?? []).length, 6);
  assert.equal((html.match(/>Pause video</g) ?? []).length, 7);

  // Every one of the seven is a plain button, so nothing submits or toggles implicitly.
  const buttons = html.match(/<button[^>]*>/g) ?? [];
  const videoButtons = buttons.filter((button) => /hero-video-control|property-video-control/.test(button));
  assert.equal(videoButtons.length, 7);
  for (const button of videoButtons) {
    assert.match(button, /type="button"/);
    assert.doesNotMatch(button, /aria-pressed/);
  }
});

// Returns the inner text of a brace-balanced at-rule so a mobile assertion cannot
// accidentally be satisfied by a desktop rule further down the file.
function cssBlock(css, header) {
  const start = css.indexOf(header);
  assert.notEqual(start, -1, `missing ${header}`);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === "{") depth += 1;
    else if (css[index] === "}" && (depth -= 1) === 0) return css.slice(open + 1, index);
  }
  throw new Error(`unterminated ${header}`);
}

function cssRule(block, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = block.match(new RegExp(`(?:^|\\n)\\s*${escaped} \\{([^}]*)\\}`));
  assert.notEqual(match, null, `missing rule for ${selector}`);
  return match[1];
}

function hiddenNavSelectors(block) {
  return [...block.matchAll(/(?:^|\n)\s*([^\n{}]*nav a[^\n{}]*)\{[^}]*display: none/g)]
    .map(([, selector]) => selector.trim());
}

test("gives every text control a 44px touch target and locks the mobile interface type", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.text-link \{[^}]*min-height: 44px/);
  assert.match(css, /footer a \{[^}]*min-height: 44px/);
  assert.match(css, /nav a \{[^}]*min-height: 44px/);
  assert.match(css, /\.wordmark \{[^}]*min-height: 44px/);
  // The seven video controls are touch targets too, at every width.
  assert.match(css, /\.hero-video-control \{[^}]*min-height: 44px/);
  assert.match(css, /\.property-video-control \{[^}]*min-height: 44px/);

  const mobile = cssBlock(css, "@media (max-width: 900px)");
  const small = cssBlock(css, "@media (max-width: 640px)");

  // No small-screen override may shrink a target back under the contract.
  for (const block of [mobile, small]) {
    for (const [, selector, body] of block.matchAll(/(?:^|\n)\s*([^\n{}]+)\{([^}]*)\}/g)) {
      if (!/\.wordmark|nav a|footer a|\.text-link|video-control/.test(selector)) continue;
      const minHeight = body.match(/min-height:\s*([^;]+)/)?.[1]?.trim();
      if (minHeight) assert.equal(minHeight, "44px", selector.trim());
    }
  }

  assert.match(cssRule(mobile, ".wordmark"), /font-size: 14px/);
  assert.match(cssRule(mobile, "nav"), /gap: 12px/);
  assert.match(cssRule(mobile, "nav a"), /font-size: 10px/);
  assert.match(cssRule(mobile, "nav a"), /letter-spacing: \.06em/);
  assert.match(cssRule(mobile, ".facts span"), /font-size: 11px/);
  assert.match(cssRule(mobile, ".feature-columns h3"), /font-size: 11px/);
  assert.match(cssRule(mobile, "footer"), /font-size: 11px/);
  assert.match(cssRule(mobile, ".hero h1"), /line-height: \.95/);
  assert.match(cssRule(mobile, ".section h2, .suite-band h2, .inquire h2"), /line-height: 1;/);

  // The 640 block must not re-tighten or re-shrink what the 900 block just set.
  assert.equal(/(?:^|\n)\s*nav a \{/.test(small), false, "640 re-sets nav type");
  assert.doesNotMatch(small, /\.hero h1 \{[^}]*line-height/, "640 re-sets the hero display line-height");
});

test("standardises the mobile placement and type size of every video control", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const desktop = desktopBlock(css);
  const mobile = cssBlock(css, "@media (max-width: 900px)");
  const small = cssBlock(css, "@media (max-width: 640px)");

  // One combined rule, so the hero control and the six secondary controls cannot drift
  // apart on mobile the way their distinct desktop offsets do.
  const combined = cssRule(mobile, ".hero-video-control, .property-video-control");
  assert.match(combined, /bottom: 16px/);
  assert.match(combined, /right: 16px/);
  assert.match(combined, /font-size: 11px/);
  assert.match(combined, /min-height: 44px/);
  assert.match(combined, /padding-inline: 16px/);

  // Combined means combined: neither family may also be placed on its own below 900px.
  for (const [block, label] of [[mobile, "900"], [small, "640"]]) {
    for (const selector of [".hero-video-control", ".property-video-control"]) {
      assert.equal(
        new RegExp(`(?:^|\\n)\\s*\\${selector} \\{`).test(block),
        false,
        `${label} places ${selector} on its own instead of using the combined rule`,
      );
    }
  }

  // The two desktop placements are deliberately different and stay untouched.
  const hero = cssRule(desktop, ".hero-video-control");
  assert.match(hero, /bottom: 28px/);
  assert.match(hero, /right: 30px/);
  const property = cssRule(desktop, ".property-video-control");
  assert.match(property, /bottom: 10px/);
  assert.match(property, /right: 10px/);

  // Presentation, state and reduced-motion handling all survive the mobile placement.
  assert.match(css, /\.hero-video-control\[hidden\] \{[^}]*display: none/);
  assert.match(css, /\.property-video-control\[hidden\] \{[^}]*display: none/);
  assert.match(css, /\.property-video-control:focus-visible \{[^}]*outline: 2px solid var\(--gold\)/);
  assert.match(hero, /position: absolute/);
  assert.match(property, /position: absolute/);
});

test("gives every mobile gallery group a complete, intentional rhythm", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const mobile = cssBlock(css, "@media (max-width: 900px)");
  const small = cssBlock(css, "@media (max-width: 640px)");

  // 24 / 48 / 72: the same rhythm the rest of the mobile shell already uses.
  assert.match(cssRule(mobile, ".gallery-heading"), /margin-bottom: 48px/);
  assert.match(cssRule(mobile, ".gallery-group + .gallery-group"), /margin-top: 72px/);
  const groupHeading = cssRule(mobile, ".gallery-group h3");
  assert.match(groupHeading, /margin-bottom: 24px/);
  assert.match(groupHeading, /padding-bottom: 16px/);
  assert.match(cssRule(mobile, ".gallery-group-grid"), /gap: 24px/);

  // The 640 block already owns the stacked heading, so the stacked spacing belongs there.
  assert.match(cssRule(small, ".gallery-heading"), /display: block/);
  assert.match(cssRule(small, ".gallery-heading h2"), /margin-top: 24px/);

  // Rhythm only. Every column, span and ratio contract is left exactly as it was.
  assert.match(cssRule(mobile, ".gallery-group-grid"), /grid-template-columns: repeat\(2, 1fr\)/);
  assert.match(
    mobile,
    /\.gallery-item\.landscape, \.gallery-item\.portrait, \.gallery-item\.feature \{[^}]*grid-column: span 1/,
  );
  assert.match(mobile, /\.gallery-item:last-child:nth-child\(odd\) \{[^}]*grid-column: 1 \/ -1/);
  assert.match(cssRule(small, ".gallery-item.landscape"), /grid-column: 1 \/ -1/);
  assert.match(cssRule(small, ".gallery-item.portrait"), /grid-column: span 1/);
  assert.match(css, /\.gallery-item\.landscape \{[^}]*aspect-ratio: 4 \/ 3/);
  assert.match(css, /\.gallery-item\.portrait \{[^}]*aspect-ratio: 2 \/ 3/);
  assert.match(css, /\.gallery-item\.feature \{[^}]*grid-column: span 6/);

  // Desktop rhythm keeps its fluid clamps; the fixed steps are mobile-only.
  const desktop = desktopBlock(css);
  assert.match(cssRule(desktop, ".gallery-heading"), /margin-bottom: clamp\(54px, 8vw, 110px\)/);
  assert.match(cssRule(desktop, ".gallery-group + .gallery-group"), /margin-top: clamp\(70px, 9vw, 130px\)/);
  assert.match(cssRule(desktop, ".gallery-group-grid"), /gap: clamp\(12px, 2vw, 28px\)/);
  assert.match(cssRule(desktop, ".gallery-group-grid"), /grid-template-columns: repeat\(12, 1fr\)/);
});

test("drops every moving image and its control under reduced motion", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const reduced = cssBlock(css, "@media (prefers-reduced-motion: reduce)");

  // Both media elements and both control families go; nothing animated is left running.
  assert.match(cssRule(reduced, ".hero-video"), /display: none/);
  assert.match(cssRule(reduced, ".hero-video-control"), /display: none/);
  assert.match(cssRule(reduced, ".property-video-media, .property-video-control"), /display: none/);

  // The posters are what remains visible, so nothing may hide the fallbacks.
  assert.doesNotMatch(reduced, /\.hero-video-fallback[^{}]*\{[^}]*display: none/);
  assert.doesNotMatch(reduced, /\.property-video-fallback[^{}]*\{[^}]*display: none/);

  assert.match(cssRule(reduced, "html"), /scroll-behavior: auto/);
  assert.match(reduced, /\*, \*::before, \*::after \{[^}]*scroll-behavior: auto !important/);
});

test("uses a native copper underline for the viewing link", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const navInquire = css.match(/\.nav-inquire \{([^}]*)\}/)?.[1] ?? "";
  assert.match(navInquire, /text-decoration:\s*underline/);
  assert.match(navInquire, /text-decoration-color:\s*var\(--copper\)/);
  assert.match(navInquire, /text-decoration-thickness:\s*1px/);
  assert.match(navInquire, /text-underline-offset:\s*4px/);
  assert.doesNotMatch(navInquire, /border-bottom|padding/);
  assert.match(css, /nav a \{[^}]*min-height: 44px/);
});

test("renders a compact sticky mobile header without adding navigation UI", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const markup = markupOnly(await (await render()).text());
  const header = markup.match(/<header[\s\S]*?<\/header>/)?.[0] ?? "";
  const mobile = cssBlock(css, "@media (max-width: 900px)");
  const small = cssBlock(css, "@media (max-width: 640px)");

  // Hiding a link is a CSS decision; every destination stays in the markup.
  for (const href of ["#top", "#story", "#gallery", "#details", "#inquire"]) {
    assert.equal(header.includes(`href="${href}"`), true, `header lost ${href}`);
  }

  const siteHeader = cssRule(mobile, ".site-header");
  assert.match(siteHeader, /position: sticky/);
  assert.match(siteHeader, /top: 0/);
  assert.match(siteHeader, /height: 64px/);
  assert.match(siteHeader, /padding-inline: var\(--mobile-gutter\)/);

  // The 900 block is the single authority: only the two section links drop out.
  assert.deepEqual(hiddenNavSelectors(mobile), ['nav a[href="#story"], nav a[href="#details"]']);
  assert.deepEqual(hiddenNavSelectors(small), []);
  assert.match(cssRule(mobile, "nav a"), /white-space: nowrap/);
  assert.match(
    mobile,
    /#top, #story, #grounds, #interior, #details, #gallery, #inquire \{[^}]*scroll-margin-top: 64px/,
  );
  // Smooth scrolling and its reduced-motion escape hatch both survive the sticky offset.
  assert.match(css, /html \{[^}]*scroll-behavior: smooth/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*html \{[^}]*scroll-behavior: auto/);

  // No drawer, no hamburger, no bottom bar, no JavaScript navigation.
  assert.equal((markup.match(/<header/g) ?? []).length, 1);
  assert.equal((markup.match(/<nav/g) ?? []).length, 1);
  assert.equal(header.includes("<button"), false, "header must not add a navigation button");
  assert.doesNotMatch(markup, /hamburger|menu-?(?:toggle|drawer|panel|button)|nav-?toggle|bottom-?nav/i);
  assert.doesNotMatch(css, /hamburger|menu-?(?:toggle|drawer|panel|button)|nav-?toggle|bottom-?nav/i);
});

test("uses one mobile gutter and aligns facts and footer safely", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const markup = markupOnly(await (await render()).text());
  const mobile = cssBlock(css, "@media (max-width: 900px)");
  const small = cssBlock(css, "@media (max-width: 640px)");

  assert.match(css, /:root \{[^}]*--mobile-gutter: 24px;/);

  // One inset, applied to every gutter-bearing surface this stage owns.
  for (const [selector, declaration] of [
    [".site-header", "padding-inline: var(--mobile-gutter)"],
    [".hero-content", "left: var(--mobile-gutter)"],
    [".hero-content", "right: var(--mobile-gutter)"],
    [".facts", "padding-inline: var(--mobile-gutter)"],
    [".section", "padding: 72px var(--mobile-gutter)"],
    ["footer", "padding-inline: var(--mobile-gutter)"],
  ]) {
    assert.equal(cssRule(mobile, selector).includes(declaration), true, `${selector} { ${declaration} }`);
  }

  // 72 section-level, 48 within-section, 24 between related media.
  for (const [selector, declaration] of [
    ["#grounds", "padding-block: 72px"],
    [".story, .interior, .features", "gap: 48px"],
    [".section-intro", "padding: 0"],
    [".feature-columns", "gap: 48px"],
    [".story-arrival-row", "gap: 24px"],
    [".grounds", "gap: 24px"],
    [".grounds-copy", "padding-bottom: 24px"],
    [".grounds-note", "margin-top: 0"],
  ]) {
    assert.equal(cssRule(mobile, selector).includes(declaration), true, `${selector} { ${declaration} }`);
  }
  // Below 640 the grounds grid collapses to blocks, so the same separations move onto margins.
  assert.match(cssRule(small, ".grounds-copy"), /padding-bottom: 48px/);
  assert.match(cssRule(small, ".grounds-secondary"), /margin-top: 24px/);
  assert.match(cssRule(small, ".grounds-note"), /margin-top: 24px/);

  // The header is in flow now, so the first fold is the viewport minus its 64px.
  assert.match(cssRule(mobile, ".hero"), /height: max\(616px, calc\(100svh - 64px\)\)/);
  assert.match(cssRule(mobile, ".hero"), /min-height: 616px/);
  assert.doesNotMatch(small, /\.hero \{[^}]*min-height: 680px/);
  assert.equal(/(?:^|\n)\s*\.hero-content \{/.test(small), false, "640 re-sets the hero gutter");

  // Vertical cards with the value pushed down, so a wrapped label cannot shift its row.
  assert.match(cssRule(mobile, ".facts div"), /display: flex/);
  assert.match(cssRule(mobile, ".facts div"), /flex-direction: column/);
  assert.match(cssRule(mobile, ".facts strong"), /margin-top: auto/);
  assert.match(cssRule(small, ".facts"), /grid-template-columns: repeat\(2, 1fr\)/);
  const smallCard = cssRule(small, ".facts div, .facts div:nth-child(3)");
  assert.match(smallCard, /padding: 26px 16px/);
  assert.match(smallCard, /border-bottom: 1px solid/);
  assert.match(smallCard, /border-right: 1px solid/);

  // Same words, same order, grouped so a line can only break between phrases.
  const footerParagraph = markup.match(/<footer[\s\S]*?<\/footer>/)?.[0]?.match(/<p[^>]*>[\s\S]*?<\/p>/)?.[0] ?? "";
  const groups = [...footerParagraph.matchAll(/<span>([^<]*)<\/span>/g)].map(([, text]) => text);
  assert.deepEqual(groups, ["Casa Marrone ·", "1309 Queens Bush Road ·", "Wellesley, Ontario"]);
  assert.equal(groups.join(" "), "Casa Marrone · 1309 Queens Bush Road · Wellesley, Ontario");
  assert.match(css, /footer p \{[^}]*display: flex/);
  assert.match(css, /footer p \{[^}]*flex-wrap: wrap/);
  assert.match(css, /footer p \{[^}]*row-gap: 8px/);
  // The column gap only replaces the word space, so desktop keeps its one-line address.
  assert.match(css, /footer p \{[^}]*column-gap: \.4em/);
  assert.match(css, /footer p span \{[^}]*white-space: nowrap/);
  assert.doesNotMatch(mobile, /footer p \{[^}]*flex-wrap: nowrap/);
});

test("sizes the hero video to fully cover its box", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /img, video, \.hero-video \{[^}]*width: 100%/);
  assert.match(css, /img, video, \.hero-video \{[^}]*height: 100%/);
  assert.match(css, /img, video, \.hero-video \{[^}]*object-fit: cover/);
});

test("keeps media complete and truthful at every breakpoint", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const html = await (await render()).text();
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  assert.match(html, />Wellesley, Ontario</);
  // The garage loft is a historically verified feature, so only unverified claims stay excluded.
  assert.doesNotMatch(html, /St\. Jacobs|wine cellar|lower-level gallery/i);
  assert.match(
    html,
    /alt="Bedroom with stone fireplace, television and windows"/,
    "primary bedroom alt text should describe the visible fireplace, television and windows",
  );
  assert.doesNotMatch(
    html,
    /alt="Bedroom with stone fireplace, garden door and burgundy bedding"/,
    "primary bedroom alt text should not claim details absent from the image",
  );
  assert.match(css, /\.gallery-group-grid \{[^}]*grid-template-columns: repeat\(12, 1fr\)/);
  assert.match(css, /\.gallery-group-grid \{[^}]*align-items: end/);
  assert.match(css, /\.story-arrival-row \{[^}]*grid-template-columns: repeat\(3, 1fr\)/);
  assert.match(css, /\.gallery-item\.landscape \{[^}]*grid-column: span 4/);
  assert.match(css, /\.gallery-item\.portrait \{[^}]*grid-column: span 3/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.gallery-group-grid \{[^}]*grid-template-columns: repeat\(2, 1fr\)/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.gallery-item\.landscape \{[^}]*grid-column: 1 \/ -1/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.hero-video \{[^}]*display: none/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.property-video-media[^}]*display: none/);
});

test("ships only the approved web media within budget", async () => {
  const files = [
    ...galleryImages.flatMap((name) => [
      [`gallery/${name}-720.webp`, 110 * 1024],
      [`gallery/${name}-1440.webp`, 260 * 1024],
    ]),
    ["video/property-overview-desktop-poster.webp", 300 * 1024],
    ["video/property-overview-mobile-poster.webp", 300 * 1024],
    ["video/property-overview-desktop.mp4", 65_000_000],
    ["video/property-overview-mobile.mp4", 4.5 * 1024 * 1024],
    // Secondary clips are 1280x720 web cuts. These ceilings are deliberately tight:
    // the earlier budgets were loose enough to let master-bitrate files ship unnoticed.
    ["video/setting-wide-context.mp4", 1.6 * 1024 * 1024],
    ["video/setting-wide-context-poster.webp", 150 * 1024],
    ["video/setting-facade-flyby.mp4", 0.95 * 1024 * 1024],
    ["video/setting-facade-flyby-poster.webp", 150 * 1024],
    ["video/setting-high-establishing.mp4", 1.6 * 1024 * 1024],
    ["video/setting-high-establishing-poster.webp", 160 * 1024],
    ["video/grounds-pool-pond.mp4", 1.4 * 1024 * 1024],
    ["video/grounds-pool-pond-poster.webp", 250 * 1024],
    ["video/front-driveway-arrival.mp4", 6.8 * 1024 * 1024],
    ["video/front-driveway-arrival-poster.webp", 160 * 1024],
    ["video/setting-street-approach.mp4", 1.8 * 1024 * 1024],
    ["video/setting-street-approach-poster.webp", 160 * 1024],
  ];
  for (const [file, maxBytes] of files) {
    assert.equal((await stat(new URL(`../public/property/${file}`, import.meta.url))).size <= maxBytes, true, file);
  }

  const storyNames = ["property-plan", "front-porch-daylight", "front-through-trees", "covered-porch", "kitchen", "copper-sink", "primary-bedroom", "primary-bedroom-wide", "primary-bedroom-porch-view", "pond-garden"];
  for (const name of storyNames) {
    assert.equal((await stat(new URL(`../public/property/story/${name}-960.webp`, import.meta.url))).size <= 180 * 1024, true, name);
    assert.equal((await stat(new URL(`../public/property/story/${name}-1920.webp`, import.meta.url))).size <= 450 * 1024, true, name);
  }
});

const inquiryEmail = "cmchiarello@gmail.com";
const inquiryHref = `mailto:${inquiryEmail}?subject=Casa%20Marrone%20private%20viewing%20request`;

// Omission checks read the served markup only; inlined RSC payloads repeat the same copy.
function markupOnly(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");
}

test("renders the approved Casa Marrone section order", async () => {
  const html = await (await render()).text();
  let cursor = -1;
  for (const marker of [
    'class="site-header"',
    'class="hero-video-fallback"',
    ">Wellesley, Ontario<",
    'id="property-title"',
    'class="hero-price"',
    'class="hero-line"',
    'class="facts"',
    'id="story"',
    'id="grounds"',
    'id="interior"',
    'class="suite-band"',
    'id="details"',
    'id="gallery"',
    'id="inquire"',
    "<footer",
  ]) {
    const index = html.indexOf(marker, cursor + 1);
    assert.notEqual(index, -1, `missing ${marker}`);
    assert.equal(index > cursor, true, `out of order: ${marker}`);
    cursor = index;
  }
});

test("publishes only the approved rounded area and confirmed property facts", async () => {
  const html = await (await render()).text();
  const page = html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? html;
  const detailedClaim = "one natural swimming pool/pond, plus a separate natural pond";
  const area = "6,553 sq. ft. total";
  const grounds = page.match(/<section id="grounds"[\s\S]*?<\/section>/)?.[0] ?? "";
  const details = page.match(/<section id="details"[\s\S]*?<\/section>/)?.[0] ?? "";
  const story = page.match(/<section id="story"[\s\S]*?<\/section>/)?.[0] ?? "";

  assert.match(html, /<title>[^<]*Casa Marrone[^<]*<\/title>/);
  assert.match(html, /class="facts"[\s\S]*?CAD \$1,895,000[\s\S]*?<\/section>/);

  for (const phrase of [
    "Private sale",
    "CAD $1,895,000",
    "1835",
    area,
    "Five bedrooms and four bathrooms",
    "Five covered porches",
    detailedClaim,
    "Municipal services remain current",
    "Chimneys and flues reconstructed in May 2019",
    "60,000 lb",
    "50-amp service",
    "Hard- and soft-water connections",
  ]) {
    assert.equal(html.includes(phrase), true, `missing ${phrase}`);
  }
  // Whole document, not just <main>: the stale claim survived in the metadata description
  // once already because the visible-copy check stopped at the page body.
  assert.doesNotMatch(html, /two natural swimming pools/i);
  const metaDescription = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
  assert.match(metaDescription, /natural swimming pool\/pond/);
  assert.match(metaDescription, /separate natural pond/);
  assert.match(page, /<span>Natural water features<\/span><strong>2<\/strong>/);
  assert.equal(grounds.includes(detailedClaim), true);
  assert.equal(details.includes(detailedClaim), true);
  assert.equal((page.match(new RegExp(detailedClaim, "g")) ?? []).length, 3);

  const factStrip = html.match(/class="facts"[\s\S]*?<\/section>/)[0];
  let factCursor = -1;
  for (const value of ["CAD $1,895,000", ">5<", ">4<", area, ">5<", ">2<"]) {
    const index = factStrip.indexOf(value, factCursor + 1);
    assert.notEqual(index, -1, `fact strip missing ${value}`);
    factCursor = index;
  }

  // The rounded total is the only area figure published, in all four surfaces that carry one.
  assert.equal(story.includes(`Inside there is ${area}`), true, "story copy missing the rounded total");
  assert.equal(details.includes(`<li>${area}</li>`), true, "details list missing the rounded total");
  assert.equal((details.match(/6,553 sq\. ft\. total/g) ?? []).length, 1, "details list repeats the total");
  assert.equal(metaDescription.includes(area), true, "metadata description missing the rounded total");

  // Whole document: no decimal precision and no grade breakdown survives anywhere, head included.
  for (const banned of [/6,553\.32/, /4,490\.75/, /2,062\.57/, /above grade/i, /below grade/i]) {
    assert.doesNotMatch(html, banned, `still publishes ${banned}`);
  }
});

test("offers one appointment-only email inquiry path", async () => {
  const markup = markupOnly(await (await render()).text());

  assert.match(markup, />Arrange a private viewing</);
  assert.match(markup, /by confirmed appointment/);
  assert.match(markup, /name, preferred day and time windows, and how many people will attend/);
  assert.match(markup, />Email to request a private viewing</);
  // The CTA and the visible address are both links, but to ONE destination.
  const mailtoHrefs = markup.match(/href="mailto:[^"]*"/g) ?? [];
  assert.equal(mailtoHrefs.length >= 1, true, "no mailto link rendered");
  assert.deepEqual([...new Set(mailtoHrefs)], [`href="${inquiryHref}"`]);
  assert.deepEqual([...new Set(markup.match(/[\w.+-]+@[\w.-]+\.\w{2,}/g) ?? [])], [inquiryEmail]);
});

test("makes inquiry artwork full bleed and centres the mobile CTA", async () => {
  const [css, html] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    (async () => (await render()).text())(),
  ]);
  const desktop = desktopBlock(css);
  const mobile = cssBlock(css, "@media (max-width: 900px)");

  // The artwork is a direct child of the section. Below 900px the section is taller than
  // the image's intrinsic height, so in flow it leaves a plaster seam and has to be lifted
  // out to cover. Desktop has no seam to fix: there the image stays in flow and its own
  // height is what gives the section its 1080px, so lifting it out would collapse the
  // section to its 720px minimum. The rule belongs to the mobile block only.
  assert.doesNotMatch(
    desktop,
    /\.inquire > img \{[^}]*position: absolute/,
    "desktop must leave the inquiry artwork in flow",
  );
  const artwork = cssRule(mobile, ".inquire > img");
  assert.match(artwork, /position: absolute/);
  assert.match(artwork, /inset: 0/);

  // The positioning context, the shade and the content stack all stay as they were.
  assert.match(cssRule(desktop, ".inquire"), /position: relative/);
  assert.match(cssRule(desktop, ".inquire"), /overflow: hidden/);
  const shade = cssRule(desktop, ".inquire-shade");
  assert.match(shade, /position: absolute/);
  assert.match(shade, /inset: 0/);
  assert.equal(
    html.indexOf('class="inquire-shade"') < html.indexOf('class="inquire-content"'),
    true,
    "the shade must paint under the content",
  );

  // Vertical centring is untouched; only the horizontal box becomes gutter-to-gutter.
  const desktopContent = cssRule(desktop, ".inquire-content");
  assert.match(desktopContent, /position: absolute/);
  assert.match(desktopContent, /top: 50%/);
  assert.match(desktopContent, /transform: translateY\(-50%\)/);
  assert.doesNotMatch(mobile, /\.inquire-content \{[^}]*(?:top:|transform:)/, "mobile re-sets the vertical centring");

  const content = cssRule(mobile, ".inquire-content");
  assert.match(content, /left: var\(--mobile-gutter\)/);
  assert.match(content, /right: var\(--mobile-gutter\)/);
  assert.match(content, /width: auto/);
  assert.match(content, /max-width: none/);
  assert.match(content, /text-align: center/);

  // Centred, wrappable and still a 52px target once the label breaks over two lines.
  const cta = cssRule(mobile, ".cta-button");
  assert.match(cta, /justify-content: center/);
  assert.match(cta, /text-align: center/);
  assert.match(cta, /white-space: normal/);
  assert.match(cta, /padding: 14px 20px/);
  assert.match(cta, /min-height: 52px/);
  assert.match(cssRule(desktop, ".cta-button"), /display: inline-flex/);

  // Email only: the CTA and the visible address, both to the one approved destination.
  const markup = markupOnly(html);
  const section = markup.slice(markup.indexOf('id="inquire"'), markup.indexOf("<footer"));
  assert.match(section, />Email to request a private viewing</);
  assert.match(section, /by confirmed appointment/);
  const mailtoHrefs = section.match(/href="mailto:[^"]*"/g) ?? [];
  assert.equal(mailtoHrefs.length, 2, "the CTA and the visible address are the two inquiry links");
  assert.deepEqual(mailtoHrefs, [`href="${inquiryHref}"`, `href="${inquiryHref}"`]);
  assert.deepEqual([...new Set(section.match(/[\w.+-]+@[\w.-]+\.\w{2,}/g) ?? [])], [inquiryEmail]);

  for (const [label, pattern] of [
    ["contact form", /<form\b|<input\b|<select\b|<textarea\b/i],
    ["telephone", /\btel:|telephone|\bphones?\b|\b\d{3}[.\- ]\d{3}[.\- ]\d{4}\b/i],
    ["scheduler", /calendly|acuity scheduling|(?:schedule|book) (?:a|an|your) (?:viewing|visit|tour|time|slot)/i],
    ["showing procedure", /lockbox|access code|entry code|key ?code|showing instructions|accompan/i],
  ]) {
    assert.doesNotMatch(section, pattern, label);
  }
});

test("omits everything outside the approved private-sale disclosure", async () => {
  const markup = markupOnly(await (await render()).text());

  for (const [label, pattern] of [
    ["historic wording", /historic/i],
    ["heritage wording", /heritage/i],
    ["postal code", /\b[A-Z]\d[A-Z] ?\d[A-Z]\d\b/],
    ["lot size", /lot size|\b\d+(?:\.\d+)?\s*(?:acres?|hectares?)\b/i],
    ["iGuide", /iguide/i],
    ["floor plan", /floor\s?plans?\b/i],
    ["MLS", /\bMLS\b/i],
    ["agent or brokerage", /\bagents?\b|\bbrokers?\b|brokerage|realtor|lambert/i],
    ["telephone", /\btel:|telephone|\bphones?\b|\b\d{3}[.\- ]\d{3}[.\- ]\d{4}\b/i],
    ["contact form", /<form\b|<input\b/i],
    ["access or security procedure", /lockbox|\bsecurity\b|\balarm\b|accompan|access code|entry code|key ?code|showing instructions/i],
    ["public scheduling", /calendly|acuity scheduling|(?:schedule|book) (?:a|an|your) (?:viewing|visit|tour|time|slot)/i],
    ["condition guarantee", /guarantee|warrant(?:y|ies|ed)|move-in ready|turn-?key|immaculate/i],
    ["unverified renovation", /renovat|fully updated|newly remodel|recently redone/i],
    ["maintenance or running cost", /maintenance cost|utility cost|running cost|\$[\d,]+ (?:per|a) (?:year|month)/i],
    ["business-use suggestion", /bed and breakfast|wedding venue|event space|rental income|air ?bnb|commercial use/i],
  ]) {
    assert.doesNotMatch(markup, pattern, label);
  }
});

test("keeps gallery and story media paths in their approved directories", async () => {
  const [css, page] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  ]);
  // Gallery entries only; structured-data nodes also carry a `name` field.
  assert.equal((page.match(/\{ name: "/g) ?? []).length, galleryImages.length + galleryVideos.length);
  assert.doesNotMatch(page, /\/property\/(?:wine-cellar|lower-level-gallery|garage-loft)\.webp/);
  assert.doesNotMatch(css, /\.gallery-item \{[^}]*aspect-ratio: 4 \/ 3/);
});

// --- Unit 3: SEO/GEO foundation ------------------------------------------------
// The launch origin is supplied at deploy time, so these exercise both the
// pre-launch (absent SITE_URL) and launch (validated SITE_URL) contracts.

const LAUNCH_ORIGIN = "https://casamarrone.example";

async function withSiteUrl(value, run) {
  const previous = process.env.SITE_URL;
  if (value === undefined) delete process.env.SITE_URL;
  else process.env.SITE_URL = value;
  try {
    return await run();
  } finally {
    if (previous === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = previous;
  }
}

test("validates SITE_URL as a bare HTTPS origin", async () => {
  const { validateSiteUrl, getSiteUrl } = await import("../app/site-url.ts");

  assert.equal(validateSiteUrl(undefined), null);
  assert.equal(validateSiteUrl(""), null);
  assert.equal(validateSiteUrl("https://casamarrone.example"), "https://casamarrone.example");
  assert.equal(validateSiteUrl("https://casamarrone.example/"), "https://casamarrone.example");

  for (const bad of [
    "http://casamarrone.example",
    "casamarrone.example",
    "https://casamarrone.example/listing",
    "https://casamarrone.example?utm=1",
    "https://casamarrone.example#top",
    "not a url",
  ]) {
    assert.throws(() => validateSiteUrl(bad), /SITE_URL/, bad);
  }

  await withSiteUrl(undefined, () => assert.equal(getSiteUrl(), null));
  await withSiteUrl(LAUNCH_ORIGIN, () => assert.equal(getSiteUrl(), LAUNCH_ORIGIN));
});

test("serves crawler rules that stay closed until a launch origin exists", async () => {
  const { robotsFor } = await import("../app/site-url.ts");

  assert.deepEqual(robotsFor(null), { rules: { userAgent: "*", disallow: "/" } });
  assert.deepEqual(robotsFor(LAUNCH_ORIGIN), {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${LAUNCH_ORIGIN}/sitemap.xml`,
  });

  // The route files must stay thin adapters over the validated origin.
  const [robotsSource, sitemapSource] = await Promise.all([
    readFile(new URL("../app/robots.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
  ]);
  assert.match(robotsSource, /robotsFor\(getSiteUrl\(\)\)/);
  assert.match(sitemapSource, /sitemapFor\(getSiteUrl\(\)\)/);
});

test("serves a canonical-only sitemap that stays empty until launch", async () => {
  const { sitemapFor } = await import("../app/site-url.ts");

  assert.deepEqual(sitemapFor(null), []);
  const entries = sitemapFor(LAUNCH_ORIGIN);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].url, LAUNCH_ORIGIN);
});

test("withholds canonical, social and structured data before launch", async () => {
  const html = await (await render()).text();
  const markup = markupOnly(html);

  assert.doesNotMatch(html, /<link[^>]+rel="canonical"/);
  assert.doesNotMatch(html, /property="og:/);
  assert.doesNotMatch(html, /name="twitter:/);
  assert.doesNotMatch(html, /application\/ld\+json/);
  // Framework payloads carry their own "$undefined" sentinels, so scan the markup only.
  assert.doesNotMatch(markup, /undefined|\[object Object\]|SITE_URL/);

  const robotsTxt = await (await render("/robots.txt")).text();
  assert.match(robotsTxt, /User-Agent: \*/i);
  assert.match(robotsTxt, /Disallow: \//);
  assert.doesNotMatch(robotsTxt, /^Allow:/im);
  assert.doesNotMatch(robotsTxt, /Sitemap:/i);

  const sitemapXml = await (await render("/sitemap.xml")).text();
  assert.doesNotMatch(sitemapXml, /<loc>/);
});

test("defers video and llms.txt claims that have no verified source yet", async () => {
  const html = await (await render()).text();
  assert.doesNotMatch(html, /VideoObject/);
  assert.equal((await render("/llms.txt")).status, 404);
});

test("builds a truthful, internally consistent property graph for launch", async () => {
  const { propertyGraphFor } = await import("../app/site-url.ts");
  const graph = propertyGraphFor(LAUNCH_ORIGIN);

  assert.equal(graph["@context"], "https://schema.org");
  const nodes = graph["@graph"];
  assert.deepEqual(nodes.map((node) => node["@type"]), [
    "RealEstateListing",
    "SingleFamilyResidence",
    "ImageObject",
  ]);

  const [listing, residence, image] = nodes;
  const ids = new Set(nodes.map((node) => node["@id"]));
  for (const reference of [
    listing.mainEntity["@id"],
    listing.primaryImageOfPage["@id"],
    listing.offers.itemOffered["@id"],
    residence.photo["@id"],
  ]) {
    assert.equal(ids.has(reference), true, `dangling @id: ${reference}`);
  }
  assert.equal(listing.url, LAUNCH_ORIGIN);

  // `offers` is a CreativeWork property; SingleFamilyResidence is a Place.
  assert.equal("offers" in residence, false);
  assert.equal(listing.offers.price, 1895000);
  assert.equal(listing.offers.priceCurrency, "CAD");
  assert.equal(listing.offers.availability, "https://schema.org/InStock");

  assert.equal(residence.yearBuilt, 1835);
  assert.equal(residence.numberOfBedrooms, 5);
  assert.equal(residence.numberOfBathroomsTotal, 4);
  assert.deepEqual(residence.floorSize, {
    "@type": "QuantitativeValue",
    value: 6553,
    unitCode: "FTK",
  });
  assert.equal(residence.address.postalCode, undefined);
  assert.equal(image.contentUrl, `${LAUNCH_ORIGIN}/property/video/property-overview-desktop-poster.webp`);

  const flattened = JSON.stringify(graph);
  for (const banned of [
    /postalCode/i,
    /seller/i,
    /broker/i,
    /\bagents?\b/i,
    /\bMLS\b/i,
    /lotSize|\bacres?\b/i,
    /lambert/i,
    /VideoObject/,
    /ForSale|ForRent/,
    /historic|heritage/i,
  ]) {
    assert.doesNotMatch(flattened, banned);
  }

  // Next's documented JSON-LD injection escapes `<` before it reaches the page.
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /JSON\.stringify\(propertyGraphFor\(siteUrl\)\)\.replace\(\/<\/g, "\\\\u003c"\)/);
});
