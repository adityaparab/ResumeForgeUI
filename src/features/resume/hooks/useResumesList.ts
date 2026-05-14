import { useQuery } from '@tanstack/react-query'
import { resumeApi } from '@/lib/api-client'

export function useResumesList(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['resumes', page, limit],
    queryFn: () => resumeApi.list(page, limit),
  })
}
