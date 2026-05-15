# Chakra UI Migration Plan

**Branch:** `ui-upgrade`  
**Repo:** [adityaparab/ResumeForgeUI](https://github.com/adityaparab/ResumeForgeUI)  
**Started:** 2026-05-15  
**Status:** 🟡 In Progress

## Background

The Login page was rewritten to use Chakra UI v3 as a pilot. This plan covers the migration of **all remaining components** from a mix of shadcn/ui primitives, `@base-ui/react`, and raw Tailwind CSS to a consistent Chakra UI v3 implementation.

The full migration produces:
- A single, consistent design language powered by Chakra UI v3 semantic tokens
- Automatic light **and** dark mode support on every surface
- Fully responsive layouts (mobile-first, at minimum `base` + `md` + `lg` breakpoints)
- Accessible components (Chakra handles ARIA wiring; we supply meaningful labels)
- Zero remaining shadcn/ui or `@base-ui/react` imports after Step 11

---

## Current Inventory

| Layer | File(s) | Old Library | New Library |
|---|---|---|---|
| Common | `LoadingSpinner.tsx`, `ErrorBoundary.tsx` | Tailwind + shadcn Button | Chakra `Spinner`, `Button` |
| Layout | `MainLayout.tsx`, `Header.tsx`, `Sidebar.tsx` | Tailwind + shadcn Button | Chakra `Flex`, `Box`, `HStack`, `IconButton` |
| Pages – Auth | `Register.tsx` | shadcn/ui full suite | Chakra (match Login design) |
| Pages – Utility | `NotFound.tsx`, `Settings.tsx` | Tailwind HTML | Chakra `Center`, `VStack`, `Card` |
| Feature – Dashboard | `StatsCard.tsx`, `StatsCardSkeleton.tsx`, `Dashboard.tsx` | Tailwind + shadcn Button/Card | Chakra `Card`, `Skeleton`, `SimpleGrid` |
| Feature – Common | `StreamViewer.tsx`, `NotificationBell.tsx`, `NotificationDropdown.tsx` | Tailwind + shadcn Button/Card | Chakra `Badge`, `Float`, `IconButton`, `Card` |
| UI Primitive | `data-table.tsx` | TanStack Table + Tailwind | TanStack Table + Chakra `Table.*` |
| Feature – Resume | `ResumeUploadForm.tsx`, `EditableStructuredContent.tsx`, `ResumeList.tsx`, `ResumeDetail.tsx` | shadcn Button/Card/Input/Textarea | Chakra equivalents |
| Feature – Analysis | `AnalyzeForm.tsx`, `AnalysisList.tsx`, `AnalysisResult.tsx` | shadcn Button/Label/Textarea | Chakra `NativeSelect`, `Textarea`, `Badge`, `Card` |
| Pages – Streaming | `ResumeStream.tsx`, `AnalysisStream.tsx` | Tailwind wrappers | Chakra `Box`, `Center` |
| Cleanup | `button.tsx`, `card.tsx`, `badge.tsx`, `input.tsx`, `label.tsx`, `textarea.tsx` | Delete after migration | — |

---

## Design Principles

1. **Semantic tokens everywhere** — `bg`, `bg.subtle`, `fg`, `fg.muted`, `border.subtle`. Never hard-code hex values unless intentional (e.g., gradient stops).
2. **Brand color palette** — `colorPalette="purple"` for primary actions; `indigo → purple` CSS gradient for hero panels.
3. **Responsive by default** — every layout uses at minimum `{ base, md }` breakpoint props; split layouts add `lg`.
4. **Accessibility first** — `Field.Root` for all form fields, `aria-label` on all icon buttons, semantic heading hierarchy.
5. **No Tailwind `className` strings** in migrated files — all styling via Chakra style props.
6. **Component ≤ 300 lines** — extract sub-components if needed.

---

## Steps

### ✅ Step 0 — Pilot: Login Page *(done)*
- **Issue:** N/A (completed before plan was created)
- **Files:** `src/pages/Login.tsx`, `src/app/providers.tsx`, `src/components/ui/chakra-provider.tsx`
- **Summary:** Installed `@chakra-ui/react @emotion/react next-themes`. Created `ChakraAppProvider`. Rewrote Login with two-column split layout (gradient brand panel + form card), `Field.Root` form fields, password visibility toggle, Chakra `Button loading` state, `ChakraLink asChild` for router links.
- **Commit:** `8606846`

---

### 🔲 Step 1 — Foundation: LoadingSpinner + ErrorBoundary
- **Issue:** [#59 feat(ui): Step 1 — Migrate LoadingSpinner & ErrorBoundary to Chakra UI](https://github.com/adityaparab/ResumeForgeUI/issues/59)
- **Files:** `src/components/common/LoadingSpinner.tsx`, `src/components/common/ErrorBoundary.tsx`
- **Key changes:**
  - `LoadingSpinner`: Replace `animate-spin` border with `<Spinner colorPalette="purple" />`. Map `sm/md/lg` to Chakra sizes. Wrap label in `<Text>`.
  - `ErrorBoundary`: Replace shadcn `Button` with Chakra `Button`. Wrap fallback UI in `<Center>` + `<VStack>`.

---

### 🔲 Step 2 — Layout: MainLayout, Header, Sidebar
- **Issue:** [#57 feat(ui): Step 2 — Migrate Layout to Chakra UI](https://github.com/adityaparab/ResumeForgeUI/issues/57)
- **Files:** `src/components/layout/MainLayout.tsx`, `src/components/layout/Header.tsx`, `src/components/layout/Sidebar.tsx`
- **Key changes:**
  - `MainLayout`: `Flex minH="100dvh"` shell with sidebar + content column.
  - `Header`: `HStack` sticky bar, `IconButton` for hamburger/theme/logout, Chakra `Button` replaces shadcn.
  - `Sidebar`: `Box` fixed/drawer with `VStack` nav items. Active route uses `bg.subtle` + `color="purple.500"`.

---

### 🔲 Step 3 — Auth: Register Page
- **Issue:** [#58 feat(ui): Step 3 — Migrate Register page to Chakra UI](https://github.com/adityaparab/ResumeForgeUI/issues/58)
- **Files:** `src/pages/Register.tsx`
- **Key changes:** Match Login design exactly — same two-column gradient layout, `Field.Root` fields, password show/hide `IconButton`, `Button loading`, `ChakraLink asChild`.

---

### 🔲 Step 4 — Utility Pages: NotFound + Settings
- **Issue:** [#60 feat(ui): Step 4 — Migrate NotFound & Settings pages to Chakra UI](https://github.com/adityaparab/ResumeForgeUI/issues/60)
- **Files:** `src/pages/NotFound.tsx`, `src/pages/Settings.tsx`
- **Key changes:**
  - `NotFound`: `Center + VStack` with large purple "404", Chakra `Button asChild` home link.
  - `Settings`: Proper placeholder `Card.Root` layout with "coming soon" content.

---

### 🔲 Step 5 — Dashboard Feature
- **Issue:** [#61 feat(ui): Step 5 — Migrate Dashboard feature to Chakra UI](https://github.com/adityaparab/ResumeForgeUI/issues/61)
- **Files:** `src/features/dashboard/components/StatsCard.tsx`, `src/features/dashboard/components/StatsCardSkeleton.tsx`, `src/pages/Dashboard.tsx`
- **Key changes:**
  - `StatsCard`: `Card.Root variant="outline"` with `bg="purple.subtle"` icon container.
  - `StatsCardSkeleton`: Chakra `Skeleton` components replacing `animate-pulse`.
  - `Dashboard`: `SimpleGrid` for stat cards, Chakra `Button/Card` for quick actions, error state with `Alert`.

---

### 🔲 Step 6 — Common Features: StreamViewer, NotificationBell, NotificationDropdown
- **Issue:** [#62 feat(ui): Step 6 — Migrate common features to Chakra UI](https://github.com/adityaparab/ResumeForgeUI/issues/62)
- **Files:** `src/features/common/components/StreamViewer.tsx`, `src/features/common/components/NotificationBell.tsx`, `src/features/common/components/NotificationDropdown.tsx`
- **Key changes:**
  - `StreamViewer`: `Box as="pre"` with `fontFamily="mono"`, `Badge` for status, auto-scroll.
  - `NotificationBell`: Chakra `IconButton` + `Float` for unread count badge.
  - `NotificationDropdown`: `Card.Root` popup, Chakra `Button/Badge/Link` replacing shadcn.

---

### 🔲 Step 7 — DataTable Component
- **Issue:** [#63 feat(ui): Step 7 — Migrate DataTable component to Chakra UI Table](https://github.com/adityaparab/ResumeForgeUI/issues/63)
- **Files:** `src/components/ui/data-table.tsx`
- **Key changes:** Keep TanStack React Table logic. Replace Tailwind `<table>` HTML with Chakra `Table.Root`, `Table.Header`, `Table.Body`, `Table.Row`, `Table.ColumnHeader`, `Table.Cell`. Loading uses `Skeleton`, hover uses `_hover={{ bg: "bg.subtle" }}`.

---

### 🔲 Step 8 — Resume Feature
- **Issue:** [#64 feat(ui): Step 8 — Migrate Resume feature to Chakra UI](https://github.com/adityaparab/ResumeForgeUI/issues/64)
- **Files:** `src/features/resume/components/ResumeUploadForm.tsx`, `src/features/resume/components/EditableStructuredContent.tsx`, `src/pages/ResumeList.tsx`, `src/pages/ResumeDetail.tsx`
- **Key changes:**
  - `ResumeUploadForm`: Chakra `Box` drag-drop zone with `_hover`/`_dragOver` style props.
  - `EditableStructuredContent`: Chakra `Card.Root`, `Input`, `Textarea`, `SimpleGrid`, `Button`. Preserve all recursive logic.
  - `ResumeList`: Chakra page layout + `Badge` status colors.
  - `ResumeDetail`: Chakra `Badge`, `Button`, back navigation.

---

### 🔲 Step 9 — Analysis Feature
- **Issue:** [#65 feat(ui): Step 9 — Migrate Analysis feature to Chakra UI](https://github.com/adityaparab/ResumeForgeUI/issues/65)
- **Files:** `src/features/analysis/components/AnalyzeForm.tsx`, `src/pages/AnalysisList.tsx`, `src/pages/AnalysisResult.tsx`
- **Key changes:**
  - `AnalyzeForm`: Chakra `NativeSelect` replaces custom `<select>`, `Textarea`, `Field.Root`.
  - `AnalysisList`: Chakra page layout + `Badge` status colors.
  - `AnalysisResult`: Score circle using Chakra `Box` with `borderRadius="full"`, `Wrap` for tag lists, `Card.Root` sections for strengths/gaps/recommendations/keywords.

---

### 🔲 Step 10 — Streaming Pages
- **Issue:** [#66 feat(ui): Step 10 — Migrate Streaming pages to Chakra UI](https://github.com/adityaparab/ResumeForgeUI/issues/66)
- **Files:** `src/pages/ResumeStream.tsx`, `src/pages/AnalysisStream.tsx`
- **Key changes:** Replace any Tailwind wrapper `className` strings with `Box`/`Center` Chakra props. Both pages delegate rendering to `StreamViewer` (already migrated in Step 6).

---

### 🔲 Step 11 — Cleanup: Remove shadcn/ui Primitives
- **Issue:** [#67 chore(ui): Step 11 — Remove shadcn/ui primitives and clean up dead imports](https://github.com/adityaparab/ResumeForgeUI/issues/67)
- **Files to delete:** `src/components/ui/button.tsx`, `card.tsx`, `badge.tsx`, `input.tsx`, `label.tsx`, `textarea.tsx`
- **Key changes:** Verify zero remaining imports from deleted files. Remove `@base-ui/react` if no other dependents. Update this plan document to mark all steps complete.

---

## Commit & PR Convention

Each step follows this workflow:
1. Implement all changes for the step
2. `yarn lint` → must pass
3. `yarn build` → must pass
4. `git commit -m "feat(ui): step N — <description> [closes #<issue>]"`
5. `git push origin ui-upgrade`
6. Update GitHub issue: add completion comment, close issue
7. Update this plan file (mark step ✅, add commit SHA)

Final step creates a PR: `ui-upgrade` → `main` with migration summary.

---

## Progress Log

| Step | Status | Issue | Commit |
|---|---|---|---|
| 0 – Login Page (pilot) | ✅ Done | N/A | `8606846` |
| 1 – Foundation | 🔲 Todo | [#59](https://github.com/adityaparab/ResumeForgeUI/issues/59) | — |
| 2 – Layout | 🔲 Todo | [#57](https://github.com/adityaparab/ResumeForgeUI/issues/57) | — |
| 3 – Register Page | 🔲 Todo | [#58](https://github.com/adityaparab/ResumeForgeUI/issues/58) | — |
| 4 – Utility Pages | 🔲 Todo | [#60](https://github.com/adityaparab/ResumeForgeUI/issues/60) | — |
| 5 – Dashboard | 🔲 Todo | [#61](https://github.com/adityaparab/ResumeForgeUI/issues/61) | — |
| 6 – Common Features | 🔲 Todo | [#62](https://github.com/adityaparab/ResumeForgeUI/issues/62) | — |
| 7 – DataTable | 🔲 Todo | [#63](https://github.com/adityaparab/ResumeForgeUI/issues/63) | — |
| 8 – Resume Feature | 🔲 Todo | [#64](https://github.com/adityaparab/ResumeForgeUI/issues/64) | — |
| 9 – Analysis Feature | 🔲 Todo | [#65](https://github.com/adityaparab/ResumeForgeUI/issues/65) | — |
| 10 – Streaming Pages | 🔲 Todo | [#66](https://github.com/adityaparab/ResumeForgeUI/issues/66) | — |
| 11 – Cleanup | 🔲 Todo | [#67](https://github.com/adityaparab/ResumeForgeUI/issues/67) | — |
