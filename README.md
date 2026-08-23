# TrashDash

**Version:** 1.0.0 · **Status:** Production-ready private release candidate ·
**License:** MIT

TrashDash is a small, standalone drag-and-drop game about a cartoon trash bin that is
determined not to accept your document. The bin tries seven different excuses before it
finally gives in.

The project is built with semantic HTML, CSS, inline SVG, and vanilla JavaScript. It has
no framework, runtime dependency, external image, tracking script, or backend.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Getting started](#getting-started)
- [How to play](#how-to-play)
- [The bin's excuses](#the-bins-excuses)
- [Project structure](#project-structure)
- [Technical notes](#technical-notes)
- [Accessibility](#accessibility)
- [Verification](#verification)
- [Deployment and release](#deployment-and-release)
- [Browser support](#browser-support)
- [Security](#security)
- [Contributing](#contributing)
- [About](#about)
- [License](#license)

## Features

- Ten shuffled refusal behaviors, with no repeat until the behavior deck is exhausted.
- Seven-attempt progression followed by a final successful drop and celebration.
- Smooth document dragging with mouse, touch, and pen through Pointer Events.
- Complete keyboard play using Space or Enter and the arrow keys.
- Collision detection for both approaching the bin and completing the final drop.
- Generated Web Audio sound effects with an accessible sound toggle.
- Responsive SVG and CSS artwork with no external images or remote fonts.
- Reset and replay controls, live status messages, visible focus states, and reduced-motion
  support.
- No framework, dependency installation, backend, analytics, or persistent user data.

## Technology

| Area | Implementation |
| --- | --- |
| Markup | Semantic HTML5 and ARIA status descriptions |
| Visuals | CSS, inline SVG, responsive layout, and CSS animation |
| Game logic | Vanilla JavaScript and `requestAnimationFrame` |
| Input | Pointer Events, pointer capture, and keyboard events |
| Sound | Generated Web Audio oscillators; no audio files |
| Verification | Node.js built-in test runner and syntax checking |
| Package tooling | pnpm 10.28.2, with zero runtime or development dependencies |

## Getting started

### Prerequisites

- A current version of Chrome, Edge, Firefox, or Safari.
- Node.js 18 or newer and pnpm 10.28.2 to run project checks.
- Python 3 to use the included local static-server command.

### Installation

The GitHub repository is private, so cloning requires access to
[`SUDARSHANCHAUDHARI/TrashDash`](https://github.com/SUDARSHANCHAUDHARI/TrashDash).

```bash
git clone https://github.com/SUDARSHANCHAUDHARI/TrashDash.git
cd TrashDash
pnpm check
pnpm start
```

Then visit `http://localhost:4173`. You can also open `index.html` directly in a modern
browser, although serving the project over HTTP provides the most consistent experience.

Python 3 provides the small static server used by `pnpm start`. There is no build step,
and the command does not upload project data anywhere.

## How to play

- Drag `DRAFT_final_FINAL.doc` toward the trash bin with a mouse, pen, or touch.
- Each approach records one refusal. The bin may run away, change size, disguise itself,
  or reject the document in another way.
- After seven failed attempts, drag the document over the bin and release it.
- Use **Sound on/off** to control generated sound effects or **Reset** to start over.

Keyboard play is supported too: focus the document, press <kbd>Space</kbd> or
<kbd>Enter</kbd> to grab it, move it with the arrow keys, and press <kbd>Space</kbd> or
<kbd>Enter</kbd> again to drop it. Hold <kbd>Shift</kbd> while using an arrow key for a
larger step.

## The bin's excuses

The ten refusal behaviors are shuffled before each game, avoiding immediate repeats:

1. Move away
2. Close its lid
3. Jump to another corner
4. Hide behind a folder
5. Pretend to be a plant pot
6. Become tiny
7. Push the document away
8. Show `Storage Full`
9. Grow wheels and escape
10. Return the document to its starting point

Only seven behaviors appear in one game. On the next valid drop, the bin celebrates and
displays **“Trash accepted reluctantly.”**

## Project structure

```text
TrashDash/
├── index.html              # Semantic game markup and inline SVG artwork
├── styles.css              # Responsive visuals, states, and motion preferences
├── script.js               # Pointer/keyboard input, collisions, behaviors, and audio
├── favicon.svg             # Self-contained SVG site icon
├── tests/
│   ├── project.test.mjs    # Runtime and interaction contract checks
│   └── repository.test.mjs # Repository and release-boundary checks
├── package.json            # Local serve and verification commands
├── AGENTS.md               # Repository-specific development guidance
├── CHANGELOG.md            # User-facing release history
├── SECURITY.md             # Private vulnerability reporting policy
├── .editorconfig
├── .gitignore
├── LICENSE
└── README.md
```

## Technical notes

- **Unified input:** Pointer Events and pointer capture provide the same drag path for
  mouse, touch, and pen input.
- **Smooth movement:** The document follows the pointer with a `requestAnimationFrame`
  interpolation loop while remaining clamped to the desktop.
- **Collision handling:** An expanded rectangle detects an approaching document. A
  stricter overlap-area check is required for the final successful drop.
- **Varied play:** A Fisher–Yates shuffled behavior deck makes refusals random without
  repeating one until the deck has been exhausted.
- **Generated audio:** Short oscillator tones are created with the Web Audio API after a
  user interaction. No sound files are downloaded.
- **Responsive artwork:** All main artwork is SVG or CSS and scales from small phones to
  wide desktop displays.
- **Motion preferences:** `prefers-reduced-motion` removes decorative transitions and
  confetti while preserving every game state and message.

## Accessibility

- The document can be grabbed, moved, and dropped without a pointer.
- Buttons are native controls with visible keyboard focus indicators.
- Attempt results and the final outcome are announced through polite live regions.
- Controls meet a minimum touch-target size and the layout adapts to narrow screens.
- Reduced-motion preferences remove decorative movement while preserving gameplay.
- Sound is optional, can be disabled at any time, and is never required to understand the
  game state.

## Verification

Run the dependency-free checks with Node.js 18 or newer:

```bash
pnpm check
```

This command checks JavaScript syntax and validates the project's required behaviors,
input support, accessibility hooks, reduced-motion rule, generated audio, and lack of
external assets.

## Deployment and release

TrashDash is a static site. Upload the repository contents to any static host, or enable
GitHub Pages for the repository and publish from the root of the default branch. No
environment variables or server configuration are required.

The production runtime consists of `index.html`, `styles.css`, `script.js`, and
`favicon.svg`. `LICENSE` should accompany redistributed copies. Generated release
archives belong in ignored `dist/` and must not be committed.

Before publishing a release:

1. Run `pnpm check`.
2. Serve the site with `pnpm start` and complete one full seven-refusal game.
3. Confirm pointer, keyboard, sound toggle, reset, and reduced-motion behavior.
4. Review `CHANGELOG.md` and the Git diff.
5. Keep the GitHub repository private until the release owner approves public visibility.

## Browser support

TrashDash targets current versions of Chrome, Edge, Firefox, and Safari. The core game
requires Pointer Events, `requestAnimationFrame`, and standard SVG support. Sound is an
optional enhancement and the game remains playable if Web Audio is unavailable.

## Security

TrashDash stores no user data and makes no network requests. Please report potential
vulnerabilities privately using the process in [SECURITY.md](SECURITY.md).

## Contributing

TrashDash is maintained as a focused SudarshanTechLabs project. Before proposing a
change, open an issue describing the user-facing problem and intended behavior. Keep
changes dependency-free, preserve all supported input methods, and run `pnpm check`
before submitting code.

## License

TrashDash is available under the [MIT License](LICENSE).

Copyright © 2026 Sudarshan Chaudhari / SudarshanTechLabs.

---

## About

I'm Sudarshan Chaudhari, a Senior Quality Engineer, Test Automation specialist, and AI systems builder based in Bangkok, Thailand.

I have 13+ years of experience in software quality engineering, working across SaaS, fintech, gaming, web, mobile, cloud, and digital signage platforms. My background combines hands-on test automation with QA leadership, test strategy, CI/CD, release quality, production investigation, and cross-platform validation.

Alongside my professional QA career, I run [SudarshanTechLabs](https://sudarshantechlabs.com/), my independent engineering and product lab where I design, build, test, and ship software across Android, web, AI, cybersecurity, developer tooling, and cross-platform applications.

### What I work on

- ⚙️ **Quality Engineering & Test Automation** — Playwright, Selenium, Cypress, Appium, API testing, automation frameworks, end-to-end testing, CI/CD, release gates, GitHub Actions, risk-based testing, and production validation
- 🤖 **AI Systems & Automation** — AI agents, multi-agent orchestration, MCP servers, AI-assisted QA, prompt tooling, developer workflows, automation systems, and Claude Code plugins
- 📱 **Mobile & Cross-Platform Applications** — Android applications built with Kotlin and Jetpack Compose, Google Play releases, automated build and publishing pipelines, and cross-platform development spanning iOS, web, Windows, and macOS
- 🌐 **Web Applications & Platforms** — Full-stack applications using Next.js, TypeScript, Firebase, Cloudflare, REST APIs, and modern web infrastructure
- 🛠️ **Developer Tooling & CLI Engineering** — Rust, Python, TypeScript, CLI utilities, multi-repository tooling, build automation, release tooling, and engineering productivity systems
- 🛡️ **Cybersecurity & Observability** — Threat detection, log analysis, security auditing, vulnerability assessment, monitoring, and security-focused developer tools
- 📺 **Digital Signage & Device Platforms** — Content validation, playback testing, device compatibility, production investigation, monitoring, and QA across diverse hardware and operating-system environments

My work sits at the intersection of quality engineering, automation, AI, and software development. I approach products with a QA mindset from the beginning: understanding failure modes, designing for testability, automating repetitive work, and building release confidence into the engineering process.

Through SudarshanTechLabs, I also build products and tools from idea to production, covering architecture, development, testing, CI/CD, release automation, monitoring, and ongoing maintenance.

🌐 [sudarshantechlabs.com](https://sudarshantechlabs.com/) · 💼 [LinkedIn](https://linkedin.com/in/sudarshan-chaudhari) · 🐙 [GitHub](https://github.com/SUDARSHANCHAUDHARI) · ✉️ [sunny.sudarshan@gmail.com](mailto:sunny.sudarshan@gmail.com)
