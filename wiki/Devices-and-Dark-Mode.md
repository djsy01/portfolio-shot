# Devices and Dark Mode

By default, `portfolio-shot` captures each page once — at the desktop `viewport` (1440×900), in light mode — with an unsuffixed filename (`home.webp`). This is identical to v1.0 behavior; adding `devices`/`colorSchemes` is entirely opt-in.

## How filename suffixing works

Each configured dimension only adds a suffix when it has **more than one** entry:

| `devices.length` | `colorSchemes.length` | Example filename        |
| ---------------- | --------------------- | ----------------------- |
| 1                | 1                     | `home.webp`             |
| 1                | 2+                    | `home-dark.webp`        |
| 2+               | 1                     | `home-mobile.webp`      |
| 2+               | 2+                    | `home-mobile-dark.webp` |

So a config with just `colorSchemes: ["light", "dark"]` (no `devices`) produces `home-light.webp` / `home-dark.webp` — no device segment, since there's only one device (the default `"desktop"`).

## `devices`

```ts
devices: ['desktop', 'mobile', 'tablet'];
```

Each entry can be:

- **`"desktop"`** — resolves to the top-level `viewport` config (or its default, 1440×900). This is the only preset with no built-in user agent/touch emulation.
- **`"mobile"`** — alias for Playwright's `"iPhone 13"` device descriptor (390×844 logical, 3x scale factor, touch + mobile UA).
- **`"tablet"`** — alias for Playwright's `"iPad (gen 7)"` device descriptor (810×1080 logical, 2x scale factor, touch enabled).
- **Any exact Playwright device name** — the full catalog (100+ devices: iPhones, iPads, Pixels, Galaxy phones/tablets/folds) is available. See the [device descriptor source](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json) for exact names, e.g. `"iPhone 15 Pro"`, `"Pixel 8 Pro"`, `"Galaxy Tab S9"`.
- **A custom object** — full manual control:

  ```ts
  devices: [
    { name: 'wide', viewport: { width: 1920, height: 1080 } },
    { name: 'ultrawide', viewport: { width: 3440, height: 1440 } },
  ];
  ```

  Only `name` and `viewport` are required; `userAgent`, `deviceScaleFactor`, `isMobile`, and `hasTouch` are optional.

An unrecognized string throws `InvalidConfigError` before the browser launches, naming the bad value.

## `colorSchemes`

```ts
colorSchemes: ['light', 'dark']; // or add "no-preference"
```

Playwright emulates the CSS `prefers-color-scheme` media feature accordingly. If your site's dark mode is driven by that media query (rather than, say, a JS toggle that needs a click), this captures both correctly with zero extra config. Sites that toggle dark mode via a button/localStorage flag instead aren't covered by this option — that would need a custom pre-capture step, which isn't supported yet (see [Roadmap](Roadmap)).

## Performance note

Each device × color-scheme combination opens its own browser context (required — Playwright can't change viewport-affecting settings like `isMobile` on an existing context) and re-visits every page in `pages`. A config with 3 devices × 2 color schemes × 5 pages captures 30 screenshots sequentially. There's no parallelism yet; large matrices will take proportionally longer.

See also: [Configuration Reference](Configuration-Reference), [Authentication](Authentication).
