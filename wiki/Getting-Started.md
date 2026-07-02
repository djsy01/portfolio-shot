# Getting Started

## Requirements

- Node.js 18+
- Playwright's Chromium browser — installed automatically as part of `npm install` (the `playwright` package runs its own postinstall download). If it was skipped (e.g. offline install, CI cache), run:

  ```bash
  npx playwright install chromium
  ```

- `typescript` in your project, only if you want to use a `.ts` config (optional peer dependency — `.js`/`.mjs`/`.cjs`/`.json` work without it)

## Install

```bash
npm install --save-dev portfolio-shot
```

## Scaffold a config

```bash
npx portfolio-shot init
```

This writes `portfolio-shot.config.ts` in the current directory:

```ts
import { defineConfig } from 'portfolio-shot';

export default defineConfig({
  url: 'https://example.vercel.app',
  output: './public/screenshots',
  pages: [
    { path: '/', name: 'home' },
    { path: '/projects', name: 'projects' },
  ],
  format: 'webp',
  quality: 90,
  fullPage: true,
});
```

Edit `url` to point at your deployed site, and `pages` to match the routes you want captured.

If a config already exists and you want to regenerate it from scratch:

```bash
npx portfolio-shot init --force
```

## Run it

```bash
npx portfolio-shot generate
```

Expected output:

```text
✔ Browser started
… Visiting /
✔ Saved home.webp
… Visiting /projects
✔ Saved projects.webp

Done in 4.2s
```

Screenshots land in `<output>/<name>.<format>` — with the example config above, `./public/screenshots/home.webp` and `./public/screenshots/projects.webp`.

## Next steps

- Capture multiple devices and light/dark mode in one run — [Devices and Dark Mode](Devices-and-Dark-Mode)
- Capture pages behind a login — [Authentication](Authentication)
- Every config field, with examples — [Configuration Reference](Configuration-Reference)

## Project layout (for contributors)

```text
src/
  browser/   Playwright lifecycle (launch, context, navigation, screenshot, devices, auth)
  config/    Config discovery, validation, and defaults
  image/     Sharp-based optimization and format conversion
  cli/       Commander-based CLI (init, generate)
  utils/     Logging
  index.ts   Public library API (generate, defineConfig, loadConfig, types)
```

Next: [Configuration Reference](Configuration-Reference) for every option, or [CLI Reference](CLI-Reference) for command flags.
