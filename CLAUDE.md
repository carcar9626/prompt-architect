# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AI_RULES.md

Imported rather than duplicated — AI_RULES.md is the shared source of truth Dyad/Qwen also
reads, so both tools stay aligned on library/styling conventions.

## What this is

PromptDeck — a single-page AI art prompt builder. Users tap visual "token" cards
(subject, style, lighting, camera, mood, setting, quality) to assemble a comma-separated
prompt string for Midjourney/DALL·E/SDXL/Flux, with no backend: all state (selections,
favorites, custom tokens, category order) lives in `localStorage`. Nearly the entire UI is
one route: [src/routes/index.tsx](src/routes/index.tsx) + [src/hooks/use-prompt-builder.ts](src/hooks/use-prompt-builder.ts).

This project is developed via Claude Code and [Dyad](https://dyad.sh) (local `qwen3:coder`
via Ollama) — see git history for `[dyad]`-authored commits made by that tool. It is **not**
connected to Lovable (that ended 2026-07-26). Both tools work in this same checkout and push
to the same GitHub remote — see [AGENTS.md](AGENTS.md) and the Sync Workflow section below
before rewriting any published history.

## Commands

```bash
pnpm dev          # start dev server (vite dev)
pnpm build        # production build
pnpm build:dev    # development-mode build
pnpm lint         # eslint .
pnpm format       # prettier --write .
```

No test suite is configured. Package manager is pnpm (`pnpm-lock.yaml`); `bun.lock` and
`bunfig.toml` also exist but pnpm is the one actually used for scripts.

## Architecture

**Stack**: TanStack Start (file-based SSR framework, React 19) + TanStack Router + TanStack
Query, Tailwind CSS v4 (oklch color tokens) + shadcn/ui (`new-york` style, Radix primitives),
React Hook Form + Zod. See [AI_RULES.md](AI_RULES.md) for per-library conventions (use
shadcn/ui components before hand-rolling, Tailwind over custom CSS, TanStack Query for any
server state, Lucide for icons).

**Routing** ([src/routes/README.md](src/routes/README.md)): file-based, one file = one route.
Don't add `src/pages/` or Next/Remix-style conventions. `__root.tsx` is the only app shell —
preserve its `<Outlet />`. `routeTree.gen.ts` is generated; never hand-edit it.

**Vite config** ([vite.config.ts](vite.config.ts)): almost all plugin wiring (TanStack Start,
React, Tailwind, path aliases, dedupe, error loggers) is supplied by the internal
`@lovable.dev/vite-tanstack-config` package — don't re-add any of the plugins listed in that
file's comment or the app breaks with duplicates. Additional config goes through the
`defineConfig({ vite: {...} })` escape hatch.

**Server error handling**: a deliberate three-layer belt-and-suspenders setup because h3
(TanStack Start's server) sometimes swallows in-handler throws into an opaque
`{"unhandled":true,"message":"HTTPError"}` 500 response that a normal try/catch never sees:

1. [src/start.ts](src/start.ts) — `errorMiddleware` wraps server functions/loaders.
2. [src/server.ts](src/server.ts) — wraps the whole fetch handler, and additionally detects
   and recovers from the h3-swallowed-error case via `normalizeCatastrophicSsrResponse`.
3. [src/lib/error-capture.ts](src/lib/error-capture.ts) — records the last real error from
   global `error`/`unhandledrejection` listeners so `server.ts` can recover a real stack trace
   even after h3 has discarded it.
4. [src/routes/__root.tsx](src/routes/__root.tsx) `errorComponent` — client-side boundary that
   also reports to Lovable's editor telemetry via [src/lib/lovable-error-reporting.ts](src/lib/lovable-error-reporting.ts)
   (a no-op outside the Lovable editor preview).

Don't "simplify" this by collapsing layers — each exists to catch a failure mode the others miss.

**Styling**: [src/styles.css](src/styles.css) is the only stylesheet — imported by `__root.tsx`
via `?url` — and defines all theme tokens (oklch CSS variables, Tailwind `@theme inline`
mapping). There is no `tailwind.config.ts`; Tailwind v4 reads the color scale straight from
these CSS custom properties. (A duplicate, never-imported `src/index.css` theme file existed
here from an earlier Dyad/Qwen theming pass that got wired to the wrong file — removed
2026-07-26. If a from-scratch theme file mysteriously reappears unimported, it's the same
mistake recurring — wire it into `styles.css` instead of adding a new file.)

**Prompt-builder domain model** ([src/lib/prompt-data.ts](src/lib/prompt-data.ts) +
[src/hooks/use-prompt-builder.ts](src/hooks/use-prompt-builder.ts)):

- `CATEGORIES` is the static preset token list (id/label/value/emoji), grouped by category.
- User customization is layered on top rather than mutating presets: `removed` tracks
  preset-token IDs hidden per category, `custom` holds user-added tokens per category,
  and `order` holds category display order. `tokensFor(categoryId)` merges these
  (presets minus removed, plus custom) — always go through it rather than reading
  `CATEGORIES` directly when rendering available tokens.
- Each piece of state persists to its own `localStorage` key and only after initial
  hydration (the `hydrated` flag prevents the hydration read from re-triggering a write).

## Working with c96 (project owner)

- Workflow builder, not a traditional coder — understands system architecture
  and design intent, relies on you for syntax/implementation.
- Wants the reasoning behind implementation choices, briefly — not just a diff.
- Prefers surgical, minimal diffs over rewrites unless a rewrite is explicitly requested.
- Ask clarifying questions before starting if intent is ambiguous — don't guess
  and explain the guess afterward.
- State assumptions explicitly, especially around product/design intent.

## About this repo

- prompt-architect is one app in "DJJPS" — a portfolio of small standalone
  app prototypes. Most are built/iterated in Dyad using local Qwen models via
  Ollama; this one is getting a Claude Code pass specifically for the design
  token system, which Qwen kept losing track of across sessions.
- Originally drafted in Lovable (free tier), then moved to local/Dyad. As of 2026-07-26,
  Lovable involvement has ended entirely; work is now split ~80% Claude Code / 20% Dyad+Qwen.
- Environment: Mac Studio M4 Max, 64GB RAM, macOS Sequoia, Node already set up.

## Sync Workflow

Claude Code and Dyad both work directly in this same local checkout (not separate clones) —
this local copy is the user's actual source of truth. Both push to `origin`
(`https://github.com/carcar9626/prompt-architect`).

- **Start of session**: `git status` / `git fetch` before editing — Dyad runs independently
  of Claude sessions and may have committed+pushed since you last looked.
- **Commits**: normal concise engineering messages (not Dyad's auto-generated
  `[dyad] ...`/`Changes` style). Group by logical change, don't mix unrelated fixes.
- **Push**: push after each finished, verified chunk of work — same auto-push behavior Dyad
  already uses, no need to ask each time. Still always ask before anything destructive
  (force-push, `reset --hard`, rebase/amend of already-pushed commits, `git clean`).
- **Uncommitted work**: don't leave long-lived uncommitted diffs — Dyad edits the same
  working tree and could run concurrently. Commit checkpoints promptly.
- `.dyad/` (Dyad's per-commit screenshot cache) is currently untracked; leave it that way
  unless asked — unclear whether Dyad expects it git-tracked for its own history features.
