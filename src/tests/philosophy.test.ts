import { describe, expect, it } from 'vitest'
import { calculateQualifyingScore, calculateRaceScore, calculateReliabilityRisk } from '@/domain/simulation/formulas'
import { evaluatePhilosophyFit, getGhostPhilosophyIdsForArchetype, getPhilosophyModifiersForRace, getTeamPhilosophyById } from '@/domain/teams/philosophies'
import ptBR from '@/messages/pt-BR.json'
import en from '@/messages/en.json'
import type { Car } from '@/domain/cars/types'
import type { Engine } from '@/domain/engines/types'
import type { Circuit } from '@/domain/circuits/types'
import type { Driver } from '@/domain/drivers/types'
import type { TeamPrincipal, TechnicalDirector } from '@/domain/teams/types'

const circuit: Circuit = {
  id: 'circuit-test',
  name: 'Test Circuit',
  country: 'Test',
  straightDemand: 92,
  slowCornerDemand: 75,
  mediumCornerDemand: 80,
  fastCornerDemand: 88,
  brakingDemand: 86,
  mechanicalGripDemand: 84,
  aeroDemand: 90,
  tireStress: 78,
  overtakingDifficulty: 85,
  qualifyingImportance: 92,
  rainProbability: 20,
  safetyCarProbability: 20,
  reliabilityStress: 80,
  driverErrorStress: 75,
  notes: '',
}

const car: Car = {
  id: 'car-test',
  name: 'Car Test',
  seasonYear: 2020,
  teamName: 'Test',
  tier: 'S',
  era: '20s',
  overall: 92,
  aeroEfficiency: 92,
  slowCorner: 88,
  mediumCorner: 90,
  fastCorner: 91,
  straightLineSpeed: 90,
  mechanicalGrip: 88,
  braking: 91,
  tireWear: 92,
  setupWindow: 90,
  reliability: 94,
  developmentPotential: 90,
  stableRear: 0.8,
  strongFrontEnd: 0.7,
  nervousRear: 0.2,
  traction: 0.8,
  strengths: '',
  weaknesses: '',
  notes: '',
}

const engine: Engine = {
  id: 'engine-test',
  name: 'Engine Test',
  manufacturer: 'Test',
  seasonYear: 2020,
  era: '20s',
  overall: 91,
  power: 91,
  torqueDelivery: 89,
  drivability: 90,
  fuelEfficiency: 90,
  energyRecovery: 80,
  weightEfficiency: 90,
  reliability: 93,
  coolingDemand: 60,
  qualifyingMode: 92,
  racePaceSustainability: 91,
  compatibleEras: ['20s'],
  notes: '',
}

const driver: Driver = {
  id: 'driver-test',
  canonicalDriverId: 'driver-test',
  name: 'Driver Test',
  seasonYear: 2020,
  nationality: 'Test',
  tier: 'S',
  role: 'primary',
  era: '20s',
  overall: 94,
  qualifyingPace: 96,
  racePace: 94,
  wetSkill: 90,
  tireManagement: 92,
  overtaking: 90,
  defending: 88,
  consistency: 94,
  adaptability: 92,
  technicalFeedback: 92,
  pressureHandling: 94,
  aggression: 80,
  teamPlay: 82,
  errorProneness: 10,
  incidentRisk: 12,
  politicalTension: 18,
  preferredCarTraits: [],
  weakCarTraits: [],
  notes: '',
}

const riskyDriver: Driver = {
  ...driver,
  id: 'driver-risky',
  consistency: 78,
  aggression: 92,
  errorProneness: 24,
  incidentRisk: 26,
}

const secondary: Driver = {
  ...driver,
  id: 'driver-secondary',
  role: 'secondary',
  qualifyingPace: 88,
  racePace: 88,
  consistency: 90,
  teamPlay: 92,
  politicalTension: 10,
}

const tp: TeamPrincipal = {
  id: 'tp-test',
  name: 'TP Test',
  era: '20s',
  leadership: 88,
  politics: 82,
  crisisManagement: 84,
  driverManagement: 82,
  operationalDiscipline: 90,
  strategicPatience: 92,
  riskTolerance: 78,
  developmentCulture: 90,
  notes: '',
  budgetCost: 90,
}

const td: TechnicalDirector = {
  id: 'td-test',
  name: 'TD Test',
  era: '20s',
  aerodynamics: 92,
  mechanicalDesign: 90,
  innovation: 88,
  reliabilityFocus: 92,
  developmentSpeed: 94,
  regulationExploitation: 90,
  setupUnderstanding: 92,
  riskProfile: 82,
  notes: '',
  budgetCost: 95,
}

const fragileCar: Car = { ...car, reliability: 72, tireWear: 76, developmentPotential: 82 }
const fragileEngine: Engine = { ...engine, reliability: 70, coolingDemand: 78 }

const team = {
  driverPrimary: driver,
  driverSecondary: secondary,
  car,
  engine,
  teamPrincipal: tp,
  technicalDirector: td,
}

describe('Team philosophy strategy', () => {
  it('aggressive increases performance and risk on a reliable package', () => {
    const balanced = getTeamPhilosophyById('philosophy-balanced')!
    const aggressive = getTeamPhilosophyById('philosophy-aggressive')!
    const base = calculateRaceScore(driver, car, engine, circuit, tp, td, balanced, 0, false, { raceIndex: 1, totalRaces: 12 })
    const attack = calculateRaceScore(driver, car, engine, circuit, tp, td, aggressive, 0, false, { raceIndex: 1, totalRaces: 12 })
    expect(attack).toBeGreaterThan(base)
    const baseRisk = calculateReliabilityRisk(car, engine, circuit, balanced)
    const attackRisk = calculateReliabilityRisk(car, engine, circuit, aggressive)
    expect(attackRisk).toBeGreaterThanOrEqual(baseRisk)
  })

  it('conservative reduces reliability risk on a fragile package', () => {
    const balanced = getTeamPhilosophyById('philosophy-balanced')!
    const conservative = getTeamPhilosophyById('philosophy-conservative')!
    const baseRisk = calculateReliabilityRisk(fragileCar, fragileEngine, circuit, balanced)
    const safeRisk = calculateReliabilityRisk(fragileCar, fragileEngine, circuit, conservative)
    expect(safeRisk).toBeLessThan(baseRisk)
  })

  it('qualifying focused helps qualifying more than race pace', () => {
    const balanced = getTeamPhilosophyById('philosophy-balanced')!
    const quali = getTeamPhilosophyById('philosophy-qualifying-focused')!
    const qualiBase = calculateQualifyingScore(driver, car, engine, circuit, tp, td, balanced, { raceIndex: 1, totalRaces: 12 })
    const qualiBoost = calculateQualifyingScore(driver, car, engine, circuit, tp, td, quali, { raceIndex: 1, totalRaces: 12 })
    const raceBase = calculateRaceScore(driver, car, engine, circuit, tp, td, balanced, 0, false, { raceIndex: 1, totalRaces: 12 })
    const raceBoost = calculateRaceScore(driver, car, engine, circuit, tp, td, quali, 0, false, { raceIndex: 1, totalRaces: 12 })
    expect(qualiBoost - qualiBase).toBeGreaterThan(raceBoost - raceBase)
  })

  it('development focused starts negative and ends positive', () => {
    const development = getTeamPhilosophyById('philosophy-development-focused')!
    const early = getPhilosophyModifiersForRace(development, 0, 12, circuit)
    const late = getPhilosophyModifiersForRace(development, 10, 12, circuit)
    expect(early.qualifyingModifier).toBeLessThan(0)
    expect(early.raceModifier).toBeLessThan(0)
    expect(late.qualifyingModifier).toBeGreaterThan(0)
    expect(late.raceModifier).toBeGreaterThan(0)
  })

  it('evaluatePhilosophyFit recommends aggressive for a reliable package', () => {
    const aggressive = getTeamPhilosophyById('philosophy-aggressive')!
    const result = evaluatePhilosophyFit(team as any, aggressive, 'standard')
    expect(result.rating).toBe('recommended')
  })

  it('evaluatePhilosophyFit marks aggressive as risky for a fragile package', () => {
    const aggressive = getTeamPhilosophyById('philosophy-aggressive')!
    const result = evaluatePhilosophyFit(
      {
        ...team,
        car: fragileCar,
        engine: fragileEngine,
        driverPrimary: riskyDriver,
      } as any,
      aggressive,
      'standard'
    )
    expect(['risky', 'not_recommended']).toContain(result.rating)
  })

  it('evaluatePhilosophyFit recommends development in standard format with strong technical support', () => {
    const development = getTeamPhilosophyById('philosophy-development-focused')!
    const result = evaluatePhilosophyFit(team as any, development, 'standard')
    expect(result.rating).toBe('recommended')
  })

  it('evaluatePhilosophyFit does not recommend development in quick format', () => {
    const development = getTeamPhilosophyById('philosophy-development-focused')!
    const result = evaluatePhilosophyFit(team as any, development, 'quick')
    expect(['risky', 'not_recommended']).toContain(result.rating)
  })

  it('ghost teams choose coherent philosophies by archetype', () => {
    expect(getGhostPhilosophyIdsForArchetype('balanced_constructor')).toEqual(['philosophy-balanced'])
    expect(getGhostPhilosophyIdsForArchetype('reliability_machine')).toEqual(['philosophy-conservative'])
    expect(getGhostPhilosophyIdsForArchetype('aero_monster')).toContain('philosophy-aggressive')
    expect(getGhostPhilosophyIdsForArchetype('elite_driver_underdog_car')).toContain('philosophy-development-focused')
  })

  it('message files contain philosophy names and risk keys', () => {
    expect(ptBR.philosophy.balanced.name).toBeTruthy()
    expect(ptBR.philosophy.development_focused.quickWarning).toBeTruthy()
    expect(en.philosophy.qualifying_focused.description).toBeTruthy()
    expect(en.philosophy.fit.aggressiveRisk).toBeTruthy()
  })
})
