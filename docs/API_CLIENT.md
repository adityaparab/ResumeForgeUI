# API Client Usage Guide

The API client (`src/lib/api-client.ts`) is a typed wrapper around `fetch` that handles authentication, token refresh, and error normalization.

## Setup

The base URL is read from `VITE_API_BASE_URL` at build time. Access tokens are stored in Redux and attached to every request via `Authorization: Bearer <token>`.

## Usage

### Direct calls (rare – prefer hooks)

```typescript
import { apiClient } from '@/lib/api-client'

// GET
const resumes = await apiClient.get<ResumeListResponse>('/resumes')

// POST with body
const result = await apiClient.post<LoginResponse>('/auth/login', { email, password })

// POST multipart
const formData = new FormData()
formData.append('file', file)
const resume = await apiClient.postForm<ResumeResponse>('/resumes', formData)

// DELETE
await apiClient.delete(`/resumes/${id}`)
```

### Token refresh

The client automatically retries with a refreshed token on 401 responses. If refresh fails, the user is logged out.

## TanStack Query Hooks

Prefer using the feature hooks over calling the API client directly:

| Hook | File | Description |
|------|------|-------------|
| `useResumesList` | `features/resume/hooks/useResumesList.ts` | Fetch paginated resume list |
| `useResumeUploadMutation` | `features/resume/hooks/useResumeUploadMutation.ts` | Upload a resume |
| `useAnalysesList` | `features/analysis/hooks/useAnalysesList.ts` | Fetch analysis list |
| `useCreateAnalysisMutation` | `features/analysis/hooks/useCreateAnalysisMutation.ts` | Create analysis |
| `useLoginMutation` | `features/auth/hooks/useAuthMutations.ts` | Login |
| `useLogoutMutation` | `features/auth/hooks/useAuthMutations.ts` | Logout |
| `useDashboardStats` | `features/dashboard/hooks/useDashboardStats.ts` | Dashboard stats |

## Zod Schemas

Request/response shapes are validated with Zod schemas in `src/lib/schemas/`:

- `auth.schema.ts` — login, register, user
- `resume.schema.ts` — resume upload, resume item
- `analysis.schema.ts` — analysis create, analysis item

## SSE Streaming

The `useStreamJob` hook (`features/common/hooks/useStreamJob.ts`) subscribes to `GET /subscription/stream` via `EventSource` and dispatches job status updates to Redux.

## Error Handling

All API errors are normalized to `{ message: string; statusCode: number }` shape. Components display user-friendly messages via `sonner` toast notifications.
