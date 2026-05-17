export const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'ResumeForge'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'
export const API_VERSION = 'v1'
export const API_URL = `${API_BASE_URL}/api/${API_VERSION}`

console.log(`API URL: ${API_URL}`)

export const AUTH_TOKEN_KEY = 'accessToken'
export const REFRESH_TOKEN_KEY = 'refreshToken'
export const THEME_KEY = 'theme'

export const FILE_UPLOAD_MAX_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [5, 10, 20, 50],
} as const
