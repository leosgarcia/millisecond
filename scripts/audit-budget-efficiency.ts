import { buildBenchmarkShell, buildSimpleGhostGrid, buildTeam, loadCuratedData, mean, simulateSeason, writeJsonReport, writeReport } from './audit-support'

const data = loadCuratedData()
const shell = buildBenchmarkShell(data)
const ghosts = buildSimpleGhostGrid(data, 20260628, 9)
const circuits = data.circuits
const seeds = [71, 72, 73, 74, 75]

function evalPoints(team: ReturnType<typeof buildTeam>) {
  const results = seeds.map((seed) => simulateSeason(team, ghosts, circuits, seed))
  const points = results.map((result) => result.constructorStandings.find((standing) => standing.teamId === team.id)?.points ?? 0)
  const wins = results.map((result) => (result.constructorStandings[0]?.teamId === team.id ? 1 : 0))
  const podiums = results.map((result) => (result.constructorStandings.findIndex((standing) => standing.teamId === team.id) < 3 ? 1 : 0))
  return {
    avgPoints: mean(points),
    winRate: mean(wins) * 100,
    podiumRate: mean(podiums) * 100,
  }
}

const categories = {
  driverPrimary: data.drivers.filter((driver) => driver.role === 'primary'),
  driverSecondary: data.drivers.filter((driver) => driver.role === 'secondary'),
  car: data.cars,
  engine: data.engines,
  teamPrincipal: data.teamPrincipals,
  technicalDirector: data.technicalDirectors,
  philosophy: data.teamPhilosophies,
}

function scoreItem<T>(category: keyof typeof categories, item: T) {
  const team = buildTeam({
    id: `budget-${category}-${String((item as any).id)}`,
    name: `Budget ${category}`,
    driverPrimary: category === 'driverPrimary' ? (item as any) : shell.primary,
    driverSecondary: category === 'driverSecondary' ? (item as any) : shell.secondary,
    car: category === 'car' ? (item as any) : shell.car,
    engine: category === 'engine' ? (item as any) : shell.engine,
    teamPrincipal: category === 'teamPrincipal' ? (item as any) : shell.tp,
    technicalDirector: category === 'technicalDirector' ? (item as any) : shell.td,
    philosophy: category === 'philosophy' ? (item as any) : shell.philosophy,
    isGhost: false,
  })

  const metrics = evalPoints(team)
  const budgetCost = [
    team.car.budgetCost,
    team.engine.budgetCost,
    team.driverPrimary.budgetCost,
    team.driverSecondary.budgetCost,
    team.teamPrincipal.budgetCost,
    team.technicalDirector.budgetCost,
  ].reduce((sum, value) => sum + value, 0)

  return {
    id: (item as any).id,
    name: (item as any).name,
    budgetCost,
    ...metrics,
    pointsPer100Ms: budgetCost > 0 ? metrics.avgPoints / budgetCost * 100 : 0,
    pointsPerMs: budgetCost > 0 ? metrics.avgPoints / budgetCost : 0,
  }
}

const rows = Object.entries(categories).flatMap(([category, items]) => items.map((item) => ({ category, ...scoreItem(category as keyof typeof categories, item) })))

const metrics = {
  costPerPoint: rows.map((row) => ({ ...row, costPerPoint: row.avgPoints > 0 ? row.budgetCost / row.avgPoints : Infinity })),
  costPerWin: rows.map((row) => ({ ...row, costPerWin: row.winRate > 0 ? row.budgetCost / row.winRate : Infinity })),
  costPerPodium: rows.map((row) => ({ ...row, costPerPodium: row.podiumRate > 0 ? row.budgetCost / row.podiumRate : Infinity })),
}

const championFrequency = rows
  .sort((a, b) => b.avgPoints - a.avgPoints)
  .slice(0, 20)
  .reduce<Record<string, number>>((acc, row) => {
    acc[row.name] = (acc[row.name] || 0) + 1
    return acc
  }, {})

const report = {
  generatedAt: new Date().toISOString(),
  baseline: {
    team: shell.car.teamName,
    avgPoints: evalPoints(
      buildTeam({
        id: 'baseline-budget',
        name: 'Baseline Budget',
        driverPrimary: shell.primary,
        driverSecondary: shell.secondary,
        car: shell.car,
        engine: shell.engine,
        teamPrincipal: shell.tp,
        technicalDirector: shell.td,
        philosophy: shell.philosophy,
      })
    ).avgPoints,
  },
  rows,
  championFrequency,
}

writeJsonReport('budget-efficiency.json', report)

const md = `# Budget Efficiency Audit

Generated at: ${report.generatedAt}

## Average Cost Metrics

${metrics.costPerPoint
  .sort((a, b) => a.costPerPoint - b.costPerPoint)
  .slice(0, 15)
  .map((row) => `- ${row.category}: ${row.name} | cost per point ${row.costPerPoint.toFixed(2)} | points ${row.avgPoints.toFixed(1)} | budget ${row.budgetCost}`)
  .join('\n')}

## Least Efficient

${metrics.costPerPoint
  .sort((a, b) => b.costPerPoint - a.costPerPoint)
  .slice(0, 15)
  .map((row) => `- ${row.category}: ${row.name} | cost per point ${row.costPerPoint.toFixed(2)} | points ${row.avgPoints.toFixed(1)} | budget ${row.budgetCost}`)
  .join('\n')}

## More Common in Top Runs

${Object.entries(championFrequency)
  .sort((a, b) => b[1] - a[1])
  .map(([name, count]) => `- ${name}: ${count}`)
  .join('\n')}

## Notes

- Items with low cost per point are candidates for underpricing.
- Items with high budget and weak points are candidates for review.
- This report is intentionally conservative: it does not auto-edit any rating.
`

writeReport('budget-efficiency.md', md)

console.log('budget-efficiency reports generated')
