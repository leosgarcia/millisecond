import {
  DiagnosticFactor,
  RaceDiagnostics,
  TeamSeasonDiagnostics,
  RaceEntry,
  RaceResult,
  ResolvedTeam,
  ScoreBreakdown,
  ChampionshipResult,
  DriverStanding,
  ConstructorStanding
} from './types'
import { Circuit } from '../circuits/types'
import { getBudgetBreakdown } from './budget'

const severityWeight = { critical: 4, high: 3, medium: 2, low: 1 }

export function identifyMainRaceStrengths(breakdown: ScoreBreakdown, circuit: Circuit): DiagnosticFactor[] {
  const strengths: DiagnosticFactor[] = []
  
  if (breakdown.carTrackFit > 85) {
    strengths.push({
      key: 'carTrackFit',
      label: 'Fit de Chassi',
      value: breakdown.carTrackFit,
      impact: 'positive',
      severity: breakdown.carTrackFit > 95 ? 'critical' : 'high'
    })
  }

  if (breakdown.engineTrackFit > 85 && circuit.straightDemand > 70) {
    strengths.push({
      key: 'engineTrackFit',
      label: 'Fit de Motor nas Retas',
      value: breakdown.engineTrackFit,
      impact: 'positive',
      severity: 'high'
    })
  }

  if (breakdown.driverPairSynergy > 2.5) {
    strengths.push({
      key: 'driverPairSynergy',
      label: 'Sinergia da Dupla',
      value: breakdown.driverPairSynergy,
      impact: 'positive',
      severity: 'medium'
    })
  }

  if (breakdown.reliabilityRisk < 0.05) {
    strengths.push({
      key: 'reliability',
      label: 'Confiabilidade',
      value: breakdown.reliabilityRisk,
      impact: 'positive',
      severity: 'high'
    })
  }

  return strengths.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity]).slice(0, 3)
}

export function identifyMainRaceWeaknesses(breakdown: ScoreBreakdown, circuit: Circuit): DiagnosticFactor[] {
  const weaknesses: DiagnosticFactor[] = []
  
  if (breakdown.carTrackFit < 65) {
    weaknesses.push({
      key: 'carTrackFit',
      label: 'Fit de Chassi',
      value: breakdown.carTrackFit,
      impact: 'negative',
      severity: breakdown.carTrackFit < 50 ? 'critical' : 'high'
    })
  }

  if (breakdown.engineTrackFit < 65 && circuit.straightDemand > 75) {
    weaknesses.push({
      key: 'engineTrackFit',
      label: 'Falta de Motor nas Retas',
      value: breakdown.engineTrackFit,
      impact: 'negative',
      severity: 'high'
    })
  }

  if (breakdown.driverPairSynergy < -2.5) {
    weaknesses.push({
      key: 'driverPairSynergy',
      label: 'Conflito da Dupla',
      value: breakdown.driverPairSynergy,
      impact: 'negative',
      severity: 'high'
    })
  }

  if (breakdown.reliabilityRisk > 0.15) {
    weaknesses.push({
      key: 'reliability',
      label: 'Risco de Quebra',
      value: breakdown.reliabilityRisk,
      impact: 'negative',
      severity: 'critical'
    })
  }

  if (breakdown.errorRisk > 0.10) {
    weaknesses.push({
      key: 'errorRisk',
      label: 'Risco de Erro do Piloto',
      value: breakdown.errorRisk,
      impact: 'negative',
      severity: 'high'
    })
  }

  return weaknesses.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity]).slice(0, 3)
}

export function buildRaceDiagnostics(
  raceId: string,
  circuit: Circuit,
  team: ResolvedTeam,
  driverId: string,
  entry: RaceEntry,
  breakdown: ScoreBreakdown
): RaceDiagnostics {
  return {
    raceId,
    circuitId: circuit.id,
    teamId: team.id,
    driverId,
    qualifyingScore: breakdown.qualifyingScore,
    raceScore: breakdown.raceScore,
    carTrackFit: breakdown.carTrackFit,
    engineTrackFit: breakdown.engineTrackFit,
    driverCarCompatibility: breakdown.driverCarCompatibility,
    driverPairSynergy: breakdown.driverPairSynergy,
    reliabilityRisk: breakdown.reliabilityRisk,
    errorRisk: breakdown.errorRisk,
    strategyFit: breakdown.strategyFit,
    mainStrengths: identifyMainRaceStrengths(breakdown, circuit),
    mainWeaknesses: identifyMainRaceWeaknesses(breakdown, circuit),
  }
}

export function calculateBudgetEfficiency(team: ResolvedTeam, points: number): number {
  const breakdown = getBudgetBreakdown(team)
  if (points === 0) return 0
  // pts per 100 ms
  return (points / breakdown.used) * 100
}

export function identifyBestBudgetValue(team: ResolvedTeam, races: RaceResult[], driverStandings: DriverStanding[]) {
  // Rough heuristic: primary driver points vs cost
  const p1 = driverStandings.find(d => d.driverId === team.driverPrimary.id)?.points || 0
  const p2 = driverStandings.find(d => d.driverId === team.driverSecondary.id)?.points || 0
  
  const eff1 = p1 > 0 ? (p1 / team.driverPrimary.budgetCost) : 0
  const eff2 = p2 > 0 ? (p2 / team.driverSecondary.budgetCost) : 0
  
  if (eff1 > eff2 && eff1 > 0.5) {
    return { type: 'driverPrimary', name: team.driverPrimary.name, efficiency: eff1 }
  } else if (eff2 > eff1 && eff2 > 0.5) {
    return { type: 'driverSecondary', name: team.driverSecondary.name, efficiency: eff2 }
  }
  return undefined
}

export function identifyWorstBudgetValue(team: ResolvedTeam, races: RaceResult[], driverStandings: DriverStanding[]) {
  const p1 = driverStandings.find(d => d.driverId === team.driverPrimary.id)?.points || 0
  const p2 = driverStandings.find(d => d.driverId === team.driverSecondary.id)?.points || 0
  
  const eff1 = team.driverPrimary.budgetCost > 150 && p1 < 20 ? (p1 / team.driverPrimary.budgetCost) : 999
  const eff2 = team.driverSecondary.budgetCost > 120 && p2 < 10 ? (p2 / team.driverSecondary.budgetCost) : 999
  
  if (eff1 < eff2 && eff1 < 0.2) {
    return { type: 'driverPrimary', name: team.driverPrimary.name, efficiency: eff1 }
  } else if (eff2 < eff1 && eff2 < 0.2) {
    return { type: 'driverSecondary', name: team.driverSecondary.name, efficiency: eff2 }
  }
  return undefined
}

export function identifySeasonBottleneck(team: ResolvedTeam, diagnostics: RaceDiagnostics[], circuits: Circuit[]): DiagnosticFactor | null {
  // Aggregate weaknesses
  let lowCarCount = 0
  let lowEngineCount = 0
  let highReliabilityRisk = 0

  diagnostics.forEach(d => {
    if (d.carTrackFit < 70) lowCarCount++
    if (d.engineTrackFit < 70) lowEngineCount++
    if (d.reliabilityRisk > 0.12) highReliabilityRisk++
  })

  if (lowCarCount > diagnostics.length / 2) {
    return { key: 'carTrackFit', label: 'Chassi Limitado', value: lowCarCount, impact: 'negative', severity: 'high' }
  }
  if (lowEngineCount > diagnostics.length / 2) {
    return { key: 'engineTrackFit', label: 'Déficit de Motor', value: lowEngineCount, impact: 'negative', severity: 'high' }
  }
  if (highReliabilityRisk > diagnostics.length / 2) {
    return { key: 'reliability', label: 'Confiabilidade Frágil', value: highReliabilityRisk, impact: 'negative', severity: 'critical' }
  }

  return null
}

export function identifyDecisiveRace(teamId: string, races: RaceResult[]): string | null {
  let maxPoints = -1
  let decisiveRace: string | null = null
  
  // Find the race where the team scored the most points
  races.forEach(r => {
    let pts = 0
    r.entries.forEach((e, idx) => {
      if (e.teamId === teamId && e.didFinish) {
        const pMap: Record<number, number> = {1:25, 2:18, 3:15, 4:12, 5:10, 6:8, 7:6, 8:4, 9:2, 10:1}
        pts += pMap[idx+1] || 0
      }
    })
    if (pts > maxPoints) {
      maxPoints = pts
      decisiveRace = r.circuitId
    }
  })

  return decisiveRace
}

export function identifyLeadDriverImpact(team: ResolvedTeam, driverStandings: DriverStanding[]): DiagnosticFactor | null {
  const p1 = driverStandings.find(d => d.driverId === team.driverPrimary.id)
  if (!p1) return null
  
  if (p1.points > 100) {
    return { key: 'leadDriver', label: 'Piloto Primário Dominante', value: p1.points, impact: 'positive', severity: 'high' }
  } else if (p1.points < 25 && team.driverPrimary.budgetCost > 150) {
    return { key: 'leadDriver', label: 'Piloto Primário Decepcionante', value: p1.points, impact: 'negative', severity: 'critical' }
  }
  return null
}

export function identifySecondDriverImpact(team: ResolvedTeam, driverStandings: DriverStanding[]): DiagnosticFactor | null {
  const p1 = driverStandings.find(d => d.driverId === team.driverPrimary.id)?.points || 0
  const p2 = driverStandings.find(d => d.driverId === team.driverSecondary.id)?.points || 0
  
  if (p2 > 0 && p2 >= p1 * 0.7) {
    return { key: 'secondDriver', label: 'Segundo Piloto Forte', value: p2, impact: 'positive', severity: 'high' }
  } else if (p1 > 50 && p2 < p1 * 0.2) {
    return { key: 'secondDriver', label: 'Segundo Piloto Ausente', value: p2, impact: 'negative', severity: 'high' }
  }
  return null
}

export function buildTeamSeasonDiagnostics(
  team: ResolvedTeam,
  races: RaceResult[],
  driverStandings: DriverStanding[],
  constructorStandings: ConstructorStanding[],
  raceDiagnostics: RaceDiagnostics[],
  circuits: Circuit[]
): TeamSeasonDiagnostics {
  const teamStandings = constructorStandings.find(c => c.teamId === team.id)
  const totalPoints = teamStandings?.points || 0

  return {
    teamId: team.id,
    budgetEfficiency: calculateBudgetEfficiency(team, totalPoints),
    bestBudgetValue: identifyBestBudgetValue(team, races, driverStandings),
    worstBudgetValue: identifyWorstBudgetValue(team, races, driverStandings),
    seasonBottleneck: identifySeasonBottleneck(team, raceDiagnostics.filter(d => d.teamId === team.id), circuits),
    decisiveRaceId: identifyDecisiveRace(team.id, races),
    leadDriverImpact: identifyLeadDriverImpact(team, driverStandings),
    secondDriverImpact: identifySecondDriverImpact(team, driverStandings)
  }
}
