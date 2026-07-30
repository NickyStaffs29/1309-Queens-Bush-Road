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
  "setting-stone-porch-bench",
  "grounds-natural-pool-aerial",
  "grounds-pond-deck",
  "grounds-rear-across-pond",
  "grounds-lawn-fountain",
  "grounds-lawn-deck-pond",
  "grounds-opposite-aerial",
  "living-fireplace",
  "living-dining-room",
  "living-kitchen-island",
  "living-kitchen-island-vertical",
  "living-copper-sink-edge",
  "living-kitchen-piano-connection",
  "craft-range-stone",
  "craft-range-detail",
  "craft-leaded-glass-nook",
  "craft-window-stair",
  "craft-brick-stair-detail",
  "craft-brick-steps-timber-door",
  "rooms-timber-entry",
  "rooms-office-library",
  "rooms-sitting-room",
  "rooms-balcony-cafe",
  "rooms-willow-tree",
  "rooms-bedroom",
  "quiet-timber-hall",
  "quiet-double-vanity",
  "quiet-pond-window-view",
  "quiet-stone-waterfall",
  "quiet-lily-pads",
  "quiet-pond-fountain",
];

test("server-renders the approved six-part property gallery", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /id="gallery"/);
  assert.equal((html.match(/class="gallery-group"/g) ?? []).length, 6);
  assert.equal((html.match(/class="gallery-item /g) ?? []).length, 36);
  for (const heading of ["The setting", "The grounds", "Living &amp; kitchen", "Craft", "Rooms", "Quiet views"]) {
    assert.match(html, new RegExp(`>${heading}<`));
  }
  for (const image of galleryImages) {
    assert.match(html, new RegExp(`/property/gallery/${image}-1440\\.webp`));
  }
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
  assert.equal((html.match(/loading="lazy"/g) ?? []).length >= 44, true);
  assert.equal((html.match(/decoding="async"/g) ?? []).length >= 44, true);
  assert.equal((html.match(/srcSet="/g) ?? []).length >= 44, true);
  assert.equal((html.match(/width="/g) ?? []).length >= 46, true);
  assert.equal((html.match(/height="/g) ?? []).length >= 46, true);
});

test("renders the responsive hero video with still-image fallbacks", async () => {
  const html = await (await render()).text();
  assert.match(html, /\/property\/video\/property-overview-desktop\.mp4/);
  assert.match(html, /\/property\/video\/property-overview-mobile\.mp4/);
  assert.match(html, /media="\(max-width: 640px\)"/);
  assert.match(html, /poster="\/property\/video\/property-overview-desktop-poster\.webp"/);
  assert.match(html, /muted=""[^>]*playsInline=""|playsInline=""[^>]*muted=""/);
  assert.match(html, />Pause video</);
  assert.match(html, /class="hero-video-fallback"/);
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
  assert.match(css, /\.gallery-item\.landscape \{[^}]*grid-column: span 4/);
  assert.match(css, /\.gallery-item\.portrait \{[^}]*grid-column: span 3/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.gallery-group-grid \{[^}]*grid-template-columns: repeat\(2, 1fr\)/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.gallery-item\.landscape \{[^}]*grid-column: 1 \/ -1/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.hero-video \{[^}]*display: none/);
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
  ];
  for (const [file, maxBytes] of files) {
    assert.equal((await stat(new URL(`../public/property/${file}`, import.meta.url))).size <= maxBytes, true, file);
  }

  const storyNames = ["property-plan", "front-arrival", "rear-pond", "covered-porch", "kitchen", "copper-sink", "primary-bedroom", "pond-garden"];
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
    'id="gallery"',
    'id="details"',
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
    "Two natural swimming pools",
    "Municipal services remain current",
    "Chimneys and flues reconstructed in May 2019",
    "60,000 lb",
    "50-amp service",
    "Hard- and soft-water connections",
  ]) {
    assert.equal(html.includes(phrase), true, `missing ${phrase}`);
  }

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
  assert.deepEqual(markup.match(/href="mailto:[^"]*"/g), [`href="${inquiryHref}"`]);
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
  assert.equal((page.match(/name: "/g) ?? []).length, 36);
  assert.doesNotMatch(page, /\/property\/(?:wine-cellar|lower-level-gallery|garage-loft)\.webp/);
  assert.doesNotMatch(css, /\.gallery-item \{[^}]*aspect-ratio: 4 \/ 3/);
});
