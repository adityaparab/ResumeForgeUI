# Project Structure

```
src/
├── app/                    # Redux store, TanStack Query client, providers
├── assets/                 # icons, images
├── components/
│   ├── ui/                 # shadcn/ui + custom reusable (Button, Card, Table, etc.)
│   ├── layout/             # Header, Sidebar, MainLayout
│   └── common/             # Toast, ErrorBoundary, LoadingSpinner, Dropzone
├── features/               # Feature slices (auth, dashboard, analysis, resume)
│   ├── auth/
│   ├── dashboard/
│   ├── analysis/
│   ├── resume/
│   └── common/             # shared hooks, utils
├── hooks/                  # custom TanStack Query hooks
├── lib/                    # utils, api client, zod schemas, cn utility
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
storybook/                  # .stories.tsx
```

All new components must be placed in the correct feature folder or `components/ui` if reusable.