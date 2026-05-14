import { useQuery } from '@tanstack/react-query'
import { resumeApi } from '@/lib/api-client'

export function useResumesForSelect() {
  return useQuery({
    queryKey: ['resumes', 'select'],
    queryFn: () => resumeApi.list(1, 100),
    select: (data) =>
      data.data
        .filter((r) => r.status === 'completed')
        .map((r) => ({
          value: r.id,
          /* v8 ignore next */
          label: r.originalName ?? r.id,
        })),
  })
}
