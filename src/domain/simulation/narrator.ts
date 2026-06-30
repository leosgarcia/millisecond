import { RaceDiagnostics, TeamSeasonDiagnostics, NarrativeEvent, ResolvedTeam, RaceResult } from './types'
import { Circuit } from '../circuits/types'

export function explainRace(diag: RaceDiagnostics, circuit: Circuit, team: ResolvedTeam): NarrativeEvent[] {
  const events: NarrativeEvent[] = []

  if (diag.mainStrengths.length === 0 && diag.mainWeaknesses.length === 0) {
    events.push({ key: 'Narrator.race.neutral', params: { teamName: team.name, circuitName: circuit.name } })
    return events
  }

  if (diag.mainStrengths.length > 0) {
    const s1 = diag.mainStrengths[0]
    if (s1.key === 'carTrackFit') {
      events.push({ key: 'Narrator.race.strength.carTrackFit', params: { circuitName: circuit.name } })
    } else if (s1.key === 'engineTrackFit') {
      events.push({ key: 'Narrator.race.strength.engineTrackFit' })
    } else if (s1.key === 'driverPairSynergy') {
      events.push({ key: 'Narrator.race.strength.driverPairSynergy' })
    } else if (s1.key === 'reliability') {
      events.push({ key: 'Narrator.race.strength.reliability' })
    }
  }

  if (diag.mainWeaknesses.length > 0) {
    const w1 = diag.mainWeaknesses[0]
    if (w1.key === 'carTrackFit') {
      events.push({ key: 'Narrator.race.weakness.carTrackFit' })
    } else if (w1.key === 'engineTrackFit') {
      events.push({ key: 'Narrator.race.weakness.engineTrackFit' })
    } else if (w1.key === 'driverPairSynergy') {
      events.push({ key: 'Narrator.race.weakness.driverPairSynergy' })
    } else if (w1.key === 'reliability') {
      events.push({ key: 'Narrator.race.weakness.reliability' })
    } else if (w1.key === 'errorRisk') {
      events.push({ key: 'Narrator.race.weakness.errorRisk' })
    }
  }

  return events
}

export function explainChampionship(season: TeamSeasonDiagnostics, team: ResolvedTeam): NarrativeEvent {
  if (season.budgetEfficiency > 20) {
    return { key: 'Narrator.championship.brilliant', params: { teamName: team.name } }
  } else if (season.budgetEfficiency < 5) {
    return { key: 'Narrator.championship.difficult', params: { teamName: team.name } }
  }
  return { key: 'Narrator.championship.average', params: { teamName: team.name } }
}

export function explainBudgetEfficiency(season: TeamSeasonDiagnostics, team: ResolvedTeam): NarrativeEvent {
  if (season.bestBudgetValue && season.worstBudgetValue) {
    return { key: 'Narrator.budget.mixed', params: { efficiency: season.budgetEfficiency.toFixed(1), best: season.bestBudgetValue.name, worst: season.worstBudgetValue.name } }
  } else if (season.bestBudgetValue) {
    return { key: 'Narrator.budget.good', params: { efficiency: season.budgetEfficiency.toFixed(1), best: season.bestBudgetValue.name } }
  } else if (season.worstBudgetValue) {
    return { key: 'Narrator.budget.bad', params: { efficiency: season.budgetEfficiency.toFixed(1), worst: season.worstBudgetValue.name } }
  }
  return { key: 'Narrator.budget.neutral', params: { efficiency: season.budgetEfficiency.toFixed(1) } }
}

export function explainSeasonBottleneck(season: TeamSeasonDiagnostics): NarrativeEvent {
  if (!season.seasonBottleneck) {
    return { key: 'Narrator.bottleneck.none' }
  }
  
  const bottleneck = season.seasonBottleneck
  if (bottleneck.key === 'carTrackFit') {
    return { key: 'Narrator.bottleneck.carTrackFit' }
  } else if (bottleneck.key === 'engineTrackFit') {
    return { key: 'Narrator.bottleneck.engineTrackFit' }
  } else if (bottleneck.key === 'reliability') {
    return { key: 'Narrator.bottleneck.reliability' }
  }
  
  return { key: 'Narrator.bottleneck.generic', params: { label: bottleneck.label } }
}

export function explainDecisiveMoment(season: TeamSeasonDiagnostics, races: RaceResult[]): NarrativeEvent {
  if (!season.decisiveRaceId) {
    return { key: 'Narrator.decisiveMoment.none' }
  }
  const race = races.find(r => r.circuitId === season.decisiveRaceId)
  return { key: 'Narrator.decisiveMoment.peak', params: { circuitName: race?.circuitName ?? season.decisiveRaceId } }
}
