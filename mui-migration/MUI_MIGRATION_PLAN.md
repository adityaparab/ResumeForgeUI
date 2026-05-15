# ResumeForge Material UI Migration Plan

Date: 2026-05-15
Branch: `mui`

## Goal

Rewrite the ResumeForge React UI from the current shadcn/Tailwind component system to React Material UI while preserving the existing business functionality from Redux, TanStack Query hooks, API clients, schemas, and route contracts. The end state should feel like a professional admin dashboard for resume upload, resume review, AI analysis, stream monitoring, and account settings: modern, polished, accessible, responsive, and efficient for repeated use.

This plan supersedes conflicting shadcn/Tailwind-specific rules in `docs/TECH_STACK.md` and `AGENTS.md`. The project structure, strict TypeScript expectations, feature ownership boundaries, unit-test expectations, and one-issue-at-a-time workflow still apply.

## Current Application Analysis

### Current Stack

- React 19, Vite, TypeScript strict, React Router v7.
- Redux Toolkit for auth, active jobs, and theme preference.
- TanStack Query for server data and mutations.
- React Hook Form and Zod for forms and validation.
- Axios API client in `src/lib/api-client.ts` for auth, resume, analysis, status, download, and stream setup.
- UI is currently Tailwind CSS v4 plus shadcn-style components in `src/components/ui` and lucide icons.
- Tests use Vitest, React Testing Library, MSW, vitest-axe, Storybook, and Playwright. E2E Playwright tests are explicitly out of scope for this migration.

### Routes And Screen Inventory

- Public routes: `/login`, `/register`.
- Protected dashboard shell: `MainLayout`, `Header`, `Sidebar`.
- Protected pages: `/`, `/analysis`, `/analysis/stream/:analysisId`, `/analysis/:analysisId`, `/resume`, `/resume/stream/:resumeId`, `/resume/:resumeId`, `/settings`.
- Catch-all: `NotFound`.

### Existing Functional Dependencies To Preserve

- Auth: `useLoginMutation`, `useRegisterMutation`, `useLogoutMutation`, `authSlice`.
- Resume upload/list/detail/edit/download: `useResumeUploadMutation`, `useResumesList`, `resumeApi`, resume schemas.
- Analysis creation/list/detail: `useCreateAnalysisMutation`, `useAnalysesList`, `useResumesForSelect`, `analysisApi`, analysis schemas.
- Streaming: `useStreamJob`, resume/analysis status APIs, active job notification state.
- Dashboard metrics: `useDashboardStats`.
- Notifications: `useNotifications`, active job selectors and reducers.

### UI Replacement Targets

- Replace `src/components/ui/button.tsx`, `badge.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `textarea.tsx`, and `data-table.tsx` with MUI-first primitives or remove them after direct migration.
- Replace Tailwind class usage in all pages, layout, common, and feature components with MUI `Box`, `Stack`, `Grid`, `Paper`, `Card`, `Typography`, `Button`, `Chip`, `TextField`, `Select`, `DataGrid`, `Drawer`, `AppBar`, `Toolbar`, `Menu`, `Popover`, `Alert`, `Snackbar`, `Skeleton`, and `CircularProgress`.
- Replace `lucide-react` icons with `@mui/icons-material`.
- Replace `sonner` toasts with MUI Snackbar/Alert backed by the existing Redux/global UI pattern or a focused notification provider.
- Replace Tailwind dark-mode class toggling with MUI theme color schemes while preserving the Redux `theme` preference value.
- Remove Tailwind/shadcn-only dependencies and config after no imports remain.

## Target UX Direction

### Visual Design

- Build a quiet, premium admin dashboard rather than a landing page.
- Use a persistent desktop navigation rail/drawer with a compact top app bar, temporary mobile drawer, clear breadcrumbs/page titles, and contextual actions.
- Prefer dense but readable operational surfaces: summary metrics, upload panel, recent activity, analysis history, and resume inventory should be scannable at a glance.
- Use a restrained multi-color palette, not a one-note blue/purple surface. Suggested direction: deep ink text, crisp white/near-white surfaces, teal primary action, indigo secondary/action accents, amber warning, emerald success, crimson error, and subtle neutral dividers.
- Keep card radius at or below 8px unless MUI component behavior requires otherwise.
- Avoid nested decorative cards; use `Paper`/`Card` for actual repeated items, data surfaces, dialogs, and forms.
- Use icons in buttons and navigation where helpful; use text buttons only for clear commands.

### Responsive Behavior

- Desktop: permanent navigation drawer, sticky app bar, constrained content width, dashboard grids, DataGrid/table surfaces.
- Tablet: collapsible drawer, two-column card grids where useful, readable form panels.
- Mobile: temporary drawer, bottom-friendly spacing, single-column workflows, non-overlapping controls, full-width primary actions where appropriate.

### Accessibility Requirements

- Preserve route protection behavior and keyboard navigation.
- All icon-only buttons require `aria-label` and tooltip where the icon is not universally obvious.
- Forms must use MUI labels/helper text/error text with stable IDs and React Hook Form/Zod errors.
- Statuses must not rely on color alone; text labels are always visible.
- Streaming output remains `role="log"`/`aria-live="polite"`.
- Data grids/tables expose useful labels and empty/loading states.

## Execution Rules For Every Issue

- Work one GitHub issue at a time.
- Before each issue, read the issue description and inspect the touched files.
- Implement only the issue scope.
- Update tests only for the component, page, or feature in scope.
- Do not modify, implement, or run e2e Playwright tests.
- Use ResumeForge MCP only when API behavior is unclear; otherwise keep current API clients/hooks as source of truth.
- Use MUI MCP/docs for uncertain MUI APIs or component patterns.
- Every terminal command must append `echo "Dolalala"`, and execution must wait until that text appears before continuing.
- Per issue validation: run the targeted unit test command for the touched files, then `yarn lint`, then `yarn build`.
- Use `yarn test` for non-coverage targeted tests and `yarn test:cov` for targeted coverage after the alias exists. Until the alias is added, use the existing `yarn test:coverage` script only if absolutely necessary.
- Commit each completed issue with a Conventional Commit message and push to `origin mui`.
- Update the GitHub issue with progress and close it after the issue is complete.

## Dependency Plan

### Add

- `@mui/material`
- `@mui/icons-material`
- `@mui/x-data-grid`
- `@mui/x-charts`
- `@emotion/react`
- `@emotion/styled`

### Keep

- React, React DOM, React Router, React Hook Form, Zod, Redux Toolkit, React Redux, TanStack Query, Axios, Sentry, Vite PWA, Vitest, RTL, MSW, Storybook, Biome.
- `@tanstack/react-table` only until list screens are migrated to MUI DataGrid.

### Remove After Migration

- `@base-ui/react`
- `@tailwindcss/vite`
- `tailwindcss`
- `tw-animate-css`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `lucide-react`
- `shadcn`
- `sonner`
- `@tanstack/react-table` after all current `ColumnDef`/`DataTable` consumers are removed.

## GitHub Issue Plan

### Issue 1: Disable GitHub Actions During MUI Migration

**Benefit:** Prevents migration work from triggering noisy CI, deploy, and visual-regression runs while the UI is intentionally unstable.

**Detailed Steps:**

1. Disable `.github/workflows/ci.yml`, `.github/workflows/chromatic.yml`, and `.github/workflows/deploy.yml` without deleting them.
2. Preserve the existing workflow contents for later reactivation.
3. Add a short comment in each workflow explaining that it is disabled during the MUI migration.
4. Validate YAML remains parseable.

**Acceptance Criteria:**

- All three workflow files remain in place.
- No workflow runs on `push` or `pull_request` while disabled.
- Manual reactivation path is obvious from the file.
- Targeted validation plus `yarn lint` and `yarn build` complete.

### Issue 2: Install MUI And Remove Initial Build Coupling To Tailwind

**Benefit:** Establishes the Material UI runtime foundation while keeping the existing app bootable.

**Detailed Steps:**

1. Install MUI packages: `@mui/material`, `@mui/icons-material`, `@mui/x-data-grid`, `@mui/x-charts`, `@emotion/react`, `@emotion/styled`.
2. Add a `test:cov` script alias pointing to Vitest coverage so future issue commands match the migration rules.
3. Keep Tailwind dependencies temporarily until all Tailwind classes/imports are removed.
4. Update `docs/TECH_STACK.md` to identify Material UI as the target styling/component system for this branch.
5. Confirm Vite still builds with both systems temporarily present.

**Acceptance Criteria:**

- `package.json` and `yarn.lock` include MUI packages.
- `yarn test:cov` exists.
- Existing shadcn/Tailwind components still compile until replaced.
- `yarn lint` and `yarn build` complete.

### Issue 3: Add MUI Theme, Color Schemes, And App Providers

**Benefit:** Creates the visual foundation for the redesigned admin dashboard and replaces Tailwind dark-mode behavior.

**Detailed Steps:**

1. Create a MUI theme module under `src/app` or `src/components/common` with palette, typography, shape, spacing, breakpoints, shadows, and component overrides.
2. Wrap the app with MUI `ThemeProvider` and `CssBaseline` in `Providers`.
3. Preserve `uiSlice.theme` as the source of truth for `light`, `dark`, and `system` preferences.
4. Replace the current Tailwind class toggling `ThemeProvider` with a MUI-aware color-scheme bridge.
5. Add or update tests covering theme selection and provider rendering.

**Acceptance Criteria:**

- MUI `CssBaseline` is active.
- Theme preference still persists in localStorage via existing Redux action.
- System mode follows `prefers-color-scheme` where practical.
- No visual dependency on the root `dark` Tailwind class remains in new code.
- Relevant provider/theme tests pass, then `yarn lint` and `yarn build` complete.

### Issue 4: Introduce App Shell With MUI AppBar, Drawer, And Navigation

**Benefit:** Replaces the existing basic sidebar/header with a professional responsive dashboard frame.

**Detailed Steps:**

1. Rewrite `MainLayout`, `Header`, and `Sidebar` using MUI `Box`, `AppBar`, `Toolbar`, `Drawer`, `List`, `ListItemButton`, `IconButton`, `Avatar`, `Menu`, `Tooltip`, and responsive breakpoints.
2. Use permanent drawer on desktop and temporary drawer on small screens.
3. Replace lucide layout icons with MUI icons.
4. Keep notification, theme toggle, current user, logout, and route navigation behavior.
5. Update layout Storybook stories or tests only for layout components.

**Acceptance Criteria:**

- Navigation works for all existing routes.
- Active route is visually and accessibly indicated.
- Mobile drawer opens/closes via keyboard and pointer.
- Header actions remain accessible with labels/tooltips.
- Layout tests pass, then `yarn lint` and `yarn build` complete.

### Issue 5: Replace Common Feedback Components And Toast System

**Benefit:** Moves loading, error, notification, and toast feedback into a consistent MUI design language.

**Detailed Steps:**

1. Rewrite `LoadingSpinner` using MUI `CircularProgress`, `LinearProgress`, `Stack`, and `Typography` as needed.
2. Rewrite `ErrorBoundary` fallback with MUI `Alert`, `Paper`, `Button`, and clear recovery action.
3. Replace `sonner` with an app-level MUI Snackbar/Alert service while preserving existing success/error call sites through a small adapter or focused refactor.
4. Rewrite `NotificationBell` and `NotificationDropdown` using MUI `IconButton`, `Badge`, `Popover`/`Menu`, `List`, `Chip`, and `Button`.
5. Update only common feedback and notification tests.

**Acceptance Criteria:**

- Loading, error, toast, and notification states are MUI-styled.
- Existing hooks can still trigger user-friendly success/error messages.
- Notification routing and dismiss/read behavior is unchanged.
- Relevant common component tests pass, then `yarn lint` and `yarn build` complete.

### Issue 6: Migrate Auth Pages To A Polished MUI Public Experience

**Benefit:** Gives first-time and returning users a modern, accessible entry point while preserving auth logic.

**Detailed Steps:**

1. Rewrite `Login` and `Register` with MUI `Container`, `Paper`, `Stack`, `Typography`, `TextField`, `Button`, `Alert`, `Link`, and icons.
2. Preserve React Hook Form and Zod schemas.
3. Add password visibility toggles with MUI `InputAdornment` and `IconButton` if it improves usability.
4. Use responsive layout that looks intentional on desktop and mobile.
5. Update only login/register tests.

**Acceptance Criteria:**

- Login/register validation errors are linked to MUI helper text.
- Mutation pending/error states remain visible and accessible.
- Route links between login/register still work.
- Relevant auth page tests pass, then `yarn lint` and `yarn build` complete.

### Issue 7: Replace Core Primitive Components Or Remove Their Consumers

**Benefit:** Eliminates shadcn wrappers and reduces future migration friction.

**Detailed Steps:**

1. Replace current Button/Card/Badge/Input/Label/Textarea consumers with direct MUI components or MUI-specific local components where repeated behavior is useful.
2. Delete obsolete shadcn primitive wrappers when no imports remain.
3. Keep component APIs only where they meaningfully reduce duplication.
4. Update primitive tests or remove tests that no longer match retained components.

**Acceptance Criteria:**

- No production file imports `@/components/ui/button`, `card`, `badge`, `input`, `label`, or `textarea` unless the file has been intentionally rewritten as a MUI wrapper.
- No `@base-ui/react` or `class-variance-authority` usage remains in production code.
- Relevant primitive tests pass, then `yarn lint` and `yarn build` complete.

### Issue 8: Rebuild Dashboard As A Data-Rich MUI Admin Overview

**Benefit:** Turns the home route into an efficient command center for resume and analysis work.

**Detailed Steps:**

1. Rewrite `Dashboard` with MUI grids, metric cards, quick actions, recent status summary, and responsive panels.
2. Rewrite `StatsCard` and `StatsCardSkeleton` using MUI `Paper`, `Skeleton`, `Stack`, `Typography`, and icons.
3. Preserve `useDashboardStats`, retry behavior, and upload/analyze navigation.
4. Add tasteful MUI X Charts only if backed by available data or useful mock-free derived metrics.
5. Update dashboard and stats tests.

**Acceptance Criteria:**

- Dashboard communicates total resumes, total analyses, loading, error, and retry states.
- Primary upload/analyze actions are clear on desktop and mobile.
- No Tailwind classes remain in dashboard/stat components.
- Relevant dashboard tests pass, then `yarn lint` and `yarn build` complete.

### Issue 9: Migrate Resume Upload And Resume List To MUI Data Surfaces

**Benefit:** Makes the highest-frequency resume workflow feel efficient and professional.

**Detailed Steps:**

1. Rewrite `ResumeUploadForm` with MUI `Paper`, `Button`, `Alert`, drag/drop states, file metadata, and accessible file input behavior.
2. Rewrite `ResumeList` with MUI page header, upload panel, filters/empty states if useful, and MUI DataGrid or MUI Table.
3. Replace status class maps with MUI `Chip` color/variant mapping.
4. Preserve navigation for completed, streaming, and failed resumes.
5. Update only resume upload/list tests.

**Acceptance Criteria:**

- Upload accepts only PDF/DOCX and max 5 MB with accessible errors.
- List displays file, type, status, uploaded date, and actions.
- Responsive layout does not overflow on mobile.
- Relevant resume upload/list tests pass, then `yarn lint` and `yarn build` complete.

### Issue 10: Migrate Analysis Creation And History To MUI

**Benefit:** Makes analysis creation and historical review clearer and faster.

**Detailed Steps:**

1. Rewrite `AnalyzeForm` with MUI `TextField`, `MenuItem`/`Select`, helper text, alert states, and action buttons.
2. Rewrite `AnalysisList` with a MUI page layout, form panel, resume-upload fallback, and MUI DataGrid/Table history surface.
3. Preserve completed-resume selection, create-analysis mutation, streaming navigation, result navigation, and interview-prep placeholder.
4. Update only analysis form/list tests.

**Acceptance Criteria:**

- Analysis form validation remains accessible.
- No-completed-resume fallback still offers upload flow.
- History displays ID, resume ID, status, date, and contextual actions.
- Relevant analysis tests pass, then `yarn lint` and `yarn build` complete.

### Issue 11: Migrate Stream Views And Live Job Output

**Benefit:** Gives long-running resume/analysis jobs a clearer, calmer monitoring experience.

**Detailed Steps:**

1. Rewrite `StreamViewer` with MUI `Paper`, `Chip`, progress indicators, alerts, monospaced output surface, and responsive header.
2. Keep `role="log"`, `aria-live`, auto-scroll, done callback, and failure behavior.
3. Update `ResumeStream` and `AnalysisStream` only as needed for MUI error/loading surfaces.
4. Update stream component/page tests.

**Acceptance Criteria:**

- Idle, connecting, streaming, done, and failed states are visually distinct and text-labeled.
- Stream output remains accessible and readable.
- Done callbacks still navigate after success.
- Relevant stream tests pass, then `yarn lint` and `yarn build` complete.

### Issue 12: Migrate Resume Detail And Structured Content Editor

**Benefit:** Turns extracted resume content into a polished editing workspace.

**Detailed Steps:**

1. Rewrite `ResumeDetail` with MUI page header, back button, status chip, download action, alerts, and responsive layout.
2. Rewrite `EditableStructuredContent` with MUI Accordions or section Papers, `TextField`, `Stack`, `Grid`, sticky save/reset actions if useful, and clear dirty/submitting states.
3. Preserve structured clone update behavior, dirty checks, save/reset mutations, failed-state messaging, and download rules.
4. Update only resume detail/editor tests.

**Acceptance Criteria:**

- Structured fields remain editable for scalar, multiline, nested object, and array values.
- Save/reset behavior is unchanged and accessible.
- Failed/no-content/processing states are clear.
- Relevant resume detail/editor tests pass, then `yarn lint` and `yarn build` complete.

### Issue 13: Migrate Analysis Result Into A Modern Insight Report

**Benefit:** Makes AI analysis output easier to understand, scan, and act on.

**Detailed Steps:**

1. Rewrite `AnalysisResult` with MUI `Grid`, `Paper`, `Card`, `Chip`, `List`, `LinearProgress` or chart/gauge-like score visualization.
2. Preserve normalization logic for varied result payload shapes.
3. Improve sections for match score, summary, strengths, gaps, recommendations, matched keywords, and missing keywords.
4. Preserve failed, processing, no-result, loading, and invalid ID states.
5. Update only analysis result tests.

**Acceptance Criteria:**

- Score and recommendations are prominent without overwhelming the page.
- Strengths/gaps/keywords are readable and responsive.
- Existing result payload test cases still render correctly.
- Relevant analysis result tests pass, then `yarn lint` and `yarn build` complete.

### Issue 14: Build Settings And Polish Not Found/Public Edge Screens

**Benefit:** Completes the application surface and removes placeholder-quality UI.

**Detailed Steps:**

1. Replace `Settings` placeholder with a MUI settings screen for profile summary, theme preference, notification cleanup, API/session hints, and account actions supported by existing state.
2. Rewrite `NotFound` with MUI components and route-safe navigation.
3. Ensure public and protected edge states share the new design language.
4. Update settings/not-found tests.

**Acceptance Criteria:**

- Settings is no longer a placeholder.
- Theme preference can be changed from settings or clearly surfaced through existing header control.
- Not Found screen is responsive and accessible.
- Relevant tests pass, then `yarn lint` and `yarn build` complete.

### Issue 15: Remove Tailwind, shadcn, Lucide, Sonner, And Legacy CSS

**Benefit:** Completes the migration by removing obsolete libraries and configuration.

**Detailed Steps:**

1. Remove Tailwind plugin from `vite.config.ts`.
2. Replace `src/index.css` with a minimal MUI/global CSS baseline supplement if any is still needed.
3. Remove unused `src/App.css` if no longer imported or useful.
4. Remove obsolete dependencies listed in the dependency plan.
5. Delete obsolete `src/components/ui` files only if no MUI wrappers remain there.
6. Remove `cn()` and `src/lib/utils.ts` only if no longer used.
7. Sweep production and test code for `className` Tailwind utility leftovers, `lucide-react`, `sonner`, and shadcn imports.

**Acceptance Criteria:**

- No Tailwind import or Vite plugin remains.
- No `lucide-react`, `sonner`, `@base-ui/react`, `class-variance-authority`, `tailwind-merge`, `clsx`, `shadcn`, or Tailwind package remains in `package.json`.
- No production Tailwind utility class usage remains.
- Targeted cleanup tests, then `yarn lint` and `yarn build` complete.

### Issue 16: Storybook, Accessibility, Documentation, And Final Migration Audit

**Benefit:** Ensures the new MUI app is documented, accessible, and ready for normal CI/deploy reactivation.

**Detailed Steps:**

1. Update Storybook stories for retained common/layout components.
2. Update documentation: `docs/TECH_STACK.md`, `docs/COMPONENTS.md`, and any relevant README sections.
3. Run a final grep audit for forbidden legacy imports and Tailwind utilities.
4. Run focused accessibility tests for changed app surfaces; do not run e2e Playwright.
5. Prepare a final migration summary with screenshots/GIFs if practical.
6. Reactivate GitHub Actions only if explicitly approved after migration validation.

**Acceptance Criteria:**

- Docs describe MUI as the active UI system.
- Storybook stories compile for migrated components.
- Accessibility tests for migrated surfaces pass.
- No legacy UI dependencies remain.
- `yarn lint` and `yarn build` complete.

## Issue Creation Notes

Each GitHub issue should use the matching issue section above as its body, with labels such as `migration`, `mui`, `frontend`, and a scoped label like `layout`, `auth`, `resume`, `analysis`, or `cleanup` when useful.

Suggested title prefix: `MUI Migration: ...`

## Final Done Definition

- The full app runs on Material UI and MUI X where appropriate.
- Existing business functionality remains intact.
- The UI is responsive across mobile, tablet, and desktop.
- Keyboard and screen-reader affordances are preserved or improved.
- Obsolete shadcn/Tailwind/lucide/sonner dependencies are removed.
- Unit tests relevant to each changed component/feature are updated.
- E2E Playwright tests remain untouched and unrun.
- Each migration issue has been implemented, validated, committed, pushed to `origin mui`, updated, and closed.