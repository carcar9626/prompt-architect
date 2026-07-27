# Category icons

Drop custom category icons here as SVG files, named to match the category's
`id` — e.g. `subject.svg`, `outfit.svg`, `pose-action.svg`.

Then set `icon: "/icons/<name>.svg"` on that category's entry in
[src/lib/prompt-data.ts](../../src/lib/prompt-data.ts) (or in an imported
`customCategories` backup — see [use-prompt-builder.ts](../../src/hooks/use-prompt-builder.ts)).
`icon` is optional; categories without one keep showing their `emoji`.

Recommended format:

- SVG, square `viewBox` (e.g. `0 0 24 24`) so every icon sits the same way
  inside the round badge.
- No hardcoded fill/stroke color — use `fill="currentColor"` (or omit fill
  and rely on `stroke="currentColor"` for line icons) so the icon
  automatically follows the app's text color instead of clashing with
  future theme changes.
- Keep some internal padding in the artwork itself; the badge doesn't crop
  or auto-inset the image.
