# AGENTS.md - Development Agent Workflow (GitHub MCP Server)

**Purpose:** This file defines how the AI coding agent (Grok + VS Code GitHub MCP) will implement the entire project.

## Core Rules
1. **One Issue at a Time** – Never start the next issue until the current one is fully completed, tested, and the GitHub issue is closed.
2. **Issue Creation** – After this plan is approved, the first step is to create all 50 GitHub issues automatically via MCP/CLI.
3. **Implementation Flow for Each Issue:**
   - Read the issue description (copied from PLAN.md).
   - Explore Swagger (`https://resumeforge-production-13cd.up.railway.app`) if API details needed.
   - Write code following clean architecture (one responsibility per file/component).
   - Add/update tests (only unit, 100% coverage on ALL coveragec metrics).
   - Run `yarn lint`, `yarn test`, `yarn build`.
   - Commit with Conventional Commits (`feat:`, `fix:`, `chore:`, etc.).
   - Create PR (or direct merge if small), link to issue, mark as "Done" with demo GIF/screenshot.
4. **Shared Reusable Components** – Anything used >1 place goes to `src/components/ui/` or `src/features/common/`.
5. **State Management Rule:**
   - Server data → TanStack Query
   - Complex UI + optimistic updates → Redux Toolkit slices
   - Auth + global UI state → Redux
6. **Testing Standard:** 100% coverage on statements, branches, functions, lines.
7. **Code Quality:**
   - Every component ≤ 300 lines, pure where possible.
   - Use `cn()` utility everywhere for Tailwind.
   - Full TypeScript strict typing (no `any`).
   - Error handling with try/catch + user-friendly messages.

## Tools & Commands the Agent Must Use
```bash
yarn install
yarn dev
yarn test
yarn lint
yarn build