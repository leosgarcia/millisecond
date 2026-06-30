import { describe, it, expect } from 'vitest'
import { getBudgetBreakdown, calculateTeamBudgetCost, validateBudgetCap } from '../domain/simulation/budget'
import { ResolvedTeam } from '../domain/simulation/types'

describe('Budget Cap Validation', () => {
  const mockTeam = {
    car: { name: 'F2004', budgetCost: 240 },
    engine: { name: 'Ferrari V10', budgetCost: 160 },
    driverPrimary: { name: 'Schumacher', budgetCost: 220 },
    driverSecondary: { name: 'Barrichello', budgetCost: 110 },
    teamPrincipal: { name: 'Todt', budgetCost: 115 },
    technicalDirector: { name: 'Brawn', budgetCost: 130 },
  } as unknown as ResolvedTeam

  it('should calculate the total budget correctly', () => {
    const total = calculateTeamBudgetCost(mockTeam)
    expect(total).toBe(975)
  })

  it('should generate a correct breakdown', () => {
    const breakdown = getBudgetBreakdown(mockTeam)
    expect(breakdown.limit).toBe(1000)
    expect(breakdown.used).toBe(975)
    expect(breakdown.remaining).toBe(25)
    expect(breakdown.items.length).toBe(6)
    expect(breakdown.items.find(i => i.type === 'car')?.cost).toBe(240)
  })

  it('should return true for a valid team under budget', () => {
    expect(validateBudgetCap(mockTeam)).toBe(true)
  })

  it('should return false for a team exceeding budget', () => {
    const expensiveTeam = {
      ...mockTeam,
      driverSecondary: { name: 'Senna', budgetCost: 200 } // pushes total to 1065
    } as unknown as ResolvedTeam

    expect(validateBudgetCap(expensiveTeam)).toBe(false)
  })
})
