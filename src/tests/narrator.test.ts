import { describe, it, expect } from 'vitest'
import { explainRace, explainChampionship } from '../domain/simulation/narrator'
import { RaceDiagnostics, TeamSeasonDiagnostics, ResolvedTeam } from '../domain/simulation/types'
import { Circuit } from '../domain/circuits/types'

describe('Narrator Module', () => {
  const dummyTeam = { name: 'Lotus Lendária' } as ResolvedTeam
  const dummyCircuit = { name: 'Monza' } as Circuit

  it('should return NarrativeEvent for neutral race', () => {
    const diag: RaceDiagnostics = {
      raceId: 'r1', circuitId: 'c1', teamId: 't1', driverId: 'd1',
      qualifyingScore: 90, raceScore: 90, carTrackFit: 80, engineTrackFit: 80, driverCarCompatibility: 0, driverPairSynergy: 0, reliabilityRisk: 0, errorRisk: 0, strategyFit: 80,
      mainStrengths: [],
      mainWeaknesses: []
    }
    
    const events = explainRace(diag, dummyCircuit, dummyTeam)
    expect(events.length).toBe(1)
    expect(events[0].key).toBe('Narrator.race.neutral')
    expect(events[0].params?.teamName).toBe('Lotus Lendária')
    expect(events[0].params?.circuitName).toBe('Monza')
  })

  it('should return NarrativeEvent for championship brilliant', () => {
    const seasonDiag: TeamSeasonDiagnostics = {
      teamId: 't1',
      budgetEfficiency: 25,
      seasonBottleneck: null,
      decisiveRaceId: null,
      leadDriverImpact: null,
      secondDriverImpact: null
    }

    const event = explainChampionship(seasonDiag, dummyTeam)
    expect(event.key).toBe('Narrator.championship.brilliant')
  })
})
