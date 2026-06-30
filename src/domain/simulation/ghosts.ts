import { prisma } from '@/lib/prisma'
import { createRng, rngInt } from '@/lib/deterministic-rng'
import { validateBudgetCap } from './budget'
import { DifficultyMode, GhostArchetype, DIFFICULTY_CONFIG } from './types'
import { getGhostPhilosophyIdsForArchetype, getTeamPhilosophies, getTeamPhilosophyById } from '../teams/philosophies'

function getTopChoices<T>(pool: T[], count: number, scorer: (item: T) => number): T[] {
  return [...pool].sort((a, b) => scorer(b) - scorer(a)).slice(0, count)
}

function parseDriver(d: any) {
  return {
    ...d,
    preferredCarTraits: typeof d.preferredCarTraits === 'string' ? JSON.parse(d.preferredCarTraits) : d.preferredCarTraits,
    weakCarTraits: typeof d.weakCarTraits === 'string' ? JSON.parse(d.weakCarTraits) : d.weakCarTraits,
  }
}

function parseEngine(e: any) {
  return {
    ...e,
    compatibleEras: typeof e.compatibleEras === 'string' ? JSON.parse(e.compatibleEras) : e.compatibleEras,
  }
}

export async function buildGhostTeams(
  seed: number,
  difficulty: DifficultyMode,
  teamCount: number = 4,
  excludedCanonicalDriverIds: string[] = []
) {
  const rng = createRng(seed + 1000)
  const config = DIFFICULTY_CONFIG[difficulty]
  const ghostLimit = config.ghostBudgetLimit
  const poolSize = config.ghostOptimization === 'very_high' ? 3 : config.ghostOptimization === 'high' ? 5 : 10
  const usedCanonicalDriverIds = new Set(excludedCanonicalDriverIds.filter(Boolean))

  const allDrivers = await prisma.driver.findMany()
  const primaryDrivers = allDrivers.filter(d => d.role === 'primary')
  const secondaryDrivers = allDrivers.filter(d => d.role === 'secondary')
  const cars = await prisma.car.findMany()
  const engines = await prisma.engine.findMany()
  const tps = await prisma.teamPrincipal.findMany()
  const tds = await prisma.technicalDirector.findMany()
  const philosophies = getTeamPhilosophies()

  const archetypes: GhostArchetype[] = [
    "balanced_constructor",
    "aero_monster",
    "straight_line_rocket",
    "wet_weather_specialists",
    "reliability_machine",
    "qualifying_kings",
    "elite_driver_underdog_car"
  ]

  const ghostTeams = []

  function pickDriver<T extends { canonicalDriverId: string }>(pool: T[], fallback: T[]) {
    const source = pool.length > 0 ? pool : fallback
    return source.find((driver) => !usedCanonicalDriverIds.has(driver.canonicalDriverId))
  }
  
  for (let i = 0; i < teamCount; i++) {
    const archetype = archetypes[rngInt(rng, 0, archetypes.length - 1)]

    let dpPool = primaryDrivers.filter(d => !excludedCanonicalDriverIds.includes(d.canonicalDriverId))
    let dsPool = secondaryDrivers.filter(d => !excludedCanonicalDriverIds.includes(d.canonicalDriverId))

    if (dpPool.length === 0) dpPool = primaryDrivers
    if (dsPool.length === 0) dsPool = secondaryDrivers

    let carPool = cars
    let enginePool = engines
    let tpPool = tps
    let tdPool = tds

    if (archetype === 'aero_monster') {
      carPool = getTopChoices(cars, poolSize, c => c.aeroEfficiency + c.fastCorner)
      tdPool = getTopChoices(tds, poolSize, td => td.aerodynamics)
      dpPool = getTopChoices(primaryDrivers, poolSize, d => d.racePace)
    } else if (archetype === 'straight_line_rocket') {
      enginePool = getTopChoices(engines, poolSize, e => e.power)
      carPool = getTopChoices(cars, poolSize, c => c.straightLineSpeed + c.braking)
      dpPool = getTopChoices(primaryDrivers, poolSize, d => d.overtaking)
    } else if (archetype === 'wet_weather_specialists') {
      dpPool = getTopChoices(primaryDrivers, poolSize, d => d.wetSkill + d.adaptability)
      carPool = getTopChoices(cars, poolSize, c => c.stableRear)
      tpPool = getTopChoices(tps, poolSize, t => t.crisisManagement)
    } else if (archetype === 'reliability_machine') {
      carPool = getTopChoices(cars, poolSize, c => c.reliability)
      enginePool = getTopChoices(engines, poolSize, e => e.reliability)
      dpPool = getTopChoices(primaryDrivers, poolSize, d => d.consistency)
      tpPool = getTopChoices(tps, poolSize, t => t.operationalDiscipline)
    } else if (archetype === 'qualifying_kings') {
      dpPool = getTopChoices(primaryDrivers, poolSize, d => d.qualifyingPace)
      carPool = getTopChoices(cars, poolSize, c => c.setupWindow)
      enginePool = getTopChoices(engines, poolSize, e => e.qualifyingMode)
      tdPool = getTopChoices(tds, poolSize, t => t.setupUnderstanding)
    } else if (archetype === 'elite_driver_underdog_car') {
      dpPool = getTopChoices(primaryDrivers, poolSize, d => d.overall)
      carPool = getTopChoices(cars, cars.length, c => -c.budgetCost).slice(cars.length / 2, cars.length / 2 + poolSize)
      if (carPool.length === 0) carPool = cars
      enginePool = getTopChoices(engines, poolSize, e => e.reliability)
      dsPool = getTopChoices(secondaryDrivers, poolSize, d => d.consistency - (d.budgetCost * 0.5))
    }

    let validTeam: any = null
    for (let attempts = 0; attempts < 50; attempts++) {
      const dp = pickDriver(dpPool, primaryDrivers)
      const ds = pickDriver(dsPool, secondaryDrivers)
      const car = carPool[rngInt(rng, 0, carPool.length - 1)] || cars[rngInt(rng, 0, cars.length - 1)]
      const engine = enginePool[rngInt(rng, 0, enginePool.length - 1)] || engines[rngInt(rng, 0, engines.length - 1)]
      const tp = tpPool[rngInt(rng, 0, tpPool.length - 1)] || tps[rngInt(rng, 0, tps.length - 1)]
      const td = tdPool[rngInt(rng, 0, tdPool.length - 1)] || tds[rngInt(rng, 0, tds.length - 1)]
      const philPool = getGhostPhilosophyIdsForArchetype(archetype)
      const philId = philPool[rngInt(rng, 0, philPool.length - 1)]
      const phil = getTeamPhilosophyById(philId) ?? philosophies[0]

      if (!dp || !ds) continue
      if (dp.canonicalDriverId === ds.canonicalDriverId) continue
      if (usedCanonicalDriverIds.has(dp.canonicalDriverId) || usedCanonicalDriverIds.has(ds.canonicalDriverId)) continue

      const candidateTeam = {
        id: `ghost-${i}-${attempts}`,
        name: `${car.teamName} ${car.seasonYear} - ${archetype.replace(/_/g, ' ').toUpperCase()}`,
        driverPrimary: parseDriver(dp),
        driverSecondary: parseDriver(ds),
        car,
        engine: parseEngine(engine),
        teamPrincipal: tp,
        technicalDirector: td,
        philosophy: phil,
        isGhost: true,
        archetype
      } as any

      if (validateBudgetCap(candidateTeam, ghostLimit)) {
        validTeam = candidateTeam
        break
      }
    }
    
    if (!validTeam) {
      const cheapestDp = [...primaryDrivers].sort((a, b) => a.budgetCost - b.budgetCost)[0]
      const cheapestDs = [...secondaryDrivers].sort((a, b) => a.budgetCost - b.budgetCost)[0]
      const cheapestCar = [...cars].sort((a, b) => a.budgetCost - b.budgetCost)[0]
      const cheapestEngine = [...engines].sort((a, b) => a.budgetCost - b.budgetCost)[0]
      const cheapestTp = [...tps].sort((a, b) => a.budgetCost - b.budgetCost)[0]
      const cheapestTd = [...tds].sort((a, b) => a.budgetCost - b.budgetCost)[0]

      validTeam = {
        id: `ghost-${i}-fallback`,
        name: `${cheapestCar.teamName} Econômica`,
        driverPrimary: parseDriver(cheapestDp),
        driverSecondary: parseDriver(cheapestDs),
        car: cheapestCar,
        engine: parseEngine(cheapestEngine),
        teamPrincipal: cheapestTp,
        technicalDirector: cheapestTd,
        philosophy: getTeamPhilosophyById('philosophy-balanced') ?? philosophies[0],
        isGhost: true,
        archetype: 'economic_fallback'
      }
    }

    usedCanonicalDriverIds.add(validTeam.driverPrimary.canonicalDriverId)
    usedCanonicalDriverIds.add(validTeam.driverSecondary.canonicalDriverId)

    ghostTeams.push(validTeam)
  }

  return ghostTeams
}
