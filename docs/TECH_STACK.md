# Tech Stack Decisions (May 2026)

- **Framework:** React 19 + Vite 8
- **Language:** TypeScript strict mode
- **UI System:** Material UI, MUI X Data Grid, MUI X Charts, and Emotion
- **Routing:** React Router v7
- **Forms:** React Hook Form + Zod
- **State:** Redux Toolkit v2 for auth/global UI, TanStack Query v5 for server state
- **Testing:** Vitest + React Testing Library + MSW + vitest-axe; Playwright remains available for E2E but is not part of the MUI migration validation loop
- **Lint/Format:** Biome
- **CI/CD:** GitHub Actions, Vercel, and Netlify. Automatic workflow triggers are disabled during migration; manual `workflow_dispatch` remains available.
- **Observability:** Sentry + TanStack Query Devtools
- **Documentation:** Storybook 8 + Chromatic

## UI Direction

Material UI is the active component system. Application screens should compose MUI primitives directly, use `sx` and theme tokens for styling, and use MUI icons for icon-only or icon-plus-text actions. Shared reusable app components live in `src/components/common/`, `src/components/layout/`, or the appropriate `src/features/*/components/` folder.

The former non-MUI styling stack and class-merging utilities have been removed from the application dependency graph.