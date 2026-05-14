import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useAppDispatch } from '@/app/hooks'
import { analysisApi } from '@/lib/api-client'
import type { CreateAnalysisDto } from '@/lib/schemas/analysis.schema'
import { addActiveJob } from '@/stores/uiSlice'

export function useCreateAnalysisMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: (data: CreateAnalysisDto) => analysisApi.create(data),
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['analyses'] })

      dispatch(
        addActiveJob({
          id: data.id,
          type: 'analysis',
          status: 'processing',
          label: `Analysis for ${variables.resumeId}`,
          createdAt: new Date().toISOString(),
        }),
      )

      toast.success('Analysis started!')
      void navigate(`/analysis/stream/${data.id}`)
    },
    onError: (error: Error) => {
      /* v8 ignore next */
      toast.error(error.message ?? 'Failed to start analysis. Please try again.')
    },
  })
}
