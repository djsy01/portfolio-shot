# Troubleshooting

## `Failed to launch Chromium...`

Playwright's browser binaries aren't downloaded. Run:

```bash
npx playwright install chromium
```

This can happen after a fresh clone, in CI with a cold cache, or if `npm install` ran with network access disabled (the `playwright` package's postinstall download was skipped).

## `Could not find a "portfolio-shot.config..." file`

No config file was found in the current directory. Either:

- run `npx portfolio-shot init` to create one, or
- pass an explicit path: `npx portfolio-shot generate -c ./path/to/config.ts`

## `Failed to visit "..."` / navigation timeout

The page didn't reach the configured `waitUntil` state within `timeout` milliseconds. Common causes:

- **Slow cold start** (serverless/edge deploys) — raise `timeout` (e.g. `60000`).
- **Background polling never goes idle** — `networkidle` waits for no network activity for 500ms; if your app long-polls or keeps a websocket open, that condition may never fire. Switch `waitUntil` to `"load"` or `"domcontentloaded"`.
- **Site is actually down or the URL/path is wrong** — verify the URL resolves in a normal browser first.

## Config field rejected at load time (`url`, `format`, `quality`, `devices`, `colorSchemes`, `auth`, ...)

Config validation runs before anything launches — regardless of whether you use the CLI or call `generate()` directly from a script — and the error message names the exact field and why (e.g. `Config "quality" must be between 1 and 100.`, `Config "colorSchemes" entries must be one of: light, dark, no-preference.`). Cross-check against [Configuration Reference](Configuration-Reference).

## `Unknown device "..."`

A `devices` entry wasn't `"desktop"`, `"mobile"`, `"tablet"`, or an exact Playwright device name. Check spelling against the [Playwright device catalog](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json), or pass a custom object instead: `{ name: "wide", viewport: { width: 1920, height: 1080 } }`. See [Devices and Dark Mode](Devices-and-Dark-Mode).

## `requires the "typescript" package`

You're using a `.ts` config file, but `typescript` isn't installed anywhere resolvable from it. `typescript` is an optional peer dependency — most TypeScript projects already have it. Fix with `npm install --save-dev typescript`, or switch to a `.js`/`.mjs`/`.cjs`/`.json` config. (`portfolio-shot init` and non-`.ts` configs work fine either way — this only affects `.ts` config loading.)

## `Login flow failed: ...`

Something in `auth.login` didn't work — a selector didn't match, or the post-submit wait (`waitForSelector`/`waitUntil`) timed out. To debug:

1. Run the same steps manually in a real browser — confirm `fields[].selector` and `submitSelector` actually match elements on the login page.
2. If the app is slow, raise `auth.login.timeout`.
3. Prefer `waitForSelector` over relying on `waitUntil` — it directly confirms the login succeeded (e.g. wait for an element that only exists once authenticated) instead of just waiting for network activity to settle.
4. Logins requiring 2FA, CAPTCHA, or SSO redirects to a third party aren't supported by the automated `login` flow — use `storageStatePath` or `cookies` with a session obtained another way instead.

See [Authentication](Authentication) for the full config shape and a security note about not committing session data.

## `Failed to apply configured cookies.`

An entry in `auth.cookies` is missing both `url` and `domain` (Playwright requires one or the other). See [Authentication](Authentication).

## `sharp` fails to install or errors at runtime

`sharp` ships prebuilt native binaries per-platform/arch. Mismatches happen most often on:

- **Apple Silicon** with a Node installed under Rosetta (x64) — reinstall Node natively (arm64), then `npm rebuild sharp`.
- **Docker/CI images** that differ from your local dev machine's arch — let `npm install` run inside the target image rather than copying `node_modules` across.

If in doubt: `rm -rf node_modules package-lock.json && npm install`.

## Screenshot is blank, partially rendered, or missing content

The screenshot is taken right after `waitUntil` resolves — if your app renders more content after that point (e.g. a slow client-side fetch that resolves after the network goes briefly idle), you'll capture too early. Fixes, in order of preference:

1. Keep `waitUntil: "networkidle"` (default) — it already waits for network activity to settle.
2. Increase `timeout` if the page is simply slow.
3. If the app never fully "settles" (e.g. animations, polling), this is a known gap — see the [Roadmap](Roadmap) for planned explicit-wait/selector support.

## Output directory / permission errors

`output` is created automatically (`mkdir -p` equivalent) if missing. If creation fails, it's almost always a permissions issue on the target path — check that the process has write access to the resolved `output` directory.

## Still stuck?

Open an issue with your config (redact the real URL if it's private), the exact command you ran, and the full error output — see [CONTRIBUTING](https://github.com/djsy01/portfolio-shot/blob/main/CONTRIBUTING.md#reporting-bugs).
