import fs from 'fs'
import path from 'path'
import { z } from 'zod'
import { DriverSchema } from '../src/domain/drivers/types'
import { CarSchema } from '../src/domain/cars/types'
import { EngineSchema } from '../src/domain/engines/types'
import { TeamPrincipalSchema, TechnicalDirectorSchema, TeamPhilosophySchema } from '../src/domain/teams/types'
import { CircuitSchema } from '../src/domain/circuits/types'
import type { Car } from '../src/domain/cars/types'
import type { Circuit } from '../src/domain/circuits/types'
import type { Driver } from '../src/domain/drivers/types'
import type { Engine } from '../src/domain/engines/types'
import type { TeamPrincipal, TechnicalDirector, TeamPhilosophy } from '../src/domain/teams/types'
import type { ConstructorStanding, DriverStanding, ResolvedTeam } from '../src/domain/simulation/types'
import { createRng, rngInt } from '../src/lib/deterministic-rng'
import { validateBudgetCap } from '../src/domain/simulation/budget'
import { simulateChampionship } from '../src/domain/simulation/engine'

const CURATED_DIR = path.resolve(process.cwd(), 'data', 'curated')
const REPORTS_DIR = path.resolve(process.cwd(), 'reports')

export type CuratedData = {
  drivers: Driver[]
  cars: Car[]
  engines: Engine[]
  teamPrincipals: TeamPrincipal[]
  technicalDirectors: TechnicalDirector[]
  teamPhilosophies: TeamPhilosophy[]
  circuits: Circuit[]
}

export type AttributeStatRow = {
  metric: string
  mean: number
  median: number
  min: number
  max: number
  stdDev: number
  top10: Array<{ id: string; label: string; value: number; tier?: string; role?: string; cost?: number }>
  bottom10: Array<{ id: string; label: string; value: number; tier?: string; role?: string; cost?: number }>
  outliers: Array<{ id: string; label: string; value: number; tier?: string; role?: string; cost?: number }>
  distributionByTier?: Record<string, number>
  distributionByRole?: Record<string, number>
}

export type DatasetAuditSection = {
  itemCount: number
  attributes: Record<string, AttributeStatRow>
}

export function ensureReportsDir() {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true })
  }
}

function readJsonFile<T>(fileName: string): T {
  const filePath = path.join(CURATED_DIR, fileName)
  const raw = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(raw) as T
}

function maybeParseArray(value: unknown) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

function normalizeDriver(raw: any) {
  return {
    ...raw,
    preferredCarTraits: maybeParseArray(raw.preferredCarTraits),
    weakCarTraits: maybeParseArray(raw.weakCarTraits),
  }
}

function normalizeEngine(raw: any) {
  return {
    ...raw,
    compatibleEras: maybeParseArray(raw.compatibleEras),
  }
}

export function loadCuratedData(): CuratedData {
  const rawDrivers = readJsonFile<unknown[]>('drivers.v1.json')
  const rawCars = readJsonFile<unknown[]>('cars.v1.json')
  const rawEngines = readJsonFile<unknown[]>('engines.v1.json')
  const rawTeamPrincipals = readJsonFile<unknown[]>('team_principals.v1.json')
  const rawTechnicalDirectors = readJsonFile<unknown[]>('technical_directors.v1.json')
  const rawTeamPhilosophies = readJsonFile<unknown[]>('team_philosophies.v1.json')
  const rawCircuits = readJsonFile<unknown[]>('circuits.v1.json')

  const drivers = z.array(DriverSchema).parse(rawDrivers.map(normalizeDriver))
  const cars = z.array(CarSchema).parse(rawCars)
  const engines = z.array(EngineSchema).parse(rawEngines.map(normalizeEngine))
  const teamPrincipals = z.array(TeamPrincipalSchema).parse(rawTeamPrincipals)
  const technicalDirectors = z.array(TechnicalDirectorSchema).parse(rawTechnicalDirectors)
  const teamPhilosophies = z.array(TeamPhilosophySchema).parse(rawTeamPhilosophies)
  const circuits = z.array(CircuitSchema).parse(rawCircuits)

  return {
    drivers,
    cars,
    engines,
    teamPrincipals,
    technicalDirectors,
    teamPhilosophies,
    circuits,
  }
}

export function mean(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function median(values: number[]) {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

export function stdDev(values: number[]) {
  if (values.length === 0) return 0
  const avg = mean(values)
  const variance = mean(values.map((value) => (value - avg) ** 2))
  return Math.sqrt(variance)
}

export function quantile(values: number[], q: number) {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const pos = (sorted.length - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base
  const next = sorted[base + 1] ?? sorted[base]
  return sorted[base] + rest * (next - sorted[base])
}

export function findOutliers(values: number[]) {
  if (values.length < 4) return { lower: -Infinity, upper: Infinity }
  const q1 = quantile(values, 0.25)
  const q3 = quantile(values, 0.75)
  const iqr = q3 - q1
  return {
    lower: q1 - 1.5 * iqr,
    upper: q3 + 1.5 * iqr,
  }
}

export function countBy<T>(items: T[], selector: (item: T) => string | undefined) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = selector(item) || 'unknown'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
}

function buildLabel(item: any) {
  const year = item.seasonYear ? ` ${item.seasonYear}` : ''
  return `${item.name}${year}`.trim()
}

export function buildStatRows<T extends { id: string; name: string; seasonYear?: number; tier?: string; role?: string; budgetCost?: number }>(
  items: T[],
  selectors: Record<string, (item: T) => number>
): Record<string, AttributeStatRow> {
  const rows: Record<string, AttributeStatRow> = {}

  for (const [metric, selector] of Object.entries(selectors)) {
    const values = items.map((item) => selector(item))
    const sortedDesc = [...items].sort((a, b) => selector(b) - selector(a))
    const sortedAsc = [...sortedDesc].reverse()
    const outlierRange = findOutliers(values)

    rows[metric] = {
      metric,
      mean: mean(values),
      median: median(values),
      min: Math.min(...values),
      max: Math.max(...values),
      stdDev: stdDev(values),
      top10: sortedDesc.slice(0, 10).map((item) => ({
        id: item.id,
        label: buildLabel(item),
        value: selector(item),
        tier: item.tier,
        role: item.role,
        cost: item.budgetCost,
      })),
      bottom10: sortedAsc.slice(0, 10).map((item) => ({
        id: item.id,
        label: buildLabel(item),
        value: selector(item),
        tier: item.tier,
        role: item.role,
        cost: item.budgetCost,
      })),
      outliers: items
        .filter((item) => {
          const value = selector(item)
          return value < outlierRange.lower || value > outlierRange.upper
        })
        .sort((a, b) => selector(b) - selector(a))
        .map((item) => ({
          id: item.id,
          label: buildLabel(item),
          value: selector(item),
          tier: item.tier,
          role: item.role,
          cost: item.budgetCost,
        })),
      distributionByTier: countBy(items, (item) => item.tier),
      distributionByRole: countBy(items, (item) => item.role),
    }
  }

  return rows
}

export function formatNumber(value: number, digits = 1) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(digits)
}

export function writeReport(name: string, content: string) {
  ensureReportsDir()
  fs.writeFileSync(path.join(REPORTS_DIR, name), content)
}

export function writeJsonReport(name: string, data: unknown) {
  ensureReportsDir()
  fs.writeFileSync(path.join(REPORTS_DIR, name), JSON.stringify(data, null, 2))
}

export function buildBenchmarkShell(data: CuratedData) {
  const sortBy = <T>(items: T[], scorer: (item: T) => number) => [...items].sort((a, b) => scorer(b) - scorer(a))

  const primary = sortBy(data.drivers.filter((driver) => driver.role === 'primary'), (driver) => driver.overall)[Math.floor(data.drivers.filter((driver) => driver.role === 'primary').length / 2)] ?? data.drivers[0]
  const secondary = sortBy(data.drivers.filter((driver) => driver.role === 'secondary'), (driver) => driver.overall)[Math.floor(data.drivers.filter((driver) => driver.role === 'secondary').length / 2)] ?? data.drivers[0]
  const car = sortBy(data.cars, (item) => item.overall)[Math.floor(data.cars.length / 2)] ?? data.cars[0]
  const engine = sortBy(data.engines, (item) => item.overall)[Math.floor(data.engines.length / 2)] ?? data.engines[0]
  const tp = sortBy(data.teamPrincipals, (item) => item.leadership)[Math.floor(data.teamPrincipals.length / 2)] ?? data.teamPrincipals[0]
  const td = sortBy(data.technicalDirectors, (item) => item.aerodynamics)[Math.floor(data.technicalDirectors.length / 2)] ?? data.technicalDirectors[0]
  const philosophy = data.teamPhilosophies.find((item) => item.id === 'philosophy-balanced') ?? data.teamPhilosophies[0]

  return { primary, secondary, car, engine, tp, td, philosophy }
}

export function buildTeam(params: {
  id: string
  name: string
  driverPrimary: Driver
  driverSecondary: Driver
  car: Car
  engine: Engine
  teamPrincipal: TeamPrincipal
  technicalDirector: TechnicalDirector
  philosophy: TeamPhilosophy
  isGhost?: boolean
}) {
  return {
    id: params.id,
    name: params.name,
    driverPrimary: params.driverPrimary,
    driverSecondary: params.driverSecondary,
    car: params.car,
    engine: params.engine,
    teamPrincipal: params.teamPrincipal,
    technicalDirector: params.technicalDirector,
    philosophy: params.philosophy,
    isGhost: params.isGhost ?? false,
  } satisfies ResolvedTeam
}

export function pickByMetric<T>(items: T[], scorer: (item: T) => number, mode: 'max' | 'min' = 'max') {
  const sorted = [...items].sort((a, b) => scorer(a) - scorer(b))
  return mode === 'max' ? sorted[sorted.length - 1] : sorted[0]
}

export function sampleTop<T>(items: T[], scorer: (item: T) => number, count: number, rngSeed: number) {
  const sorted = [...items].sort((a, b) => scorer(b) - scorer(a)).slice(0, Math.max(1, count))
  const rng = createRng(rngSeed)
  return sorted[rngInt(rng, 0, sorted.length - 1)]
}

export function meanAbsolute(values: number[]) {
  if (values.length === 0) return 0
  return mean(values.map((value) => Math.abs(value)))
}

export function averageRank(values: number[]) {
  if (values.length === 0) return 0
  return mean(values)
}

export function pointsTableForSeason(raceCount: number) {
  return Array.from({ length: raceCount }, (_, index) => [25, 18, 15, 12, 10, 8, 6, 4, 2, 1][index] ?? 0)
}

export function simulateSeason(
  playerTeam: ResolvedTeam,
  ghostTeams: ResolvedTeam[],
  circuits: Circuit[],
  seed: number
) {
  return simulateChampionship({
    seed,
    playerTeam,
    ghostTeams,
    circuits,
    difficulty: 'standard',
    championshipFormat: 'standard',
  })
}

export function buildSimpleGhostGrid(data: CuratedData, seed: number, count = 9, budgetLimit = 1000) {
  const rng = createRng(seed)
  const archetypes = [
    'balanced_constructor',
    'aero_monster',
    'straight_line_rocket',
    'wet_weather_specialists',
    'reliability_machine',
    'qualifying_kings',
    'elite_driver_underdog_car',
    'balanced_constructor',
    'economic_fallback',
  ] as const

  const sortBy = <T>(items: T[], scorer: (item: T) => number) => [...items].sort((a, b) => scorer(b) - scorer(a))
  const primaryPool = data.drivers.filter((driver) => driver.role === 'primary')
  const secondaryPool = data.drivers.filter((driver) => driver.role === 'secondary')
  const usedCanonicalDriverIds = new Set<string>()

  const teams: ResolvedTeam[] = []

  for (let i = 0; i < count; i++) {
    const archetype = archetypes[i % archetypes.length]
    let dpPool = primaryPool
    let dsPool = secondaryPool
    let carPool = data.cars
    let enginePool = data.engines
    let tpPool = data.teamPrincipals
    let tdPool = data.technicalDirectors

    if (archetype === 'aero_monster') {
      carPool = sortBy(data.cars, (car) => car.aeroEfficiency + car.fastCorner)
      tdPool = sortBy(data.technicalDirectors, (td) => td.aerodynamics + td.setupUnderstanding)
      dpPool = sortBy(primaryPool, (driver) => driver.racePace + driver.consistency)
    } else if (archetype === 'straight_line_rocket') {
      enginePool = sortBy(data.engines, (engine) => engine.power + engine.qualifyingMode)
      carPool = sortBy(data.cars, (car) => car.straightLineSpeed + car.braking)
      dpPool = sortBy(primaryPool, (driver) => driver.overtaking + driver.racePace)
    } else if (archetype === 'wet_weather_specialists') {
      dpPool = sortBy(primaryPool, (driver) => driver.wetSkill + driver.adaptability)
      carPool = sortBy(data.cars, (car) => car.stableRear + car.traction)
      tpPool = sortBy(data.teamPrincipals, (tp) => tp.crisisManagement + tp.operationalDiscipline)
    } else if (archetype === 'reliability_machine') {
      carPool = sortBy(data.cars, (car) => car.reliability + car.tireWear)
      enginePool = sortBy(data.engines, (engine) => engine.reliability + engine.racePaceSustainability)
      dpPool = sortBy(primaryPool, (driver) => driver.consistency + driver.teamPlay)
      tpPool = sortBy(data.teamPrincipals, (tp) => tp.operationalDiscipline + tp.strategicPatience)
    } else if (archetype === 'qualifying_kings') {
      dpPool = sortBy(primaryPool, (driver) => driver.qualifyingPace + driver.pressureHandling)
      carPool = sortBy(data.cars, (car) => car.setupWindow + car.aeroEfficiency)
      enginePool = sortBy(data.engines, (engine) => engine.qualifyingMode + engine.power)
      tdPool = sortBy(data.technicalDirectors, (td) => td.setupUnderstanding + td.aerodynamics)
    } else if (archetype === 'elite_driver_underdog_car') {
      dpPool = sortBy(primaryPool, (driver) => driver.overall + driver.racePace)
      carPool = sortBy(data.cars, (car) => car.budgetCost).slice(0, Math.min(8, data.cars.length))
      enginePool = sortBy(data.engines, (engine) => engine.budgetCost).slice(0, Math.min(8, data.engines.length))
      dsPool = sortBy(secondaryPool, (driver) => driver.consistency + driver.teamPlay - driver.budgetCost / 10)
    }

    const candidatePrimary = dpPool.find((driver) => !usedCanonicalDriverIds.has(driver.canonicalDriverId)) ?? dpPool[0]
    const candidateSecondary = dsPool.find((driver) => !usedCanonicalDriverIds.has(driver.canonicalDriverId) && driver.canonicalDriverId !== candidatePrimary?.canonicalDriverId) ?? dsPool[0]
    const car = carPool[rngInt(rng, 0, carPool.length - 1)] ?? data.cars[0]
    const engine = enginePool[rngInt(rng, 0, enginePool.length - 1)] ?? data.engines[0]
    const tp = tpPool[rngInt(rng, 0, tpPool.length - 1)] ?? data.teamPrincipals[0]
    const td = tdPool[rngInt(rng, 0, tdPool.length - 1)] ?? data.technicalDirectors[0]
    const philosophy = data.teamPhilosophies[rngInt(rng, 0, data.teamPhilosophies.length - 1)] ?? data.teamPhilosophies[0]

    const team = buildTeam({
      id: `ghost-${i}`,
      name: `${car.teamName} ${car.seasonYear} ${archetype.replace(/_/g, ' ')}`,
      driverPrimary: candidatePrimary ?? primaryPool[0],
      driverSecondary: candidateSecondary ?? secondaryPool[0],
      car,
      engine,
      teamPrincipal: tp,
      technicalDirector: td,
      philosophy,
      isGhost: true,
    })

    if (validateBudgetCap(team, budgetLimit)) {
      teams.push(team)
      usedCanonicalDriverIds.add(team.driverPrimary.canonicalDriverId)
      usedCanonicalDriverIds.add(team.driverSecondary.canonicalDriverId)
    }
  }

  return teams
}
