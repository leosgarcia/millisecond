import { ResolvedTeam } from './types'

export interface BudgetBreakdownItem {
  type: string
  name: string
  cost: number
}

export interface BudgetBreakdown {
  limit: number
  used: number
  remaining: number
  items: BudgetBreakdownItem[]
}

const DEFAULT_BUDGET_LIMIT = 1000

export function getBudgetBreakdown(team: ResolvedTeam, limit = DEFAULT_BUDGET_LIMIT): BudgetBreakdown {
  const items: BudgetBreakdownItem[] = [
    { type: 'car', name: team.car.name, cost: team.car.budgetCost },
    { type: 'engine', name: team.engine.name, cost: team.engine.budgetCost },
    { type: 'leadDriver', name: team.driverPrimary.name, cost: team.driverPrimary.budgetCost },
    { type: 'secondDriver', name: team.driverSecondary.name, cost: team.driverSecondary.budgetCost },
    { type: 'teamPrincipal', name: team.teamPrincipal.name, cost: team.teamPrincipal.budgetCost },
    { type: 'technicalDirector', name: team.technicalDirector.name, cost: team.technicalDirector.budgetCost }
  ]

  const used = items.reduce((sum, item) => sum + item.cost, 0)
  
  return {
    limit,
    used,
    remaining: limit - used,
    items
  }
}

export function calculateTeamBudgetCost(team: ResolvedTeam): number {
  return getBudgetBreakdown(team).used
}

export function validateBudgetCap(team: ResolvedTeam, limit = DEFAULT_BUDGET_LIMIT): boolean {
  return calculateTeamBudgetCost(team) <= limit
}
