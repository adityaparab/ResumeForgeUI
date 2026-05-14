# Component Guide

## UI Components (`src/components/ui/`)

Shadcn/ui components — pre-built, accessible, Tailwind-styled.

| Component | Usage |
|-----------|-------|
| `Button` | `<Button variant="default|ghost|outline" size="default|sm|icon">` |
| `Input` | `<Input type="text|email|password" {...register('field')} />` |
| `Label` | `<Label htmlFor="field-id">Label text</Label>` |
| `Card`, `CardHeader`, `CardContent`, `CardFooter` | Container cards |
| `DataTable` | `<DataTable columns={columns} data={data} />` — sortable table |

## Common Components (`src/components/common/`)

| Component | Description |
|-----------|-------------|
| `ErrorBoundary` | Catches render errors, reports to Sentry, shows fallback UI |
| `LoadingSpinner` | Animated spinner with optional `size` prop |
| `ThemeProvider` | Applies `.dark` class to `<html>` based on Redux theme state |

## Layout Components (`src/components/layout/`)

| Component | Description |
|-----------|-------------|
| `MainLayout` | Authenticated shell: sidebar + header + content area |
| `Header` | Top bar with brand name, dark mode toggle, notifications, user email, sign out |
| `Sidebar` | Navigation sidebar with links to Dashboard, Resumes, Analyses, Settings |

## Feature Components

### Auth

- No standalone components — auth logic lives in `features/auth/hooks/`

### Resume

| Component | File | Description |
|-----------|------|-------------|
| `ResumeUploadForm` | `features/resume/components/ResumeUploadForm.tsx` | Drag-and-drop file upload with validation |

### Analysis

| Component | File | Description |
|-----------|------|-------------|
| `AnalyzeForm` | `features/analysis/components/AnalyzeForm.tsx` | Resume select + job description form |

### Common

| Component | File | Description |
|-----------|------|-------------|
| `StreamViewer` | `features/common/components/StreamViewer.tsx` | Real-time SSE message display |

### Dashboard

| Component | File | Description |
|-----------|------|-------------|
| `StatsCard` | `features/dashboard/components/StatsCard.tsx` | Metric card with title + value |
| `StatsCardSkeleton` | `features/dashboard/components/StatsCardSkeleton.tsx` | Loading skeleton for StatsCard |

## Dark Mode

All components support dark mode via Tailwind `dark:` variants. The `.dark` class is toggled on `<html>` by `ThemeProvider`. Use the Moon/Sun button in the Header to toggle.

## Styling Conventions

- Use `cn()` from `@/lib/utils` for conditional Tailwind class merging
- Never use inline styles
- Use Tailwind v4 `@theme` variables for brand colors

## Testing Components

Each component has a corresponding test in `src/tests/`:

```bash
# Run component tests
yarn test -- --testPathPattern=components
```

All components have 100% test coverage.
