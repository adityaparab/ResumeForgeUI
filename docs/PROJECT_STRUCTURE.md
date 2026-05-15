# Project Structure

```
src/
├── app/                    # Redux store, TanStack Query client, providers
├── assets/                 # icons, images
├── components/
│   ├── layout/             # Header, Sidebar, MainLayout
│   └── common/             # AppSnackbar, ThemeProvider, ErrorBoundary, LoadingSpinner
├── features/               # Feature slices (auth, dashboard, analysis, resume)
│   ├── auth/
│   ├── dashboard/
│   ├── analysis/
│   ├── resume/
│   └── common/             # shared hooks, utils
├── hooks/                  # custom TanStack Query hooks
├── lib/                    # API client and Zod schemas
├── pages/                  # Route components (Dashboard.tsx, Analysis.tsx, etc.)
├── routes/                 # React Router v7 route definitions
├── stores/                 # Redux slices (authSlice, uiSlice)
├── types/                  # Global TypeScript interfaces (from Swagger)
├── tests/                  # MSW handlers, test utilities
└── constants.ts
public/
├── favicon.svg
└── manifest.json (PWA)
tests/e2e/                  # Playwright tests
.storybook/                 # Storybook config and app decorators
```

Material UI primitives are imported directly from MUI packages. New project-specific components should live in the owning feature folder, `components/common`, or `components/layout` depending on their scope.