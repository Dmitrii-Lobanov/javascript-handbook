import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("generates the current handbook chapters", async () => {
  const content = await readFile(new URL("generated/content.ts", root), "utf8");
  assert.match(content, /JavaScript Runtime Model/);
  assert.match(content, /Scope and Identifier Resolution/);
  assert.match(content, /export const roadmap/);
});

test("enumerates chapter routes at build time", async () => {
  const page = await readFile(new URL("app/chapters/[slug]/page.tsx", root), "utf8");
  assert.match(page, /generateStaticParams/);
  assert.match(page, /dynamicParams = false/);
});

test("ships the handbook reading tools", async () => {
  const [library, controls, markdown] = await Promise.all([
    readFile(new URL("app/components/Library.tsx", root), "utf8"),
    readFile(new URL("app/components/ReaderControls.tsx", root), "utf8"),
    readFile(new URL("app/components/MarkdownContent.tsx", root), "utf8"),
  ]);
  assert.match(library, /Search handbook chapters/);
  assert.match(controls, /handbook-completed/);
  assert.match(markdown, /remarkGfm/);
  assert.match(markdown, /MermaidDiagram/);
});
