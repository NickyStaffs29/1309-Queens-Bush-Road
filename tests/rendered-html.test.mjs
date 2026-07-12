import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the complete property gallery", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /id="gallery"/);
  assert.equal((html.match(/class="gallery-item item-/g) ?? []).length, 18);
  assert.match(html, /\/property\/aerial-site-plan\.webp/);
  assert.match(html, /\/property\/aerial-neighbourhood\.webp/);
});

test("keeps gallery rows and story images complete at every breakpoint", async () => {
  const [css, page] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.equal((page.match(/^  \["\/property\//gm) ?? []).length, 18);
  assert.match(css, /\.gallery-grid \{[^}]*grid-template-columns: repeat\(3, 1fr\)/);
  assert.match(css, /\.gallery-item \{[^}]*aspect-ratio: 4 \/ 3/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.gallery-grid \{ grid-template-columns: repeat\(2, 1fr\); \}/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.gallery-grid \{ grid-template-columns: 1fr; \}/);
  assert.doesNotMatch(css, /\.story-approach \{[^}]*width: (?:60|78)%/);
  assert.doesNotMatch(css, /\.interior-detail \{[^}]*width: (?:50|68)%/);
});
