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
  for (const heading of ["The setting", "The grounds", "Living &amp; kitchen", "Craft", "Rooms", "Serene Corners"]) {
    assert.match(html, new RegExp(`>${heading}<`));
  }
  assert.doesNotMatch(html, />Quiet views</);
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
  const descriptors = JSON.parse((video.match(/data-hero-clips="([^"]+)"/)?.[1] ?? "[]").replaceAll("&quot;", '"'));
  assert.deepEqual(descriptors, [
    {
      desktop: "/property/video/property-overview-desktop.mp4",
      mobile: "/property/video/property-overview-mobile.mp4",
      mobileObjectPosition: "center",
    },
    {
      desktop: "/property/video/hero-front-driveway-arrival-desktop.mp4",
      mobile: "/property/video/front-driveway-arrival.mp4",
      mobileObjectPosition: "38% 52%",
    },
    {
      desktop: "/property/video/hero-setting-street-approach-desktop.mp4",
      mobile: "/property/video/setting-street-approach.mp4",
      mobileObjectPosition: "35% 48%",
    },
  ]);
  assert.match(html, /\/property\/video\/property-overview-desktop\.mp4/);
  assert.match(html, /\/property\/video\/property-overview-mobile\.mp4/);
  assert.match(html, /\/property\/video\/hero-front-driveway-arrival-desktop\.mp4/);
  assert.match(html, /\/property\/video\/front-driveway-arrival\.mp4/);
  assert.match(html, /\/property\/video\/hero-setting-street-approach-desktop\.mp4/);
  assert.match(html, /\/property\/video\/setting-street-approach\.mp4/);
  assert.match(html, /media="\(max-width: 640px\)"/);
  assert.match(html, /poster="\/property\/video\/property-overview-desktop-poster\.webp"/);
  assert.match(html, /muted=""[^>]*playsInline=""|playsInline=""[^>]*muted=""/);
  assert.match(video, /preload="none"/);
  assert.doesNotMatch(video, /\sloop(?:="")?(?:\s|>)/);
  assert.match(video, /aria-hidden="true"/);
  assert.match(video, /class="hero-video"/);
  assert.doesNotMatch(video, /class="hero-video is-ready"/);
  assert.equal((video.match(/<source\b/g) ?? []).length, 2);
  assert.equal((video.match(/<source\b[^>]*\ssrc=/g) ?? []).length, 0);
  assert.match(html, />Pause video</);
  assert.match(html, /class="hero-video-fallback"/);
});

test("preserves the hero source bytes and approved generated video ceilings", async () => {
  const exactBytes = new Map([
    ["video/property-overview-desktop.mp4", 5520924],
    ["video/property-overview-mobile.mp4", 3283385],
    ["video/setting-street-approach.mp4", 1756445],
  ]);
  for (const [file, expected] of exactBytes) {
    assert.equal((await stat(new URL(`../public/property/${file}`, import.meta.url))).size, expected, file);
  }

  const ceilings = new Map([
    ["video/hero-front-driveway-arrival-desktop.mp4", 12 * 1024 * 1024],
    ["video/front-driveway-arrival.mp4", 6.8 * 1024 * 1024],
    ["video/hero-setting-street-approach-desktop.mp4", 11.5 * 1024 * 1024],
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

test("applies the approved still-image and gallery treatments", async () => {
  const [css, html] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    (async () => (await render()).text())(),
  ]);

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
  assert.match(suite, /\/property\/story\/primary-bedroom-1920\.webp/);
  assert.match(suite, /\/property\/story\/primary-bedroom-porch-view-1920\.webp/);
  assert.match(css, /\.suite-primary \{[^}]*background:\s*var\(--tobacco\)/);
  assert.match(css, /\.suite-primary img \{[^}]*object-fit:\s*contain/);
  assert.match(css, /\.suite-primary img \{[^}]*object-position:\s*center/);

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

test("exposes video controls as plain buttons rather than toggle buttons", async () => {
  const html = await (await render()).text();
  // The label already carries the state, so aria-pressed would announce it twice, and invert it.
  assert.doesNotMatch(html, /aria-pressed/);
  assert.match(html, /class="hero-video-control"/);
  assert.match(html, /class="property-video-control"/);
});

test("gives every text control a 44px touch target", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.text-link \{[^}]*min-height: 44px/);
  assert.match(css, /footer a \{[^}]*min-height: 44px/);
  assert.match(css, /nav a \{[^}]*min-height: 44px/);
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

test("keeps the gallery and the viewing request reachable in the mobile header", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const mobile = css.slice(css.indexOf("@media (max-width: 640px)"));
  // One rule may hide header links, and only the two section anchors.
  const hidden = [...mobile.matchAll(/\n\s*([^\n{}]*nav a[^\n{}]*)\{[^}]*display: none/g)]
    .map(([, selector]) => selector.trim());
  assert.deepEqual(hidden, ['nav a[href="#story"], nav a[href="#details"]']);
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
    ["video/property-overview-desktop.mp4", 7 * 1024 * 1024],
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

test("publishes the private-sale terms and confirmed property facts", async () => {
  const html = await (await render()).text();
  const page = html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? html;
  const detailedClaim = "one natural swimming pool/pond, plus a separate natural pond";
  const grounds = page.match(/<section id="grounds"[\s\S]*?<\/section>/)?.[0] ?? "";
  const details = page.match(/<section id="details"[\s\S]*?<\/section>/)?.[0] ?? "";

  assert.match(html, /<title>[^<]*Casa Marrone[^<]*<\/title>/);
  assert.match(html, /class="facts"[\s\S]*?CAD \$1,895,000[\s\S]*?<\/section>/);

  for (const phrase of [
    "Private sale",
    "CAD $1,895,000",
    "1835",
    "6,553.32 sq. ft. measured",
    "4,490.75 sq. ft. above grade",
    "2,062.57 sq. ft. below grade",
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
  for (const value of ["CAD $1,895,000", ">5<", ">4<", "6,553.32 sq. ft.", ">5<", ">2<"]) {
    const index = factStrip.indexOf(value, factCursor + 1);
    assert.notEqual(index, -1, `fact strip missing ${value}`);
    factCursor = index;
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
    value: 6553.32,
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
