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
- **Tailwind CSS v4** + shadcn/ui components
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

# Run unit tests with coverage (100% enforced)
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
├── components/   # Shared UI components (common, layout, ui)
├── features/     # Feature modules (auth, resume, analysis, dashboard)
├── lib/          # API client, utilities, Zod schemas
├── pages/        # Route-level page components
├── routes/       # React Router configuration
├── stores/       # Redux slices (authSlice, uiSlice)
└── tests/        # Unit tests + test utilities
tests/
└── e2e/          # Playwright E2E tests
```

---

_Previously generated Vite README content below:_

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
