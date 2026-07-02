# Roadmap

The architecture is intentionally layered (`browser` / `config` / `image` / `cli`, all consumed through `index.ts`) so each milestone below can be added without reshaping existing code. **v1.0 through v1.5 are shipped**; v2.0 and v3.0 are not implemented yet — this page tracks intent for those.

## v1.0 — CLI + Playwright + WebP ✅

- CLI (`init`, `generate`) + library API (`generate()`)
- Playwright Chromium capture, full-page or viewport
- Sharp-based WebP/PNG optimization with configurable quality and resize
- Typed config with validation and sensible defaults

## v1.1 — Mobile/tablet, dark mode, PNG ✅

- `devices` config: `"desktop"` / `"mobile"` / `"tablet"` presets (backed by real Playwright device descriptors), any exact Playwright device name, or a fully custom `{ name, viewport }` profile
- `colorSchemes` config: `"light"` / `"dark"` / `"no-preference"`, emulating `prefers-color-scheme`
- Each combination captures independently; filenames get a `-<device>`/`-<colorScheme>` suffix only when more than one is configured — a plain v1.0 config still produces unsuffixed filenames
- PNG support (`format: "png"`, lossless, `resize` still applies)

Details: [Devices and Dark Mode](Devices-and-Dark-Mode).

## v1.5 — Login, cookies, authentication ✅ (current)

- `auth.storageStatePath` — load a previously saved Playwright storageState (cookies + localStorage)
- `auth.cookies` — inject raw cookies directly, without a login flow
- `auth.login` — automate a login form once (fill fields, click submit, wait for confirmation); the resulting session is captured and reused across every device/color-scheme variant for the rest of the run
- `auth.saveStorageStatePath` — persist the session from `login`/`cookies` so future runs can skip straight to `storageStatePath`
- Auth failures surface as typed `AuthError`s, not raw Playwright exceptions

Details: [Authentication](Authentication).

## v2.0 — AI-driven page discovery (`discover`)

- Instead of manually listing every `path` in `pages`, crawl the site (following internal links up to some depth) and let a model decide which pages are portfolio-worthy
- Will likely be an opt-in `discover: true` config flag or a separate `portfolio-shot discover` command that writes a suggested `pages` array

## v3.0 — GitHub Actions integration

- An official action (or documented workflow) that runs `portfolio-shot generate` on deploy
- Diffing: only regenerate screenshots for pages whose content actually changed, instead of the full set every run

## Contributing to the roadmap

Roadmap items are deliberately not implemented early — see [CONTRIBUTING](https://github.com/djsy01/portfolio-shot/blob/main/CONTRIBUTING.md#conventions). If you want to work on `discover` or the GitHub Actions integration, open an issue first to align on scope before sending a PR.
