import { z } from 'zod'

// --- Sub-schemas matching the resume structured content ---

export const LocationSchema = z.object({
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  countryCode: z.string().optional(),
  region: z.string().optional(),
})

export const ProfileSchema = z.object({
  network: z.string(),
  username: z.string(),
  url: z.string().optional(),
})

export const BasicsSchema = z.object({
  name: z.string().optional(),
  label: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  url: z.string().optional(),
  summary: z.string().optional(),
  location: LocationSchema.optional(),
  profiles: z.array(ProfileSchema).optional(),
})

export const WorkSchema = z.object({
  name: z.string(),
  position: z.string(),
  url: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().nullable().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).optional(),
})

export const VolunteerSchema = z.object({
  organization: z.string(),
  position: z.string(),
  url: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).optional(),
})

export const EducationSchema = z.object({
  institution: z.string(),
  url: z.string().optional(),
  area: z.string().optional(),
  studyType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  score: z.string().optional(),
  courses: z.array(z.string()).optional(),
})

export const AwardSchema = z.object({
  title: z.string(),
  date: z.string().optional(),
  awarder: z.string().optional(),
  summary: z.string().optional(),
})

export const CertificateSchema = z.object({
  name: z.string(),
  date: z.string().optional(),
  issuer: z.string().optional(),
  url: z.string().optional(),
})

export const PublicationSchema = z.object({
  name: z.string(),
  publisher: z.string().optional(),
  releaseDate: z.string().optional(),
  url: z.string().optional(),
  summary: z.string().optional(),
})

export const SkillSchema = z.object({
  name: z.string(),
  level: z.string().optional(),
  keywords: z.array(z.string()).optional(),
})

export const LanguageSchema = z.object({
  language: z.string(),
  fluency: z.string().optional(),
})

export const InterestSchema = z.object({
  name: z.string(),
  keywords: z.array(z.string()).optional(),
})

export const ReferenceSchema = z.object({
  name: z.string(),
  reference: z.string().optional(),
})

export const ProjectSchema = z.object({
  name: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  url: z.string().optional(),
})

export const StructuredContentSchema = z.object({
  basics: BasicsSchema.optional(),
  work: z.array(WorkSchema).optional(),
  volunteer: z.array(VolunteerSchema).optional(),
  education: z.array(EducationSchema).optional(),
  awards: z.array(AwardSchema).optional(),
  certificates: z.array(CertificateSchema).optional(),
  publications: z.array(PublicationSchema).optional(),
  skills: z.array(SkillSchema).optional(),
  languages: z.array(LanguageSchema).optional(),
  interests: z.array(InterestSchema).optional(),
  references: z.array(ReferenceSchema).optional(),
  projects: z.array(ProjectSchema).optional(),
})

// --- Resume status ---

export const ResumeStatusSchema = z.enum(['queued', 'processing', 'completed', 'failed'])

// --- Request DTOs ---

export const ResumeUploadResponseSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  status: ResumeStatusSchema,
})

export type ResumeUploadResponse = z.infer<typeof ResumeUploadResponseSchema>

// --- Resume Response ---

export const ResumeSchema = z.object({
  id: z.string(),
  _id: z.string().optional(),
  userId: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  status: ResumeStatusSchema,
  idempotencyKey: z.string().optional(),
  jobId: z.string().optional(),
  sourceText: z.string().nullable().optional(),
  structuredContent: StructuredContentSchema.nullable().optional(),
  rawOutput: z.string().nullable().optional(),
  error: z.string().nullable().optional(),
  tokensUsed: z.number().optional(),
  deletedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Resume = z.infer<typeof ResumeSchema>

export const ResumeStatusResponseSchema = z.object({
  id: z.string(),
  jobId: z.string().optional(),
  status: ResumeStatusSchema,
  originalName: z.string().optional(),
  structuredContent: StructuredContentSchema.nullable().optional(),
  error: z.string().nullable().optional(),
})

export type ResumeStatusResponse = z.infer<typeof ResumeStatusResponseSchema>

export const PaginatedResumesSchema = z.object({
  data: z.array(ResumeSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

export type PaginatedResumes = z.infer<typeof PaginatedResumesSchema>
