import {
  buildBenchmarkShell,
  buildSimpleGhostGrid,
  buildTeam,
  loadCuratedData,
  mean,
  simulateSeason,
  writeJsonReport,
  writeReport,
} from './audit-support'
import { summarizeTrackSensitivity } from '../src/domain/simulation/trackSensitivity'

const data = loadCuratedData()
const shell = buildBenchmarkShell(data)
const ghosts = buildSimpleGhostGrid(data, 20260628, 9)
const circuitsByName = new Map(data.circuits.map((circuit) => [circuit.name.toLowerCase(), circuit]))

function chooseTarget(names: string[]) {
  for (const name of names) {
    const circuit = circuitsByName.get(name.toLowerCase())
    if (circuit) return circuit
  }
  throw new Error(`Circuit not found: ${names.join(', ')}`)
}

function sortDesc<T>(items: T[], scorer: (item: T) => number) {
  return [...items].sort((a, b) => scorer(b) - scorer(a))
}

function pickPrimary(scorer: (driver: (typeof data.drivers)[number]) => number) {
  return sortDesc(data.drivers.filter((driver) => driver.role === 'primary'), scorer)[0] ?? shell.primary
}

function pickSecondary(scorer: (driver: (typeof data.drivers)[number]) => number) {
  return sortDesc(data.drivers.filter((driver) => driver.role === 'secondary'), scorer)[0] ?? shell.secondary
}

function pickCar(scorer: (car: (typeof data.cars)[number]) => number) {
  return sortDesc(data.cars, scorer)[0] ?? shell.car
}

function pickEngine(scorer: (engine: (typeof data.engines)[number]) => number) {
  return sortDesc(data.engines, scorer)[0] ?? shell.engine
}

function pickTP(scorer: (item: (typeof data.teamPrincipals)[number]) => number) {
  return sortDesc(data.teamPrincipals, scorer)[0] ?? shell.tp
}

function pickTD(scorer: (item: (typeof data.technicalDirectors)[number]) => number) {
  return sortDesc(data.technicalDirectors, scorer)[0] ?? shell.td
}

function makeVariant(overrides: Partial<Parameters<typeof buildTeam>[0]>, label: string) {
  return buildTeam({
    id: `bench-${label}`,
    name: `Benchmark ${label}`,
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

function buildPackageVariants() {
  const balanced = makeVariant({}, 'balanced_package')

  const powerPackage = makeVariant(
    {
      driverPrimary: pickPrimary((driver) => driver.racePace + driver.qualifyingPace + driver.overtaking + driver.pressureHandling),
      driverSecondary: pickSecondary((driver) => driver.consistency + driver.teamPlay),
      car: pickCar((car) => car.straightLineSpeed * 2 + car.braking + car.fastCorner - car.slowCorner * 0.6 - car.mechanicalGrip * 0.3),
      engine: pickEngine((engine) => engine.power * 2 + engine.qualifyingMode + engine.racePaceSustainability - engine.drivability * 0.3),
      teamPrincipal: pickTP((tp) => tp.crisisManagement + tp.operationalDiscipline),
      technicalDirector: pickTD((td) => td.setupUnderstanding + td.developmentSpeed),
    },
    'power_package'
  )

  const monacoSpecialist = makeVariant(
    {
      driverPrimary: pickPrimary((driver) => driver.qualifyingPace + driver.consistency + driver.pressureHandling),
      driverSecondary: pickSecondary((driver) => driver.teamPlay + driver.consistency),
      car: pickCar((car) => car.slowCorner + car.mechanicalGrip + car.setupWindow),
      engine: pickEngine((engine) => engine.qualifyingMode + engine.drivability + engine.reliability),
      teamPrincipal: pickTP((tp) => tp.operationalDiscipline + tp.crisisManagement),
      technicalDirector: pickTD((td) => td.setupUnderstanding + td.aerodynamics),
    },
    'monaco_specialist'
  )

  const highDownforcePackage = makeVariant(
    {
      driverPrimary: pickPrimary((driver) => driver.consistency + driver.adaptability + driver.racePace),
      driverSecondary: pickSecondary((driver) => driver.teamPlay + driver.consistency),
      car: pickCar((car) => car.aeroEfficiency + car.slowCorner + car.mediumCorner),
      engine: pickEngine((engine) => engine.qualifyingMode + engine.drivability + engine.power),
      teamPrincipal: pickTP((tp) => tp.operationalDiscipline + tp.driverManagement),
      technicalDirector: pickTD((td) => td.aerodynamics + td.setupUnderstanding),
    },
    'high_downforce_package'
  )

  const wetWeatherPackage = makeVariant(
    {
      driverPrimary: pickPrimary((driver) => driver.wetSkill + driver.adaptability + driver.consistency),
      driverSecondary: pickSecondary((driver) => driver.teamPlay + driver.wetSkill),
      car: pickCar((car) => car.mechanicalGrip + car.reliability + car.tireWear),
      engine: pickEngine((engine) => engine.drivability + engine.reliability + engine.racePaceSustainability),
      teamPrincipal: pickTP((tp) => tp.crisisManagement + tp.strategicPatience),
      technicalDirector: pickTD((td) => td.reliabilityFocus + td.setupUnderstanding),
    },
    'wet_weather_package'
  )

  const reliabilityPackage = makeVariant(
    {
      driverPrimary: pickPrimary((driver) => driver.consistency + driver.teamPlay + driver.adaptability),
      driverSecondary: pickSecondary((driver) => driver.consistency + driver.teamPlay),
      car: pickCar((car) => car.reliability + car.tireWear + car.setupWindow),
      engine: pickEngine((engine) => engine.reliability + engine.racePaceSustainability + engine.drivability),
      teamPrincipal: pickTP((tp) => tp.crisisManagement + tp.strategicPatience + tp.operationalDiscipline),
      technicalDirector: pickTD((td) => td.reliabilityFocus + td.setupUnderstanding + td.mechanicalDesign),
    },
    'reliability_package'
  )

  return [balanced, powerPackage, monacoSpecialist, highDownforcePackage, wetWeatherPackage, reliabilityPackage] as const
}

const variants = buildPackageVariants()

const circuits = [
  {
    key: 'monza',
    circuit: chooseTarget(['Autodromo Nazionale Monza']),
    expected: ['power_package', 'balanced_package'],
  },
  {
    key: 'monaco',
    circuit: chooseTarget(['Circuit de Monaco']),
    expected: ['monaco_specialist', 'high_downforce_package'],
  },
  {
    key: 'spa',
    circuit: chooseTarget(['Circuit de Spa-Francorchamps']),
    expected: ['balanced_package', 'high_downforce_package', 'wet_weather_package'],
  },
  {
    key: 'suzuka',
    circuit: chooseTarget(['Suzuka International Racing Course']),
    expected: ['high_downforce_package', 'monaco_specialist'],
  },
  {
    key: 'singapore',
    circuit: chooseTarget(['Marina Bay Street Circuit']),
    expected: ['reliability_package', 'monaco_specialist'],
  },
] as const

const packageNotes: Record<string, { decisiveAttributes: string[]; why: (circuitName: string) => string }> = {
  balanced_package: {
    decisiveAttributes: ['overall', 'adaptability', 'setupWindow'],
    why: (circuitName) => `Balanced coverage kept it competitive without overfitting to ${circuitName}.`,
  },
  power_package: {
    decisiveAttributes: ['power', 'straightLineSpeed', 'braking'],
    why: (circuitName) => `Pure speed and braking conversion were the difference on ${circuitName}.`,
  },
  monaco_specialist: {
    decisiveAttributes: ['qualifyingPace', 'slowCorner', 'mechanicalGrip'],
    why: (circuitName) => `Low-speed precision and qualifying strength mattered most on ${circuitName}.`,
  },
  high_downforce_package: {
    decisiveAttributes: ['aeroEfficiency', 'mediumCorner', 'fastCorner'],
    why: (circuitName) => `Aero load and mid-speed flow were the key on ${circuitName}.`,
  },
  wet_weather_package: {
    decisiveAttributes: ['wetSkill', 'adaptability', 'reliability'],
    why: (circuitName) => `Wet skill and stability carried the package on ${circuitName}.`,
  },
  reliability_package: {
    decisiveAttributes: ['reliability', 'consistency', 'tireWear'],
    why: (circuitName) => `Consistency and low-risk execution mattered most on ${circuitName}.`,
  },
}

function packageLabel(teamId: string) {
  return teamId.replace('bench-', '')
}

const seeds = [101, 202, 303, 404, 505, 606, 707, 808]

const results = circuits.map((target) => {
  const scores = variants.map((team) => {
    const seasonPoints = seeds.map((seed) => {
      const result = simulateSeason(team, ghosts, [target.circuit], seed)
      return result.constructorStandings.find((standing) => standing.teamId === team.id)?.points ?? 0
    })

    const seasonPositions = seeds.map((seed) => {
      const result = simulateSeason(team, ghosts, [target.circuit], seed)
      const standingIndex = result.constructorStandings.findIndex((item) => item.teamId === team.id)
      return standingIndex >= 0 ? standingIndex + 1 : result.constructorStandings.length
    })

    return {
      variant: packageLabel(team.id),
      teamId: team.id,
      avgPoints: mean(seasonPoints),
      avgPosition: mean(seasonPositions),
    }
  })

  const ordered = [...scores].sort((a, b) => b.avgPoints - a.avgPoints)
  const winner = ordered[0]
  const runnerUp = ordered[1] ?? null
  const baseline = scores.find((score) => score.variant === 'balanced_package')
  const gap = winner && runnerUp ? winner.avgPoints - runnerUp.avgPoints : 0
  const winnerNotes = packageNotes[winner?.variant ?? 'balanced_package'] ?? packageNotes.balanced_package

  return {
    circuit: target.circuit.name,
    country: target.circuit.countryCode ?? target.circuit.country,
    expected: target.expected,
    scores,
    winner,
    runnerUp,
    gap,
    baseline,
    decisiveAttributes: winnerNotes.decisiveAttributes,
    why: winnerNotes.why(target.circuit.name),
    alignment: ordered.slice(0, 3).map((entry) => entry.variant).join(' > '),
  }
})

const { repeatedWinner, warnings } = summarizeTrackSensitivity(results)

writeJsonReport('track-sensitivity.json', {
  generatedAt: new Date().toISOString(),
  targets: results,
  repeatedWinner,
  warnings,
})

const md = `# Track Sensitivity Audit

Generated at: ${new Date().toISOString()}

${results
  .map(
    (result) => `## ${result.circuit}

- Expected strengths: ${result.expected.join(', ')}
- Winner: ${result.winner?.variant} (${result.winner?.avgPoints.toFixed(1)} pts)
- Runner-up: ${result.runnerUp?.variant ?? 'n/a'} (${result.runnerUp?.avgPoints.toFixed(1) ?? 'n/a'} pts)
- Gap: ${result.gap.toFixed(1)} pts
- Why it won: ${result.why}
- Decisive attributes: ${result.decisiveAttributes.join(', ')}
- Alignment order: ${result.alignment}

### Variant Scores

${result.scores
  .map(
    (score) =>
      `- ${score.variant}: ${score.avgPoints.toFixed(1)} pts, avg position ${score.avgPosition.toFixed(1)}`
  )
  .join('\n')}
`
  )
  .join('\n')}

## Alert

${repeatedWinner ? `The same package won every audited track: ${repeatedWinner}.` : 'No single package dominated every audited track.'}

${warnings.length ? warnings.map((warning) => `- ${warning}`).join('\n') : '- No critical mismatch warnings emitted.'}
`

writeReport('track-sensitivity.md', md)

console.log('track-sensitivity reports generated')
