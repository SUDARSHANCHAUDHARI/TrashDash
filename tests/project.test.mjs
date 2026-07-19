import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [html, css, javascript, packageJson] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../styles.css", import.meta.url), "utf8"),
  readFile(new URL("../script.js", import.meta.url), "utf8"),
  readFile(new URL("../package.json", import.meta.url), "utf8"),
]);

test("the site stays standalone and dependency-free", () => {
  const packageData = JSON.parse(packageJson);
  assert.equal(packageData.private, true);
  assert.equal(packageData.dependencies, undefined);
  assert.equal(packageData.devDependencies, undefined);
  assert.doesNotMatch(html, /<(?:img|script|link)[^>]+(?:src|href)=["']https?:/i);
  assert.doesNotMatch(css, /url\(["']?https?:/i);
  assert.match(html, /<link rel="stylesheet" href="styles\.css"/);
  assert.match(html, /<script src="script\.js"><\/script>/);
});

test("the runtime has no network clients or unsafe HTML injection sinks", () => {
  assert.doesNotMatch(javascript, /\bfetch\s*\(/);
  assert.doesNotMatch(javascript, /\bXMLHttpRequest\b/);
  assert.doesNotMatch(javascript, /\bWebSocket\b/);
  assert.doesNotMatch(javascript, /\.innerHTML\s*=/);
  assert.doesNotMatch(javascript, /insertAdjacentHTML/);
  assert.doesNotMatch(javascript, /\beval\s*\(/);
});

test("all ten requested refusal behaviors are implemented", () => {
  const behaviorIds = [
    "move-away",
    "close-lid",
    "jump-corner",
    "hide-folder",
    "plant-pot",
    "become-tiny",
    "push-document",
    "storage-full",
    "grow-wheels",
    "return-document",
  ];

  behaviorIds.forEach((id) => {
    assert.match(javascript, new RegExp(`id: ["']${id}["']`));
    assert.match(javascript, new RegExp(`case ["']${id}["']`));
  });
});

test("the game tracks seven failures before its exact success message", () => {
  assert.match(javascript, /const REQUIRED_FAILURES = 7/);
  assert.match(html, /id="attempt-count">0 \/ 7/);
  assert.match(html, /Trash accepted reluctantly\./);
  assert.match(javascript, /Trash accepted reluctantly\./);
});

test("pointer, keyboard, and accessible status handling are present", () => {
  ["pointerdown", "pointermove", "pointerup", "pointercancel"].forEach((eventName) => {
    assert.match(javascript, new RegExp(`addEventListener\\(["']${eventName}["']`));
  });
  assert.match(javascript, /setPointerCapture/);
  assert.match(javascript, /releasePointerCapture/);
  assert.match(html, /aria-grabbed="false"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /id="keyboard-help"/);
  assert.match(css, /:focus-visible/);
});

test("responsive motion and generated audio requirements are covered", () => {
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(javascript, /requestAnimationFrame/);
  assert.match(javascript, /AudioContext/);
  assert.match(javascript, /createOscillator/);
  assert.match(html, /id="sound-toggle"/);
  assert.match(html, /id="reset-button"/);
});

test("shared TinyChaos UI and document focus contracts remain intact", () => {
  const sharedTokens = {
    ink: "#15152a",
    paper: "#fff5df",
    coral: "#ff5d5d",
    blue: "#4f7cff",
    butter: "#ffd166",
    mint: "#58d6a9",
    lilac: "#b695ff",
  };

  Object.entries(sharedTokens).forEach(([token, value]) => {
    assert.ok(css.includes(`--${token}: ${value};`), `Missing exact ${token} token`);
  });
  assert.match(html, /href="\.\.\/TinyChaos\/"/);
  assert.match(html, /TrashDash · by Sudarshan Chaudhari/);
  assert.match(html, /class="game-stage"[\s\S]*?id="game-stage"[\s\S]*?tabindex="-1"/);
  assert.match(css, /(?:button|a|\.game-stage):focus-visible[\s\S]*?outline:\s*4px solid var\(--blue\)/);
  assert.match(
    css,
    /\.desktop-document:focus-visible\s*\{[^}]*box-shadow:[^}]*var\(--paper\)[^}]*var\(--ink\)/s,
  );
  assert.doesNotMatch(css, /min-width:\s*320px/);
});
