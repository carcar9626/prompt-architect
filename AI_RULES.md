# AI Rules for PromptDeck

## Tech Stack Overview

- **Framework**: TanStack Start with React 19 and React Router for routing
- **Styling**: Tailwind CSS with custom oklch color system and shadcn/ui components
- **State Management**: TanStack Query for data fetching and state management
- **Form Handling**: React Hook Form with Zod resolvers for form validation
- **UI Components**: shadcn/ui library components built on Radix UI primitives
- **TypeScript**: Strongly typed codebase with comprehensive type definitions
- **Build Tooling**: Vite with TanStack Start configuration for development and production builds

## Library Usage Rules

1. **For UI Components**: Use shadcn/ui components when available, customizing only through Tailwind classes or props
2. **For Styling**: Prefer Tailwind CSS utility classes over custom CSS files; use theme variables for consistent design
3. **For State Management**: Use TanStack Query for server state and caching; React's useState/useEffect for local component state
4. **For Forms**: Use React Hook Form with Zod for validation, following the existing form patterns in the codebase
5. **For Icons**: Use Lucide React icons for all UI icons, maintaining consistency with existing icon usage
6. **For Data Fetching**: Use TanStack Query's useQuery/useMutation hooks for all API/data interactions
7. **For Routing**: Follow TanStack Router conventions; avoid creating new routing patterns outside of the established system
8. **For Type Safety**: Maintain strict TypeScript types throughout, using Zod schemas for data validation where appropriate
9. **For Performance**: Implement proper React.memo and useCallback patterns where needed to prevent unnecessary re-renders
10. **For Accessibility**: Ensure all components follow WCAG guidelines with proper ARIA attributes and semantic HTML

## Design Tokens

Current theme: **Studio Cyber-Violet**. All values are defined once, in `:root` in
[src/styles.css](src/styles.css) — there is no `tailwind.config.ts` in this project;
Tailwind v4 reads the color scale straight from these CSS custom properties via the
`@theme inline` block in the same file. Never hardcode a hex/oklch color in a component;
reference the variable (`bg-primary`, `border-border`, `var(--shadow-neon)`, etc.).

`src/index.css` exists but is **not imported anywhere** — it's a leftover from an earlier
theming pass. Editing it has no visual effect. Always edit `src/styles.css`.

| Variable                                                                                | Resolved oklch                                         | Source hex                                            | Role                                                                                             |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `--background`                                                                          | `oklch(0.151 0.0064 285.61)`                           | `#0B0B0E`                                             | App background                                                                                   |
| `--card` / `--popover`                                                                  | `oklch(0.1822 0.0143 291.46)`                          | `#121118`                                             | Panel/container fill                                                                             |
| `--border` / `--input`                                                                  | `oklch(0.2648 0.0335 294.19)`                          | `#262234`                                             | 1px borders, input borders                                                                       |
| `--primary` / `--ring`                                                                  | `oklch(0.5999 0.2412 293.08)`                          | `#8C52FF`                                             | Primary accent, focus ring                                                                       |
| `--primary-foreground` / `--neon-foreground`                                            | `oklch(1 0 0)`                                         | `#FFFFFF`                                             | Text/icons on primary or neon fills                                                              |
| `--neon`                                                                                | `oklch(0.6464 0.2149 296.01)`                          | `#9D68FF`                                             | Secondary/hover accent                                                                           |
| `--muted`                                                                               | `oklch(0.2821 0.0257 294.52)`                          | `#2A2735`                                             | Muted/inactive surface                                                                           |
| `--muted-foreground`                                                                    | `oklch(0.6439 0.0313 294.24)`                          | `#8E8A9F`                                             | Muted/micro-copy text                                                                            |
| `--foreground` / `--card-foreground` / `--secondary-foreground` / `--accent-foreground` | `oklch(0.97 0.005 291)`                                | — (re-hued from prior neutral gray, no explicit spec) | Default text on dark surfaces                                                                    |
| `--secondary`                                                                           | `oklch(0.28 0.02 291)`                                 | — (re-hued, no explicit spec)                         | Secondary surface (shadcn `Badge`/`Sheet`/`Button` only — not rendered on the main route)        |
| `--accent`                                                                              | `oklch(0.32 0.05 291)`                                 | — (re-hued, no explicit spec)                         | Hover accent surface (currently unused in the live route)                                        |
| `--surface`                                                                             | `oklch(0.205 0.015 291)`                               | — (re-hued, no explicit spec)                         | Defined for future use; not consumed by any utility class today                                  |
| `--destructive` / `--destructive-foreground`                                            | unchanged                                              | `oklch(0.65 0.24 25)`                                 | Intentionally left red — out of scope for the violet theme                                       |
| `--gradient-neon`                                                                       | `linear-gradient(135deg, var(--primary), var(--neon))` | —                                                     | The "glow" gradient token; references `--primary`/`--neon` instead of duplicating literal colors |
| `--shadow-neon`                                                                         | `0 0 16px oklch(from var(--primary) l c h / 0.35)`     | rgba(140,82,255,0.35) equivalent                      | The "glow" box-shadow token — apply via the `shadow-neon` utility or `focus:shadow-neon`         |

Values were computed precisely from the source hex codes via the `culori` npm package
(`converter("oklch")`), not approximated by hand — see the theme-change commit for the
conversion script if you need to regenerate any of them.

Font stack (`--font-sans`) already satisfies the brief's "Inter, system-ui, SF Pro Display"
requirement — it lists `"Inter", ui-sans-serif, system-ui, -apple-system, "SF Pro Display", "Segoe UI", sans-serif` — and was left unchanged.
