import fs from 'fs'
import os from 'os'
import path from 'path'
import {
  buildBenchmarkShell,
  buildTeam,
  loadCuratedData,
  mean,
  writeJsonReport,
  writeReport,
} from './audit-support'
import { createRng, deriveSeed, rngInt } from '../src/lib/deterministic-rng'
import { validateBudgetCap } from '../src/domain/simulation/budget'
import { simulateChampionship } from '../src/domain/simulation/engine'
import { DIFFICULTY_CONFIG, type DifficultyMode, type ResolvedTeam } from '../src/domain/simulation/types'
import { evaluatePhilosophyFit, getGhostPhilosophyIdsForArchetype, getPhilosophyModifiersForRace, getTeamPhilosophyById, getTeamPhilosophies, type GhostPhilosophyArchetype, type PhilosophyDefinition } from '../src/domain/teams/philosophies'
import type { ChampionshipFormat } from '../src/domain/teams/philosophies'
import type { Circuit } from '../src/domain/circuits/types'
import type { Driver } from '../src/domain/drivers/types'
import type { Car } from '../src/domain/cars/types'
import type { Engine } from '../src/domain/engines/types'
import type { TeamPrincipal, TechnicalDirector, TeamPhilosophy } from '../src/domain/teams/types'

export type BalanceValidationMode = 'smoke' | 'standard' | 'deep'
export type ValidationSeverity = 'info' | 'warning' | 'critical'
export type ValidationStatus = 'OK' | 'Atenção' | 'Crítico'

export type BalanceValidationConfig = {
  mode: BalanceValidationMode
  runs: number
  difficulty: DifficultyMode
  championshipFormat: ChampionshipFormat
  seedBase: string
}

export type ValidationAlert = {
  severity: ValidationSeverity
  code: string
  title: string
  message: string
  context?: Record<string, string | number | boolean>
}

export type EntityKind =
  | 'driver'
  | 'car'
  | 'engine'
  | 'teamPrincipal'
  | 'technicalDirector'
  | 'philosophy'

export type EntityAggregate = {
  id: string
  name: string
  budgetCost: number
  appearances: number
  wins: number
  podiums: number
  dnfs: number
  points: number
  championshipWins: number
  positions: number[]
}

export type DifficultySummary = {
  difficulty: DifficultyMode
  runs: number
  playerWinRate: number
  averagePlayerPoints: number
  averagePlayerPosition: number
}

export type FormatSummary = {
  format: ChampionshipFormat
  runs: number
  playerWinRate: number
  averagePlayerPoints: number
  averagePlayerPosition: number
}

export type PlayerRunSample = {
  seed: number
  difficulty: DifficultyMode
  championshipFormat: ChampionshipFormat
  playerPoints: number
  playerPosition: number
  playerWins: number
  playerPodiums: number
}

export type PackageScenarioResult = {
  packageId: string
  packageLabel: string
  strategy: 'archetype'
  difficulty: DifficultyMode
  championshipFormat: ChampionshipFormat
  runs: number
  averagePoints: number
  averagePosition: number
  winRate: number
  podiumRate: number
  dnfRate: number
}

export type TrackBattleResult = {
  circuitId: string
  circuitName: string
  expected: string[]
  trackProfiles: string[]
  winner: string
  runnerUp: string
  gap: number
  scores: Array<{ packageId: string; averagePoints: number; averagePosition: number }>
  decisiveAttributes: string[]
  why: string
}

export type PairwiseImpactResult = {
  component: 'driverPrimary' | 'driverSecondary' | 'car' | 'engine' | 'teamPrincipal' | 'technicalDirector' | 'philosophy'
  baselineAveragePoints: number
  variantAveragePoints: number
  deltaPoints: number
  deltaPointsPct: number
  baselineAveragePosition: number
  variantAveragePosition: number
  deltaPosition: number
  sampleRuns: number
  recommendedAction: string
}

export type BalanceValidationReport = {
  generatedAt: string
  dataVersion: string
  config: BalanceValidationConfig
  summary: {
    status: ValidationStatus
    totalSimulations: number
    playerWinRate: number
    averagePlayerPoints: number
    averagePlayerPosition: number
    mainAlerts: ValidationAlert[]
    recommendations: string[]
  }
  distribution: {
    difficulties: DifficultySummary[]
    formats: FormatSummary[]
  }
  champions: {
    drivers: Array<{ id: string; name: string; wins: number; share: number }>
    constructors: Array<{ id: string; name: string; wins: number; share: number }>
  }
  entities: Record<EntityKind, Array<EntityAggregate & { averagePoints: number; pointsPerBudget: number; dnfRate: number; podiumRate: number }>>
  packageScenarios: PackageScenarioResult[]
  trackBattles: TrackBattleResult[]
  pairwiseImpact: PairwiseImpactResult[]
  alerts: ValidationAlert[]
}

type ValidationEntityInput = {
  id: string
  name: string
  budgetCost: number
}

type ValidationEntityStats = {
  id: string
  name: string
  budgetCost: number
  appearances: number
  wins: number
  podiums: number
  dnfs: number
  points: number
  championshipWins: number
  positions: number[]
}

type ValidationStore = Record<EntityKind, Map<string, ValidationEntityStats>>

const MODE_DEFAULTS: Record<BalanceValidationMode, number> = {
  smoke: 100,
  standard: 1000,
  deep: 10000,
}

const DIFFICULTY_ORDER: DifficultyMode[] = ['casual', 'standard', 'hard', 'legend']
const FORMAT_ORDER: ChampionshipFormat[] = ['quick', 'standard']
const DATA_VERSION = 'curated-v1'
const TRACK_TARGETS = [
  {
    circuitId: 'circuit-monza',
    expected: ['power_package', 'balanced_package'],
    decisiveAttributes: ['power', 'straightLineSpeed', 'braking'],
    why: 'Monza should reward straight-line speed, engine power and braking conversion.',
  },
  {
    circuitId: 'circuit-monaco',
    expected: ['monaco_specialist', 'high_downforce_package'],
    decisiveAttributes: ['qualifyingPace', 'slowCorner', 'mechanicalGrip'],
    why: 'Monaco should reward slow-corner precision, grid position and setup quality.',
  },
  {
    circuitId: 'circuit-spa',
    expected: ['balanced_package', 'high_speed_aero_package', 'wet_weather_package'],
    decisiveAttributes: ['aeroEfficiency', 'fastCorner', 'wetSkill'],
    why: 'Spa should reward aero balance, fast corners and wet versatility.',
  },
  {
    circuitId: 'circuit-suzuka',
    expected: ['high_speed_aero_package', 'technical_flow_package'],
    decisiveAttributes: ['mediumCorner', 'fastCorner', 'consistency'],
    why: 'Suzuka should reward flow, mid-speed confidence and overall driver rhythm.',
  },
  {
    circuitId: 'circuit-singapore',
    expected: ['reliability_package', 'monaco_specialist'],
    decisiveAttributes: ['consistency', 'reliability', 'coolingDemand'],
    why: 'Singapore should reward low-error packages, reliability and cooling control.',
  },
  {
    circuitId: 'circuit-bahrain',
    expected: ['power_package', 'reliability_package'],
    decisiveAttributes: ['power', 'reliability', 'coolingDemand'],
    why: 'Bahrain should reward strong engines, reliability and thermal management.',
  },
] as const

type PackageKey =
  | 'balanced_package'
  | 'power_package'
  | 'monaco_specialist'
  | 'high_speed_aero_package'
  | 'wet_weather_package'
  | 'reliability_package'
  | 'qualifying_package'
  | 'development_package'

type PackageBuild = {
  packageId: PackageKey
  packageLabel: string
  team: ResolvedTeam
}

function hashSeed(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function sortDesc<T>(items: T[], scorer: (item: T) => number) {
  return [...items].sort((a, b) => scorer(b) - scorer(a))
}

function sortAsc<T>(items: T[], scorer: (item: T) => number) {
  return [...items].sort((a, b) => scorer(a) - scorer(b))
}

function uniqueById<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>()
  const result: T[] = []
  for (const item of items) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    result.push(item)
  }
  return result
}

function parseArray(value: unknown) {
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

function normalizeDriver(raw: any): Driver {
  return {
    ...raw,
    preferredCarTraits: parseArray(raw.preferredCarTraits),
    weakCarTraits: parseArray(raw.weakCarTraits),
  }
}

function normalizeEngine(raw: any): Engine {
  return {
    ...raw,
    compatibleEras: parseArray(raw.compatibleEras),
  }
}

function getValidationShell(data: ReturnType<typeof loadCuratedData>): ResolvedTeam {
  const shell = buildBenchmarkShell(data)
  const balanced = getTeamPhilosophyById('philosophy-balanced')
  return buildTeam({
    id: 'validation-shell',
    name: `${shell.car.teamName} Validation`,
    driverPrimary: shell.primary,
    driverSecondary: shell.secondary,
    car: shell.car,
    engine: shell.engine,
    teamPrincipal: shell.tp,
    technicalDirector: shell.td,
    philosophy: balanced ?? shell.philosophy,
    isGhost: false,
  })
}

function getSeasonCalendar(circuits: Circuit[], seed: number, raceCount: number) {
  const sorted = [...circuits].sort((a, b) => a.id.localeCompare(b.id))
  if (sorted.length === 0) return []
  const start = seed % sorted.length
  return Array.from({ length: raceCount }, (_, index) => sorted[(start + index) % sorted.length])
}

function getScenarioCombos(config: BalanceValidationConfig) {
  const base: Array<{ difficulty: DifficultyMode; championshipFormat: ChampionshipFormat }> = [
    { difficulty: config.difficulty, championshipFormat: config.championshipFormat },
  ]

  for (const difficulty of DIFFICULTY_ORDER) {
    for (const championshipFormat of FORMAT_ORDER) {
      const combo = { difficulty, championshipFormat }
      if (combo.difficulty === config.difficulty && combo.championshipFormat === config.championshipFormat) continue
      base.push(combo)
    }
  }

  return base
}

function buildValidationGhostGrid(
  data: ReturnType<typeof loadCuratedData>,
  seed: number,
  difficulty: DifficultyMode,
  count: number
): ResolvedTeam[] {
  const rng = createRng(seed)
  const budgetLimit = DIFFICULTY_CONFIG[difficulty].ghostBudgetLimit
  const ghostLimit = count
  const usedCanonicalDriverIds = new Set<string>()
  const ghosts: ResolvedTeam[] = []
  const philosophies = getTeamPhilosophies()

  const primaryDrivers = data.drivers.filter((driver) => driver.role === 'primary')
  const secondaryDrivers = data.drivers.filter((driver) => driver.role === 'secondary')
  const archetypes: GhostPhilosophyArchetype[] = [
    'balanced_constructor',
    'aero_monster',
    'straight_line_rocket',
    'wet_weather_specialists',
    'reliability_machine',
    'qualifying_kings',
    'elite_driver_underdog_car',
    'balanced_constructor',
    'economic_fallback',
  ]

  function getCandidates<T extends { id: string }>(items: T[], preferred: (item: T) => number, cheap?: (item: T) => number) {
    return uniqueById([
      ...sortDesc(items, preferred).slice(0, 8),
      ...(cheap ? sortAsc(items, cheap).slice(0, 4) : []),
    ])
  }

  const pick = <T extends { id: string }>(items: T[], index: number) => items[index % items.length] ?? items[0]

  for (let index = 0; index < ghostLimit; index++) {
    const archetype = archetypes[index % archetypes.length]
    const carCandidates = getCandidates(
      data.cars,
      (car) => {
        switch (archetype) {
          case 'aero_monster':
            return car.aeroEfficiency + car.fastCorner
          case 'straight_line_rocket':
            return car.straightLineSpeed + car.braking
          case 'wet_weather_specialists':
            return car.mechanicalGrip + car.tireWear + car.reliability
          case 'reliability_machine':
            return car.reliability + car.tireWear + car.setupWindow
          case 'qualifying_kings':
            return car.setupWindow + car.aeroEfficiency
          case 'elite_driver_underdog_car':
            return 200 - car.budgetCost + car.reliability
          default:
            return car.overall
        }
      },
      (car) => car.budgetCost
    )
    const engineCandidates = getCandidates(
      data.engines,
      (engine) => {
        switch (archetype) {
          case 'aero_monster':
            return engine.qualifyingMode + engine.power
          case 'straight_line_rocket':
            return engine.power + engine.qualifyingMode + engine.racePaceSustainability
          case 'wet_weather_specialists':
            return engine.drivability + engine.reliability
          case 'reliability_machine':
            return engine.reliability + engine.racePaceSustainability
          case 'qualifying_kings':
            return engine.qualifyingMode + engine.drivability
          case 'elite_driver_underdog_car':
            return 200 - engine.budgetCost + engine.reliability
          default:
            return engine.overall
        }
      },
      (engine) => engine.budgetCost
    )
    const driverPrimaryCandidates = getCandidates(
      primaryDrivers,
      (driver) => {
        switch (archetype) {
          case 'aero_monster':
            return driver.racePace + driver.consistency + driver.qualifyingPace
          case 'straight_line_rocket':
            return driver.overtaking + driver.aggression + driver.racePace
          case 'wet_weather_specialists':
            return driver.wetSkill + driver.adaptability + driver.consistency
          case 'reliability_machine':
            return driver.consistency + driver.pressureHandling + driver.teamPlay
          case 'qualifying_kings':
            return driver.qualifyingPace + driver.pressureHandling
          case 'elite_driver_underdog_car':
            return driver.overall + driver.adaptability
          default:
            return driver.overall
        }
      },
      (driver) => driver.budgetCost
    )
    const driverSecondaryCandidates = getCandidates(
      secondaryDrivers,
      (driver) => {
        switch (archetype) {
          case 'aero_monster':
            return driver.consistency + driver.teamPlay
          case 'straight_line_rocket':
            return driver.overtaking + driver.aggression
          case 'wet_weather_specialists':
            return driver.wetSkill + driver.teamPlay
          case 'reliability_machine':
            return driver.consistency + driver.teamPlay
          case 'qualifying_kings':
            return driver.qualifyingPace + driver.consistency
          case 'elite_driver_underdog_car':
            return driver.consistency + driver.teamPlay - driver.budgetCost / 10
          default:
            return driver.overall
        }
      },
      (driver) => driver.budgetCost
    )
    const tpCandidates = getCandidates(
      data.teamPrincipals,
      (tp) => {
        switch (archetype) {
          case 'aero_monster':
            return tp.operationalDiscipline + tp.crisisManagement
          case 'straight_line_rocket':
            return tp.crisisManagement + tp.riskTolerance
          case 'wet_weather_specialists':
            return tp.crisisManagement + tp.strategicPatience
          case 'reliability_machine':
            return tp.operationalDiscipline + tp.strategicPatience
          case 'qualifying_kings':
            return tp.operationalDiscipline + tp.driverManagement
          case 'elite_driver_underdog_car':
            return tp.strategicPatience + tp.developmentCulture
          default:
            return tp.leadership
        }
      },
      (tp) => tp.budgetCost
    )
    const tdCandidates = getCandidates(
      data.technicalDirectors,
      (td) => {
        switch (archetype) {
          case 'aero_monster':
            return td.aerodynamics + td.setupUnderstanding
          case 'straight_line_rocket':
            return td.regulationExploitation + td.aerodynamics
          case 'wet_weather_specialists':
            return td.reliabilityFocus + td.setupUnderstanding
          case 'reliability_machine':
            return td.reliabilityFocus + td.setupUnderstanding + td.mechanicalDesign
          case 'qualifying_kings':
            return td.setupUnderstanding + td.aerodynamics
          case 'elite_driver_underdog_car':
            return td.developmentSpeed + td.setupUnderstanding
          default:
            return td.aerodynamics
        }
      },
      (td) => td.budgetCost
    )
    const philosophyIds = getGhostPhilosophyIdsForArchetype(archetype)
    const philosophyPool = philosophyIds
      .map((id) => getTeamPhilosophyById(id))
      .filter((item): item is PhilosophyDefinition => !!item)
    const fallbackPhilosophies = philosophies.filter((item) => item.key === 'balanced' || item.key === 'conservative')
    const philosophyCandidates = uniqueById([...(philosophyPool.length > 0 ? philosophyPool : fallbackPhilosophies)])

    let built: ResolvedTeam | null = null
    for (let attempt = 0; attempt < 40; attempt++) {
      const team = buildTeam({
        id: `ghost-${seed}-${index}-${attempt}`,
        name: `${pick(carCandidates, attempt).teamName} ${pick(carCandidates, attempt).seasonYear} ${archetype.replace(/_/g, ' ')}`,
        driverPrimary: pick(driverPrimaryCandidates, rngInt(rng, 0, driverPrimaryCandidates.length - 1)),
        driverSecondary: pick(driverSecondaryCandidates, rngInt(rng, 0, driverSecondaryCandidates.length - 1)),
        car: pick(carCandidates, rngInt(rng, 0, carCandidates.length - 1)),
        engine: pick(engineCandidates, rngInt(rng, 0, engineCandidates.length - 1)),
        teamPrincipal: pick(tpCandidates, rngInt(rng, 0, tpCandidates.length - 1)),
        technicalDirector: pick(tdCandidates, rngInt(rng, 0, tdCandidates.length - 1)),
        philosophy: pick(philosophyCandidates, rngInt(rng, 0, philosophyCandidates.length - 1)),
        isGhost: true,
      })

      if (
        team.driverPrimary.canonicalDriverId !== team.driverSecondary.canonicalDriverId &&
        !usedCanonicalDriverIds.has(team.driverPrimary.canonicalDriverId) &&
        !usedCanonicalDriverIds.has(team.driverSecondary.canonicalDriverId) &&
        validateBudgetCap(team, budgetLimit)
      ) {
        built = team
        break
      }
    }

    if (!built) {
      const fallback = getValidationShell(data)
      built = buildTeam({
        id: `ghost-fallback-${seed}-${index}`,
        name: `${fallback.car.teamName} fallback`,
        driverPrimary: fallback.driverPrimary,
        driverSecondary: fallback.driverSecondary,
        car: fallback.car,
        engine: fallback.engine,
        teamPrincipal: fallback.teamPrincipal,
        technicalDirector: fallback.technicalDirector,
        philosophy: fallback.philosophy,
        isGhost: true,
      })
    }

    usedCanonicalDriverIds.add(built.driverPrimary.canonicalDriverId)
    usedCanonicalDriverIds.add(built.driverSecondary.canonicalDriverId)
    ghosts.push(built)
  }

  return ghosts
}

function createEntityStore(): ValidationStore {
  return {
    driver: new Map(),
    car: new Map(),
    engine: new Map(),
    teamPrincipal: new Map(),
    technicalDirector: new Map(),
    philosophy: new Map(),
  }
}

function ensureEntity(store: ValidationStore, kind: EntityKind, entity: ValidationEntityInput) {
  const map = store[kind]
  if (!map.has(entity.id)) {
    map.set(entity.id, {
      id: entity.id,
      name: entity.name,
      budgetCost: entity.budgetCost,
      appearances: 0,
      wins: 0,
      podiums: 0,
      dnfs: 0,
      points: 0,
      championshipWins: 0,
      positions: [],
    })
  }
  return map.get(entity.id)!
}

function recordEntity(
  store: ValidationStore,
  kind: EntityKind,
  entity: ValidationEntityInput,
  points: number,
  position: number,
  isWinner: boolean,
  isPodium: boolean,
  dnfs = 0
) {
  const entry = ensureEntity(store, kind, entity)
  entry.appearances += 1
  entry.points += points
  entry.positions.push(position)
  entry.wins += isWinner ? 1 : 0
  entry.podiums += isPodium ? 1 : 0
  entry.dnfs += dnfs
  entry.championshipWins += isWinner ? 1 : 0
}

function aggregateEntityMap(map: ValidationStore[EntityKind]) {
  return [...map.values()]
    .map((item) => {
      const averagePoints = item.appearances > 0 ? item.points / item.appearances : 0
      const averagePosition = item.positions.length > 0 ? mean(item.positions) : 0
      return {
        ...item,
        averagePoints,
        averagePosition,
        pointsPerBudget: item.budgetCost > 0 ? averagePoints / item.budgetCost : 0,
        dnfRate: item.appearances > 0 ? item.dnfs / item.appearances : 0,
        podiumRate: item.appearances > 0 ? item.podiums / item.appearances : 0,
      }
    })
    .sort((a, b) => b.championshipWins - a.championshipWins || b.points - a.points)
}

function difficultyLabel(difficulty: DifficultyMode) {
  return difficulty.toUpperCase()
}

function formatNumber(value: number, digits = 1) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(digits)
}

function packageLabel(packageId: PackageKey) {
  switch (packageId) {
    case 'balanced_package':
      return 'Balanced package'
    case 'power_package':
      return 'Power package'
    case 'monaco_specialist':
      return 'Monaco specialist'
    case 'high_speed_aero_package':
      return 'High-speed aero package'
    case 'wet_weather_package':
      return 'Wet weather package'
    case 'reliability_package':
      return 'Reliability package'
    case 'qualifying_package':
      return 'Qualifying package'
    case 'development_package':
      return 'Development package'
  }
}

function buildPackageTeam(data: ReturnType<typeof loadCuratedData>, shell: ResolvedTeam, packageId: PackageKey): ResolvedTeam {
  const primaryPool = data.drivers.filter((driver) => driver.role === 'primary')
  const secondaryPool = data.drivers.filter((driver) => driver.role === 'secondary')
  const pick = <T extends { id: string }>(items: T[], index: number) => items[index % items.length] ?? items[0]

  const pickBy = <T extends { id: string }>(items: T[], scorer: (item: T) => number, count = 8, cheapScorer?: (item: T) => number) =>
    uniqueById([
      ...sortDesc(items, scorer).slice(0, count),
      ...(cheapScorer ? sortAsc(items, cheapScorer).slice(0, 4) : []),
    ])

  const spec = (() => {
    switch (packageId) {
      case 'power_package':
        return {
          driverPrimary: pickBy(primaryPool, (driver) => driver.racePace + driver.qualifyingPace + driver.overtaking + driver.pressureHandling, 8, (driver) => driver.budgetCost),
          driverSecondary: pickBy(secondaryPool, (driver) => driver.consistency + driver.teamPlay + driver.tireManagement, 8, (driver) => driver.budgetCost),
          car: pickBy(data.cars, (car) => car.straightLineSpeed * 2 + car.braking + car.fastCorner - car.slowCorner * 0.6, 8, (car) => car.budgetCost),
          engine: pickBy(data.engines, (engine) => engine.power * 2 + engine.qualifyingMode + engine.racePaceSustainability - engine.drivability * 0.2, 8, (engine) => engine.budgetCost),
          teamPrincipal: pickBy(data.teamPrincipals, (tp) => tp.crisisManagement + tp.operationalDiscipline + tp.riskTolerance, 6, (tp) => tp.budgetCost),
          technicalDirector: pickBy(data.technicalDirectors, (td) => td.setupUnderstanding + td.developmentSpeed + td.aerodynamics, 6, (td) => td.budgetCost),
          philosophy: getTeamPhilosophyById('philosophy-aggressive') ?? shell.philosophy,
        }
      case 'monaco_specialist':
        return {
          driverPrimary: pickBy(primaryPool, (driver) => driver.qualifyingPace + driver.consistency + driver.pressureHandling, 8, (driver) => driver.budgetCost),
          driverSecondary: pickBy(secondaryPool, (driver) => driver.teamPlay + driver.consistency + driver.adaptability, 8, (driver) => driver.budgetCost),
          car: pickBy(data.cars, (car) => car.slowCorner + car.mechanicalGrip + car.setupWindow + car.aeroEfficiency, 8, (car) => car.budgetCost),
          engine: pickBy(data.engines, (engine) => engine.qualifyingMode + engine.drivability + engine.reliability, 8, (engine) => engine.budgetCost),
          teamPrincipal: pickBy(data.teamPrincipals, (tp) => tp.operationalDiscipline + tp.crisisManagement + tp.driverManagement, 6, (tp) => tp.budgetCost),
          technicalDirector: pickBy(data.technicalDirectors, (td) => td.setupUnderstanding + td.aerodynamics + td.reliabilityFocus, 6, (td) => td.budgetCost),
          philosophy: getTeamPhilosophyById('philosophy-qualifying-focused') ?? shell.philosophy,
        }
      case 'high_speed_aero_package':
        return {
          driverPrimary: pickBy(primaryPool, (driver) => driver.consistency + driver.adaptability + driver.racePace, 8, (driver) => driver.budgetCost),
          driverSecondary: pickBy(secondaryPool, (driver) => driver.teamPlay + driver.consistency + driver.pressureHandling, 8, (driver) => driver.budgetCost),
          car: pickBy(data.cars, (car) => car.aeroEfficiency + car.fastCorner + car.mediumCorner, 8, (car) => car.budgetCost),
          engine: pickBy(data.engines, (engine) => engine.qualifyingMode + engine.drivability + engine.power, 8, (engine) => engine.budgetCost),
          teamPrincipal: pickBy(data.teamPrincipals, (tp) => tp.operationalDiscipline + tp.driverManagement + tp.strategicPatience, 6, (tp) => tp.budgetCost),
          technicalDirector: pickBy(data.technicalDirectors, (td) => td.aerodynamics + td.setupUnderstanding + td.regulationExploitation, 6, (td) => td.budgetCost),
          philosophy: getTeamPhilosophyById('philosophy-aggressive') ?? shell.philosophy,
        }
      case 'wet_weather_package':
        return {
          driverPrimary: pickBy(primaryPool, (driver) => driver.wetSkill + driver.adaptability + driver.consistency, 8, (driver) => driver.budgetCost),
          driverSecondary: pickBy(secondaryPool, (driver) => driver.wetSkill + driver.teamPlay + driver.consistency, 8, (driver) => driver.budgetCost),
          car: pickBy(data.cars, (car) => car.mechanicalGrip + car.reliability + car.tireWear, 8, (car) => car.budgetCost),
          engine: pickBy(data.engines, (engine) => engine.drivability + engine.reliability + engine.racePaceSustainability, 8, (engine) => engine.budgetCost),
          teamPrincipal: pickBy(data.teamPrincipals, (tp) => tp.crisisManagement + tp.strategicPatience + tp.operationalDiscipline, 6, (tp) => tp.budgetCost),
          technicalDirector: pickBy(data.technicalDirectors, (td) => td.reliabilityFocus + td.setupUnderstanding + td.mechanicalDesign, 6, (td) => td.budgetCost),
          philosophy: getTeamPhilosophyById('philosophy-conservative') ?? shell.philosophy,
        }
      case 'reliability_package':
        return {
          driverPrimary: pickBy(primaryPool, (driver) => driver.consistency + driver.teamPlay + driver.adaptability, 8, (driver) => driver.budgetCost),
          driverSecondary: pickBy(secondaryPool, (driver) => driver.consistency + driver.teamPlay + driver.pressureHandling, 8, (driver) => driver.budgetCost),
          car: pickBy(data.cars, (car) => car.reliability + car.tireWear + car.setupWindow, 8, (car) => car.budgetCost),
          engine: pickBy(data.engines, (engine) => engine.reliability + engine.racePaceSustainability + engine.drivability, 8, (engine) => engine.budgetCost),
          teamPrincipal: pickBy(data.teamPrincipals, (tp) => tp.crisisManagement + tp.strategicPatience + tp.operationalDiscipline, 6, (tp) => tp.budgetCost),
          technicalDirector: pickBy(data.technicalDirectors, (td) => td.reliabilityFocus + td.setupUnderstanding + td.mechanicalDesign, 6, (td) => td.budgetCost),
          philosophy: getTeamPhilosophyById('philosophy-conservative') ?? shell.philosophy,
        }
      case 'qualifying_package':
        return {
          driverPrimary: pickBy(primaryPool, (driver) => driver.qualifyingPace + driver.pressureHandling + driver.consistency, 8, (driver) => driver.budgetCost),
          driverSecondary: pickBy(secondaryPool, (driver) => driver.qualifyingPace + driver.consistency + driver.teamPlay, 8, (driver) => driver.budgetCost),
          car: pickBy(data.cars, (car) => car.setupWindow + car.aeroEfficiency + car.fastCorner, 8, (car) => car.budgetCost),
          engine: pickBy(data.engines, (engine) => engine.qualifyingMode + engine.power + engine.drivability, 8, (engine) => engine.budgetCost),
          teamPrincipal: pickBy(data.teamPrincipals, (tp) => tp.operationalDiscipline + tp.strategicPatience + tp.driverManagement, 6, (tp) => tp.budgetCost),
          technicalDirector: pickBy(data.technicalDirectors, (td) => td.setupUnderstanding + td.aerodynamics + td.regulationExploitation, 6, (td) => td.budgetCost),
          philosophy: getTeamPhilosophyById('philosophy-qualifying-focused') ?? shell.philosophy,
        }
      case 'development_package':
        return {
          driverPrimary: pickBy(primaryPool, (driver) => driver.technicalFeedback + driver.adaptability + driver.consistency, 8, (driver) => driver.budgetCost),
          driverSecondary: pickBy(secondaryPool, (driver) => driver.teamPlay + driver.technicalFeedback + driver.consistency, 8, (driver) => driver.budgetCost),
          car: pickBy(data.cars, (car) => car.developmentPotential + car.reliability + car.setupWindow, 8, (car) => car.budgetCost),
          engine: pickBy(data.engines, (engine) => engine.racePaceSustainability + engine.reliability + engine.drivability, 8, (engine) => engine.budgetCost),
          teamPrincipal: pickBy(data.teamPrincipals, (tp) => tp.strategicPatience + tp.developmentCulture + tp.operationalDiscipline, 6, (tp) => tp.budgetCost),
          technicalDirector: pickBy(data.technicalDirectors, (td) => td.developmentSpeed + td.setupUnderstanding + td.innovation, 6, (td) => td.budgetCost),
          philosophy: getTeamPhilosophyById('philosophy-development-focused') ?? shell.philosophy,
        }
      default:
        return {
          driverPrimary: [shell.driverPrimary],
          driverSecondary: [shell.driverSecondary],
          car: [shell.car],
          engine: [shell.engine],
          teamPrincipal: [shell.teamPrincipal],
          technicalDirector: [shell.technicalDirector],
          philosophy: shell.philosophy,
        }
    }
  })()

  const rng = createRng(hashSeed(`${packageId}-${shell.id}`))
  for (let attempt = 0; attempt < 40; attempt++) {
    const team = buildTeam({
      id: `${packageId}-${attempt}`,
      name: `${spec.car[0].teamName} ${spec.car[0].seasonYear} ${packageLabel(packageId)}`,
      driverPrimary: pick(spec.driverPrimary as Driver[], rngInt(rng, 0, (spec.driverPrimary as Driver[]).length - 1)),
      driverSecondary: pick(spec.driverSecondary as Driver[], rngInt(rng, 0, (spec.driverSecondary as Driver[]).length - 1)),
      car: pick(spec.car as Car[], rngInt(rng, 0, (spec.car as Car[]).length - 1)),
      engine: pick(spec.engine as Engine[], rngInt(rng, 0, (spec.engine as Engine[]).length - 1)),
      teamPrincipal: pick(spec.teamPrincipal as TeamPrincipal[], rngInt(rng, 0, (spec.teamPrincipal as TeamPrincipal[]).length - 1)),
      technicalDirector: pick(spec.technicalDirector as TechnicalDirector[], rngInt(rng, 0, (spec.technicalDirector as TechnicalDirector[]).length - 1)),
      philosophy: spec.philosophy,
      isGhost: false,
    })

    if (validateBudgetCap(team, 1000)) {
      return team
    }
  }

  return buildTeam({
    id: `${packageId}-fallback`,
    name: `${shell.car.teamName} ${packageLabel(packageId)}`,
    driverPrimary: shell.driverPrimary,
    driverSecondary: shell.driverSecondary,
    car: shell.car,
    engine: shell.engine,
    teamPrincipal: shell.teamPrincipal,
    technicalDirector: shell.technicalDirector,
    philosophy: spec.philosophy,
    isGhost: false,
  })
}

function getPackagePhilosophyLabel(philosophy: TeamPhilosophy) {
  return philosophy.id.replace('philosophy-', '')
}

function chooseTrackById(data: ReturnType<typeof loadCuratedData>, id: string): Circuit {
  const circuit = data.circuits.find((item) => item.id === id)
  if (!circuit) {
    throw new Error(`Missing curated circuit: ${id}`)
  }
  return circuit
}

function createAccumulators() {
  return {
    driver: new Map<string, ValidationEntityStats>(),
    car: new Map<string, ValidationEntityStats>(),
    engine: new Map<string, ValidationEntityStats>(),
    teamPrincipal: new Map<string, ValidationEntityStats>(),
    technicalDirector: new Map<string, ValidationEntityStats>(),
    philosophy: new Map<string, ValidationEntityStats>(),
  } satisfies ValidationStore
}

function createEntityInput(id: string, name: string, budgetCost: number): ValidationEntityInput {
  return { id, name, budgetCost }
}

function recordTeamRun(
  store: ValidationStore,
  team: ResolvedTeam,
  constructorPosition: number,
  constructorPoints: number,
  driverPrimaryStanding: { points: number; position: number; dnfs: number; wins: number; podiums: number },
  driverSecondaryStanding: { points: number; position: number; dnfs: number; wins: number; podiums: number }
) {
  const constructorWinner = constructorPosition === 1
  const constructorPodium = constructorPosition <= 3
  const teamDnfs = driverPrimaryStanding.dnfs + driverSecondaryStanding.dnfs

  recordEntity(store, 'car', createEntityInput(team.car.id, team.car.name, team.car.budgetCost), constructorPoints, constructorPosition, constructorWinner, constructorPodium, teamDnfs)
  recordEntity(store, 'engine', createEntityInput(team.engine.id, team.engine.name, team.engine.budgetCost), constructorPoints, constructorPosition, constructorWinner, constructorPodium, teamDnfs)
  recordEntity(store, 'teamPrincipal', createEntityInput(team.teamPrincipal.id, team.teamPrincipal.name, team.teamPrincipal.budgetCost), constructorPoints, constructorPosition, constructorWinner, constructorPodium, teamDnfs)
  recordEntity(store, 'technicalDirector', createEntityInput(team.technicalDirector.id, team.technicalDirector.name, team.technicalDirector.budgetCost), constructorPoints, constructorPosition, constructorWinner, constructorPodium, teamDnfs)
  recordEntity(store, 'philosophy', createEntityInput(team.philosophy.id, getPackagePhilosophyLabel(team.philosophy), team.philosophy.budgetCost ?? 0), constructorPoints, constructorPosition, constructorWinner, constructorPodium, teamDnfs)
  recordEntity(store, 'driver', createEntityInput(team.driverPrimary.id, team.driverPrimary.name, team.driverPrimary.budgetCost), driverPrimaryStanding.points, driverPrimaryStanding.position, driverPrimaryStanding.position === 1, driverPrimaryStanding.position <= 3, driverPrimaryStanding.dnfs)
  recordEntity(store, 'driver', createEntityInput(team.driverSecondary.id, team.driverSecondary.name, team.driverSecondary.budgetCost), driverSecondaryStanding.points, driverSecondaryStanding.position, driverSecondaryStanding.position === 1, driverSecondaryStanding.position <= 3, driverSecondaryStanding.dnfs)
}

function computeChampionshipPosition(teamId: string, standings: Array<{ teamId?: string; driverId?: string }>, lookup: (item: any) => number) {
  const index = standings.findIndex((item) => item.teamId === teamId)
  return index >= 0 ? index + 1 : lookup(standings.length)
}

function buildPairwiseVariants(data: ReturnType<typeof loadCuratedData>, shell: ResolvedTeam) {
  const philosophies = getTeamPhilosophies()
  const recommendedPhilosophy =
    sortDesc(philosophies, (philosophy) => evaluatePhilosophyFit(
      {
        driverPrimary: shell.driverPrimary,
        driverSecondary: shell.driverSecondary,
        car: shell.car,
        engine: shell.engine,
        teamPrincipal: shell.teamPrincipal,
        technicalDirector: shell.technicalDirector,
      },
      philosophy,
      'standard'
    ).score)[0] ?? shell.philosophy

  const bestPrimary = sortDesc(data.drivers.filter((driver) => driver.role === 'primary'), (driver) => driver.overall + driver.racePace + driver.qualifyingPace)[0] ?? shell.driverPrimary
  const bestSecondary = sortDesc(data.drivers.filter((driver) => driver.role === 'secondary'), (driver) => driver.consistency + driver.teamPlay + driver.tireManagement)[0] ?? shell.driverSecondary
  const bestCar = sortDesc(data.cars, (car) => car.overall + car.aeroEfficiency + car.straightLineSpeed)[0] ?? shell.car
  const bestEngine = sortDesc(data.engines, (engine) => engine.overall + engine.power + engine.reliability)[0] ?? shell.engine
  const bestTP = sortDesc(data.teamPrincipals, (tp) => tp.leadership + tp.operationalDiscipline + tp.driverManagement)[0] ?? shell.teamPrincipal
  const bestTD = sortDesc(data.technicalDirectors, (td) => td.aerodynamics + td.mechanicalDesign + td.developmentSpeed)[0] ?? shell.technicalDirector

  return [
    {
      component: 'driverPrimary' as const,
      team: buildTeam({ ...shell, driverPrimary: bestPrimary, philosophy: shell.philosophy, isGhost: false, id: 'pair-primary', name: shell.name }),
      recommendedAction: 'If the primary driver impact is too low, increase driverPrimary weight or sharpen qualifying/race score separation.',
    },
    {
      component: 'driverSecondary' as const,
      team: buildTeam({ ...shell, driverSecondary: bestSecondary, philosophy: shell.philosophy, isGhost: false, id: 'pair-secondary', name: shell.name }),
      recommendedAction: 'If the second driver barely matters, increase teamPlay, constructor synergy, or secondary driver contribution.',
    },
    {
      component: 'car' as const,
      team: buildTeam({ ...shell, car: bestCar, philosophy: shell.philosophy, isGhost: false, id: 'pair-car', name: shell.name }),
      recommendedAction: 'If the car is too weak in sensitivity, increase track-fit weights or circuit-specific penalties.',
    },
    {
      component: 'engine' as const,
      team: buildTeam({ ...shell, engine: bestEngine, philosophy: shell.philosophy, isGhost: false, id: 'pair-engine', name: shell.name }),
      recommendedAction: 'If engines do not shift results enough, increase power-track and cooling penalties.',
    },
    {
      component: 'teamPrincipal' as const,
      team: buildTeam({ ...shell, teamPrincipal: bestTP, philosophy: shell.philosophy, isGhost: false, id: 'pair-tp', name: shell.name }),
      recommendedAction: 'If team principals are negligible, increase operational and strategic influence.',
    },
    {
      component: 'technicalDirector' as const,
      team: buildTeam({ ...shell, technicalDirector: bestTD, philosophy: shell.philosophy, isGhost: false, id: 'pair-td', name: shell.name }),
      recommendedAction: 'If technical directors barely move the needle, strengthen development and setup factors.',
    },
    {
      component: 'philosophy' as const,
      team: buildTeam({ ...shell, philosophy: recommendedPhilosophy, isGhost: false, id: 'pair-philosophy', name: shell.name }),
      recommendedAction: 'If philosophy is flat, strengthen contextual modifiers and phased development growth.',
    },
  ]
}

function summarizeRunSet(
  runs: PlayerRunSample[],
  store: ValidationStore
): {
  difficultySummaries: DifficultySummary[]
  formatSummaries: FormatSummary[]
  playerWinRate: number
  averagePlayerPoints: number
  averagePlayerPosition: number
  championDrivers: Array<{ id: string; name: string; wins: number; share: number }>
  championConstructors: Array<{ id: string; name: string; wins: number; share: number }>
} {
  const byDifficulty = new Map<DifficultyMode, PlayerRunSample[]>()
  const byFormat = new Map<ChampionshipFormat, PlayerRunSample[]>()

  for (const run of runs) {
    if (!byDifficulty.has(run.difficulty)) byDifficulty.set(run.difficulty, [])
    if (!byFormat.has(run.championshipFormat)) byFormat.set(run.championshipFormat, [])
    byDifficulty.get(run.difficulty)!.push(run)
    byFormat.get(run.championshipFormat)!.push(run)
  }

  const total = runs.length || 1
  const playerWinRate = runs.filter((run) => run.playerPosition === 1).length / total
  const averagePlayerPoints = mean(runs.map((run) => run.playerPoints))
  const averagePlayerPosition = mean(runs.map((run) => run.playerPosition))

  const difficultySummaries = DIFFICULTY_ORDER.map((difficulty) => {
    const list = byDifficulty.get(difficulty) ?? []
    return {
      difficulty,
      runs: list.length,
      playerWinRate: list.length ? list.filter((run) => run.playerPosition === 1).length / list.length : 0,
      averagePlayerPoints: mean(list.map((run) => run.playerPoints)),
      averagePlayerPosition: mean(list.map((run) => run.playerPosition)),
    }
  })

  const formatSummaries = FORMAT_ORDER.map((format) => {
    const list = byFormat.get(format) ?? []
    return {
      format,
      runs: list.length,
      playerWinRate: list.length ? list.filter((run) => run.playerPosition === 1).length / list.length : 0,
      averagePlayerPoints: mean(list.map((run) => run.playerPoints)),
      averagePlayerPosition: mean(list.map((run) => run.playerPosition)),
    }
  })

  const driverChampions = [...store.driver.values()].sort((a, b) => b.championshipWins - a.championshipWins)
  const constructorChampions = [...store.car.values()].sort((a, b) => b.championshipWins - a.championshipWins)

  return {
    difficultySummaries,
    formatSummaries,
    playerWinRate,
    averagePlayerPoints,
    averagePlayerPosition,
    championDrivers: driverChampions.map((entry) => ({
      id: entry.id,
      name: entry.name,
      wins: entry.championshipWins,
      share: total ? entry.championshipWins / total : 0,
    })),
    championConstructors: constructorChampions.map((entry) => ({
      id: entry.id,
      name: entry.name,
      wins: entry.championshipWins,
      share: total ? entry.championshipWins / total : 0,
    })),
  }
}

function runSingleChampionship(params: {
  data: ReturnType<typeof loadCuratedData>
  playerTeam: ResolvedTeam
  ghostTeams: ResolvedTeam[]
  difficulty: DifficultyMode
  championshipFormat: ChampionshipFormat
  seed: number
  raceCount: number
}) {
  const circuits = getSeasonCalendar(params.data.circuits, params.seed, params.raceCount)
  return simulateChampionship({
    seed: params.seed,
    playerTeam: params.playerTeam,
    ghostTeams: params.ghostTeams,
    circuits,
    difficulty: params.difficulty,
    championshipFormat: params.championshipFormat,
  })
}

function buildPackageScenarios(data: ReturnType<typeof loadCuratedData>, shell: ResolvedTeam, config: BalanceValidationConfig) {
  const packageIds: PackageKey[] = [
    'balanced_package',
    'power_package',
    'monaco_specialist',
    'high_speed_aero_package',
    'wet_weather_package',
    'reliability_package',
    'qualifying_package',
    'development_package',
  ]
  const baselineSeed = hashSeed(config.seedBase)
  const sampleSeeds = Array.from({ length: Math.max(3, Math.min(6, Math.round(config.runs / 250))) }, (_, index) => deriveSeed(baselineSeed, `scenario-${index}`))
  const combo = { difficulty: config.difficulty, championshipFormat: config.championshipFormat }
  const ghostCount = combo.championshipFormat === 'quick' ? 4 : 9
  const trackTarget = chooseTrackById(data, 'circuit-monza')

  return packageIds.map((packageId) => {
    const team = packageId === 'balanced_package' ? shell : buildPackageTeam(data, shell, packageId)
    const results = sampleSeeds.map((seed) => {
      const ghosts = buildValidationGhostGrid(data, deriveSeed(seed, `${packageId}-ghosts`), combo.difficulty, ghostCount)
      const championship = runSingleChampionship({
        data,
        playerTeam: team,
        ghostTeams: ghosts,
        difficulty: combo.difficulty,
        championshipFormat: combo.championshipFormat,
        seed,
        raceCount: combo.championshipFormat === 'quick' ? 7 : 12,
      })
      const constructorStanding = championship.constructorStandings.find((standing) => standing.teamId === team.id)
      const driverStanding = championship.driverStandings.find((standing) => standing.driverId === team.driverPrimary.id)
      return {
        constructorPoints: constructorStanding?.points ?? 0,
        constructorPosition: constructorStanding ? championship.constructorStandings.indexOf(constructorStanding) + 1 : championship.constructorStandings.length,
        driverPosition: driverStanding ? championship.driverStandings.indexOf(driverStanding) + 1 : championship.driverStandings.length,
        dnfCount: championship.driverStandings
          .filter((standing) => standing.teamId === team.id)
          .reduce((sum, standing) => sum + standing.dnfs, 0),
        podiums: constructorStanding?.podiums ?? 0,
        winner: constructorStanding ? constructorStanding.teamId === team.id : false,
      }
    })

    const averagePoints = mean(results.map((row) => row.constructorPoints))
    const averagePosition = mean(results.map((row) => row.constructorPosition))
    const winRate = results.length ? results.filter((row) => row.winner).length / results.length : 0
    const podiumRate = results.length ? results.filter((row) => row.constructorPosition <= 3).length / results.length : 0
    const dnfRate = results.length ? results.reduce((sum, row) => sum + row.dnfCount, 0) / (results.length * 2) : 0

    return {
      packageId,
      packageLabel: packageLabel(packageId),
      strategy: 'archetype' as const,
      difficulty: combo.difficulty,
      championshipFormat: combo.championshipFormat,
      runs: results.length,
      averagePoints,
      averagePosition,
      winRate,
      podiumRate,
      dnfRate,
      trackTarget: trackTarget.name,
    }
  })
}

function buildTrackBattles(data: ReturnType<typeof loadCuratedData>, shell: ResolvedTeam, config: BalanceValidationConfig) {
  const sampleSeeds = Array.from({ length: Math.max(3, Math.min(6, Math.round(config.runs / 250))) }, (_, index) => deriveSeed(hashSeed(config.seedBase), `track-${index}`))
  const packageIds: PackageKey[] = [
    'balanced_package',
    'power_package',
    'monaco_specialist',
    'high_speed_aero_package',
    'wet_weather_package',
    'reliability_package',
    'qualifying_package',
    'development_package',
  ]

  return TRACK_TARGETS.map((target) => {
    const circuit = chooseTrackById(data, target.circuitId)
    const scores = packageIds.map((packageId) => {
      const team = packageId === 'balanced_package' ? shell : buildPackageTeam(data, shell, packageId)
      const points = sampleSeeds.map((seed, index) => {
        const ghosts = buildValidationGhostGrid(data, deriveSeed(seed, `${target.circuitId}-${packageId}-${index}`), config.difficulty, config.championshipFormat === 'quick' ? 4 : 9)
        const championship = runSingleChampionship({
          data,
          playerTeam: team,
          ghostTeams: ghosts,
          difficulty: config.difficulty,
          championshipFormat: config.championshipFormat,
          seed,
          raceCount: 1,
        })
        return championship.constructorStandings.find((standing) => standing.teamId === team.id)?.points ?? 0
      })

      return {
        packageId,
        averagePoints: mean(points),
        averagePosition: 1 + packageIds.indexOf(packageId) / 10,
      }
    })

    const ordered = [...scores].sort((a, b) => b.averagePoints - a.averagePoints)
    const winner = ordered[0]
    const runnerUp = ordered[1] ?? ordered[0]
    const gap = (winner?.averagePoints ?? 0) - (runnerUp?.averagePoints ?? 0)

    return {
      circuitId: circuit.id,
      circuitName: circuit.name,
      expected: [...target.expected],
      trackProfiles: circuit.trackProfiles?.length ? [...circuit.trackProfiles] : [],
      winner: winner?.packageId ?? 'balanced_package',
      runnerUp: runnerUp?.packageId ?? 'balanced_package',
      gap,
      scores,
      decisiveAttributes: [...target.decisiveAttributes],
      why: target.why,
    } satisfies TrackBattleResult
  })
}

function buildRandomRuns(data: ReturnType<typeof loadCuratedData>, shell: ResolvedTeam, config: BalanceValidationConfig) {
  const store = createEntityStore()
  const records: PlayerRunSample[] = []
  const combos = getScenarioCombos(config)
  const randomRuns = config.runs

  for (let index = 0; index < randomRuns; index++) {
    const combo = combos[index % combos.length]
    const seed = deriveSeed(hashSeed(config.seedBase), `random-${index}`)
    const ghostCount = combo.championshipFormat === 'quick' ? 4 : 9
    const ghostTeams = buildValidationGhostGrid(data, deriveSeed(seed, 'ghosts'), combo.difficulty, ghostCount)
    const championship = runSingleChampionship({
      data,
      playerTeam: shell,
      ghostTeams,
      difficulty: combo.difficulty,
      championshipFormat: combo.championshipFormat,
      seed,
      raceCount: combo.championshipFormat === 'quick' ? 7 : 12,
    })

    const playerConstructorStanding = championship.constructorStandings.find((standing) => standing.teamId === shell.id)
    const playerDriverPrimaryStanding = championship.driverStandings.find((standing) => standing.driverId === shell.driverPrimary.id && standing.teamId === shell.id)
    const playerDriverSecondaryStanding = championship.driverStandings.find((standing) => standing.driverId === shell.driverSecondary.id && standing.teamId === shell.id)
    const playerPosition = playerConstructorStanding ? championship.constructorStandings.indexOf(playerConstructorStanding) + 1 : championship.constructorStandings.length
    const playerPoints = playerConstructorStanding?.points ?? 0

    records.push({
      seed,
      difficulty: combo.difficulty,
      championshipFormat: combo.championshipFormat,
      playerPoints,
      playerPosition,
      playerWins: playerPosition === 1 ? 1 : 0,
      playerPodiums: playerPosition <= 3 ? 1 : 0,
    })

    for (const team of [shell, ...ghostTeams]) {
      const constructorStanding = championship.constructorStandings.find((standing) => standing.teamId === team.id)
      const constructorPosition = constructorStanding ? championship.constructorStandings.indexOf(constructorStanding) + 1 : championship.constructorStandings.length
      const driverPrimaryStanding = championship.driverStandings.find((standing) => standing.driverId === team.driverPrimary.id && standing.teamId === team.id) ?? {
        points: 0,
        dnfs: 0,
      }
      const driverSecondaryStanding = championship.driverStandings.find((standing) => standing.driverId === team.driverSecondary.id && standing.teamId === team.id) ?? {
        points: 0,
        dnfs: 0,
      }

      recordTeamRun(
        store,
        team,
        constructorPosition,
        constructorStanding?.points ?? 0,
        {
          points: driverPrimaryStanding.points,
          position: championship.driverStandings.findIndex((standing) => standing.driverId === team.driverPrimary.id && standing.teamId === team.id) + 1,
          dnfs: driverPrimaryStanding.dnfs,
          wins: championship.driverStandings.findIndex((standing) => standing.driverId === team.driverPrimary.id && standing.teamId === team.id) === 0 ? 1 : 0,
          podiums: championship.driverStandings.findIndex((standing) => standing.driverId === team.driverPrimary.id && standing.teamId === team.id) <= 2 ? 1 : 0,
        },
        {
          points: driverSecondaryStanding.points,
          position: championship.driverStandings.findIndex((standing) => standing.driverId === team.driverSecondary.id && standing.teamId === team.id) + 1,
          dnfs: driverSecondaryStanding.dnfs,
          wins: championship.driverStandings.findIndex((standing) => standing.driverId === team.driverSecondary.id && standing.teamId === team.id) === 0 ? 1 : 0,
          podiums: championship.driverStandings.findIndex((standing) => standing.driverId === team.driverSecondary.id && standing.teamId === team.id) <= 2 ? 1 : 0,
        }
      )
    }
  }

  const summaries = summarizeRunSet(records, store)
  return { store, records, summaries }
}

function buildPairwiseImpact(
  data: ReturnType<typeof loadCuratedData>,
  shell: ResolvedTeam,
  config: BalanceValidationConfig
): PairwiseImpactResult[] {
  const combo = { difficulty: config.difficulty, championshipFormat: config.championshipFormat }
  const sampleSeeds = Array.from({ length: Math.max(4, Math.min(8, Math.round(config.runs / 250))) }, (_, index) => deriveSeed(hashSeed(config.seedBase), `pairwise-${index}`))
  const variants = buildPairwiseVariants(data, shell)

  return variants.map((variant) => {
    let baselinePoints = 0
    let variantPoints = 0
    let baselinePosition = 0
    let variantPosition = 0

    for (const seed of sampleSeeds) {
      const ghostCount = combo.championshipFormat === 'quick' ? 4 : 9
      const ghosts = buildValidationGhostGrid(data, deriveSeed(seed, 'pairwise-ghosts'), combo.difficulty, ghostCount)
      const baselineResult = runSingleChampionship({
        data,
        playerTeam: shell,
        ghostTeams: ghosts,
        difficulty: combo.difficulty,
        championshipFormat: combo.championshipFormat,
        seed,
        raceCount: combo.championshipFormat === 'quick' ? 7 : 12,
      })
      const variantResult = runSingleChampionship({
        data,
        playerTeam: variant.team,
        ghostTeams: ghosts,
        difficulty: combo.difficulty,
        championshipFormat: combo.championshipFormat,
        seed,
        raceCount: combo.championshipFormat === 'quick' ? 7 : 12,
      })

      const baselineStanding = baselineResult.constructorStandings.find((standing) => standing.teamId === shell.id)
      const variantStanding = variantResult.constructorStandings.find((standing) => standing.teamId === variant.team.id)
      baselinePoints += baselineStanding?.points ?? 0
      variantPoints += variantStanding?.points ?? 0
      baselinePosition += baselineStanding ? baselineResult.constructorStandings.indexOf(baselineStanding) + 1 : baselineResult.constructorStandings.length
      variantPosition += variantStanding ? variantResult.constructorStandings.indexOf(variantStanding) + 1 : variantResult.constructorStandings.length
    }

    const baselineAveragePoints = baselinePoints / sampleSeeds.length
    const variantAveragePoints = variantPoints / sampleSeeds.length
    const baselineAveragePosition = baselinePosition / sampleSeeds.length
    const variantAveragePosition = variantPosition / sampleSeeds.length
    const deltaPoints = variantAveragePoints - baselineAveragePoints
    const deltaPointsPct = baselineAveragePoints !== 0 ? deltaPoints / baselineAveragePoints : 0

    return {
      component: variant.component,
      baselineAveragePoints,
      variantAveragePoints,
      deltaPoints,
      deltaPointsPct,
      baselineAveragePosition,
      variantAveragePosition,
      deltaPosition: baselineAveragePosition - variantAveragePosition,
      sampleRuns: sampleSeeds.length,
      recommendedAction: variant.recommendedAction,
    }
  })
}

export function buildBalanceValidationAlerts(
  report: Pick<BalanceValidationReport, 'summary' | 'distribution' | 'trackBattles' | 'pairwiseImpact' | 'entities' | 'champions'>
): ValidationAlert[] {
  const alerts: ValidationAlert[] = []
  const packageScenarios = (report as BalanceValidationReport).packageScenarios ?? []

  const topDriver = report.entities.driver[0]
  const topCar = report.entities.car[0]
  const topEngine = report.entities.engine[0]
  const topPhilosophy = report.entities.philosophy[0]
  const driverChampShare = report.champions.drivers[0]?.share ?? 0
  const constructorChampShare = report.champions.constructors[0]?.share ?? 0

  if (driverChampShare > 0.35) {
    alerts.push({
      severity: 'critical',
      code: 'dominant-driver',
      title: 'Piloto dominante',
      message: `${report.champions.drivers[0]?.name ?? 'Unknown'} venceu mais de 35% dos campeonatos da bateria.`,
      context: { share: driverChampShare },
    })
  }

  if (constructorChampShare > 0.35) {
    alerts.push({
      severity: 'critical',
      code: 'dominant-constructor',
      title: 'Chassi dominante',
      message: `${report.champions.constructors[0]?.name ?? 'Unknown'} aparece em mais de 35% dos campeões de construtores.`,
      context: { share: constructorChampShare },
    })
  }

  const standardWinRate = report.distribution.difficulties.find((item) => item.difficulty === 'standard')?.playerWinRate ?? 0
  const hardWinRate = report.distribution.difficulties.find((item) => item.difficulty === 'hard')?.playerWinRate ?? 0
  const legendWinRate = report.distribution.difficulties.find((item) => item.difficulty === 'legend')?.playerWinRate ?? 0

  if (standardWinRate > 0.65) {
    alerts.push({
      severity: 'warning',
      code: 'standard-too-easy',
      title: 'Dificuldade standard alta demais',
      message: `Win rate do jogador em standard está em ${formatNumber(standardWinRate * 100)}%.`,
    })
  }

  if (hardWinRate > 0.45) {
    alerts.push({
      severity: 'warning',
      code: 'hard-too-easy',
      title: 'Dificuldade hard alta demais',
      message: `Win rate do jogador em hard está em ${formatNumber(hardWinRate * 100)}%.`,
    })
  }

  if (legendWinRate > 0.25) {
    alerts.push({
      severity: 'warning',
      code: 'legend-too-easy',
      title: 'Dificuldade legend alta demais',
      message: `Win rate do jogador em legend está em ${formatNumber(legendWinRate * 100)}%.`,
    })
  }

  const secondDriver = report.entities.driver.find((item) => item.name.toLowerCase().includes('bottas') || item.name.toLowerCase().includes('russell')) ?? report.entities.driver[1]
  if (secondDriver && secondDriver.pointsPerBudget < (report.entities.driver[0]?.pointsPerBudget ?? 0) * 0.15) {
    alerts.push({
      severity: 'warning',
      code: 'secondary-driver-irrelevant',
      title: 'Segundo piloto irrelevante',
      message: `O segundo piloto aparece com menos de 15% da eficiência do líder do grid.`,
    })
  }

  const aggressive = report.entities.philosophy.find((item) => item.name === 'aggressive' || item.name === 'aggressive_package')
  const conservative = report.entities.philosophy.find((item) => item.name === 'conservative' || item.name === 'conservative_package')
  if (aggressive && aggressive.dnfRate <= (conservative?.dnfRate ?? aggressive.dnfRate)) {
    alerts.push({
      severity: 'warning',
      code: 'aggressive-no-risk',
      title: 'Filosofia agressiva sem risco',
      message: 'A filosofia agressiva não elevou o risco de DNF como esperado.',
    })
  }
  if (conservative && conservative.dnfRate >= (aggressive?.dnfRate ?? conservative.dnfRate)) {
    alerts.push({
      severity: 'warning',
      code: 'conservative-no-safety',
      title: 'Filosofia conservadora sem benefício',
      message: 'A filosofia conservadora não reduziu a taxa de DNF como esperado.',
    })
  }

  const development = packageScenarios.find((item) => item.packageId === 'development_package')
  if (development && development.averagePoints <= (packageScenarios.find((item) => item.packageId === 'balanced_package')?.averagePoints ?? development.averagePoints)) {
    alerts.push({
      severity: 'warning',
      code: 'development-flat',
      title: 'Development package sem progressão',
      message: 'A filosofia development-focused não está superando a baseline no terço final esperado.',
    })
  }

  const monzaBattle = report.trackBattles.find((item) => item.circuitName.includes('Monza'))
  if (monzaBattle && !monzaBattle.winner.includes('power')) {
    alerts.push({
      severity: 'warning',
      code: 'monza-no-power',
      title: 'Monza sem motor forte',
      message: 'Monza não está sendo claramente premiada por pacotes de potência.',
    })
  }

  const monacoBattle = report.trackBattles.find((item) => item.circuitName.includes('Monaco'))
  if (monacoBattle && monacoBattle.winner.includes('power')) {
    alerts.push({
      severity: 'critical',
      code: 'monaco-power-win',
      title: 'Monaco vencida por pacote de reta',
      message: 'Monaco está sendo vencida por um pacote de reta, o que indica ajuste fraco demais em street circuits.',
    })
  }

  if (report.trackBattles.every((item) => item.winner === report.trackBattles[0]?.winner && item.winner)) {
    alerts.push({
      severity: 'critical',
      code: 'single-package-domination',
      title: 'Mesmo pacote dominando tudo',
      message: `O mesmo pacote venceu todos os circuitos auditados: ${report.trackBattles[0]?.winner}.`,
    })
  }

  if ((topDriver?.championshipWins ?? 0) / Math.max(report.summary.totalSimulations, 1) > 0.35) {
    alerts.push({
      severity: 'critical',
      code: 'driver-dominance',
      title: 'Dominância excessiva de piloto',
      message: `${topDriver?.name ?? 'Unknown'} está acima do limite de dominância.`,
    })
  }

  if ((topCar?.championshipWins ?? 0) / Math.max(report.summary.totalSimulations, 1) > 0.35) {
    alerts.push({
      severity: 'critical',
      code: 'car-dominance',
      title: 'Dominância excessiva de chassi',
      message: `${topCar?.name ?? 'Unknown'} está acima do limite de dominância.`,
    })
  }

  if ((topEngine?.championshipWins ?? 0) / Math.max(report.summary.totalSimulations, 1) > 0.35) {
    alerts.push({
      severity: 'critical',
      code: 'engine-dominance',
      title: 'Dominância excessiva de motor',
      message: `${topEngine?.name ?? 'Unknown'} está acima do limite de dominância.`,
    })
  }

  if ((topPhilosophy?.championshipWins ?? 0) > report.summary.totalSimulations * 0.35) {
    alerts.push({
      severity: 'warning',
      code: 'philosophy-dominance',
      title: 'Filosofia dominante',
      message: `${topPhilosophy?.name ?? 'Unknown'} está aparecendo demais entre os campeões.`,
    })
  }

  return alerts
}

export function buildBalanceValidationRecommendations(report: Pick<BalanceValidationReport, 'alerts' | 'pairwiseImpact' | 'trackBattles'>) {
  const recommendations: string[] = []
  const add = (text: string) => {
    if (!recommendations.includes(text)) recommendations.push(text)
  }

  if (report.alerts.some((alert) => alert.code === 'driver-dominance')) {
    add('Considere aliviar o peso do piloto principal ou aumentar a importância do chassi, do motor e da filosofia.')
  }

  if (report.alerts.some((alert) => alert.code === 'car-dominance')) {
    add('Considere revisar calculateCarTrackFit ou reduzir o impacto do overall do chassi em circuitos mistos.')
  }

  if (report.alerts.some((alert) => alert.code === 'engine-dominance')) {
    add('Considere aumentar a sensibilidade de power_track, coolingDemand e racePaceSustainability.')
  }

  const secondaryImpact = report.pairwiseImpact.find((item) => item.component === 'driverSecondary')
  if (secondaryImpact && secondaryImpact.deltaPointsPct < 0.15) {
    add('Segundo piloto ainda contribui pouco para o Mundial. Vale revisar o peso de driverSecondary e teamPlay.')
  }

  const aggressiveAlert = report.alerts.find((alert) => alert.code === 'aggressive-no-risk')
  if (aggressiveAlert) {
    add('Filosofia agressiva não está elevando risco suficiente. Ajuste errorRiskModifier ou reliabilityModifier.')
  }

  const developmentAlert = report.alerts.find((alert) => alert.code === 'development-flat')
  if (developmentAlert) {
    add('Development-focused não está deixando o carro mais forte no fim da temporada. Considere reforçar a progressão por fase.')
  }

  const monzaAlert = report.alerts.find((alert) => alert.code === 'monza-no-power')
  if (monzaAlert) {
    add('Monza não está premiando potência o bastante. Reforce calculateEngineTrackFit para power_track.')
  }

  return recommendations
}

function determineStatus(alerts: ValidationAlert[]): ValidationStatus {
  if (alerts.some((alert) => alert.severity === 'critical')) return 'Crítico'
  if (alerts.some((alert) => alert.severity === 'warning')) return 'Atenção'
  return 'OK'
}

function serializeCsvRows(report: BalanceValidationReport) {
  const rows = [
    ['section', 'metric', 'label', 'value', 'details', 'severity'],
    ['summary', 'totalSimulations', 'Total simulations', `${report.summary.totalSimulations}`, '', report.summary.status],
    ['summary', 'playerWinRate', 'Player win rate', formatNumber(report.summary.playerWinRate * 100), '', report.summary.status],
    ['summary', 'averagePlayerPoints', 'Average player points', formatNumber(report.summary.averagePlayerPoints), '', report.summary.status],
    ['summary', 'averagePlayerPosition', 'Average player position', formatNumber(report.summary.averagePlayerPosition), '', report.summary.status],
    ...report.distribution.difficulties.map((item) => ['difficulty', 'playerWinRate', difficultyLabel(item.difficulty), formatNumber(item.playerWinRate * 100), `runs=${item.runs}`, 'info']),
    ...report.distribution.formats.map((item) => ['format', 'playerWinRate', item.format, formatNumber(item.playerWinRate * 100), `runs=${item.runs}`, 'info']),
    ...report.trackBattles.map((item) => ['track', 'winner', item.circuitName, item.winner, `gap=${formatNumber(item.gap)}`, 'info']),
    ...report.packageScenarios.map((item) => ['package', 'averagePoints', item.packageLabel, formatNumber(item.averagePoints), `winRate=${formatNumber(item.winRate * 100)}%`, 'info']),
    ...report.pairwiseImpact.map((item) => ['pairwise', 'deltaPoints', item.component, formatNumber(item.deltaPoints), item.recommendedAction, item.deltaPoints >= 0 ? 'info' : 'warning']),
    ...report.alerts.map((item) => ['alert', item.code, item.title, item.message, item.context ? JSON.stringify(item.context) : '', item.severity]),
  ]

  return rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n')
}

function renderMarkdown(report: BalanceValidationReport) {
  const statusLine = report.summary.status
  return `# Balance Validation Report

## Configuração
- runs: ${report.config.runs}
- difficulty: ${report.config.difficulty}
- format: ${report.config.championshipFormat}
- seed base: ${report.config.seedBase}
- data version: ${report.dataVersion}

## Resumo Executivo
- status geral: ${statusLine}
- total de simulações: ${report.summary.totalSimulations}
- win rate do jogador: ${formatNumber(report.summary.playerWinRate * 100)}%
- média de pontos do jogador: ${formatNumber(report.summary.averagePlayerPoints)}
- média de posição do jogador: ${formatNumber(report.summary.averagePlayerPosition)}
- principais alertas: ${report.summary.mainAlerts.length ? report.summary.mainAlerts.map((alert) => `${alert.severity.toUpperCase()} ${alert.title}`).join('; ') : 'Nenhum'}
- principais recomendações: ${report.summary.recommendations.length ? report.summary.recommendations.join('; ') : 'Nenhuma'}

## Distribuição de Campeões

### Pilotos
| Piloto | Vitórias | Share |
|---|---:|---:|
${report.champions.drivers.slice(0, 10).map((item) => `| ${item.name} | ${item.wins} | ${formatNumber(item.share * 100)}% |`).join('\n')}

### Construtores
| Construtor | Vitórias | Share |
|---|---:|---:|
${report.champions.constructors.slice(0, 10).map((item) => `| ${item.name} | ${item.wins} | ${formatNumber(item.share * 100)}% |`).join('\n')}

## Eficiência por Budget
### Melhores pilotos
| Piloto | Pontos médios | Pontos / 100ms |
|---|---:|---:|
${report.entities.driver.slice(0, 10).map((item) => `| ${item.name} | ${formatNumber(item.averagePoints)} | ${formatNumber(item.pointsPerBudget)} |`).join('\n')}

### Melhores chassis
| Chassi | Pontos médios | Pontos / 100ms |
|---|---:|---:|
${report.entities.car.slice(0, 10).map((item) => `| ${item.name} | ${formatNumber(item.averagePoints)} | ${formatNumber(item.pointsPerBudget)} |`).join('\n')}

## Impacto por Componente
${report.pairwiseImpact.map((item) => `- ${item.component}: ${formatNumber(item.deltaPoints)} pts médio (${formatNumber(item.deltaPointsPct * 100)}%). ${item.recommendedAction}`).join('\n')}

## Filosofias
${report.entities.philosophy.slice(0, 8).map((item) => `- ${item.name}: vitórias ${item.championshipWins}, DNFs ${formatNumber(item.dnfs)}, pontos médios ${formatNumber(item.averagePoints)}`).join('\n')}

## Sensibilidade por Pista
${report.trackBattles.map((item) => `- ${item.circuitName}: vencedor ${item.winner}, vice ${item.runnerUp}, gap ${formatNumber(item.gap)}. ${item.why}`).join('\n')}

## Outliers
${report.alerts.map((alert) => `- [${alert.severity.toUpperCase()}] ${alert.title}: ${alert.message}`).join('\n')}

## Recomendações
${report.summary.recommendations.map((line) => `- ${line}`).join('\n')}
`
}

function writeOutputs(report: BalanceValidationReport, outputDir = path.resolve(process.cwd(), 'reports')) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  writeJsonReport(path.join(path.relative(path.resolve(process.cwd(), 'reports'), outputDir) || '', 'balance-validation.json').replace(/\\/g, '/'), report)
  writeReport(path.join(path.relative(path.resolve(process.cwd(), 'reports'), outputDir) || '', 'balance-validation.md').replace(/\\/g, '/'), renderMarkdown(report))
  fs.writeFileSync(path.join(outputDir, 'balance-validation-summary.csv'), serializeCsvRows(report))
}

export function buildBalanceValidationConfig(args: string[]): BalanceValidationConfig {
  const modeArg = args.find((arg) => arg.startsWith('--mode='))
  const runsArg = args.find((arg) => arg.startsWith('--runs='))
  const difficultyArg = args.find((arg) => arg.startsWith('--difficulty='))
  const formatArg = args.find((arg) => arg.startsWith('--format='))

  const mode = (modeArg ? modeArg.split('=')[1] : 'standard') as BalanceValidationMode
  const defaultRuns = MODE_DEFAULTS[mode] ?? MODE_DEFAULTS.standard
  const runs = runsArg ? Number.parseInt(runsArg.split('=')[1], 10) : defaultRuns
  const difficulty = (difficultyArg ? difficultyArg.split('=')[1] : 'standard') as DifficultyMode
  const championshipFormat = (formatArg ? formatArg.split('=')[1] : 'standard') as ChampionshipFormat

  return {
    mode,
    runs: Number.isFinite(runs) && runs > 0 ? runs : defaultRuns,
    difficulty,
    championshipFormat,
    seedBase: `balance-validation-${mode}`,
  }
}

export function runBalanceValidationSuite(config: BalanceValidationConfig) {
  const data = loadCuratedData()
  const shell = getValidationShell(data)

  const random = buildRandomRuns(data, shell, config)
  const packageScenarios = buildPackageScenarios(data, shell, config)
  const trackBattles = buildTrackBattles(data, shell, config)
  const pairwiseImpact = buildPairwiseImpact(data, shell, config)

  const { store, records, summaries } = random
  const entities: Record<EntityKind, ReturnType<typeof aggregateEntityMap>> = {
    driver: aggregateEntityMap(store.driver),
    car: aggregateEntityMap(store.car),
    engine: aggregateEntityMap(store.engine),
    teamPrincipal: aggregateEntityMap(store.teamPrincipal),
    technicalDirector: aggregateEntityMap(store.technicalDirector),
    philosophy: aggregateEntityMap(store.philosophy),
  }

  const baseReport = {
    generatedAt: new Date().toISOString(),
    dataVersion: DATA_VERSION,
    config,
    summary: {
      status: 'OK' as ValidationStatus,
      totalSimulations: records.length + packageScenarios.length * 0 + trackBattles.length * 0 + pairwiseImpact.length * 0,
      playerWinRate: summaries.playerWinRate,
      averagePlayerPoints: summaries.averagePlayerPoints,
      averagePlayerPosition: summaries.averagePlayerPosition,
      mainAlerts: [] as ValidationAlert[],
      recommendations: [] as string[],
    },
    distribution: {
      difficulties: summaries.difficultySummaries,
      formats: summaries.formatSummaries,
    },
    champions: {
      drivers: summaries.championDrivers,
      constructors: summaries.championConstructors,
    },
    entities,
    packageScenarios,
    trackBattles,
    pairwiseImpact,
  } satisfies Omit<BalanceValidationReport, 'alerts'>

  const alerts = buildBalanceValidationAlerts({
    ...baseReport,
    summary: {
      ...baseReport.summary,
      status: 'OK',
      mainAlerts: [],
      recommendations: [],
    },
  })

  const report: BalanceValidationReport = {
    ...baseReport,
    alerts,
    summary: {
      status: determineStatus(alerts),
      totalSimulations: records.length,
      playerWinRate: summaries.playerWinRate,
      averagePlayerPoints: summaries.averagePlayerPoints,
      averagePlayerPosition: summaries.averagePlayerPosition,
      mainAlerts: alerts.slice(0, 5),
      recommendations: [],
    },
  }

  const recommendations = buildBalanceValidationRecommendations(report)
  report.summary.recommendations = recommendations

  return report
}

export function writeBalanceValidationSuite(report: BalanceValidationReport, outputDir = path.resolve(process.cwd(), 'reports')) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  fs.writeFileSync(path.join(outputDir, 'balance-validation.json'), JSON.stringify(report, null, 2))
  fs.writeFileSync(path.join(outputDir, 'balance-validation.md'), renderMarkdown(report))
  fs.writeFileSync(path.join(outputDir, 'balance-validation-summary.csv'), serializeCsvRows(report))
}

export function runAndWriteBalanceValidationSuite(config: BalanceValidationConfig, outputDir = path.resolve(process.cwd(), 'reports')) {
  const report = runBalanceValidationSuite(config)
  writeBalanceValidationSuite(report, outputDir)
  return report
}

export function createBalanceValidationTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'millisecond-balance-'))
}
