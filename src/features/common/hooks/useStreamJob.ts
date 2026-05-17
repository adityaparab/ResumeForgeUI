import { useEffect, useRef, useState } from 'react'
import { store } from '@/app/store'
import { toast } from '@/components/common/toast'
import { API_URL } from '@/constants'
import { clearStream, updateStream } from '@/stores/streamSlice'

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
  const fullTextRef = useRef('')

  useEffect(() => {
    if (!jobId || !enabled) return

    const token = store.getState().auth.accessToken
    const url = `${API_URL}/subscription/stream/${jobId}${token ? `?token=${encodeURIComponent(token)}` : ''}`

    setStatus('connecting')
    setChunks([])
    setError(null)
    fullTextRef.current = ''
    setFullText('')
    store.dispatch(updateStream({ jobId, fullText: '', status: 'connecting' }))

    const es = new EventSource(url)
    esRef.current = es

    es.addEventListener('history', (e: MessageEvent) => {
      const text = getStreamChunk(e.data as string)
      fullTextRef.current = text
      setChunks(text ? [text] : [])
      setFullText(text)
      setStatus('streaming')
      store.dispatch(updateStream({ jobId, fullText: text, status: 'streaming' }))
    })

    es.addEventListener('chunk', (e: MessageEvent) => {
      const chunk = getStreamChunk(e.data as string)
      if (chunk) {
        fullTextRef.current += chunk
        const newText = fullTextRef.current
        setChunks((prev) => [...prev, chunk])
        setFullText(newText)
        store.dispatch(updateStream({ jobId, fullText: newText, status: 'streaming' }))
      }
    })

    es.addEventListener('done', (e: MessageEvent) => {
      const text = getStreamChunk(e.data as string)
      if (text) {
        fullTextRef.current = text
        setFullText(text)
      }
      setStatus('done')
      store.dispatch(clearStream(jobId))
      es.close()
    })

    es.addEventListener('failed', (e: MessageEvent) => {
      const msg = getStreamError(e.data as string)
      setError(msg)
      setStatus('failed')
      store.dispatch(clearStream(jobId))
      toast.error(msg)
      es.close()
    })

    es.onerror = () => {
      const msg = 'Connection error. Please check your network and try again.'
      setError(msg)
      setStatus('failed')
      store.dispatch(clearStream(jobId))
      toast.error(msg)
      es.close()
    }

    return () => {
      es.close()
    }
  }, [jobId, enabled])

  return { chunks, fullText, status, error }
}
