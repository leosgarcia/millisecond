export type TrackSensitivityScore = {
  variant: string
  teamId: string
  avgPoints: number
  avgPosition: number
}

export type TrackSensitivityCircuitResult = {
  circuit: string
  expected: readonly string[]
  scores: TrackSensitivityScore[]
  winner?: TrackSensitivityScore
  runnerUp?: TrackSensitivityScore | null
  gap: number
  baseline?: TrackSensitivityScore
  decisiveAttributes: string[]
  why: string
  alignment: string
}

export type TrackSensitivityAuditSummary = {
  repeatedWinner: string | null
  warnings: string[]
}

export function summarizeTrackSensitivity(results: TrackSensitivityCircuitResult[]): TrackSensitivityAuditSummary {
  const repeatedWinner =
    new Set(results.map((result) => result.winner?.variant)).size === 1
      ? results[0]?.winner?.variant ?? null
      : null

  const warnings: string[] = []
  for (const result of results) {
    if (result.circuit.includes('Monza') && result.winner?.variant === 'monaco_specialist') {
      warnings.push(`CRITICAL: ${result.circuit} was won by monaco_specialist, which suggests power tracks are not differentiated enough.`)
    }
    if (result.circuit.includes('Monaco') && result.winner?.variant === 'power_package') {
      warnings.push(`CRITICAL: ${result.circuit} was won by power_package, which indicates the street-circuit penalty is too weak.`)
    }
    if (result.gap > 8 && result.winner?.variant === 'balanced_package') {
      warnings.push(`WARNING: balanced_package won ${result.circuit} by a large margin (${result.gap.toFixed(1)} pts).`)
    }
  }

  if (repeatedWinner) {
    warnings.push(`CRITICAL: the same package won every audited track: ${repeatedWinner}.`)
  }

  return { repeatedWinner, warnings }
}
