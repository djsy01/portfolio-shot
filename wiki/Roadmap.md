# Roadmap

The architecture is intentionally layered (`browser` / `config` / `image` / `cli`, all consumed through `index.ts`) so each milestone below can be added without reshaping existing code. None of the items past v1.0 are implemented yet — this page tracks intent, not current behavior.

## v1.0 — current

- CLI (`init`, `generate`) + library API (`generate()`)
- Playwright Chromium capture, full-page or viewport
- Sharp-based WebP/PNG optimization with configurable quality and resize
- Typed config with validation and sensible defaults

## v1.1 — Mobile/tablet, dark mode, PNG

- Device presets (viewport + user agent) for common mobile/tablet sizes
- `colorScheme: "dark" | "light"` — the `BrowserSession` already accepts this option internally, just not yet exposed through config
- PNG support already exists (`format: "png"`); this milestone is about polishing PNG-specific options (compression level, palette)

## v1.5 — Login, cookies, authentication

- Accept a Playwright `storageState` (cookies + localStorage) so protected pages can be captured
- Config-level login flow (fill a form once, save the resulting session, reuse it across pages)
- `BrowserSession` already has a `storageStatePath` hook reserved for this

## v2.0 — AI-driven page discovery (`discover`)

- Instead of manually listing every `path` in `pages`, crawl the site (following internal links up to some depth) and let a model decide which pages are portfolio-worthy
- Will likely be an opt-in `discover: true` config flag or a separate `portfolio-shot discover` command that writes a suggested `pages` array

## v3.0 — GitHub Actions integration

- An official action (or documented workflow) that runs `portfolio-shot generate` on deploy
- Diffing: only regenerate screenshots for pages whose content actually changed, instead of the full set every run

## Contributing to the roadmap

Roadmap items are deliberately not implemented early — see [CONTRIBUTING](https://github.com/djsy01/portfolio-shot/blob/main/CONTRIBUTING.md#conventions). If you want to work on one, open an issue first to align on scope before sending a PR.
