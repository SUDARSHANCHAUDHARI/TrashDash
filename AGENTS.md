# TrashDash Repository Guidance

## Project boundaries

- Keep TrashDash a dependency-free static project using semantic HTML, CSS, inline SVG,
  and vanilla JavaScript.
- Do not add frameworks, external images, analytics, remote fonts, or a backend unless the
  project owner explicitly changes the product scope.
- Preserve mouse, touch, pen, and keyboard play as well as reduced-motion support.
- Preserve the seven-failure gate and the exact success message:
  `Trash accepted reluctantly.`

## Verification

- Run `pnpm check` after game, markup, styling, or documentation changes.
- Use `pnpm start` for a manual browser playthrough when visual or interaction behavior
  changes.
- Do not add screenshot, recording, or browser-trace artifacts to the repository.

## Git and release

- Use `SUDARSHANCHAUDHARI <sunny.sudarshan@gmail.com>` for commits.
- Stage files by explicit path and keep commits atomic.
- Never commit `.env*`, credentials, keys, local editor state, generated output, or caches.
- Keep the GitHub repository private unless Sudarshan explicitly approves public visibility.
- Do not create or expand GitHub Actions workflows without explicit approval.
