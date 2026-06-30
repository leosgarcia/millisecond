import { z } from 'zod'
import { EraSchema } from '../drivers/types'

export const CarTierSchema = z.enum(['S', 'A', 'B', 'C'])

export const CarSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  seasonYear: z.number().int().min(1950).max(2030),
  teamName: z.string(),
  teamCountryCode: z.string().optional(),
  tier: CarTierSchema,
  era: EraSchema,
  overall: z.number().min(0).max(100),

  // Handling
  aeroEfficiency: z.number().min(0).max(100),
  slowCorner: z.number().min(0).max(100),
  mediumCorner: z.number().min(0).max(100),
  fastCorner: z.number().min(0).max(100),
  straightLineSpeed: z.number().min(0).max(100),
  mechanicalGrip: z.number().min(0).max(100),
  braking: z.number().min(0).max(100),

  // Degradation & Setup
  tireWear: z.number().min(0).max(100),
  setupWindow: z.number().min(0).max(100),
  reliability: z.number().min(0).max(100),

  // Development
  developmentPotential: z.number().min(0).max(100),

  // Traits (0 = absent, 1 = present, values in between = partial)
  stableRear: z.number().min(0).max(1),
  strongFrontEnd: z.number().min(0).max(1),
  nervousRear: z.number().min(0).max(1),
  traction: z.number().min(0).max(1),

  // Text
  strengths: z.string().default(''),
  weaknesses: z.string().default(''),
  notes: z.string().default(''),
  liveryPrimaryColor: z.string().optional(),
  liverySecondaryColor: z.string().optional(),
  liveryAccentColor: z.string().optional(),
  budgetCost: z.number().min(0),
})

export type Car = z.infer<typeof CarSchema>
export type CarTier = z.infer<typeof CarTierSchema>
