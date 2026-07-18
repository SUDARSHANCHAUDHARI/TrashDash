# TrashDash

TrashDash is a small, standalone drag-and-drop game about a cartoon trash bin that is
determined not to accept your document. The bin tries seven different excuses before it
finally gives in.

The project is built with semantic HTML, CSS, inline SVG, and vanilla JavaScript. It has
no framework, runtime dependency, external image, tracking script, or backend.

## Play locally

You can open `index.html` directly in a modern browser. For the most consistent local
development experience, serve the folder over HTTP:

```bash
pnpm start
```

Then visit `http://localhost:4173`.

Python 3 provides the tiny static server used by the `start` command. There is no build
step and nothing is uploaded anywhere.

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
│   └── project.test.mjs    # Dependency-free project contract checks
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

## Verification

Run the dependency-free checks with Node.js 18 or newer:

```bash
pnpm check
```

This command checks JavaScript syntax and validates the project's required behaviors,
input support, accessibility hooks, reduced-motion rule, generated audio, and lack of
external assets.

## Deploying

TrashDash is a static site. Upload the repository contents to any static host, or enable
GitHub Pages for the repository and publish from the root of the default branch. No
environment variables or server configuration are required.

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

## License

[MIT](LICENSE) © 2026 Sudarshan Chaudhari
