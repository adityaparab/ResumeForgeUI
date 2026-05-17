import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { store } from '@/app/store'
import { API_URL } from '@/constants'
import { logout, setCredentials } from '@/stores/authSlice'
import type {
  Analysis,
  AnalysisStatusResponse,
  CreateAnalysisDto,
  CreateAnalysisResponse,
  PaginatedAnalyses,
} from './schemas/analysis.schema'
import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  TokenRefreshResponse,
} from './schemas/auth.schema'
import type {
  PaginatedResumes,
  Resume,
  ResumeStatusResponse,
  ResumeUploadResponse,
} from './schemas/resume.schema'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface FailedRequestQueueItem {
  resolve: (value: unknown) => void
  reject: (reason: unknown) => void
}

let isRefreshing = false
let failedQueue: FailedRequestQueueItem[] = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    /* v8 ignore next */
    if (error) {
      /* v8 ignore next */
      reject(error)
    } else {
      resolve(token)
    }
  })
  failedQueue = []
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30_000,
})

// Request interceptor: attach JWT
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState()
    const token = state.auth.accessToken
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  /* v8 ignore next */
  (error) => Promise.reject(error),
)

// Response interceptor: handle 401 with token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          /* v8 ignore next */
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return apiClient(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const state = store.getState()
      const refreshToken = state.auth.refreshToken

      if (!refreshToken) {
        store.dispatch(logout())
        isRefreshing = false
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post<TokenRefreshResponse>(`${API_URL}/auth/refresh`, {
          refreshToken,
        })

        const currentUser = state.auth.user
        if (!currentUser) {
          store.dispatch(logout())
          return Promise.reject(error)
        }

        store.dispatch(
          setCredentials({
            user: currentUser,
            accessToken: data.accessToken,
            refreshToken,
          }),
        )

        processQueue(null, data.accessToken)

        /* v8 ignore next */
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        }
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        store.dispatch(logout())
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

// ===================== Auth API =====================

export const authApi = {
  register: (data: RegisterDto) =>
    apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: LoginDto) => apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  refresh: (refreshToken: string) =>
    apiClient.post<TokenRefreshResponse>('/auth/refresh', { refreshToken }).then((r) => r.data),

  logout: () => apiClient.post('/auth/logout').then((r) => r.data),
}

// ===================== Resume API =====================

export const resumeApi = {
  upload: (file: File, idempotencyKey: string) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient
      .post<ResumeUploadResponse>('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'idempotency-key': idempotencyKey,
        },
      })
      .then((r) => r.data)
  },

  list: (page = 1, limit = 20) =>
    apiClient.get<PaginatedResumes>('/resume', { params: { page, limit } }).then((r) => r.data),

  getById: (id: string) => apiClient.get<Resume>(`/resume/${id}`).then((r) => r.data),

  updateStructuredContent: (id: string, structuredContent: Resume['structuredContent']) =>
    apiClient.patch<Resume>(`/resume/${id}`, { structuredContent }).then((r) => r.data),

  updateResumeFields: (id: string, path: string, value: unknown) =>
    apiClient.patch<Resume>(`/resume/${id}`, { path, value }).then((r) => r.data),

  getStatus: (id: string) =>
    apiClient.get<ResumeStatusResponse>(`/resume/status/${id}`).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/resume/${id}`),

  download: (id: string) =>
    apiClient.get<Blob>(`/resume/${id}/download`, { responseType: 'blob' }).then((r) => r.data),

  createFromContent: (originalName: string, structuredContent: Record<string, unknown>) =>
    apiClient
      .post<{ id: string; status: string }>('/resume', { originalName, structuredContent })
      .then((r) => r.data),
}

// ===================== Analysis API =====================

export const analysisApi = {
  create: (data: CreateAnalysisDto) =>
    apiClient.post<CreateAnalysisResponse>('/analysis', data).then((r) => r.data),

  list: (page = 1, limit = 20) =>
    apiClient.get<PaginatedAnalyses>('/analysis', { params: { page, limit } }).then((r) => r.data),

  getById: (id: string) => apiClient.get<Analysis>(`/analysis/${id}`).then((r) => r.data),

  getStatus: (id: string) =>
    apiClient.get<AnalysisStatusResponse>(`/analysis/status/${id}`).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/analysis/${id}`),

  download: (analysisId: string, resumeId: string) =>
    apiClient
      .get<Blob>(`/analysis/${analysisId}/download`, {
        params: { resumeId },
        responseType: 'blob',
      })
      .then((r) => r.data),
}

export default apiClient
