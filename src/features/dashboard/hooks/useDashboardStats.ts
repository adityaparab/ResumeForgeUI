import { useQuery } from '@tanstack/react-query'
import { analysisApi, resumeApi } from '@/lib/api-client'

export function useDashboardStats() {
  const resumesQuery = useQuery({
    queryKey: ['resumes', 'count'],
    queryFn: () => resumeApi.list(1, 1),
  })

  const analysesQuery = useQuery({
    queryKey: ['analyses', 'count'],
    queryFn: () => analysisApi.list(1, 1),
  })

  return {
    totalResumes: resumesQuery.data?.total ?? 0,
    totalAnalyses: analysesQuery.data?.total ?? 0,
    isLoading: resumesQuery.isLoading || analysesQuery.isLoading,
    isError: resumesQuery.isError || analysesQuery.isError,
    error: resumesQuery.error ?? analysesQuery.error,
    refetch: () => {
      void resumesQuery.refetch()
      void analysesQuery.refetch()
    },
  }
}
