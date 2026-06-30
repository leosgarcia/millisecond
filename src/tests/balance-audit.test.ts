import { describe, expect, it } from 'vitest'
import { evaluateDriverSanity } from '@/domain/data-quality/ratingSanityRules'
import { calculateEngineTrackFit } from '@/domain/simulation/formulas'
import type { Circuit } from '@/domain/circuits/types'
import type { Driver } from '@/domain/drivers/types'
import type { Engine } from '@/domain/engines/types'

const makeDriver = (overrides: Partial<Driver> = {}): Driver =>
  ({
    id: 'driver-test',
    name: 'Driver Test',
    seasonYear: 2000,
    nationality: 'Test',
    canonicalDriverId: 'driver-test',
    tier: 'A',
    role: 'primary',
    era: '90s',
    overall: 90,
    qualifyingPace: 90,
    racePace: 90,
    wetSkill: 80,
    tireManagement: 80,
    overtaking: 80,
    defending: 80,
    consistency: 80,
    adaptability: 80,
    technicalFeedback: 80,
    pressureHandling: 80,
    aggression: 70,
    teamPlay: 75,
    errorProneness: 20,
    incidentRisk: 20,
    politicalTension: 40,
    budgetCost: 100,
    preferredCarTraits: [],
    weakCarTraits: [],
    notes: '',
    ...overrides,
  }) as Driver

const monza: Circuit = {
  id: 'monza',
  name: 'Monza',
  country: 'Italy',
  straightDemand: 98,
  slowCornerDemand: 30,
  mediumCornerDemand: 35,
  fastCornerDemand: 60,
  brakingDemand: 90,
  mechanicalGripDemand: 40,
  aeroDemand: 45,
  tireStress: 55,
  overtakingDifficulty: 30,
  qualifyingImportance: 80,
  rainProbability: 10,
  safetyCarProbability: 20,
  reliabilityStress: 45,
  driverErrorStress: 35,
  notes: '',
}

const monaco: Circuit = {
  ...monza,
  id: 'monaco',
  name: 'Monaco',
  straightDemand: 25,
  slowCornerDemand: 96,
  mediumCornerDemand: 60,
  fastCornerDemand: 15,
  brakingDemand: 95,
  mechanicalGripDemand: 94,
  aeroDemand: 70,
  tireStress: 40,
  overtakingDifficulty: 98,
  qualifyingImportance: 99,
  driverErrorStress: 92,
}

const makeEngine = (overrides: Partial<Engine> = {}): Engine =>
  ({
    id: 'engine-test',
    name: 'Engine Test',
    manufacturer: 'Test',
    seasonYear: 1990,
    era: '90s',
    overall: 85,
    power: 85,
    torqueDelivery: 80,
    drivability: 80,
    fuelEfficiency: 80,
    energyRecovery: 0,
    weightEfficiency: 80,
    reliability: 80,
    coolingDemand: 60,
    qualifyingMode: 80,
    racePaceSustainability: 80,
    compatibleEras: ['90s'],
    notes: '',
    ...overrides,
  }) as Engine

describe('balance audit helpers', () => {
  it('flags wet skill inflation for non-elite canonical IDs', () => {
    const warnings = evaluateDriverSanity(
      makeDriver({
        wetSkill: 98,
        canonicalDriverId: 'driver-hypothetical',
      })
    )

    expect(warnings.some((warning) => warning.ruleId === 'driver-wet-skill-elite')).toBe(true)
  })

  it('flags drivers that are too perfect', () => {
    const warnings = evaluateDriverSanity(
      makeDriver({
        qualifyingPace: 99,
        racePace: 98,
        wetSkill: 99,
        tireManagement: 97,
        overtaking: 96,
        defending: 96,
        consistency: 99,
        adaptability: 95,
        technicalFeedback: 96,
        pressureHandling: 97,
        aggression: 95,
        teamPlay: 95,
      })
    )

    expect(warnings.some((warning) => warning.ruleId === 'driver-too-perfect')).toBe(true)
  })

  it('boosts a powerful engine on Monza more than on Monaco', () => {
    const powerEngine = makeEngine({ power: 100, qualifyingMode: 95, racePaceSustainability: 95 })
    expect(calculateEngineTrackFit(powerEngine, monza)).toBeGreaterThan(
      calculateEngineTrackFit(powerEngine, monaco)
    )
  })
})
