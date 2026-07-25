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