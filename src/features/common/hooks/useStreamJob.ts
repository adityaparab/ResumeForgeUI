import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { store } from '@/app/store'
import { API_URL } from '@/constants'

export type StreamStatus = 'connecting' | 'streaming' | 'done' | 'failed' | 'idle'

interface UseStreamJobOptions {
  jobId: string | undefined | null
  enabled?: boolean
}

export interface UseStreamJobResult {
  chunks: string[]
  fullText: string
  status: StreamStatus
  error: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseJson(raw: string): unknown | undefined {
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return undefined
  }
}

function getPayloadChunk(payload: unknown): string | null {
  if (typeof payload === 'string') return payload
  if (isRecord(payload) && typeof payload.chunk === 'string') return payload.chunk
  return null
}

export function getStreamChunk(raw: string): string {
  const parsed = parseJson(raw)
  if (parsed === undefined) return raw
  if (Array.isArray(parsed)) return parsed.map((item) => getPayloadChunk(item) ?? '').join('')
  return getPayloadChunk(parsed) ?? ''
}

function getStreamError(raw: string): string {
  const parsed = parseJson(raw)
  if (isRecord(parsed)) {
    if (typeof parsed.error === 'string') return parsed.error
    if (typeof parsed.message === 'string') return parsed.message
  }
  return raw || 'Job failed'
}

export function useStreamJob({ jobId, enabled = true }: UseStreamJobOptions): UseStreamJobResult {
  const [chunks, setChunks] = useState<string[]>([])
  const [fullText, setFullText] = useState('')
  const [status, setStatus] = useState<StreamStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!jobId || !enabled) return

    const token = store.getState().auth.accessToken
    const url = `${API_URL}/subscription/stream/${jobId}${token ? `?token=${encodeURIComponent(token)}` : ''}`

    setStatus('connecting')
    setChunks([])
    setFullText('')
    setError(null)

    const es = new EventSource(url)
    esRef.current = es

    es.addEventListener('history', (e: MessageEvent) => {
      const text = getStreamChunk(e.data as string)
      setChunks(text ? [text] : [])
      setFullText(text)
      setStatus('streaming')
    })

    es.addEventListener('chunk', (e: MessageEvent) => {
      const chunk = getStreamChunk(e.data as string)
      setChunks((prev) => (chunk ? [...prev, chunk] : prev))
      setFullText((prev) => prev + chunk)
      setStatus('streaming')
    })

    es.addEventListener('done', (e: MessageEvent) => {
      const text = getStreamChunk(e.data as string)
      if (text) setFullText(text)
      setStatus('done')
      es.close()
    })

    es.addEventListener('failed', (e: MessageEvent) => {
      const msg = getStreamError(e.data as string)
      setError(msg)
      setStatus('failed')
      toast.error(msg)
      es.close()
    })

    es.onerror = () => {
      const msg = 'Connection error. Please check your network and try again.'
      setError(msg)
      setStatus('failed')
      toast.error(msg)
      es.close()
    }

    return () => {
      es.close()
    }
  }, [jobId, enabled])

  return { chunks, fullText, status, error }
}
