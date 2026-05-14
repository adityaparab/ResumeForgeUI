import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useAppDispatch } from '@/app/hooks'
import { resumeApi } from '@/lib/api-client'
import { addActiveJob } from '@/stores/uiSlice'

export function useResumeUploadMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: ({ file, idempotencyKey }: { file: File; idempotencyKey: string }) =>
      resumeApi.upload(file, idempotencyKey),
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['resumes'] })

      dispatch(
        addActiveJob({
          id: data.id,
          type: 'resume-upload',
          status: 'processing',
          label: variables.file.name,
          createdAt: new Date().toISOString(),
        }),
      )

      toast.success('Resume uploaded! Processing started.')
      void navigate(`/resume/stream/${data.id}`)
    },
    onError: (error: Error) => {
      /* v8 ignore next */
      toast.error(error.message ?? 'Upload failed. Please try again.')
    },
  })
}
