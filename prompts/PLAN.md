# Resume Analyzer Frontend - Implementation Plan

**Project Name:** `resume-forge-ui`  
**Repository:** https://github.com/YOUR-USERNAME/resume-forge-ui (create if not exists)  
**Target Completion:** Production-ready, fully tested, deployable web app, aesthetically beautiful, fully responsive webapp  
**Current Date:** May 13, 2026  

## Project Goals (2026 Production Standards)
- React 19 + Vite 6 + TypeScript 5.6 (strict + `satisfies` + `noUncheckedIndexedAccess`)
- Tailwind CSS v4 + shadcn/ui +  @ai-elements (latest with `cn` utility and Radix primitives)
- React Router v7 (file-based routing + data loaders/actions + future flags)
- TanStack Query v5 (server state) + Redux Toolkit v2 (UI + optimistic updates + RTK Query where beneficial)
- Zod + React Hook Form + @hookform/resolvers for validation
- Full a11y (ARIA, focus management, screen-reader tested)
- Dark/light mode (system preference + toggle)
- 100% test coverage (Vitest + RTL)
- Observability: Sentry, React Error Boundaries, TanStack Query Devtools
- CI/CD: GitHub Actions (lint, test, build, preview, deploy to Railway app)
- Security: JWT handling (httpOnly cookies + refresh token rotation), rate-limit awareness, input sanitization
- Performance: Code splitting, React Compiler (if enabled), lazy loading, virtualized lists
- DX: Biome (formatter + linter), Husky + lint-staged, Storybook 8, Chromatic, GitHub MCP integration for issue-driven development
- Additional 2026 best practices: Turbopack-ready config, React Server Components readiness (where possible), proper error boundaries, loading states, optimistic UI, infinite scroll where applicable, PWA manifest (optional but included)

## Application Flow Summary
- Public: Login / Register (email/password + JWT)
- Protected: Header + Sidebar + Main content
- Routes (React Router v7):
  - `/` → Dashboard
  - `/analysis` → Analysis list + new analysis form
  - `/analysis/stream/:analysisId` → Live streaming view
  - `/analysis/:analysisId` → Final result view
  - `/resume` → Resume list + new resume form
  - `/resume/stream/:resumeId` → Live resume processing
  - `/resume/:resumeId` → Editable resume form (structured data)
  - `/settings` → User settings
- Sidebar items: Dashboard, Analyze, Resumes, Settings
- Header: Logo, Notifications (badge + dropdown for ongoing jobs), GitHub link, Sign out

## API Integration Notes
- Base URL: `http://localhost:3001`
- Swagger: `http://localhost:3001/docs` (use this to discover exact endpoints, request/response shapes)
- Auth: JWT returned on login/register → stored securely in Redux + httpOnly cookie fallback
- Streaming: SSE (will inspect Swagger and implement with `EventSource` + TanStack Query)
- File uploads: PDF/DOCX ≤ 5MB with drag & drop
- GitHub MCP configured in the VSCode workspace
- @shadcn/ui MCP configured in the VSCode workspace

## High-Level Phases & Bite-Size GitHub Issues

### Phase 0: Project Bootstrap (Issues #1–#8)
1. **#1** - Create Vite + React 19 + TypeScript 5.6 app with strict config, Tailwind v4, shadcn/ui init, Biome setup.
2. **#2** - Set up folder structure (see PROJECT_STRUCTURE.md), add .env.example, gitignore, Husky + lint-staged.
3. **#3** - Configure React Router v7 with file-based routing, protected routes, and auth loader.
4. **#4** - Add Redux Toolkit v2 + TanStack Query v5 with devtools and persistence (auth slice).
5. **#5** - Implement Zod schemas for all expected API responses (auth, resume, analysis) based on Swagger.
6. **#6** - Create API client (axios instance with interceptors for JWT refresh + error handling).
7. **#7** - Add global error boundary, toast provider (sonner), loading spinner component, and responsive layout skeleton.
8. **#8** - Set up Vitest + RTL + MSW, Playwright E2E, and GitHub Actions CI pipeline (lint, test, build).

### Phase 1: Authentication & Layout (Issues #9–#15)
9. **#9** - Login/Register pages with full validation, error reporting, React Hook Form + Zod.
10. **#10** - Auth slice (Redux) + TanStack Query mutation for login/register + protected route guard.
11. **#11** - Top Header Bar component (logo, notifications placeholder, GitHub link, sign-out).
12. **#12** - Responsive Sidebar (Dashboard, Analyze, Resumes, Settings) with active state and mobile drawer.
13. **#13** - Main layout wrapper with sidebar + outlet, dark mode toggle, responsive breakpoints.
14. **#14** - Notification system (badge + dropdown for ongoing resume activities) using TanStack Query polling/subscription. **Done:** Header notification bell now shows unread counts, lists active and completed jobs, polls resume/analysis status, supports read/dismiss/clear actions, and raises persistent terminal toasts.
15. **#15** - Storybook setup for Header, Sidebar, Layout components + Chromatic integration. **Done:** Storybook 8 React/Vite configuration now wraps stories with app providers, includes Header/Sidebar/MainLayout plus common component stories, documents Storybook commands, and adds Chromatic CI publishing when `CHROMATIC_PROJECT_TOKEN` is configured.

### Phase 2: Core Features - Dashboard & Upload/Analyze Components (Issues #16–#25)
16. **#16** - Dashboard page: summary cards (resumes uploaded, analysed), reusable stats component.
17. **#17** - Resume Upload component (nickname, drag/drop PDF/DOCX, 5MB validation, submit/reset).
18. **#18** - Analyze component (resume dropdown via TanStack Query, job description textarea, full validation).
19. **#19** - Integrate upload and analyze mutations with optimistic updates and Redux UI state.
20. **#20** - Dashboard integration of upload + analyze sections with proper loading/error states.
21. **#21** - Create reusable DataTable component (for analysis/resume lists) with TanStack Table v8.
22. **#22** - Analysis list page (`/analysis`) + table with download & "Interview prep" buttons.
23. **#23** - Resume list page (`/resume`) mirroring analysis list (reuse table component).
24. **#24** - Add route guards and navigation logic for all protected pages.
25. **#25** - Full responsive testing + mobile-first Tailwind classes for all pages so far.

### Phase 3: Streaming & Results (Issues #26–#35)
26. **#26** - Analysis stream page (`/analysis/stream/:analysisId`) – resume name, live SSE/WebSocket stream UI, status indicator.
27. **#27** - Resume stream page (`/resume/stream/:resumeId`) – identical but different routes (reuse stream component).
28. **#28** - Analysis result page (`/analysis/:analysisId`) – display structured results, download button, validation check.
29. **#29** - Resume details page (`/resume/:resumeId`) – editable form based on analysis structure (Zod + RHF).
30. **#30** - Implement streaming logic (EventSource + TanStack Query subscription or RTK Query).
31. **#31** - Toast notifications for invalid analysisId, completion, errors.
32. **#32** - Download resume PDF/JSON functionality (blob handling).
33. **#33** - Interview preparation placeholder button (future expansion).
34. **#34** - Full form validation + optimistic updates on resume editing page.
35. **#35** - Real-time progress indicators and disconnect/reconnect handling.

### Phase 4: Polish, Testing, Observability & Deployment (Issues #36–#50)
36. **#36** - 100% test coverage: unit tests for every component, integration tests for forms/API.
37. **#37** - Playwright E2E tests for login → dashboard → upload → analysis flow.
38. **#38** - Sentry integration + performance monitoring.
39. **#39** - Accessibility audit (axe + manual screen reader).
40. **#40** - Dark mode full implementation + theme provider.
41. **#41** - PWA manifest + service worker (optional offline resume list).
42. **#42** - Environment-specific configs (dev/prod) + Vercel/Netlify deployment.
43. **#43** - README.md with setup, API integration notes, testing commands.
44. **#44** - Documentation: component stories, API client usage guide.
45. **#45** - Code splitting & lazy loading for heavy pages (stream/result).
46. **#46** - Final responsive QA across mobile/tablet/desktop.
47. **#47** - Security review (no sensitive data in localStorage, proper headers).
48. **#48** - GitHub Actions deploy preview + production workflow.
49. **#49** - Final lint, type-check, build verification.
50. **#50** - Release v1.0.0 + demo deployment link.

### Post-Plan Gap Remediation (Issues #51–#56)
51. **#51** - Gap Stage 2: Analysis page status-aware actions and upload fallback. **Done:** Analysis history now shows stream-only actions for queued/pending/processing analyses, result/interview actions only for completed analyses, failure details for failed analyses, and an upload-resume fallback when no completed resumes exist. Uploading from the fallback navigates to the resume stream workflow.
52. **#52** - Gap Stage 3: Resume page status-aware actions and failure routing. **Done:** Resume history now shows stream-only actions for queued/pending/processing extraction, the View action only for completed resumes, and failure details for failed extraction. Resume detail also surfaces failed extraction error text when available.
53. **#53** - Gap Stage 4: Stream display chunk rendering and auto-follow scroll. **Done:** Stream events now render only user-visible chunk text from structured SSE payloads, ignore hidden metadata fields, preserve friendly failure messages, and use an internally scrollable live log that follows new output while streaming. Unit and E2E coverage exercise structured chunks, history payloads, failures, and auto-scroll behavior.
54. **#54** - Gap Stage 5: Repair analysis and resume detail screens.
55. **#55** - Gap Stage 6: Repair header controls and simplify dashboard.
56. **#56** - Gap Stage 7: Modernize UI with shadcn and ai-elements components.

**Workflow Rule (enforced via GitHub MCP):**
- GitHub username is `adityaparab` and target repo name is `ResumeForgeUI`
- Each issue must be worked on **one at a time**.
- After completing an issue: commit with conventional message, close/update the GitHub issue with PR link + screenshot/demo if UI change.
- Update PLAN.md checklist as issues are completed.

**Other MCP Servers:**
- shadcn MCP server
- resumeforge MCP server - use this to create types for API request/response types. Do this only while code generation to create types and it should not be part of actual application

**Next Action (after creating this file):** Run `gh issue create` for each numbered item above using GitHub CLI (or MCP server will automate).