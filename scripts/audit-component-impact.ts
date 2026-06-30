import { buildBenchmarkShell, buildSimpleGhostGrid, buildTeam, loadCuratedData, mean, simulateSeason, writeJsonReport, writeReport } from './audit-support'

const data = loadCuratedData()
const shell = buildBenchmarkShell(data)
const ghosts = buildSimpleGhostGrid(data, 20260628, 9)
const circuits = data.circuits
const seeds = [11, 22, 33, 44, 55]

function makeTeam(overrides: Partial<Parameters<typeof buildTeam>[0]>, key: string) {
  return buildTeam({
    id: `impact-${key}`,
    name: `Impact ${key}`,
    driverPrimary: overrides.driverPrimary ?? shell.primary,
    driverSecondary: overrides.driverSecondary ?? shell.secondary,
    car: overrides.car ?? shell.car,
    engine: overrides.engine ?? shell.engine,
    teamPrincipal: overrides.teamPrincipal ?? shell.tp,
    technicalDirector: overrides.technicalDirector ?? shell.td,
    philosophy: overrides.philosophy ?? shell.philosophy,
    isGhost: false,
  })
}

const selectors = {
  driverPrimary: {
    high: [...data.drivers.filter((driver) => driver.role === 'primary')].sort((a, b) => b.overall - a.overall || b.racePace - a.racePace)[0] ?? shell.primary,
    low: [...data.drivers.filter((driver) => driver.role === 'primary')].sort((a, b) => a.overall - b.overall || a.racePace - b.racePace)[0] ?? shell.primary,
  },
  driverSecondary: {
    high: [...data.drivers.filter((driver) => driver.role === 'secondary')].sort((a, b) => b.overall - a.overall || b.teamPlay - a.teamPlay)[0] ?? shell.secondary,
    low: [...data.drivers.filter((driver) => driver.role === 'secondary')].sort((a, b) => a.overall - b.overall || a.teamPlay - b.teamPlay)[0] ?? shell.secondary,
  },
  car: {
    high: [...data.cars].sort((a, b) => b.overall - a.overall || b.aeroEfficiency - a.aeroEfficiency)[0] ?? shell.car,
    low: [...data.cars].sort((a, b) => a.overall - b.overall || a.aeroEfficiency - b.aeroEfficiency)[0] ?? shell.car,
  },
  engine: {
    high: [...data.engines].sort((a, b) => b.overall - a.overall || b.power - a.power)[0] ?? shell.engine,
    low: [...data.engines].sort((a, b) => a.overall - b.overall || a.power - b.power)[0] ?? shell.engine,
  },
  teamPrincipal: {
    high: [...data.teamPrincipals].sort((a, b) => b.leadership + b.crisisManagement - (a.leadership + a.crisisManagement))[0] ?? shell.tp,
    low: [...data.teamPrincipals].sort((a, b) => a.leadership + a.crisisManagement - (b.leadership + b.crisisManagement))[0] ?? shell.tp,
  },
  technicalDirector: {
    high: [...data.technicalDirectors].sort((a, b) => b.aerodynamics + b.setupUnderstanding - (a.aerodynamics + a.setupUnderstanding))[0] ?? shell.td,
    low: [...data.technicalDirectors].sort((a, b) => a.aerodynamics + a.setupUnderstanding - (b.aerodynamics + b.setupUnderstanding))[0] ?? shell.td,
  },
  philosophy: {
    high: [...data.teamPhilosophies].sort((a, b) => Math.abs(b.qualifyingModifier) + Math.abs(b.raceModifier) + Math.abs(b.reliabilityModifier) + Math.abs(b.tireModifier) - (Math.abs(a.qualifyingModifier) + Math.abs(a.raceModifier) + Math.abs(a.reliabilityModifier) + Math.abs(a.tireModifier)))[0] ?? shell.philosophy,
    low: data.teamPhilosophies.find((item) => item.id === 'philosophy-balanced') ?? shell.philosophy,
  },
} as const

const categories = Object.entries(selectors).map(([name, selection]) => {
  const highTeam = makeTeam({ [name]: selection.high } as any, `${name}-high`)
  const lowTeam = makeTeam({ [name]: selection.low } as any, `${name}-low`)
  const baselineTeam = makeTeam({}, `${name}-baseline`)

  const highScores = seeds.map((seed) => simulateSeason(highTeam, ghosts, circuits, seed))
  const lowScores = seeds.map((seed) => simulateSeason(lowTeam, ghosts, circuits, seed))
  const baselineScores = seeds.map((seed) => simulateSeason(baselineTeam, ghosts, circuits, seed))

  const highPoints = mean(highScores.map((result) => result.constructorStandings.find((standing) => standing.teamId === highTeam.id)?.points ?? 0))
  const lowPoints = mean(lowScores.map((result) => result.constructorStandings.find((standing) => standing.teamId === lowTeam.id)?.points ?? 0))
  const baselinePoints = mean(baselineScores.map((result) => result.constructorStandings.find((standing) => standing.teamId === baselineTeam.id)?.points ?? 0))
  const delta = Math.abs(highPoints - lowPoints)

  return {
    category: name,
    baselinePoints,
    highPoints,
    lowPoints,
    delta,
  }
})

const totalDelta = categories.reduce((sum, item) => sum + item.delta, 0) || 1
const report = categories.map((item) => ({
  ...item,
  impactShare: (item.delta / totalDelta) * 100,
}))

writeJsonReport('component-impact.json', {
  generatedAt: new Date().toISOString(),
  season: 'standard',
  report,
})

const md = `# Component Impact Audit

Generated at: ${new Date().toISOString()}

## Impact Share

${report
  .sort((a, b) => b.impactShare - a.impactShare)
  .map(
    (item) =>
      `- ${item.category}: ${item.impactShare.toFixed(1)}% (baseline ${item.baselinePoints.toFixed(1)} pts, high ${item.highPoints.toFixed(1)}, low ${item.lowPoints.toFixed(1)})`
  )
  .join('\n')}

## Interpretation

- Pilot handling should not exceed roughly 30% of the total influence.
- The second driver should matter meaningfully in constructors scoring.
- Car and driver primary should remain the strongest levers, but not the only ones.
- Philosophy should stay a small but real modifier.
`

writeReport('component-impact.md', md)

console.log('component-impact reports generated')
