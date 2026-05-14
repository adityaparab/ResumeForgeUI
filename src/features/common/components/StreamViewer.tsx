import { Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { StreamStatus } from '../hooks/useStreamJob'

interface StreamViewerProps {
  title: string
  subtitle?: string
  status: StreamStatus
  fullText: string
  error: string | null
  onDone?: () => void
  className?: string
}

const STATUS_LABELS: Record<StreamStatus, string> = {
  idle: 'Waiting…',
  connecting: 'Connecting…',
  streaming: 'Processing…',
  done: 'Complete',
  failed: 'Failed',
}

const STATUS_DOT_CLASSES: Record<StreamStatus, string> = {
  idle: 'bg-muted-foreground',
  connecting: 'bg-yellow-500 animate-pulse',
  streaming: 'bg-blue-500 animate-pulse',
  done: 'bg-green-500',
  failed: 'bg-destructive',
}

export function StreamViewer({
  title,
  subtitle,
  status,
  fullText,
  error,
  onDone,
  className,
}: StreamViewerProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll as text comes in
  useEffect(() => {
    if (status === 'streaming') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [status])

  // Trigger onDone callback
  useEffect(() => {
    if (status === 'done') {
      onDone?.()
    }
  }, [status, onDone])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm">
          <span
            className={cn('size-2 rounded-full', STATUS_DOT_CLASSES[status])}
            aria-hidden="true"
          />
          <span className="font-medium">{STATUS_LABELS[status]}</span>
          {(status === 'connecting' || status === 'streaming') && (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Error state */}
      {status === 'failed' && error && (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Stream output */}
      <div
        className="relative min-h-48 rounded-xl border border-border bg-card p-6 font-mono text-sm leading-relaxed"
        aria-live="polite"
      >
        {fullText ? (
          <pre className="whitespace-pre-wrap break-words text-foreground">{fullText}</pre>
        ) : (
          <p className="text-muted-foreground">
            {status === 'failed' ? 'No output.' : 'Waiting for output…'}
          </p>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
