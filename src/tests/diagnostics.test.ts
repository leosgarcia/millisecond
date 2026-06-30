import { describe, it, expect } from 'vitest'
import {
  identifyMainRaceStrengths,
  identifyMainRaceWeaknesses,
  calculateBudgetEfficiency
} from '../domain/simulation/diagnostics'
import { ScoreBreakdown } from '../domain/simulation/types'
import { Circuit } from '../domain/circuits/types'
import { ResolvedTeam } from '../domain/simulation/types'

describe('Simulation Diagnostics', () => {
  const dummyCircuit: Circuit = {
    id: 'c1',
    name: 'Monza',
    country: 'Italy',
    rainProbability: 0,
    safetyCarProbability: 0,
    overtakingDifficulty: 20,
    tireStress: 30,
    driverErrorStress: 20,
    reliabilityStress: 80,
    fastCornerDemand: 20,
    slowCornerDemand: 30,
    mediumCornerDemand: 30,
    straightDemand: 100,
    mechanicalGripDemand: 20,
    brakingDemand: 80,
    aeroDemand: 20
  }

  const baseBreakdown: ScoreBreakdown = {
    qualifyingScore: 90,
    raceScore: 90,
    carTrackFit: 90,
    engineTrackFit: 90,
    driverCarCompatibility: 0,
    driverPairSynergy: 0,
    teamPrincipalBonus: 0,
    technicalDirectorBonus: 0,
    strategyFit: 90,
    setupFit: 90,
    teamOperationalBonus: 90,
    reliabilityRisk: 0.01,
    errorRisk: 0.05
  }

  it('should identify strengths correctly', () => {
    const strengths = identifyMainRaceStrengths(baseBreakdown, dummyCircuit)
    expect(strengths.map(s => s.key)).toContain('carTrackFit')
    expect(strengths.map(s => s.key)).toContain('engineTrackFit')
    expect(strengths.map(s => s.key)).toContain('reliability')
  })

  it('should identify weaknesses correctly', () => {
    const badBreakdown = {
      ...baseBreakdown,
      carTrackFit: 40,
      engineTrackFit: 50,
      reliabilityRisk: 0.20,
      errorRisk: 0.15
    }
    const weaknesses = identifyMainRaceWeaknesses(badBreakdown, dummyCircuit)
    expect(weaknesses.map(w => w.key)).toContain('carTrackFit')
    expect(weaknesses.map(w => w.key)).toContain('engineTrackFit')
    expect(weaknesses.map(w => w.key)).toContain('reliability')
  })

  it('should calculate budget efficiency', () => {
    const mockTeam = {
      driverPrimary: { budgetCost: 300 },
      driverSecondary: { budgetCost: 150 },
      car: { budgetCost: 200 },
      engine: { budgetCost: 200 },
      teamPrincipal: { budgetCost: 100 },
      technicalDirector: { budgetCost: 50 },
      philosophy: { budgetCost: 0 }
    } as unknown as ResolvedTeam

    // Total cost = 1000
    // Points = 50 => Efficiency = (50 / 1000) * 100 = 5.0
    const eff = calculateBudgetEfficiency(mockTeam, 50)
    expect(eff).toBe(5)
  })
})
