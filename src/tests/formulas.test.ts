import { describe, it, expect } from 'vitest'
import {
  calculateCarTrackFit,
  calculateEngineTrackFit,
  calculateQualifyingScore,
  calculateRaceScore,
  calculateDriverPairSynergy,
  calculateReliabilityRisk,
  calculateErrorRisk,
} from '@/domain/simulation/formulas'
import type { Car } from '@/domain/cars/types'
import type { Engine } from '@/domain/engines/types'
import type { Circuit } from '@/domain/circuits/types'
import type { Driver } from '@/domain/drivers/types'
import type { TeamPrincipal, TechnicalDirector, TeamPhilosophy } from '@/domain/teams/types'

// ─── FIXTURES ──────────────────────────────────────────────────────────────────

const mockCircuitFast: Circuit = {
  id: 'test-monza',
  name: 'Monza',
  country: 'Italy',
  straightDemand: 98,
  slowCornerDemand: 30,
  mediumCornerDemand: 30,
  fastCornerDemand: 60,
  brakingDemand: 90,
  mechanicalGripDemand: 40,
  aeroDemand: 45,
  tireStress: 50,
  overtakingDifficulty: 30,
  qualifyingImportance: 55,
  rainProbability: 20,
  safetyCarProbability: 30,
  reliabilityStress: 45,
  driverErrorStress: 35,
  notes: '',
}

const mockCircuitSlow: Circuit = {
  id: 'test-monaco',
  name: 'Monaco',
  country: 'Monaco',
  straightDemand: 30,
  slowCornerDemand: 95,
  mediumCornerDemand: 50,
  fastCornerDemand: 10,
  brakingDemand: 90,
  mechanicalGripDemand: 95,
  aeroDemand: 50,
  tireStress: 35,
  overtakingDifficulty: 98,
  qualifyingImportance: 99,
  rainProbability: 15,
  safetyCarProbability: 50,
  reliabilityStress: 25,
  driverErrorStress: 92,
  notes: '',
}

const mockCarFast: Car = {
  id: 'test-car-fast',
  name: 'Fast Car',
  seasonYear: 1992,
  teamName: 'TestTeam',
  tier: 'S',
  era: '90s',
  overall: 98,
  aeroEfficiency: 95,
  slowCorner: 60,
  mediumCorner: 75,
  fastCorner: 98,
  straightLineSpeed: 99,
  mechanicalGrip: 70,
  braking: 90,
  tireWear: 80,
  setupWindow: 82,
  reliability: 90,
  developmentPotential: 85,
  stableRear: 0.9,
  strongFrontEnd: 0.8,
  nervousRear: 0.1,
  traction: 0.75,
  strengths: '',
  weaknesses: '',
  notes: '',
}

const mockCarSlow: Car = {
  ...mockCarFast,
  id: 'test-car-slow',
  fastCorner: 50,
  straightLineSpeed: 55,
  slowCorner: 95,
  mechanicalGrip: 95,
}

const mockEngine: Engine = {
  id: 'test-engine',
  name: 'Test V10',
  manufacturer: 'Test',
  seasonYear: 1992,
  era: '90s',
  overall: 92,
  power: 90,
  torqueDelivery: 85,
  drivability: 88,
  fuelEfficiency: 85,
  energyRecovery: 0,
  weightEfficiency: 88,
  reliability: 90,
  coolingDemand: 65,
  qualifyingMode: 88,
  racePaceSustainability: 90,
  compatibleEras: ['90s'],
  notes: '',
}

const mockDriver: Driver = {
  id: 'test-driver',
  name: 'Test Driver',
  seasonYear: 1992,
  nationality: 'Test',
  tier: 'S',
  role: 'primary',
  era: '90s',
  overall: 95,
  qualifyingPace: 95,
  racePace: 95,
  wetSkill: 90,
  tireManagement: 85,
  overtaking: 90,
  defending: 88,
  consistency: 92,
  adaptability: 88,
  technicalFeedback: 90,
  pressureHandling: 95,
  aggression: 80,
  teamPlay: 70,
  errorProneness: 15,
  incidentRisk: 18,
  politicalTension: 65,
  preferredCarTraits: ['stableRear'],
  weakCarTraits: ['nervousRear'],
  notes: '',
}

const mockDriverB: Driver = {
  ...mockDriver,
  id: 'test-driver-b',
  teamPlay: 90,
  politicalTension: 20,
}

const mockTP: TeamPrincipal = {
  id: 'test-tp',
  name: 'Test TP',
  era: '90s',
  leadership: 90,
  politics: 80,
  crisisManagement: 85,
  driverManagement: 80,
  operationalDiscipline: 95,
  strategicPatience: 88,
  riskTolerance: 72,
  developmentCulture: 90,
  notes: '',
}

const mockTD: TechnicalDirector = {
  id: 'test-td',
  name: 'Test TD',
  era: '90s',
  aerodynamics: 95,
  mechanicalDesign: 88,
  innovation: 92,
  reliabilityFocus: 85,
  developmentSpeed: 88,
  regulationExploitation: 90,
  setupUnderstanding: 88,
  riskProfile: 78,
  notes: '',
}

const mockPhilosophy: TeamPhilosophy = {
  id: 'test-phil',
  name: 'Balanced',
  description: 'Test philosophy',
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

// ─── TESTS ────────────────────────────────────────────────────────────────────

describe('calculateCarTrackFit', () => {
  it('a fast car should score higher on a high-speed circuit', () => {
    const fitFast = calculateCarTrackFit(mockCarFast, mockCircuitFast)
    const fitSlow = calculateCarTrackFit(mockCarSlow, mockCircuitFast)
    expect(fitFast).toBeGreaterThan(fitSlow)
  })

  it('a slow-corner car should score higher on Monaco', () => {
    const fitFast = calculateCarTrackFit(mockCarFast, mockCircuitSlow)
    const fitSlow = calculateCarTrackFit(mockCarSlow, mockCircuitSlow)
    expect(fitSlow).toBeGreaterThan(fitFast)
  })

  it('score should be in [0, 100]', () => {
    const fit = calculateCarTrackFit(mockCarFast, mockCircuitFast)
    expect(fit).toBeGreaterThanOrEqual(0)
    expect(fit).toBeLessThanOrEqual(100)
  })
})

describe('calculateEngineTrackFit', () => {
  it('powerful engine benefits more on high straight demand circuit', () => {
    const powerEngine: Engine = { ...mockEngine, power: 100 }
    const weakEngine: Engine = { ...mockEngine, power: 50 }
    expect(calculateEngineTrackFit(powerEngine, mockCircuitFast)).toBeGreaterThan(
      calculateEngineTrackFit(weakEngine, mockCircuitFast)
    )
  })

  it('high cooling demand engine is penalized on hot circuit', () => {
    const hotEngine: Engine = { ...mockEngine, coolingDemand: 100 }
    const coolEngine: Engine = { ...mockEngine, coolingDemand: 20 }
    const hotCircuit: Circuit = { ...mockCircuitFast, tireStress: 100 }
    expect(calculateEngineTrackFit(coolEngine, hotCircuit)).toBeGreaterThan(
      calculateEngineTrackFit(hotEngine, hotCircuit)
    )
  })
})

describe('calculateDriverPairSynergy', () => {
  it('high teamPlay + low tension = positive synergy', () => {
    const synergy = calculateDriverPairSynergy(mockDriverB, mockDriverB)
    expect(synergy).toBeGreaterThan(0)
  })

  it('high tension drivers have negative synergy', () => {
    const tensionDriver: Driver = { ...mockDriver, politicalTension: 95, teamPlay: 40 }
    const synergy = calculateDriverPairSynergy(tensionDriver, tensionDriver)
    expect(synergy).toBeLessThan(0)
  })

  it('synergy is in [-5, 5]', () => {
    const s = calculateDriverPairSynergy(mockDriver, mockDriverB)
    expect(s).toBeGreaterThanOrEqual(-5)
    expect(s).toBeLessThanOrEqual(5)
  })
})

describe('calculateQualifyingScore', () => {
  it('returns a value in [0, 100]', () => {
    const score = calculateQualifyingScore(
      mockDriver, mockCarFast, mockEngine, mockCircuitFast, mockTP, mockTD, mockPhilosophy
    )
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('quali-focused philosophy raises qualifying score', () => {
    const qualiFocused: TeamPhilosophy = { ...mockPhilosophy, qualifyingModifier: 0.15 }
    const conservative: TeamPhilosophy = { ...mockPhilosophy, qualifyingModifier: -0.05 }
    const s1 = calculateQualifyingScore(mockDriver, mockCarFast, mockEngine, mockCircuitFast, mockTP, mockTD, qualiFocused)
    const s2 = calculateQualifyingScore(mockDriver, mockCarFast, mockEngine, mockCircuitFast, mockTP, mockTD, conservative)
    expect(s1).toBeGreaterThan(s2)
  })
})

describe('calculateRaceScore', () => {
  it('returns a value in [0, 100]', () => {
    const score = calculateRaceScore(
      mockDriver, mockCarFast, mockEngine, mockCircuitFast,
      mockTP, mockTD, mockPhilosophy, 0, false
    )
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('wet conditions boost high wetSkill driver', () => {
    const wetDriver: Driver = { ...mockDriver, wetSkill: 100 }
    const dryDriver: Driver = { ...mockDriver, wetSkill: 30 }
    const wetScore = calculateRaceScore(wetDriver, mockCarFast, mockEngine, mockCircuitFast, mockTP, mockTD, mockPhilosophy, 0, true)
    const dryScore = calculateRaceScore(dryDriver, mockCarFast, mockEngine, mockCircuitFast, mockTP, mockTD, mockPhilosophy, 0, true)
    expect(wetScore).toBeGreaterThan(dryScore)
  })
})

describe('calculateReliabilityRisk', () => {
  it('low reliability car/engine = higher DNF probability', () => {
    const unreliableCar: Car = { ...mockCarFast, reliability: 20 }
    const unreliableEngine: Engine = { ...mockEngine, reliability: 20 }
    const riskHigh = calculateReliabilityRisk(unreliableCar, unreliableEngine, mockCircuitFast, mockPhilosophy)
    const riskLow = calculateReliabilityRisk(mockCarFast, mockEngine, mockCircuitFast, mockPhilosophy)
    expect(riskHigh).toBeGreaterThan(riskLow)
  })

  it('conservative philosophy reduces reliability risk', () => {
    const conservative: TeamPhilosophy = { ...mockPhilosophy, reliabilityModifier: 0.15 }
    const attack: TeamPhilosophy = { ...mockPhilosophy, reliabilityModifier: -0.12 }
    const r1 = calculateReliabilityRisk(mockCarFast, mockEngine, mockCircuitFast, conservative)
    const r2 = calculateReliabilityRisk(mockCarFast, mockEngine, mockCircuitFast, attack)
    expect(r1).toBeLessThan(r2)
  })

  it('risk is in [0, 0.30]', () => {
    const risk = calculateReliabilityRisk(mockCarFast, mockEngine, mockCircuitFast, mockPhilosophy)
    expect(risk).toBeGreaterThanOrEqual(0)
    expect(risk).toBeLessThanOrEqual(0.30)
  })
})

describe('calculateErrorRisk', () => {
  it('high errorProneness + high driverErrorStress = higher error risk', () => {
    const clumsy: Driver = { ...mockDriver, errorProneness: 95 }
    const precise: Driver = { ...mockDriver, errorProneness: 5 }
    expect(calculateErrorRisk(clumsy, mockCircuitSlow)).toBeGreaterThan(
      calculateErrorRisk(precise, mockCircuitSlow)
    )
  })

  it('error risk is in [0, 0.20]', () => {
    const risk = calculateErrorRisk(mockDriver, mockCircuitSlow)
    expect(risk).toBeGreaterThanOrEqual(0)
    expect(risk).toBeLessThanOrEqual(0.20)
  })
})
