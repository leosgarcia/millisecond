import { describe, it, expect } from 'vitest'
import { explainRaceResult, explainChampionshipResult } from '@/domain/simulation/explainer'
import type { RaceEntry, RaceConditions, DriverStanding, ConstructorStanding, ResolvedTeam } from '@/domain/simulation/types'
import type { Circuit } from '@/domain/circuits/types'

const mockCircuit: Circuit = {
  id: 'test-circuit',
  name: 'Silverstone',
  country: 'UK',
  straightDemand: 65,
  slowCornerDemand: 40,
  mediumCornerDemand: 65,
  fastCornerDemand: 92,
  brakingDemand: 60,
  mechanicalGripDemand: 70,
  aeroDemand: 90,
  tireStress: 75,
  overtakingDifficulty: 45,
  qualifyingImportance: 65,
  rainProbability: 40,
  safetyCarProbability: 30,
  reliabilityStress: 50,
  driverErrorStress: 55,
  notes: '',
}

const makeMinimalDriver = (id: string, wetSkill = 80, tension = 40, teamPlay = 75) => ({
  id,
  name: `Driver ${id}`,
  seasonYear: 1990,
  nationality: 'Test',
  tier: 'A' as const,
  role: 'primary' as const,
  era: '90s' as const,
  overall: 80,
  qualifyingPace: 80,
  racePace: 80,
  wetSkill,
  tireManagement: 80,
  overtaking: 75,
  defending: 75,
  consistency: 80,
  adaptability: 75,
  technicalFeedback: 75,
  pressureHandling: 80,
  aggression: 70,
  teamPlay,
  errorProneness: 15,
  incidentRisk: 15,
  politicalTension: tension,
  preferredCarTraits: [],
  weakCarTraits: [],
  notes: '',
})

const mockTeam: ResolvedTeam = {
  id: 'player-team',
  name: 'Player Team',
  driverPrimary: makeMinimalDriver('dp', 90, 30, 80),
  driverSecondary: makeMinimalDriver('ds', 70, 25, 85),
  car: {
    id: 'car1',
    name: 'Test Car',
    seasonYear: 1992,
    teamName: 'Player Team',
    tier: 'S',
    era: '90s',
    overall: 95,
    aeroEfficiency: 95,
    slowCorner: 70,
    mediumCorner: 80,
    fastCorner: 95,
    straightLineSpeed: 88,
    mechanicalGrip: 78,
    braking: 90,
    tireWear: 80,
    setupWindow: 82,
    reliability: 90,
    developmentPotential: 85,
    stableRear: 0.9,
    strongFrontEnd: 0.8,
    nervousRear: 0.1,
    traction: 0.75,
    strengths: 'Fast corners',
    weaknesses: '',
    notes: '',
  },
  engine: {
    id: 'engine1',
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
  },
  teamPrincipal: {
    id: 'tp1',
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
  },
  technicalDirector: {
    id: 'td1',
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
  },
  philosophy: {
    id: 'phil1',
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
  },
  isGhost: false,
}

const mockFinishOrder: RaceEntry[] = [
  {
    teamId: 'player-team',
    teamName: 'Player Team',
    driverId: 'dp',
    driverName: 'Driver dp',
    isSecondary: false,
    qualifyingScore: 90,
    raceScore: 88,
    didFinish: true,
  },
  {
    teamId: 'ghost-1',
    teamName: 'Ghost 1',
    driverId: 'g1',
    driverName: 'Ghost Driver 1',
    isSecondary: false,
    qualifyingScore: 85,
    raceScore: 82,
    didFinish: true,
  },
  {
    teamId: 'ghost-2',
    teamName: 'Ghost 2',
    driverId: 'g2',
    driverName: 'Ghost Driver 2',
    isSecondary: false,
    qualifyingScore: 80,
    raceScore: 75,
    didFinish: false,
    dnfReason: 'reliability',
  },
]

const dryConditions: RaceConditions = {
  isWet: false,
  hasSafetyCar: false,
  tireStressLevel: 'high',
}

const wetConditions: RaceConditions = {
  isWet: true,
  hasSafetyCar: true,
  tireStressLevel: 'medium',
}

describe('explainRaceResult', () => {
  it('generates at least one explanation', () => {
    const explanations = explainRaceResult(mockFinishOrder, [mockTeam], mockCircuit, dryConditions)
    expect(explanations.length).toBeGreaterThan(0)
  })

  it('mentions winner name in explanations', () => {
    const explanations = explainRaceResult(mockFinishOrder, [mockTeam], mockCircuit, dryConditions)
    const hasWinnerMention = explanations.some((e) => e.includes('Driver dp'))
    expect(hasWinnerMention).toBe(true)
  })

  it('mentions DNF in explanations when there is a DNF', () => {
    const explanations = explainRaceResult(mockFinishOrder, [mockTeam], mockCircuit, dryConditions)
    const hasDNF = explanations.some(
      (e) => e.toLowerCase().includes('abandonou') || e.toLowerCase().includes('dnf')
    )
    expect(hasDNF).toBe(true)
  })

  it('mentions rain when conditions are wet', () => {
    const explanations = explainRaceResult(mockFinishOrder, [mockTeam], mockCircuit, wetConditions)
    const hasRain = explanations.some((e) => e.includes('chuva') || e.includes('🌧️'))
    expect(hasRain).toBe(true)
  })

  it('mentions safety car when hasSafetyCar = true', () => {
    const explanations = explainRaceResult(mockFinishOrder, [mockTeam], mockCircuit, wetConditions)
    const hasSC = explanations.some((e) => e.toLowerCase().includes('safety car'))
    expect(hasSC).toBe(true)
  })

  it('mentions high tire stress', () => {
    const explanations = explainRaceResult(mockFinishOrder, [mockTeam], mockCircuit, dryConditions)
    const hasTireNote = explanations.some((e) => e.includes('pneu') || e.includes('desgaste'))
    expect(hasTireNote).toBe(true)
  })

  it('all explanations are non-empty strings', () => {
    const explanations = explainRaceResult(mockFinishOrder, [mockTeam], mockCircuit, dryConditions)
    for (const exp of explanations) {
      expect(typeof exp).toBe('string')
      expect(exp.length).toBeGreaterThan(0)
    }
  })
})

describe('explainChampionshipResult', () => {
  const mockDriverStandings: DriverStanding[] = [
    {
      driverId: 'dp',
      driverName: 'Driver dp',
      teamId: 'player-team',
      teamName: 'Player Team',
      points: 175,
      wins: 4,
      podiums: 6,
      dnfs: 0,
      bestResult: 1,
    },
    {
      driverId: 'g1',
      driverName: 'Ghost Driver 1',
      teamId: 'ghost-1',
      teamName: 'Ghost 1',
      points: 120,
      wins: 2,
      podiums: 3,
      dnfs: 1,
      bestResult: 1,
    },
  ]

  const mockConstructorStandings: ConstructorStanding[] = [
    {
      teamId: 'player-team',
      teamName: 'Player Team',
      points: 240,
      wins: 4,
      podiums: 8,
    },
    {
      teamId: 'ghost-1',
      teamName: 'Ghost 1',
      points: 140,
      wins: 2,
      podiums: 4,
    },
  ]

  const mockRaces: any[] = []

  it('generates at least one championship explanation', () => {
    const explanations = explainChampionshipResult(
      mockDriverStandings,
      mockConstructorStandings,
      mockTeam,
      mockRaces
    )
    expect(explanations.length).toBeGreaterThan(0)
  })

  it('mentions champion driver name', () => {
    const explanations = explainChampionshipResult(
      mockDriverStandings,
      mockConstructorStandings,
      mockTeam,
      mockRaces
    )
    const hasChampion = explanations.some((e) => e.includes('Driver dp'))
    expect(hasChampion).toBe(true)
  })

  it('mentions constructor champion', () => {
    const explanations = explainChampionshipResult(
      mockDriverStandings,
      mockConstructorStandings,
      mockTeam,
      mockRaces
    )
    const hasConstructor = explanations.some((e) => e.includes('Player Team'))
    expect(hasConstructor).toBe(true)
  })

  it('all explanations are non-empty strings', () => {
    const explanations = explainChampionshipResult(
      mockDriverStandings,
      mockConstructorStandings,
      mockTeam,
      mockRaces
    )
    for (const exp of explanations) {
      expect(typeof exp).toBe('string')
      expect(exp.length).toBeGreaterThan(0)
    }
  })
})
