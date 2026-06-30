import { z } from 'zod'

export const CircuitSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  country: z.string(),
  countryCode: z.string().optional(),
  confidenceLevel: z.string().optional(),
  trackProfiles: z.array(z.enum([
    'power_track',
    'street_circuit',
    'high_downforce',
    'high_speed_aero',
    'technical_flow',
    'mixed_classic',
    'tire_limited',
    'wet_prone',
    'braking_heavy',
  ])).optional(),

  // Demands (0–100)
  straightDemand: z.number().min(0).max(100),
  slowCornerDemand: z.number().min(0).max(100),
  mediumCornerDemand: z.number().min(0).max(100),
  fastCornerDemand: z.number().min(0).max(100),
  brakingDemand: z.number().min(0).max(100),
  mechanicalGripDemand: z.number().min(0).max(100),
  aeroDemand: z.number().min(0).max(100),
  tireStress: z.number().min(0).max(100),

  // Race factors
  overtakingDifficulty: z.number().min(0).max(100),
  qualifyingImportance: z.number().min(0).max(100),
  rainProbability: z.number().min(0).max(100),
  safetyCarProbability: z.number().min(0).max(100),
  reliabilityStress: z.number().min(0).max(100),
  driverErrorStress: z.number().min(0).max(100),

  notes: z.string().default(''),
})

export type Circuit = z.infer<typeof CircuitSchema>

export const TRACK_PROFILE_VALUES = [
  'power_track',
  'street_circuit',
  'high_downforce',
  'high_speed_aero',
  'technical_flow',
  'mixed_classic',
  'tire_limited',
  'wet_prone',
  'braking_heavy',
] as const

export type TrackProfile = typeof TRACK_PROFILE_VALUES[number]
