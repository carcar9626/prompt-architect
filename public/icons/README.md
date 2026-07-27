# Category icons

The 10 default category icons + `new.svg` (fallback for a category id we
don't otherwise recognize) are wired up in
[src/lib/prompt-data.ts](../../src/lib/prompt-data.ts) via
`DEFAULT_CATEGORY_ICONS` / `resolveCategoryIcon()`, keyed by category `id` —
not by any per-category field yet, so these apply automatically to both the
built-in `CATEGORIES` and any imported personal `customCategories` that use
the same ids. There's no UI to change these per-category yet; treat them as
fixed for now.

| File                | Category id                                     |
| ------------------- | ----------------------------------------------- |
| `subject.svg`       | `subject`                                       |
| `outfit.svg`        | `outfit`                                        |
| `setting.svg`       | `scene-setting`                                 |
| `composition.svg`   | `composition`                                   |
| `pose.svg`          | `pose-action`                                   |
| `spacial_addon.svg` | `spatial-addons`                                |
| `lighting.svg`      | `lighting`                                      |
| `aesthetic.svg`     | `aesthetic`                                     |
| `misc.svg`          | `misc`                                          |
| `custom.svg`        | `custom`                                        |
| `new.svg`           | fallback for any other/unrecognized category id |

A category's own `icon` field (once settable via UI) takes precedence over
this map; categories with neither fall back to `emoji`.

Format actually in use: Streamline Core Neon / Ultimate SVGs, 14×14 or
24×24 `viewBox`, stroke-only, hardcoded to the app's `--primary` purple
(`#8c52ff`) rather than `currentColor` — that's fine here since they're
rendered via `<img>`, which can't inherit page color anyway. Displayed at
18px with `opacity-90` for a slightly softer, minimal look.

`temp/` is a local scratch folder of rejected/unused icon candidates —
gitignored, not shipped.
