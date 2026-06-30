import { describe, expect, it } from 'vitest'
import { getTrackProfiles } from '@/domain/circuits/profiles'
import { calculateCarTrackFit, calculateEngineTrackFit, calculateRaceScore } from '@/domain/simulation/formulas'
import { summarizeTrackSensitivity } from '@/domain/simulation/trackSensitivity'
import type { Circuit } from '@/domain/circuits/types'
import type { Car } from '@/domain/cars/types'
import type { Driver } from '@/domain/drivers/types'
import type { Engine } from '@/domain/engines/types'
import type { TeamPrincipal, TechnicalDirector, TeamPhilosophy } from '@/domain/teams/types'

const makeCircuit = (overrides: Partial<Circuit>): Circuit =>
  ({
    id: 'circuit-test',
    name: 'Test Circuit',
    country: 'Test',
    straightDemand: 70,
    slowCornerDemand: 70,
    mediumCornerDemand: 70,
    fastCornerDemand: 70,
    brakingDemand: 70,
    mechanicalGripDemand: 70,
    aeroDemand: 70,
    tireStress: 70,
    overtakingDifficulty: 70,
    qualifyingImportance: 70,
    rainProbability: 20,
    safetyCarProbability: 20,
    reliabilityStress: 70,
    driverErrorStress: 70,
    notes: '',
    ...overrides,
  }) as Circuit

const monza: Circuit = makeCircuit({
  id: 'circuit-monza',
  name: 'Autodromo Nazionale Monza',
  straightDemand: 99,
  slowCornerDemand: 75,
  mediumCornerDemand: 60,
  fastCornerDemand: 85,
  brakingDemand: 95,
  mechanicalGripDemand: 80,
  aeroDemand: 50,
  tireStress: 75,
  overtakingDifficulty: 65,
  qualifyingImportance: 70,
  reliabilityStress: 95,
  driverErrorStress: 70,
  countryCode: 'IT',
})

const monaco: Circuit = makeCircuit({
  id: 'circuit-monaco',
  name: 'Circuit de Monaco',
  straightDemand: 50,
  slowCornerDemand: 98,
  mediumCornerDemand: 60,
  fastCornerDemand: 50,
  brakingDemand: 75,
  mechanicalGripDemand: 95,
  aeroDemand: 95,
  tireStress: 60,
  overtakingDifficulty: 99,
  qualifyingImportance: 98,
  reliabilityStress: 70,
  driverErrorStress: 95,
  countryCode: 'MC',
})

const spa: Circuit = makeCircuit({
  id: 'circuit-spa',
  name: 'Circuit de Spa-Francorchamps',
  straightDemand: 85,
  slowCornerDemand: 65,
  mediumCornerDemand: 80,
  fastCornerDemand: 95,
  brakingDemand: 75,
  mechanicalGripDemand: 70,
  aeroDemand: 75,
  tireStress: 85,
  overtakingDifficulty: 60,
  qualifyingImportance: 65,
  rainProbability: 60,
  safetyCarProbability: 55,
  reliabilityStress: 85,
  driverErrorStress: 80,
  countryCode: 'BE',
})

const suzuka: Circuit = makeCircuit({
  id: 'circuit-suzuka',
  name: 'Suzuka International Racing Course',
  straightDemand: 75,
  slowCornerDemand: 70,
  mediumCornerDemand: 85,
  fastCornerDemand: 95,
  brakingDemand: 70,
  mechanicalGripDemand: 70,
  aeroDemand: 95,
  tireStress: 90,
  overtakingDifficulty: 85,
  qualifyingImportance: 85,
  rainProbability: 40,
  safetyCarProbability: 50,
  reliabilityStress: 75,
  driverErrorStress: 85,
  countryCode: 'JP',
})

const singapore: Circuit = makeCircuit({
  id: 'circuit-singapore',
  name: 'Marina Bay Street Circuit',
  straightDemand: 65,
  slowCornerDemand: 95,
  mediumCornerDemand: 75,
  fastCornerDemand: 55,
  brakingDemand: 90,
  mechanicalGripDemand: 95,
  aeroDemand: 95,
  tireStress: 80,
  overtakingDifficulty: 90,
  qualifyingImportance: 95,
  rainProbability: 35,
  safetyCarProbability: 95,
  reliabilityStress: 90,
  driverErrorStress: 98,
  countryCode: 'SG',
})

const bahrain: Circuit = makeCircuit({
  id: 'circuit-bahrain',
  name: 'Bahrain International Circuit',
  straightDemand: 85,
  slowCornerDemand: 85,
  mediumCornerDemand: 70,
  fastCornerDemand: 65,
  brakingDemand: 95,
  mechanicalGripDemand: 90,
  aeroDemand: 75,
  tireStress: 95,
  overtakingDifficulty: 60,
  qualifyingImportance: 70,
  rainProbability: 5,
  safetyCarProbability: 35,
  reliabilityStress: 80,
  driverErrorStress: 65,
  countryCode: 'BH',
})

const makeCar = (overrides: Partial<Car>): Car =>
  ({
    id: 'car-test',
    name: 'Car Test',
    seasonYear: 2000,
    teamName: 'Test',
    tier: 'A',
    era: '90s',
    overall: 80,
    aeroEfficiency: 80,
    slowCorner: 80,
    mediumCorner: 80,
    fastCorner: 80,
    straightLineSpeed: 80,
    mechanicalGrip: 80,
    braking: 80,
    tireWear: 80,
    setupWindow: 80,
    reliability: 80,
    developmentPotential: 80,
    stableRear: 0.5,
    strongFrontEnd: 0.5,
    nervousRear: 0.5,
    traction: 0.5,
    strengths: '',
    weaknesses: '',
    notes: '',
    budgetCost: 100,
    ...overrides,
  }) as Car

const makeEngine = (overrides: Partial<Engine>): Engine =>
  ({
    id: 'engine-test',
    name: 'Engine Test',
    manufacturer: 'Test',
    seasonYear: 2000,
    era: '90s',
    overall: 80,
    power: 80,
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
    budgetCost: 100,
    ...overrides,
  }) as Engine

const makeDriver = (overrides: Partial<Driver>): Driver =>
  ({
    id: 'driver-test',
    name: 'Driver Test',
    seasonYear: 2000,
    nationality: 'Test',
    canonicalDriverId: 'driver-test',
    tier: 'A',
    role: 'primary',
    era: '90s',
    overall: 80,
    qualifyingPace: 80,
    racePace: 80,
    wetSkill: 80,
    tireManagement: 80,
    overtaking: 80,
    defending: 80,
    consistency: 80,
    adaptability: 80,
    technicalFeedback: 80,
    pressureHandling: 80,
    aggression: 70,
    teamPlay: 80,
    errorProneness: 20,
    incidentRisk: 20,
    politicalTension: 40,
    preferredCarTraits: [],
    weakCarTraits: [],
    notes: '',
    budgetCost: 100,
    ...overrides,
  }) as Driver

const tp: TeamPrincipal = {
  id: 'tp-test',
  name: 'TP Test',
  era: '90s',
  leadership: 80,
  politics: 70,
  crisisManagement: 80,
  driverManagement: 80,
  operationalDiscipline: 80,
  strategicPatience: 80,
  riskTolerance: 80,
  developmentCulture: 80,
  notes: '',
  budgetCost: 80,
}

const td: TechnicalDirector = {
  id: 'td-test',
  name: 'TD Test',
  era: '90s',
  aerodynamics: 80,
  mechanicalDesign: 80,
  innovation: 80,
  reliabilityFocus: 80,
  developmentSpeed: 80,
  regulationExploitation: 80,
  setupUnderstanding: 80,
  riskProfile: 80,
  notes: '',
  budgetCost: 80,
}

const philosophy: TeamPhilosophy = {
  id: 'phil-test',
  name: 'Balanced',
  description: '',
  qualifyingModifier: 0,
  raceModifier: 0,
  reliabilityModifier: 0,
  tireModifier: 0,
  aggressionModifier: 0,
  overtakingModifier: 0,
  consistencyModifier: 0,
  errorRiskModifier: 0,
  trackPositionModifier: 0,
  developmentModifier: 0,
}

describe('track profiles', () => {
  it('infers expected profiles for Monza and Monaco', () => {
    expect(getTrackProfiles(monza)).toContain('power_track')
    expect(getTrackProfiles(monza)).not.toContain('braking_heavy')
    expect(getTrackProfiles(monaco)).toContain('street_circuit')
    expect(getTrackProfiles(monaco)).toContain('high_downforce')
  })
})

describe('calculateCarTrackFit', () => {
  it('favors a Monza-specialized car over a Monaco specialist on Monza', () => {
    const powerCar = makeCar({
      overall: 78,
      straightLineSpeed: 99,
      braking: 96,
      setupWindow: 85,
      slowCorner: 70,
      mechanicalGrip: 72,
    })
    const monacoCar = makeCar({
      overall: 86,
      straightLineSpeed: 72,
      braking: 86,
      setupWindow: 92,
      slowCorner: 98,
      mechanicalGrip: 97,
      aeroEfficiency: 95,
    })

    expect(calculateCarTrackFit(powerCar, monza)).toBeGreaterThan(calculateCarTrackFit(monacoCar, monza))
  })

  it('favors a Monaco specialist over a power car on Monaco', () => {
    const powerCar = makeCar({
      overall: 78,
      straightLineSpeed: 99,
      braking: 96,
      setupWindow: 85,
      slowCorner: 70,
      mechanicalGrip: 72,
    })
    const monacoCar = makeCar({
      overall: 86,
      straightLineSpeed: 72,
      braking: 86,
      setupWindow: 92,
      slowCorner: 98,
      mechanicalGrip: 97,
      aeroEfficiency: 95,
    })

    expect(calculateCarTrackFit(monacoCar, monaco)).toBeGreaterThan(calculateCarTrackFit(powerCar, monaco))
  })

  it('does not let overall dominate a track-specific mismatch', () => {
    const weakOverallStrongMonza = makeCar({
      overall: 68,
      straightLineSpeed: 99,
      braking: 97,
      setupWindow: 88,
    })
    const strongOverallWeakMonza = makeCar({
      overall: 92,
      straightLineSpeed: 78,
      braking: 78,
      setupWindow: 78,
    })

    expect(calculateCarTrackFit(weakOverallStrongMonza, monza)).toBeGreaterThan(
      calculateCarTrackFit(strongOverallWeakMonza, monza)
    )
  })
})

describe('calculateEngineTrackFit', () => {
  it('favors a power engine on Monza more than on Monaco', () => {
    const powerEngine = makeEngine({
      overall: 78,
      power: 99,
      qualifyingMode: 97,
      racePaceSustainability: 95,
      drivability: 88,
      coolingDemand: 65,
    })

    expect(calculateEngineTrackFit(powerEngine, monza)).toBeGreaterThan(calculateEngineTrackFit(powerEngine, monaco))
  })

  it('penalizes high cooling demand on Bahrain', () => {
    const coolEngine = makeEngine({
      overall: 80,
      power: 90,
      drivability: 90,
      reliability: 88,
      coolingDemand: 20,
    })
    const hotEngine = makeEngine({
      overall: 80,
      power: 90,
      drivability: 90,
      reliability: 88,
      coolingDemand: 95,
    })

    expect(calculateEngineTrackFit(coolEngine, bahrain)).toBeGreaterThan(calculateEngineTrackFit(hotEngine, bahrain))
  })
})

describe('calculateRaceScore', () => {
  it('makes low consistency hurt more on Singapore', () => {
    const stableDriver = makeDriver({ consistency: 96, pressureHandling: 94, wetSkill: 85, racePace: 88 })
    const shakyDriver = makeDriver({ consistency: 62, pressureHandling: 62, wetSkill: 85, racePace: 88 })
    const car = makeCar({ overall: 82, slowCorner: 92, mechanicalGrip: 94, braking: 91, aeroEfficiency: 90 })
    const engine = makeEngine({ overall: 82, drivability: 90, reliability: 90, coolingDemand: 55 })

    expect(
      calculateRaceScore(stableDriver, car, engine, singapore, tp, td, philosophy, 0, false)
    ).toBeGreaterThan(calculateRaceScore(shakyDriver, car, engine, singapore, tp, td, philosophy, 0, false))
  })

  it('keeps wet skill relevant only in wet or wet-prone contexts', () => {
    const wetDriver = makeDriver({ wetSkill: 100, consistency: 88 })
    const dryDriver = makeDriver({ wetSkill: 60, consistency: 88 })
    const car = makeCar({ overall: 82, slowCorner: 92, mechanicalGrip: 94, braking: 91, aeroEfficiency: 90 })
    const engine = makeEngine({ overall: 82, drivability: 90, reliability: 90, coolingDemand: 55 })

    const wetResult = calculateRaceScore(wetDriver, car, engine, spa, tp, td, philosophy, 0, true)
    const dryResult = calculateRaceScore(dryDriver, car, engine, spa, tp, td, philosophy, 0, false)

    expect(wetResult).toBeGreaterThan(dryResult)
  })
})

describe('track sensitivity audit helper', () => {
  it('emits a warning when the same package wins every track', () => {
    const summary = summarizeTrackSensitivity([
      {
        circuit: 'Monza',
        expected: ['power_package'],
        scores: [{ variant: 'power_package', teamId: '1', avgPoints: 25, avgPosition: 1 }],
        winner: { variant: 'power_package', teamId: '1', avgPoints: 25, avgPosition: 1 },
        runnerUp: { variant: 'balanced_package', teamId: '2', avgPoints: 18, avgPosition: 2 },
        gap: 7,
        baseline: { variant: 'balanced_package', teamId: '3', avgPoints: 10, avgPosition: 3 },
        decisiveAttributes: ['power'],
        why: 'Power',
        alignment: 'power_package > balanced_package',
      },
      {
        circuit: 'Monaco',
        expected: ['monaco_specialist'],
        scores: [{ variant: 'power_package', teamId: '1', avgPoints: 24, avgPosition: 1 }],
        winner: { variant: 'power_package', teamId: '1', avgPoints: 24, avgPosition: 1 },
        runnerUp: { variant: 'balanced_package', teamId: '2', avgPoints: 19, avgPosition: 2 },
        gap: 5,
        baseline: { variant: 'balanced_package', teamId: '3', avgPoints: 10, avgPosition: 3 },
        decisiveAttributes: ['power'],
        why: 'Power',
        alignment: 'power_package > balanced_package',
      },
    ])

    expect(summary.repeatedWinner).toBe('power_package')
    expect(summary.warnings.some((warning) => warning.includes('same package won every audited track'))).toBe(true)
  })
})
