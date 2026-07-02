# Authentication

Capture pages that sit behind a login using `auth`. Whatever session `auth` produces (from `storageStatePath`, `cookies`, and/or `login`) is resolved **once** and reused across every device/color-scheme context — the login flow doesn't re-run per variant.

## Three ways to authenticate

### 1. A saved session (`storageStatePath`)

The fastest option — no browser flow runs, Playwright just loads the file:

```ts
auth: {
  storageStatePath: "./storage-state.json",
}
```

The file is a [Playwright storageState JSON](https://playwright.dev/docs/auth#reuse-signed-in-state) (cookies + localStorage per origin). Generate one by running a login once with `saveStorageStatePath` (see below), or by exporting it from `playwright test` / `browser.newContext().storageState()` elsewhere.

### 2. Raw cookies (`cookies`)

When you already have a valid session token (e.g. minted by a backend script) and don't need a full form login:

```ts
auth: {
  cookies: [
    { name: "session", value: "abc123", domain: "example.vercel.app", path: "/" },
    // or: { name: "session", value: "abc123", url: "https://example.vercel.app" },
  ],
}
```

Each cookie needs `name`, `value`, and either `url` or `domain` (+ optional `path`) — matching [Playwright's `addCookies`](https://playwright.dev/docs/api/class-browsercontext#browser-context-add-cookies) requirements. Missing both throws `InvalidConfigError` before anything launches.

### 3. An automated login (`login`)

Fills a form and submits it once, in a scratch browser context, before any pages are captured:

```ts
auth: {
  login: {
    url: "https://example.vercel.app/login",
    fields: [
      { selector: "#email", value: "demo@example.com" },
      { selector: "#password", value: process.env.DEMO_PASSWORD! },
    ],
    submitSelector: "#submit",
    waitForSelector: "#dashboard", // confirms the login actually succeeded
    // waitUntil: "networkidle",   // used if waitForSelector isn't set
    // timeout: 30000,
  },
  saveStorageStatePath: "./storage-state.json", // cache it for next time
}
```

- `fields` are filled with `page.fill(selector, value)` in order — use real CSS selectors (`#id`, `[name="..."]`, etc.), verified in an actual browser first.
- `submitSelector` is clicked after fields are filled.
- `waitForSelector` (recommended) waits for something that only appears once logged in — this is what confirms success and avoids racing the post-submit navigation. If omitted, it falls back to waiting for `waitUntil` (default `"networkidle"`) instead.
- Combine with `saveStorageStatePath` so the _next_ run can skip straight to `storageStatePath` instead of logging in again.

A failure anywhere in this flow (bad selector, timeout, wrong credentials) throws `AuthError` with a readable message — not a raw Playwright stack trace.

## Combining approaches

`storageStatePath` + `cookies` can be combined: the storage state loads first, then the extra cookies are added on top, in the same scratch context. `login` can also be combined with `storageStatePath` (e.g. to start from a partially-authenticated state) — the login step runs after the storage state loads.

## Security

- **Never commit a saved `storageStatePath` file.** It contains live session cookies (and localStorage) — anyone with the file can impersonate that session until it expires. Add it to `.gitignore`.
- **Never hardcode credentials in a config file.** Use environment variables (`process.env.DEMO_PASSWORD`) and keep the real values in a `.env` file (gitignored) or your CI secrets store.
- If running this in CI (e.g. to refresh portfolio screenshots on deploy), store credentials as encrypted secrets and inject them as environment variables at run time — don't echo them into logs (portfolio-shot's own logs never print field values, only selectors and page paths).

## Troubleshooting

Login-specific failures (selector mismatches, timeouts, cookie validation errors) are covered in [Troubleshooting](Troubleshooting).

See also: [Configuration Reference](Configuration-Reference), [`examples/auth-login.config.ts`](https://github.com/djsy01/portfolio-shot/blob/main/examples/auth-login.config.ts).
