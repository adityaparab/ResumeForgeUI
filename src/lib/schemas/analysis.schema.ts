import { z } from 'zod'
import { ResumeStatusSchema, StructuredContentSchema } from './resume.schema'

// --- Request DTOs ---

export const CreateAnalysisDtoSchema = z.object({
  resumeId: z.string().min(1, 'Resume ID is required'),
  jobDescription: z
    .string()
    .min(20, 'Job description must be at least 20 characters')
    .max(20000, 'Job description must be at most 20 000 characters'),
})

export type CreateAnalysisDto = z.infer<typeof CreateAnalysisDtoSchema>

// --- Response Types ---

export const CreateAnalysisResponseSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  status: ResumeStatusSchema,
})

export type CreateAnalysisResponse = z.infer<typeof CreateAnalysisResponseSchema>

export const AnalysisReportSchema = z.object({
  score: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  recommendations: z.array(z.string()),
  matchedKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
})

export const AnalysisResultSchema = z.object({
  analysisReport: AnalysisReportSchema,
  updatedResume: StructuredContentSchema,
})

export const AnalysisSchema = z.object({
  id: z.string(),
  _id: z.string().optional(),
  userId: z.string(),
  resumeId: z.string(),
  jobDescription: z.string(),
  status: ResumeStatusSchema,
  jobId: z.string().optional(),
  result: AnalysisResultSchema.nullable().optional(),
  rawOutput: z.string().nullable().optional(),
  error: z.string().nullable().optional(),
  resumePath: z.string().nullable().optional(),
  tokensUsed: z.number().optional(),
  deletedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Analysis = z.infer<typeof AnalysisSchema>

export const AnalysisStatusResponseSchema = z.object({
  id: z.string(),
  resumeId: z.string().optional(),
  jobId: z.string().optional(),
  status: ResumeStatusSchema,
  result: AnalysisResultSchema.nullable().optional(),
  error: z.string().nullable().optional(),
})

export type AnalysisStatusResponse = z.infer<typeof AnalysisStatusResponseSchema>

export const PaginatedAnalysesSchema = z.object({
  data: z.array(AnalysisSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

export type PaginatedAnalyses = z.infer<typeof PaginatedAnalysesSchema>
