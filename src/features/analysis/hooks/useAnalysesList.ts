import { useQuery } from '@tanstack/react-query'
import { analysisApi } from '@/lib/api-client'

export function useAnalysesList(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['analyses', page, limit],
    queryFn: () => analysisApi.list(page, limit),
  })
}
