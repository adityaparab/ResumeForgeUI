export type ToastSeverity = 'success' | 'error' | 'info' | 'warning'

export interface ToastOptions {
  duration?: number
}

export interface ToastMessage {
  id: string
  message: string
  severity: ToastSeverity
  duration?: number
}

type ToastListener = (message: ToastMessage) => void

const listeners = new Set<ToastListener>()
let toastId = 0

function emitToast(severity: ToastSeverity, message: string, options: ToastOptions = {}) {
  toastId += 1
  const toastMessage: ToastMessage = {
    id: `${Date.now()}-${toastId}`,
    message,
    severity,
    duration: options.duration,
  }

  listeners.forEach((listener) => {
    listener(toastMessage)
  })
  return toastMessage.id
}

export const toast = {
  success: (message: string, options?: ToastOptions) => emitToast('success', message, options),
  error: (message: string, options?: ToastOptions) => emitToast('error', message, options),
  info: (message: string, options?: ToastOptions) => emitToast('info', message, options),
  warning: (message: string, options?: ToastOptions) => emitToast('warning', message, options),
}

export function subscribeToToasts(listener: ToastListener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
