import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  buildBalanceValidationAlerts,
  buildBalanceValidationConfig,
  createBalanceValidationTempDir,
  runAndWriteBalanceValidationSuite,
} from '../../scripts/balance-validation-lib'

function makeAlertReport(overrides: Partial<any> = {}) {
  return {
    summary: {
      totalSimulations: 100,
      playerWinRate: 0.5,
      averagePlayerPoints: 120,
      averagePlayerPosition: 3.2,
      status: 'OK',
      mainAlerts: [],
      recommendations: [],
      ...overrides.summary,
    },
    distribution: {
      difficulties: [
        { difficulty: 'casual', runs: 25, playerWinRate: 0.2, averagePlayerPoints: 100, averagePlayerPosition: 4 },
        { difficulty: 'standard', runs: 25, playerWinRate: 0.7, averagePlayerPoints: 140, averagePlayerPosition: 2 },
        { difficulty: 'hard', runs: 25, playerWinRate: 0.5, averagePlayerPoints: 130, averagePlayerPosition: 3 },
        { difficulty: 'legend', runs: 25, playerWinRate: 0.3, averagePlayerPoints: 110, averagePlayerPosition: 4 },
      ],
      formats: [
        { format: 'quick', runs: 50, playerWinRate: 0.4, averagePlayerPoints: 90, averagePlayerPosition: 4 },
        { format: 'standard', runs: 50, playerWinRate: 0.6, averagePlayerPoints: 150, averagePlayerPosition: 2 },
      ],
      ...overrides.distribution,
    },
    champions: {
      drivers: [{ id: 'driver-a', name: 'Driver A', wins: 40, share: 0.4 }],
      constructors: [{ id: 'car-a', name: 'Car A', wins: 41, share: 0.41 }],
      ...overrides.champions,
    },
    entities: {
      driver: [
        {
          id: 'driver-a',
          name: 'Driver A',
          budgetCost: 100,
          appearances: 100,
          wins: 40,
          podiums: 70,
          dnfs: 4,
          points: 500,
          championshipWins: 40,
          positions: [1],
          averagePoints: 500,
          pointsPerBudget: 5,
          dnfRate: 0.04,
          podiumRate: 0.7,
        },
        {
          id: 'driver-secondary',
          name: 'Second Driver',
          budgetCost: 120,
          appearances: 100,
          wins: 0,
          podiums: 10,
          dnfs: 0,
          points: 40,
          championshipWins: 0,
          positions: [10],
          averagePoints: 40,
          pointsPerBudget: 0.4,
          dnfRate: 0,
          podiumRate: 0.1,
        },
      ],
      car: [
        {
          id: 'car-a',
          name: 'Car A',
          budgetCost: 180,
          appearances: 100,
          wins: 41,
          podiums: 80,
          dnfs: 6,
          points: 540,
          championshipWins: 41,
          positions: [1],
          averagePoints: 540,
          pointsPerBudget: 3,
          dnfRate: 0.06,
          podiumRate: 0.8,
        },
      ],
      engine: [
        {
          id: 'engine-a',
          name: 'Engine A',
          budgetCost: 160,
          appearances: 100,
          wins: 39,
          podiums: 75,
          dnfs: 8,
          points: 500,
          championshipWins: 39,
          positions: [1],
          averagePoints: 500,
          pointsPerBudget: 3.1,
          dnfRate: 0.08,
          podiumRate: 0.75,
        },
      ],
      teamPrincipal: [],
      technicalDirector: [],
      philosophy: [
        {
          id: 'philosophy-aggressive',
          name: 'aggressive',
          budgetCost: 10,
          appearances: 20,
          wins: 12,
          podiums: 18,
          dnfs: 1,
          points: 250,
          championshipWins: 12,
          positions: [1],
          averagePoints: 250,
          pointsPerBudget: 25,
          dnfRate: 0.04,
          podiumRate: 0.9,
        },
        {
          id: 'philosophy-conservative',
          name: 'conservative',
          budgetCost: 10,
          appearances: 20,
          wins: 5,
          podiums: 10,
          dnfs: 1,
          points: 180,
          championshipWins: 5,
          positions: [2],
          averagePoints: 180,
          pointsPerBudget: 18,
          dnfRate: 0.04,
          podiumRate: 0.5,
        },
        {
          id: 'philosophy-development-focused',
          name: 'development-focused',
          budgetCost: 10,
          appearances: 20,
          wins: 4,
          podiums: 8,
          dnfs: 2,
          points: 150,
          championshipWins: 4,
          positions: [3],
          averagePoints: 150,
          pointsPerBudget: 15,
          dnfRate: 0.1,
          podiumRate: 0.4,
        },
      ],
    },
    trackBattles: [
      {
        circuitId: 'circuit-monza',
        circuitName: 'Autodromo Nazionale Monza',
        expected: ['power_package'],
        trackProfiles: ['power_track'],
        winner: 'power_package',
        runnerUp: 'balanced_package',
        gap: 5,
        scores: [
          { packageId: 'power_package', averagePoints: 28, averagePosition: 1 },
          { packageId: 'balanced_package', averagePoints: 23, averagePosition: 2 },
        ],
        decisiveAttributes: ['power'],
        why: 'Power',
      },
      {
        circuitId: 'circuit-monaco',
        circuitName: 'Circuit de Monaco',
        expected: ['monaco_specialist'],
        trackProfiles: ['street_circuit'],
        winner: 'power_package',
        runnerUp: 'balanced_package',
        gap: 5,
        scores: [
          { packageId: 'power_package', averagePoints: 28, averagePosition: 1 },
          { packageId: 'balanced_package', averagePoints: 23, averagePosition: 2 },
        ],
        decisiveAttributes: ['power'],
        why: 'Power',
      },
      {
        circuitId: 'circuit-spa',
        circuitName: 'Circuit de Spa-Francorchamps',
        expected: ['balanced_package'],
        trackProfiles: ['mixed_classic'],
        winner: 'power_package',
        runnerUp: 'balanced_package',
        gap: 5,
        scores: [
          { packageId: 'power_package', averagePoints: 28, averagePosition: 1 },
          { packageId: 'balanced_package', averagePoints: 23, averagePosition: 2 },
        ],
        decisiveAttributes: ['power'],
        why: 'Power',
      },
    ],
    pairwiseImpact: [
      {
        component: 'driverPrimary',
        baselineAveragePoints: 100,
        variantAveragePoints: 140,
        deltaPoints: 40,
        deltaPointsPct: 0.4,
        baselineAveragePosition: 4,
        variantAveragePosition: 2,
        deltaPosition: 2,
        sampleRuns: 4,
        recommendedAction: 'Increase primary driver weight.',
      },
      {
        component: 'driverSecondary',
        baselineAveragePoints: 100,
        variantAveragePoints: 110,
        deltaPoints: 10,
        deltaPointsPct: 0.1,
        baselineAveragePosition: 4,
        variantAveragePosition: 3,
        deltaPosition: 1,
        sampleRuns: 4,
        recommendedAction: 'Increase second driver weight.',
      },
    ],
  }
}

describe('balance validation suite', () => {
  it('parses smoke mode and default runs', () => {
    const config = buildBalanceValidationConfig(['--mode=smoke'])
    expect(config.mode).toBe('smoke')
    expect(config.runs).toBe(100)
    expect(config.seedBase).toBe('balance-validation-smoke')
  })

  it('writes JSON, Markdown and CSV in smoke mode', () => {
    const config = buildBalanceValidationConfig(['--mode=smoke', '--runs=1', '--difficulty=standard', '--format=standard'])
    const dir = createBalanceValidationTempDir()
    const report = runAndWriteBalanceValidationSuite(config, dir)

    expect(fs.existsSync(path.join(dir, 'balance-validation.json'))).toBe(true)
    expect(fs.existsSync(path.join(dir, 'balance-validation.md'))).toBe(true)
    expect(fs.existsSync(path.join(dir, 'balance-validation-summary.csv'))).toBe(true)
    expect(report.summary.totalSimulations).toBeGreaterThan(0)
  })

  it('is deterministic for the same config', () => {
    const config = buildBalanceValidationConfig(['--mode=smoke', '--runs=1', '--difficulty=standard', '--format=standard'])
    const first = runAndWriteBalanceValidationSuite(config, createBalanceValidationTempDir())
    const second = runAndWriteBalanceValidationSuite(config, createBalanceValidationTempDir())

    expect({
      summary: first.summary,
      champions: first.champions,
      distribution: first.distribution,
      packageScenarios: first.packageScenarios,
      trackBattles: first.trackBattles,
      pairwiseImpact: first.pairwiseImpact,
      alerts: first.alerts,
    }).toEqual({
      summary: second.summary,
      champions: second.champions,
      distribution: second.distribution,
      packageScenarios: second.packageScenarios,
      trackBattles: second.trackBattles,
      pairwiseImpact: second.pairwiseImpact,
      alerts: second.alerts,
    })
  })

  it('detects dominant drivers, chassis, engines and weak second drivers', () => {
    const alerts = buildBalanceValidationAlerts(makeAlertReport() as any)

    expect(alerts.some((alert) => alert.code === 'dominant-driver')).toBe(true)
    expect(alerts.some((alert) => alert.code === 'dominant-constructor')).toBe(true)
    expect(alerts.some((alert) => alert.code === 'engine-dominance')).toBe(true)
    expect(alerts.some((alert) => alert.code === 'secondary-driver-irrelevant')).toBe(true)
  })

  it('detects philosophy and track balance problems', () => {
    const alerts = buildBalanceValidationAlerts(
      makeAlertReport({
        trackBattles: [
          {
            circuitId: 'circuit-monza',
            circuitName: 'Autodromo Nazionale Monza',
            expected: ['power_package'],
            trackProfiles: ['power_track'],
            winner: 'power_package',
            runnerUp: 'balanced_package',
            gap: 5,
            scores: [],
            decisiveAttributes: ['power'],
            why: 'Power',
          },
          {
            circuitId: 'circuit-monaco',
            circuitName: 'Circuit de Monaco',
            expected: ['monaco_specialist'],
            trackProfiles: ['street_circuit'],
            winner: 'power_package',
            runnerUp: 'balanced_package',
            gap: 5,
            scores: [],
            decisiveAttributes: ['power'],
            why: 'Power',
          },
        ],
      }) as any
    )

    expect(alerts.some((alert) => alert.code === 'aggressive-no-risk')).toBe(true)
    expect(alerts.some((alert) => alert.code === 'conservative-no-safety')).toBe(true)
    expect(alerts.some((alert) => alert.code === 'monaco-power-win')).toBe(true)
  })

  it('keeps the curated dataset untouched', () => {
    const filePath = path.resolve(process.cwd(), 'data', 'curated', 'drivers.v1.json')
    const before = fs.readFileSync(filePath, 'utf8')
    runAndWriteBalanceValidationSuite(buildBalanceValidationConfig(['--mode=smoke', '--runs=1']), createBalanceValidationTempDir())
    const after = fs.readFileSync(filePath, 'utf8')
    expect(after).toBe(before)
  })
})
