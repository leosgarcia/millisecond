import { z } from 'zod'
import { EraSchema } from '../drivers/types'

export const TeamPrincipalTierSchema = z.enum(['S', 'A', 'B', 'C']).optional()
export const TechnicalDirectorTierSchema = z.enum(['S', 'A', 'B', 'C']).optional()

export const TeamPrincipalSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  nationalityCode: z.string().optional(),
  era: EraSchema,
  tier: TeamPrincipalTierSchema,

  // Attributes (0–100)
  leadership: z.number().min(0).max(100),
  politics: z.number().min(0).max(100),
  crisisManagement: z.number().min(0).max(100),
  driverManagement: z.number().min(0).max(100),
  operationalDiscipline: z.number().min(0).max(100),
  strategicPatience: z.number().min(0).max(100),
  riskTolerance: z.number().min(0).max(100),
  developmentCulture: z.number().min(0).max(100),

  notes: z.string().default(''),
  budgetCost: z.number().min(0),
})

export const TechnicalDirectorSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  nationalityCode: z.string().optional(),
  era: EraSchema,
  tier: TechnicalDirectorTierSchema,

  // Attributes (0–100)
  aerodynamics: z.number().min(0).max(100),
  mechanicalDesign: z.number().min(0).max(100),
  innovation: z.number().min(0).max(100),
  reliabilityFocus: z.number().min(0).max(100),
  developmentSpeed: z.number().min(0).max(100),
  regulationExploitation: z.number().min(0).max(100),
  setupUnderstanding: z.number().min(0).max(100),
  riskProfile: z.number().min(0).max(100),

  notes: z.string().default(''),
  budgetCost: z.number().min(0),
})

export const TeamPhilosophySchema = z.object({
  id: z.string(),
  key: z.enum(['balanced', 'aggressive', 'conservative', 'qualifying_focused', 'development_focused']).optional(),
  name: z.string().min(1),
  description: z.string(),
  nameKey: z.string().optional(),
  descriptionKey: z.string().optional(),
  bestForKey: z.string().optional(),
  riskKey: z.string().optional(),
  tags: z.array(z.string()).optional(),
  progressionModel: z
    .object({
      quickWarningKey: z.string().optional(),
      phases: z.array(z.object({
        startRace: z.number().int().min(1),
        endRace: z.number().int().min(1),
        labelKey: z.string().optional(),
        modifiers: z.object({
          qualifyingModifier: z.number().min(-1).max(1).optional(),
          raceModifier: z.number().min(-1).max(1).optional(),
          reliabilityModifier: z.number().min(-1).max(1).optional(),
          tireModifier: z.number().min(-1).max(1).optional(),
          aggressionModifier: z.number().min(-1).max(1).optional(),
          overtakingModifier: z.number().min(-1).max(1).optional(),
          consistencyModifier: z.number().min(-1).max(1).optional(),
          errorRiskModifier: z.number().min(-1).max(1).optional(),
          trackPositionModifier: z.number().min(-1).max(1).optional(),
          developmentModifier: z.number().min(-1).max(1).optional(),
        }).default({}),
      })),
    })
    .optional(),

  // Modifiers (-1.0 to +1.0)
  qualifyingModifier: z.number().min(-1).max(1).default(0),
  raceModifier: z.number().min(-1).max(1).default(0),
  reliabilityModifier: z.number().min(-1).max(1).default(0),
  tireModifier: z.number().min(-1).max(1).default(0),
  aggressionModifier: z.number().min(-1).max(1).default(0),
  overtakingModifier: z.number().min(-1).max(1).default(0),
  consistencyModifier: z.number().min(-1).max(1).default(0),
  errorRiskModifier: z.number().min(-1).max(1).default(0),
  trackPositionModifier: z.number().min(-1).max(1).default(0),
  developmentModifier: z.number().min(-1).max(1).default(0),

  notes: z.string().default(''),
  budgetCost: z.number().min(0).default(0),
})

export const SelectedTeamSchema = z.object({
  driverPrimaryId: z.string(),
  driverSecondaryId: z.string(),
  carId: z.string(),
  engineId: z.string(),
  teamPrincipalId: z.string(),
  technicalDirectorId: z.string(),
  philosophyId: z.string(),
})

export const GhostTeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  driverPrimary: z.any(),   // Driver
  driverSecondary: z.any(), // Driver
  car: z.any(),             // Car
  engine: z.any(),          // Engine
  teamPrincipal: z.any(),   // TeamPrincipal
  technicalDirector: z.any(), // TechnicalDirector
  philosophy: z.any(),      // TeamPhilosophy
})

export type TeamPrincipal = z.infer<typeof TeamPrincipalSchema>
export type TechnicalDirector = z.infer<typeof TechnicalDirectorSchema>
export type TeamPhilosophy = z.infer<typeof TeamPhilosophySchema>
export type SelectedTeam = z.infer<typeof SelectedTeamSchema>
export type GhostTeam = z.infer<typeof GhostTeamSchema>
