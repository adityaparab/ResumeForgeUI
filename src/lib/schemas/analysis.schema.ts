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

export const SkillGapSchema = z.object({
  skill: z.string(),
  detail: z.string(),
  requiredOrPreferred: z.enum(['Required', 'Preferred']),
})

export const SkillsGapsSchema = z.object({
  criticalGaps: z.array(SkillGapSchema),
  secondaryGaps: z.array(SkillGapSchema),
})

export const DetailedImprovementSuggestionsSchema = z.object({
  summary: z.string(),
  workExperience: z.array(z.string()),
  skills: z.array(z.string()),
})

export const UpdatedSkillsSectionSchema = z.object({
  languages: z.array(z.string()),
  frontendFrameworks: z.array(z.string()),
  backendFrameworks: z.array(z.string()),
  architectureAndDesign: z.array(z.string()),
  toolsAndTesting: z.array(z.string()),
  databases: z.array(z.string()),
})

export const CandidateAssessmentSchema = z.object({
  overallScore: z.string(),
  justification: z.string(),
  strongMatchingPoints: z.array(z.string()),
  skillsGaps: SkillsGapsSchema,
  detailedImprovementSuggestions: DetailedImprovementSuggestionsSchema,
  impactfulProfessionalSummary: z.string(),
  updatedSkillsSection: UpdatedSkillsSectionSchema,
  projectedScoreAfterChanges: z.string(),
  nextSteps: z.array(z.string()),
  title: z.string().optional(),
})

export type CandidateAssessment = z.infer<typeof CandidateAssessmentSchema>

export const AnalysisResultSchema = z.object({
  analysisReport: CandidateAssessmentSchema,
  updatedResume: StructuredContentSchema,
})

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>

export const AnalysisSchema = z.object({
  id: z.string(),
  _id: z.string().optional(),
  title: z.string().optional(),
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
