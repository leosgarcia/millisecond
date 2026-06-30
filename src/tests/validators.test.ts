import { describe, it, expect } from 'vitest'
import { validateUniqueCanonicalDrivers } from '../domain/simulation/validators'
import { PlayerTeam, GhostTeam } from '../domain/simulation/types'

describe('Canonical Driver Validation', () => {
  it('returns valid when all canonical IDs are unique', () => {
    const teams = [
      {
        driverPrimary: { canonicalDriverId: 'ayrton-senna' },
        driverSecondary: { canonicalDriverId: 'alain-prost' }
      } as PlayerTeam,
      {
        driverPrimary: { canonicalDriverId: 'michael-schumacher' },
        driverSecondary: { canonicalDriverId: 'rubens-barrichello' }
      } as GhostTeam
    ]

    const result = validateUniqueCanonicalDrivers(teams)
    expect(result.valid).toBe(true)
    expect(result.duplicates).toHaveLength(0)
  })

  it('returns invalid when there are duplicates', () => {
    const teams = [
      {
        driverPrimary: { canonicalDriverId: 'ayrton-senna' },
        driverSecondary: { canonicalDriverId: 'alain-prost' }
      } as PlayerTeam,
      {
        driverPrimary: { canonicalDriverId: 'ayrton-senna' }, // Duplicate
        driverSecondary: { canonicalDriverId: 'rubens-barrichello' }
      } as GhostTeam
    ]

    const result = validateUniqueCanonicalDrivers(teams)
    expect(result.valid).toBe(false)
    expect(result.duplicates).toContain('ayrton-senna')
  })
})
