import { z } from 'zod'

export const DriverTierSchema = z.enum(['S', 'A', 'B', 'C'])
export const DriverRoleSchema = z.enum(['primary', 'secondary'])
export const EraSchema = z.enum([
  '50s',
  '60s',
  '70s',
  '80s',
  '90s',
  '00s',
  '10s',
  '20s',
  'classic',
  'turbo',
  'v8',
  'v10',
  'hybrid',
  '50s-80s',
  '60s-70s',
  '70s-90s',
  '80s-00s',
  '80s-90s',
  '90s-00s',
  '00s-10s',
  '10s-20s',
  '90s-20s',
  '90s-10s',
  '60s-90s',
  '00s-20s',
])

export const DriverSchema = z.object({
  id: z.string(),
  canonicalDriverId: z.string(),
  name: z.string().min(1),
  seasonYear: z.number().int().min(1950).max(2030),
  nationality: z.string(),
  nationalityCode: z.string().optional(),
  tier: DriverTierSchema,
  role: DriverRoleSchema,
  era: EraSchema,
  overall: z.number().min(0).max(100),
  confidenceLevel: z.string().optional(),

  // Performance attributes
  qualifyingPace: z.number().min(0).max(100),
  racePace: z.number().min(0).max(100),
  wetSkill: z.number().min(0).max(100),
  tireManagement: z.number().min(0).max(100),
  overtaking: z.number().min(0).max(100),
  defending: z.number().min(0).max(100),
  consistency: z.number().min(0).max(100),
  adaptability: z.number().min(0).max(100),
  technicalFeedback: z.number().min(0).max(100),
  pressureHandling: z.number().min(0).max(100),
  aggression: z.number().min(0).max(100),
  teamPlay: z.number().min(0).max(100),

  // Risk
  errorProneness: z.number().min(0).max(100),
  incidentRisk: z.number().min(0).max(100),
  politicalTension: z.number().min(0).max(100),

  // Compatibility
  preferredCarTraits: z.array(z.string()),
  weakCarTraits: z.array(z.string()),

  notes: z.string().default(''),
  budgetCost: z.number().min(0),
})

export type Driver = z.infer<typeof DriverSchema>
export type DriverTier = z.infer<typeof DriverTierSchema>
export type DriverRole = z.infer<typeof DriverRoleSchema>
export type Era = z.infer<typeof EraSchema>
