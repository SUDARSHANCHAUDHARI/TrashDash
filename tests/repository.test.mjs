import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [gitignore, agents, readme, security, packageJson] = await Promise.all([
  readFile(new URL("../.gitignore", import.meta.url), "utf8"),
  readFile(new URL("../AGENTS.md", import.meta.url), "utf8"),
  readFile(new URL("../README.md", import.meta.url), "utf8"),
  readFile(new URL("../SECURITY.md", import.meta.url), "utf8"),
  readFile(new URL("../package.json", import.meta.url), "utf8"),
]);

test("repository-local ignores cover generated and sensitive files", () => {
  const requiredPatterns = [
    "node_modules/",
    "dist/",
    "coverage/",
    ".env",
    ".env.*",
    "auth.json",
    "credentials.json",
    "local.properties",
    "secure.properties",
    "*.key",
    "*.pem",
    "*.p12",
    "*.jks",
    "*.keystore",
  ];

  requiredPatterns.forEach((pattern) => {
    assert.match(gitignore, new RegExp(`^${escapeRegExp(pattern)}$`, "m"));
  });
});

test("repository guidance preserves privacy and release boundaries", () => {
  assert.match(agents, /Keep the GitHub repository private/);
  assert.match(agents, /Do not create or expand GitHub Actions workflows/);
  assert.match(readme, /pnpm check/);
  assert.match(readme, /Keep the GitHub repository private/);
  assert.match(security, /Report a vulnerability/);
});

test("toolchain metadata is explicit and remains dependency-free", () => {
  const packageData = JSON.parse(packageJson);
  assert.equal(packageData.packageManager, "pnpm@10.28.2");
  assert.equal(packageData.engines.node, ">=18");
  assert.equal(packageData.dependencies, undefined);
  assert.equal(packageData.devDependencies, undefined);
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
