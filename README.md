# ResumeForge UI

AI-powered resume analysis and optimization frontend built with React 19, TypeScript, Redux Toolkit, and TanStack Query.

## Features

- Upload and manage resumes (PDF/DOCX)
- AI-powered resume analysis with streaming results
- Dark mode with system preference support
- Accessible UI (WCAG compliant)
- Progressive Web App (PWA) with offline support
- Responsive design for mobile/tablet/desktop

## Tech Stack

- **React 19** + TypeScript (strict mode)
- **Redux Toolkit** — auth + UI state
- **TanStack Query v5** — server state
- **Material UI** + MUI X + Emotion
- **Vite** + vite-plugin-pwa
- **Vitest** — unit tests (100% coverage)
- **Playwright** — E2E tests
- **Biome** — lint + format

## Prerequisites

- Node.js 20+
- Yarn 1.x
- ResumeForge API running at `http://localhost:3001`

## Setup

```bash
# Install dependencies
yarn install

# Copy environment file
cp .env.example .env.development

# Start development server
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | ResumeForge API base URL | `http://localhost:3001` |
| `VITE_APP_NAME` | Application name | `ResumeForge` |
| `VITE_SENTRY_DSN` | Sentry DSN for error tracking | _(empty)_ |

## API Integration

The frontend integrates with the ResumeForge REST API (`/api/v1`):

| Endpoint | Description |
|----------|-------------|
| `POST /auth/register` | Register new user |
| `POST /auth/login` | Login with email/password |
| `POST /auth/logout` | Logout |
| `POST /auth/refresh` | Refresh access token |
| `GET /resumes` | List all resumes |
| `POST /resumes` | Upload resume (multipart) |
| `GET /resumes/:id` | Get resume details |
| `DELETE /resumes/:id` | Delete resume |
| `GET /resumes/:id/status` | Poll resume processing status |
| `GET /analyses` | List all analyses |
| `POST /analyses` | Create analysis |
| `GET /analyses/:id` | Get analysis result |
| `DELETE /analyses/:id` | Delete analysis |
| `GET /subscription/stream` | SSE stream for job updates |

## Testing

```bash
# Run unit tests
yarn test

# Run unit tests with coverage
yarn test:coverage

# Run E2E tests (requires API server running)
yarn test:e2e

# Run E2E tests with UI
yarn test:e2e:ui
```

## Building

```bash
# Production build
yarn build

# Preview production build
yarn preview
```

## Storybook

```bash
# Start component workbench
yarn storybook

# Build static Storybook
yarn build-storybook

# Publish visual regression build through Chromatic
yarn chromatic
```

Chromatic CI uses the `CHROMATIC_PROJECT_TOKEN` repository secret when it is configured.

## Linting

```bash
yarn lint
```

## Deployment

### Vercel

The project includes `vercel.json` with SPA rewrites and security headers. Deploy via:

```bash
vercel --prod
```

Set environment variables in the Vercel dashboard.

### Netlify

The project includes `netlify.toml` with redirect rules and security headers. Connect the GitHub repo to Netlify and set environment variables in the Netlify dashboard.

## Project Structure

```
src/
├── app/          # Redux store, providers, hooks
├── components/   # Shared app components (common, layout)
├── features/     # Feature modules (auth, resume, analysis, dashboard)
├── lib/          # API client, utilities, Zod schemas
├── pages/        # Route-level page components
├── routes/       # React Router configuration
├── stores/       # Redux slices (authSlice, uiSlice)
└── tests/        # Unit tests + test utilities
tests/
└── e2e/          # Playwright E2E tests
```

Additional architecture and component notes live in `docs/`.
