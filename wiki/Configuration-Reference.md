# Configuration Reference

`portfolio-shot` reads `portfolio-shot.config.ts` (or `.js`/`.mjs`/`.cjs`/`.json`) from the current directory, or a path passed via `generate -c <path>`.

## Fields

| Option      | Type                                                        | Default                        | Required |
| ----------- | ----------------------------------------------------------- | ------------------------------ | -------- |
| `url`       | `string`                                                    | —                              | yes      |
| `output`    | `string`                                                    | —                              | yes      |
| `pages`     | `{ path: string; name: string }[]`                          | —                              | yes      |
| `format`    | `"webp" \| "png"`                                           | `"webp"`                       | no       |
| `quality`   | `number` (1–100)                                            | `90`                           | no       |
| `fullPage`  | `boolean`                                                   | `true`                         | no       |
| `viewport`  | `{ width: number; height: number }`                         | `{ width: 1440, height: 900 }` | no       |
| `resize`    | `{ width?: number; height?: number }`                       | none (no resize)               | no       |
| `waitUntil` | `"load" \| "domcontentloaded" \| "networkidle" \| "commit"` | `"networkidle"`                | no       |
| `timeout`   | `number` (ms)                                               | `30000`                        | no       |

### `url`

Base URL of the deployed site. Each page's `path` is resolved against it with the `URL` constructor, so `url: "https://example.com/app"` + `path: "/settings"` → `https://example.com/settings` (path replaces, doesn't append — standard `new URL(path, base)` semantics). Use a full path in `path` if you need the trailing segment preserved.

### `output`

Directory screenshots are written into, created automatically if missing. Relative paths resolve against the current working directory the CLI is run from.

### `pages`

Each entry needs a `path` (what to visit, relative to `url`) and a `name` (output filename, without extension). Both are required strings — validation fails fast with a descriptive error if either is missing.

### `format` / `quality`

`"webp"` (default) or `"png"`. `quality` (1–100) is applied to WebP encoding; PNG is always saved losslessly (`quality` has no effect there since PNG has no lossy quality knob — `resize` still applies).

### `fullPage`

`true` captures the entire scrollable page height; `false` captures only the visible `viewport`.

### `viewport`

Browser window size used for rendering and for `fullPage: false` captures. Defaults to a common desktop size (1440×900).

### `resize`

Optional post-capture resize applied by Sharp before encoding. Only the dimensions you provide are constrained (`fit: "inside"`, no upscaling) — e.g. `{ width: 1280 }` scales proportionally to a max width of 1280px.

### `waitUntil`

Playwright navigation wait condition:

- `"load"` — the `load` event fired
- `"domcontentloaded"` — DOM is parsed, assets may still be loading
- `"networkidle"` (default) — no network connections for 500ms; best for SPAs that fetch data client-side
- `"commit"` — navigation started, don't wait for content — rarely useful here

### `timeout`

Navigation timeout in milliseconds before a page capture is aborted with a `PageCaptureError`.

## Example: full config

```ts
import { defineConfig } from 'portfolio-shot';

export default defineConfig({
  url: 'https://example.vercel.app',
  output: './public/screenshots',
  pages: [
    { path: '/', name: 'home' },
    { path: '/projects', name: 'projects' },
    { path: '/contact', name: 'contact' },
  ],
  format: 'webp',
  quality: 90,
  fullPage: true,
  viewport: { width: 1440, height: 900 },
  resize: { width: 1280 },
  waitUntil: 'networkidle',
  timeout: 30000,
});
```

## Library API

The same shape is accepted by the programmatic API:

```ts
import { generate } from 'portfolio-shot';

const result = await generate({
  url: 'https://example.vercel.app',
  output: './public/screenshots',
  pages: [{ path: '/', name: 'home' }],
});
```

`generate()` returns `{ outputDir, pages: [{ page, file, durationMs }], durationMs }`.

See also: [CLI Reference](CLI-Reference), [Troubleshooting](Troubleshooting).
