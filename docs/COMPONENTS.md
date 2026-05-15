# Component Guide

ResumeForge now uses Material UI as its active UI system. Prefer MUI primitives directly for buttons, inputs, cards, dialogs, tables, icons, feedback, and layout. Keep project-specific reusable components small and place them near the feature that owns the behavior.

## Common Components (`src/components/common/`)

| Component | Description |
|-----------|-------------|
| `AppSnackbar` | Global MUI snackbar/alert bridge for toast messages |
| `ErrorBoundary` | Catches render errors, reports to Sentry, and shows an accessible MUI fallback |
| `LoadingSpinner` | Centered MUI progress indicator with `sm`, `md`, and `lg` sizes |
| `ThemeProvider` | Applies the ResumeForge MUI theme, CSS baseline, and color-scheme metadata |

## Layout Components (`src/components/layout/`)

| Component | Description |
|-----------|-------------|
| `MainLayout` | Authenticated shell with responsive sidebar, fixed header, and route outlet |
| `Header` | Top app bar with workspace identity, theme toggle, notifications, user email, and sign out |
| `Sidebar` | Responsive primary navigation for Dashboard, Analyze, Resumes, and Settings |

## Feature Components

### Resume

| Component | File | Description |
|-----------|------|-------------|
| `ResumeUploadForm` | `features/resume/components/ResumeUploadForm.tsx` | MUI upload workflow with validation, status feedback, and job tracking |
| `EditableStructuredContent` | `features/resume/components/EditableStructuredContent.tsx` | Structured resume JSON editor using MUI form controls |

### Analysis

| Component | File | Description |
|-----------|------|-------------|
| `AnalyzeForm` | `features/analysis/components/AnalyzeForm.tsx` | Resume selection and job description form for analysis creation |

### Common Feature Components

| Component | File | Description |
|-----------|------|-------------|
| `NotificationBell` | `features/common/components/NotificationBell.tsx` | Header notification trigger with MUI badge and popover |
| `NotificationDropdown` | `features/common/components/NotificationDropdown.tsx` | Accessible notification dialog for active job updates |
| `StreamViewer` | `features/common/components/StreamViewer.tsx` | Live SSE output panel with polite log announcements and auto-scroll |

### Dashboard

| Component | File | Description |
|-----------|------|-------------|
| `StatsCard` | `features/dashboard/components/StatsCard.tsx` | MUI metric card with tone-aware icon treatment |
| `StatsCardSkeleton` | `features/dashboard/components/StatsCardSkeleton.tsx` | Stable loading skeleton for dashboard metric cards |

## Styling Conventions

- Use the shared MUI theme from `src/app/theme.ts` for palette, typography, shape, and component defaults.
- Use `sx` for component-scoped styling and responsive rules.
- Use MUI layout primitives such as `Box`, `Stack`, `Container`, and `Paper` before adding custom CSS.
- Use MUI icons from `@mui/icons-material` for controls and status affordances.
- Use native MUI accessibility behavior first, then add explicit ARIA labels only where the visible label is not enough.

## Dark Mode

Theme state is stored in Redux as `light`, `dark`, or `system`. `ThemeProvider` resolves the effective palette mode, creates the MUI theme, and updates `data-mui-color-scheme` plus the document `color-scheme` style.

## Storybook

Retained common and layout stories live beside their components. Storybook wraps stories with Redux, TanStack Query, React Router, the MUI theme provider, and the global snackbar so component previews behave like the app shell.

```bash
yarn storybook
yarn build-storybook
```

## Testing Components

Component tests use Vitest and React Testing Library through `src/tests/test-utils.tsx`, which supplies the same app providers used by the runtime.

```bash
yarn test src/tests/components/StatsCard.test.tsx src/tests/LoadingSpinner.test.tsx
```