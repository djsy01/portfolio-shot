# CLI Reference

## `portfolio-shot init`

Scaffolds `portfolio-shot.config.ts` in the current directory.

```bash
npx portfolio-shot init
```

| Flag          | Description                       |
| ------------- | --------------------------------- |
| `-f, --force` | Overwrite an existing config file |

Fails with a warning (exit code `1`) if a config already exists and `--force` isn't passed.

## `portfolio-shot generate`

Loads the config and captures every page defined in `pages`.

```bash
npx portfolio-shot generate
```

| Flag                  | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| `-c, --config <path>` | Use a config file at a custom path instead of auto-discovery |

Exit code is `0` on success, `1` if config loading or capture fails — errors are printed as readable messages (`✖ ...`), not raw stack traces.

## Global flags

| Flag            | Description                 |
| --------------- | --------------------------- |
| `-V, --version` | Print the installed version |
| `-h, --help`    | Show help for a command     |

## Exit codes

| Code | Meaning                                                                 |
| ---- | ----------------------------------------------------------------------- |
| `0`  | Success                                                                 |
| `1`  | Config not found/invalid, navigation failure, or browser launch failure |

See [Troubleshooting](Troubleshooting) for what to do about each failure mode.
