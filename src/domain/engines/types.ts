import { z } from 'zod'
import { EraSchema } from '../drivers/types'

export const EngineSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  manufacturer: z.string(),
  manufacturerCountryCode: z.string().optional(),
  seasonYear: z.number().int().min(1950).max(2030),
  era: EraSchema,
  overall: z.number().min(0).max(100),

  // Performance (0–100)
  power: z.number().min(0).max(100),
  torqueDelivery: z.number().min(0).max(100),
  drivability: z.number().min(0).max(100),
  fuelEfficiency: z.number().min(0).max(100),
  energyRecovery: z.number().min(0).max(100),
  weightEfficiency: z.number().min(0).max(100),
  reliability: z.number().min(0).max(100),
  coolingDemand: z.number().min(0).max(100),
  qualifyingMode: z.number().min(0).max(100),
  racePaceSustainability: z.number().min(0).max(100),

  compatibleEras: z.array(z.string()),
  notes: z.string().default(''),
  budgetCost: z.number().min(0),
})

export type Engine = z.infer<typeof EngineSchema>
