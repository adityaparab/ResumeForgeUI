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
      const text = e.data as string
      setChunks([text])
      setFullText(text)
      setStatus('streaming')
    })

    es.addEventListener('chunk', (e: MessageEvent) => {
      const chunk = e.data as string
      setChunks((prev) => [...prev, chunk])
      setFullText((prev) => prev + chunk)
      setStatus('streaming')
    })

    es.addEventListener('done', (e: MessageEvent) => {
      const text = e.data as string
      if (text) setFullText(text)
      setStatus('done')
      es.close()
    })

    es.addEventListener('failed', (e: MessageEvent) => {
      const msg = (e.data as string) || 'Job failed'
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
