import { describe, it, expect } from 'vitest'
import { DIFFICULTY_CONFIG, DifficultyMode } from '@/domain/simulation/types'

describe('Difficulty Configuration', () => {
  it('has correctly defined difficulty thresholds', () => {
    expect(DIFFICULTY_CONFIG.casual.playerBudgetLimit).toBe(1050)
    expect(DIFFICULTY_CONFIG.casual.ghostBudgetLimit).toBe(950)
    expect(DIFFICULTY_CONFIG.casual.ghostOptimization).toBe('medium')

    expect(DIFFICULTY_CONFIG.standard.playerBudgetLimit).toBe(1000)
    expect(DIFFICULTY_CONFIG.standard.ghostBudgetLimit).toBe(1000)
    expect(DIFFICULTY_CONFIG.standard.ghostOptimization).toBe('high')

    expect(DIFFICULTY_CONFIG.hard.playerBudgetLimit).toBe(950)
    expect(DIFFICULTY_CONFIG.hard.ghostBudgetLimit).toBe(1000)
    expect(DIFFICULTY_CONFIG.hard.ghostOptimization).toBe('high')

    expect(DIFFICULTY_CONFIG.legend.playerBudgetLimit).toBe(900)
    expect(DIFFICULTY_CONFIG.legend.ghostBudgetLimit).toBe(1025)
    expect(DIFFICULTY_CONFIG.legend.ghostOptimization).toBe('very_high')
  })
})
