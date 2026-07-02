# Contributing to portfolio-shot

Thanks for taking a look. This project is small on purpose — please keep contributions focused and consistent with the existing architecture.

## Local setup

```bash
git clone https://github.com/djsy01/portfolio-shot.git
cd portfolio-shot
npm install
npx playwright install chromium   # only needed once
npm run build
```

## Scripts

| Command                | Purpose                              |
| ---------------------- | ------------------------------------ |
| `npm run build`        | Compile `src/` to `dist/` with `tsc` |
| `npm run dev`          | Watch mode compile                   |
| `npm run typecheck`    | Type-check without emitting          |
| `npm run lint`         | ESLint over `src/`                   |
| `npm run format`       | Format the repo with Prettier        |
| `npm run format:check` | Check formatting without writing     |

Before opening a PR, make sure all four of `build`, `typecheck`, `lint`, and `format:check` pass.

## Project layout

```text
src/
  browser/   Playwright lifecycle (launch, context, navigation, screenshot, devices, auth)
  config/    Config discovery, validation, and defaults
  image/     Sharp-based optimization and format conversion
  cli/       Commander-based CLI (init, generate)
  utils/     Logging
  index.ts   Public library API
```

Each layer only imports from the ones below it (`cli` → `index` → `browser`/`config`/`image` → `utils`/`types`/`errors`). Keep it that way — it's what let mobile viewports, dark mode, and auth (v1.1/v1.5) get added without reshaping existing code, and is what `discover` mode and the GitHub Actions integration (v2.0/v3.0, see the [Roadmap](./README.md#roadmap)) will rely on too.

## Conventions

- **No comments unless the WHY is non-obvious.** Well-named functions and types should carry the meaning.
- **Errors are typed.** New failure modes should throw a subclass of `PortfolioShotError` (see [`src/errors.ts`](./src/errors.ts)), not a bare `Error` or an uncaught exception.
- **Defaults live in one place.** `src/config/loadConfig.ts`'s `DEFAULTS` object and `resolveConfig()` — don't scatter fallback values across the codebase.
- **Config validation must cover both entry points.** `resolveConfig()` (called by both `loadConfig()` and `generate()`) is where validation belongs, not just the CLI's file-loading path — otherwise direct `generate()` calls skip it and raw Playwright errors leak through instead of a typed `InvalidConfigError`.
- **Don't implement roadmap items early.** `discover` and the GitHub Actions integration (v2.0/v3.0) are intentionally deferred (see the [Roadmap](./README.md#roadmap)) — the architecture should stay extensible for them, but they're out of scope for now unless a maintainer says otherwise.

## Testing a change manually

There's no test suite yet (see [Roadmap](./README.md#roadmap) items — contributions welcome). To verify a change works end to end:

```bash
npm run build
node dist/cli/index.js init --force   # in a scratch directory with a real deployed URL
node dist/cli/index.js generate
```

## Updating documentation

- User-facing usage docs: [`README.md`](./README.md) and [`README.ko.md`](./README.ko.md) (keep both in sync).
- Longer-form docs (getting started, deep troubleshooting, roadmap detail) live in [`wiki/`](./wiki) and sync to the [GitHub Wiki](https://github.com/djsy01/portfolio-shot/wiki) automatically via [`.github/workflows/wiki-sync.yml`](./.github/workflows/wiki-sync.yml) whenever `wiki/**` changes on `main`.

## Enabling wiki sync (one-time, maintainer only)

The [wiki-sync workflow](./.github/workflows/wiki-sync.yml) pushes [`wiki/`](./wiki) to the repo's GitHub Wiki on every change to `main`, but two things have to be turned on manually first — GitHub doesn't let you `git clone` a wiki that's never had a page created through the UI, and Actions can't push anywhere by default:

1. **Enable the wiki**: repo → Settings → General → Features → check "Wikis".
2. **Create one page to initialize it**: repo → Wiki tab → "Create the first page" → save anything (the workflow will overwrite it on the next sync).
3. **Allow Actions to write**: repo → Settings → Actions → General → Workflow permissions → select "Read and write permissions".
4. Push a change under `wiki/` (or run the workflow manually from the Actions tab) to trigger the first sync.

After that, editing files in `wiki/` and merging to `main` keeps the GitHub Wiki up to date automatically — no manual wiki edits needed.

## Reporting bugs

Open an issue with: your config (redact the real URL if private), the command you ran, and the full error output. If it's a rendering issue (blank/partial screenshot), attach the generated image if you can.
