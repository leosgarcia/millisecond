import { ResolvedTeam } from './types'

export type ValidationResult = {
  valid: boolean
  duplicates: string[]
}

export function validateUniqueCanonicalDrivers(teams: ResolvedTeam[]): ValidationResult {
  const seen = new Set<string>()
  const duplicates = new Set<string>()

  for (const team of teams) {
    const d1 = team.driverPrimary?.canonicalDriverId
    const d2 = team.driverSecondary?.canonicalDriverId

    if (d1) {
      if (seen.has(d1)) duplicates.add(d1)
      else seen.add(d1)
    }

    if (d2) {
      if (seen.has(d2)) duplicates.add(d2)
      else seen.add(d2)
    }
  }

  return {
    valid: duplicates.size === 0,
    duplicates: Array.from(duplicates)
  }
}
