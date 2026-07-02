# portfolio-shot

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](tsconfig.json)

> Automatically capture, optimize, and save screenshots of your web projects for developer portfolios.

[한국어 README](./README.ko.md) · [Wiki](https://github.com/djsy01/portfolio-shot/wiki) · [Contributing](./CONTRIBUTING.md)

Every developer with a portfolio has done this by hand: open the deployed site, click through every page, take a screenshot, crop it, resize it, convert it to WebP, and drop it into `public/screenshots`. **portfolio-shot** automates the whole workflow with one command.

```text
✔ Browser started
… Visiting /
✔ Saved home.webp
… Visiting /projects
✔ Saved projects.webp

Done in 4.2s
```

## Features

- **One command** — capture every page of a deployed site with a single CLI run
- **Playwright-powered** — real Chromium rendering, full-page or viewport screenshots
- **Sharp-powered optimization** — automatic WebP/PNG conversion with configurable quality
- **Zero-config friendly** — `portfolio-shot init` scaffolds a ready-to-edit config
- **Typed config & API** — use it from the CLI or import `generate()` directly in scripts
- **Built for portfolios** — sensible defaults (`networkidle`, full page, WebP @ 90)

## How it works

Running `portfolio-shot generate` does the following, in order:

1. **Load config** — finds `portfolio-shot.config.(ts|js|mjs|cjs|json)` in the current directory (or a path passed via `-c`), validates it, and fills in defaults.
2. **Launch Chromium** — starts a headless Playwright browser and opens one page/context sized to your `viewport`.
3. **Visit each page** — for every entry in `pages`, navigates to `url + path` and waits for the `waitUntil` condition (`networkidle` by default) so the page is fully rendered before capturing.
4. **Capture** — takes a `fullPage` or viewport screenshot as a raw PNG buffer.
5. **Optimize** — pipes the buffer through Sharp: optional `resize`, then WebP/PNG encoding at the configured `quality`.
6. **Save** — writes `<output>/<name>.<format>` (e.g. `public/screenshots/home.webp`), creating the output directory if it doesn't exist.
7. **Report** — logs each step and prints the total duration; a failure on any step is caught and reported as a readable error instead of crashing (see [Troubleshooting](#troubleshooting)).

The same flow is exposed as a plain async function — `generate(config)` — so you can call it from a Node script instead of the CLI. See [Library usage](#library-usage).

## Requirements

- Node.js 18+
- Playwright's Chromium browser (installed automatically by `npm install`, or run `npx playwright install chromium` if it was skipped)

## Install

```bash
npm install --save-dev portfolio-shot
```

## Quick start

```bash
npx portfolio-shot init
```

This creates `portfolio-shot.config.ts` in the current directory:

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

Edit it to match your project, then run:

```bash
npx portfolio-shot generate
```

Screenshots are written to `./public/screenshots/home.webp`, `projects.webp`, etc.

## CLI

| Command                             | Description                             |
| ----------------------------------- | --------------------------------------- |
| `portfolio-shot init`               | Scaffold `portfolio-shot.config.ts`     |
| `portfolio-shot init --force`       | Overwrite an existing config file       |
| `portfolio-shot generate`           | Capture all pages defined in the config |
| `portfolio-shot generate -c <path>` | Use a config file at a custom path      |

## Using it in an existing project

Add it as a script so screenshots regenerate on demand (or as part of your build):

```json
{
  "scripts": {
    "screenshots": "portfolio-shot generate",
    "build": "next build && npm run screenshots"
  }
}
```

For a portfolio site, a typical setup is:

- `url` — your deployed site (e.g. Vercel/Netlify preview or production URL)
- `output` — `./public/screenshots`, so the images ship with your portfolio's static assets
- run `npm run screenshots` locally whenever a project's UI changes, then commit the updated images

## Library usage

```ts
import { generate } from 'portfolio-shot';

const result = await generate({
  url: 'https://example.vercel.app',
  output: './public/screenshots',
  pages: [
    { path: '/', name: 'home' },
    { path: '/projects', name: 'projects' },
  ],
});

console.log(result.pages); // [{ page, file, durationMs }, ...]
```

See [`examples/`](./examples) for a full config and script.

## Configuration reference

| Option      | Type                                                        | Default                        | Description                                   |
| ----------- | ----------------------------------------------------------- | ------------------------------ | --------------------------------------------- |
| `url`       | `string`                                                    | —                              | Base URL of the site to capture (required)    |
| `output`    | `string`                                                    | —                              | Directory to save screenshots into (required) |
| `pages`     | `{ path: string; name: string }[]`                          | —                              | Pages to visit and capture (required)         |
| `format`    | `"webp" \| "png"`                                           | `"webp"`                       | Output image format                           |
| `quality`   | `number` (1–100)                                            | `90`                           | Image quality, applies to WebP encoding       |
| `fullPage`  | `boolean`                                                   | `true`                         | Capture the full scrollable page              |
| `viewport`  | `{ width: number; height: number }`                         | `{ width: 1440, height: 900 }` | Browser viewport size                         |
| `resize`    | `{ width?: number; height?: number }`                       | none                           | Resize the captured image before saving       |
| `waitUntil` | `"load" \| "domcontentloaded" \| "networkidle" \| "commit"` | `"networkidle"`                | Playwright navigation wait condition          |
| `timeout`   | `number` (ms)                                               | `30000`                        | Navigation timeout                            |

Config files can be `.ts`, `.js`, `.mjs`, `.cjs`, or `.json`.

## Error handling

portfolio-shot fails loudly but cleanly — invalid URLs, missing config, navigation timeouts, and browser launch failures are caught and reported as readable errors (exit code `1`) instead of raw stack traces.

## Troubleshooting

| Symptom                                              | Cause                                                              | Fix                                                                                                         |
| ---------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `Failed to launch Chromium...`                       | Playwright's browser binaries aren't installed                     | Run `npx playwright install chromium`                                                                       |
| `Could not find a "portfolio-shot.config..." file`   | No config in the current directory                                 | Run `portfolio-shot init`, or pass `-c <path>`                                                              |
| `Failed to visit "..."` / navigation timeout         | The page never reaches the `waitUntil` state within `timeout`      | Raise `timeout` in your config, or relax `waitUntil` to `"load"` if the site polls in the background        |
| Config `url` / `format` / `quality` rejected at load | Config validation failed                                           | Check the error message — it names the exact field; see [Configuration reference](#configuration-reference) |
| `sharp` fails to install                             | Native binary mismatch (e.g. Apple Silicon vs. Rosetta Node)       | Reinstall with `npm rebuild sharp`, or delete `node_modules` and reinstall with a matching Node arch        |
| Screenshot looks empty/blank                         | Page renders after `waitUntil` fires (client-side rendering delay) | Switch `waitUntil` to `"networkidle"` (default) or increase `timeout`                                       |

More scenarios and deep dives live on the [Wiki](https://github.com/djsy01/portfolio-shot/wiki).

## Architecture

```text
src/
  browser/   Playwright lifecycle (launch, context, navigation, screenshot)
  config/    Config discovery, validation, and defaults
  image/     Sharp-based optimization and format conversion
  cli/       Commander-based CLI (init, generate)
  utils/     Logging
  index.ts   Public library API (generate, defineConfig, loadConfig, types)
```

Each layer only depends on the ones below it, so new capabilities can be added without reshaping existing code — see the roadmap below.

## Roadmap

- **v1.0** — CLI + Playwright + WebP output _(current)_
- **v1.1** — Mobile/tablet viewports, dark mode, PNG support
- **v1.5** — Login flows, cookies, authenticated sessions
- **v2.0** — AI-driven page discovery (`discover` mode)
- **v3.0** — GitHub Actions integration, regenerate only changed pages

## Documentation

Longer guides (getting started, full configuration reference, troubleshooting, roadmap details) live on the [GitHub Wiki](https://github.com/djsy01/portfolio-shot/wiki). The source for those pages is kept in [`wiki/`](./wiki) in this repo and synced automatically on every push to `main`.

## Contributing

Issues and PRs are welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md) for local setup, scripts, and coding conventions.

## License

MIT
