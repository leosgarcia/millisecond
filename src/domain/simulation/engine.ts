/**
 * millisecond — Simulation Engine
 *
 * Orchestrates: qualifying → race → championship.
 * All randomness is seeded and deterministic.
 */

import { createRng, deriveSeed, rngBool, rngRange } from '@/lib/deterministic-rng'
import { clamp } from '@/lib/normalization'
import { resolveCountryCode } from '@/lib/country'
import { resolveHistoricalLivery } from '@/lib/livery'
import {
  calculateQualifyingScore,
  calculateRaceScore,
  calculateReliabilityRisk,
  calculateErrorRisk,
  calculateDriverPairSynergy,
  computeScoreBreakdown,
} from './formulas'
import { formatDriverName } from '@/lib/format'
import {
  ResolvedTeam,
  RaceEntry,
  RaceResult,
  RaceConditions,
  ChampionshipResult,
  SimulationInput,
  DriverStanding,
  ConstructorStanding,
  POINTS_TABLE,
  RaceDiagnostics,
  SimulationDiagnostics,
} from './types'
import { Circuit } from '../circuits/types'
import { explainRaceResult, explainChampionshipResult } from './explainer'
import { buildRaceDiagnostics, buildTeamSeasonDiagnostics } from './diagnostics'
import { explainRace, explainChampionship, explainBudgetEfficiency, explainSeasonBottleneck, explainDecisiveMoment } from './narrator'

function getCarDisplayInfo(car: ResolvedTeam['car']) {
  const palette = resolveHistoricalLivery(car)
  return {
    carName: car.name,
    carSeasonYear: car.seasonYear,
    carLiveryPrimaryColor: car.liveryPrimaryColor ?? palette.primaryColor,
    carLiverySecondaryColor: car.liverySecondaryColor ?? palette.secondaryColor,
    carLiveryAccentColor: car.liveryAccentColor ?? palette.accentColor,
    teamCountryCode: resolveCountryCode(car.teamCountryCode ?? car.teamName),
  }
}

function getDriverDisplayInfo(driver: ResolvedTeam['driverPrimary']) {
  return {
    driverSeasonYear: driver.seasonYear,
    driverNationalityCode: resolveCountryCode(driver.nationalityCode ?? driver.nationality),
  }
}

// ─── QUALIFYING ───────────────────────────────────────────────────────────────

export function simulateQualifying(
  teams: ResolvedTeam[],
  circuit: Circuit,
  raceNumber: number,
  baseSeed: number,
  totalRaces = 1
): RaceEntry[] {
  const entries: RaceEntry[] = []

  for (const team of teams) {
    for (const [isSecondary, driver] of [
      [false, team.driverPrimary],
      [true, team.driverSecondary],
    ] as [boolean, typeof team.driverPrimary][]) {
      const synergy = calculateDriverPairSynergy(team.driverPrimary, team.driverSecondary)
      const driverSeed = deriveSeed(baseSeed, `q-race${raceNumber}-${team.id}-${driver.id}`)
      const driverRng = createRng(driverSeed)

      const baseScore = calculateQualifyingScore(
        driver,
        team.car,
        team.engine,
        circuit,
        team.teamPrincipal,
        team.technicalDirector,
        team.philosophy,
        { raceIndex: raceNumber, totalRaces }
      )

      // Small seeded variation (max ±3 points) — keeps determinism, adds tiny spread
      const variation = rngRange(driverRng, -3, 3)
      const finalScore = clamp(baseScore + variation)

      entries.push({
        teamId: team.id,
        teamName: team.name,
        ...getCarDisplayInfo(team.car),
        driverId: driver.id,
        driverName: driver.name,
        ...getDriverDisplayInfo(driver),
        isSecondary,
        qualifyingScore: finalScore,
        raceScore: 0, // filled in simulateRace
        didFinish: true,
      })
    }
  }

  return entries.sort((a, b) => b.qualifyingScore - a.qualifyingScore)
}

// ─── RACE ─────────────────────────────────────────────────────────────────────

export function simulateRace(
  teams: ResolvedTeam[],
  circuit: Circuit,
  qualifyingOrder: RaceEntry[],
  conditions: RaceConditions,
  raceNumber: number,
  baseSeed: number,
  totalRaces = 1
): RaceEntry[] {
  const entries: RaceEntry[] = []

  for (const team of teams) {
    for (const [isSecondary, driver] of [
      [false, team.driverPrimary],
      [true, team.driverSecondary],
    ] as [boolean, typeof team.driverPrimary][]) {
      const synergy = calculateDriverPairSynergy(team.driverPrimary, team.driverSecondary)
      const driverSeed = deriveSeed(baseSeed, `r-race${raceNumber}-${team.id}-${driver.id}`)
      const driverRng = createRng(driverSeed)

      // Qualifying position bonus (top grid positions give a small advantage)
      const qualiEntry = qualifyingOrder.find(
        (e) => e.driverId === driver.id && e.teamId === team.id
      )
      const gridPosition = qualiEntry
        ? qualifyingOrder.indexOf(qualiEntry) + 1
        : qualifyingOrder.length
      const gridBonus = Math.max(0, (qualifyingOrder.length - gridPosition) * 0.2)

      const baseScore = calculateRaceScore(
        driver,
        team.car,
        team.engine,
        circuit,
        team.teamPrincipal,
        team.technicalDirector,
        team.philosophy,
        synergy,
        conditions.isWet,
        { raceIndex: raceNumber, totalRaces }
      )

      const variation = rngRange(driverRng, -4, 4)
      let finalScore = clamp(baseScore + variation + gridBonus * 0.3)

      // Check reliability DNF
      const reliabilityRisk = calculateReliabilityRisk(
        team.car,
        team.engine,
        circuit,
        team.philosophy,
        { raceIndex: raceNumber, totalRaces }
      )
      const rngRel = createRng(deriveSeed(driverSeed, 'reliability'))
      const didDNFReliability = rngBool(rngRel, reliabilityRisk)

      // Check driver error DNF
      const errorRisk = calculateErrorRisk(driver, circuit, team.philosophy, { raceIndex: raceNumber, totalRaces })
      const rngErr = createRng(deriveSeed(driverSeed, 'error'))
      const didDNFError = rngBool(rngErr, errorRisk)

      let didFinish = true
      let dnfReason: string | undefined

      if (didDNFReliability) {
        didFinish = false
        dnfReason = 'reliability'
        finalScore = 0
      } else if (didDNFError) {
        didFinish = false
        dnfReason = 'driver-error'
        finalScore = 0
      }

      entries.push({
        teamId: team.id,
        teamName: team.name,
        ...getCarDisplayInfo(team.car),
        driverId: driver.id,
        driverName: driver.name,
        ...getDriverDisplayInfo(driver),
        isSecondary,
        qualifyingScore: qualiEntry?.qualifyingScore ?? 0,
        raceScore: finalScore,
        didFinish,
        dnfReason,
      })
    }
  }

  // DNF drivers go to back, finishers sorted by raceScore
  const finishers = entries.filter((e) => e.didFinish).sort((a, b) => b.raceScore - a.raceScore)
  const dnfs = entries.filter((e) => !e.didFinish)

  return [...finishers, ...dnfs]
}

// ─── CONDITIONS ───────────────────────────────────────────────────────────────

export function determineConditions(
  circuit: Circuit,
  raceNumber: number,
  baseSeed: number
): RaceConditions {
  const seed = deriveSeed(baseSeed, `conditions-race${raceNumber}`)
  const rng = createRng(seed)

  const isWet = rngBool(rng, circuit.rainProbability / 100)
  const hasSafetyCar = rngBool(rng, circuit.safetyCarProbability / 100)
  const tireStress = circuit.tireStress
  const tireStressLevel: 'low' | 'medium' | 'high' =
    tireStress < 40 ? 'low' : tireStress < 70 ? 'medium' : 'high'

  return { isWet, hasSafetyCar, tireStressLevel }
}

// ─── CHAMPIONSHIP ─────────────────────────────────────────────────────────────

export function simulateChampionship(input: SimulationInput): ChampionshipResult {
  const { seed, playerTeam, ghostTeams, circuits } = input
  const allTeams = [playerTeam, ...ghostTeams]

  const driverStandingsMap = new Map<string, DriverStanding>()
  const constructorStandingsMap = new Map<string, ConstructorStanding>()

  // Initialize standings
  for (const team of allTeams) {
    constructorStandingsMap.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      ...getCarDisplayInfo(team.car),
      points: 0,
      wins: 0,
      podiums: 0,
    })
    for (const driver of [team.driverPrimary, team.driverSecondary]) {
      driverStandingsMap.set(`${team.id}-${driver.id}`, {
        driverId: driver.id,
        driverName: driver.name,
        ...getDriverDisplayInfo(driver),
        teamId: team.id,
        teamName: team.name,
        teamCountryCode: resolveCountryCode(team.car.teamCountryCode ?? team.car.teamName),
        points: 0,
        wins: 0,
        podiums: 0,
        dnfs: 0,
        bestResult: 99,
      })
    }
  }

  const races: RaceResult[] = []
  const raceCount = circuits.length

  for (let raceIdx = 0; raceIdx < raceCount; raceIdx++) {
    const circuit = circuits[raceIdx]
    const raceSeed = deriveSeed(seed, `race-${raceIdx}`)

    const conditions = determineConditions(circuit, raceIdx, raceSeed)
    const qualifyingOrder = simulateQualifying(allTeams, circuit, raceIdx, raceSeed, raceCount)
    const finishOrder = simulateRace(allTeams, circuit, qualifyingOrder, conditions, raceIdx, raceSeed, raceCount)

    const raceDiagnostics: RaceDiagnostics[] = []

    for (const entry of finishOrder) {
      const team = allTeams.find(t => t.id === entry.teamId)!
      const driver = entry.isSecondary ? team.driverSecondary : team.driverPrimary
      
      const breakdown = computeScoreBreakdown(
        driver,
        team.car,
        team.engine,
        circuit,
        team.teamPrincipal,
        team.technicalDirector,
        team.philosophy,
        calculateDriverPairSynergy(team.driverPrimary, team.driverSecondary),
        conditions.isWet,
        { raceIndex: raceIdx, totalRaces: raceCount }
      )

      raceDiagnostics.push(buildRaceDiagnostics(
        `race-${raceIdx}`,
        circuit,
        team,
        driver.id,
        entry,
        breakdown
      ))
    }

    // Compute explanations
    // Old explainer (backwards compat)
    const explanations = explainRaceResult(finishOrder, allTeams, circuit, conditions, { raceIndex: raceIdx, totalRaces: raceCount })

    races.push({
      circuitId: circuit.id,
      circuitName: circuit.name,
      circuitCountry: circuit.country,
      raceNumber: raceIdx + 1,
      entries: finishOrder,
      qualifyingOrder,
      conditions,
      explanations,
      podium: finishOrder.slice(0, 3).map((entry, index) => {
        const team = allTeams.find(t => t.id === entry.teamId)!
        const driver = entry.isSecondary ? team.driverSecondary : team.driverPrimary
        return {
          position: index + 1,
          driverName: driver.name,
          driverDisplayName: formatDriverName(driver),
          driverSeasonYear: driver.seasonYear,
          teamName: team.name,
          countryCode: resolveCountryCode(driver.nationalityCode ?? driver.nationality) || '',
          ...getCarDisplayInfo(team.car),
        }
      }),
    })

    // Update standings
    for (let pos = 0; pos < finishOrder.length; pos++) {
      const entry = finishOrder[pos]
      const points = POINTS_TABLE[pos + 1] ?? 0
      const finishPosition = pos + 1
      const team = allTeams.find((t) => t.id === entry.teamId)!
      const driver = entry.isSecondary ? team.driverSecondary : team.driverPrimary

      const driverKey = `${entry.teamId}-${entry.driverId}`
      const driverStanding = driverStandingsMap.get(driverKey)
      const constructorStanding = constructorStandingsMap.get(entry.teamId)

      if (driverStanding) {
        driverStanding.points += points
        driverStanding.driverSeasonYear = driverStanding.driverSeasonYear ?? driver.seasonYear
        driverStanding.driverNationalityCode = driverStanding.driverNationalityCode ?? resolveCountryCode(driver.nationalityCode ?? driver.nationality)
        driverStanding.teamCountryCode = driverStanding.teamCountryCode ?? resolveCountryCode(team.car.teamCountryCode ?? team.car.teamName)
        if (finishPosition === 1) driverStanding.wins++
        if (finishPosition <= 3 && entry.didFinish) driverStanding.podiums++
        if (!entry.didFinish) driverStanding.dnfs++
        if (entry.didFinish && finishPosition < driverStanding.bestResult) {
          driverStanding.bestResult = finishPosition
        }
      }

      if (constructorStanding) {
        constructorStanding.points += points
        constructorStanding.teamCountryCode = constructorStanding.teamCountryCode ?? resolveCountryCode(team.car.teamCountryCode ?? team.car.teamName)
        constructorStanding.carName = constructorStanding.carName ?? team.car.name
        constructorStanding.carSeasonYear = constructorStanding.carSeasonYear ?? team.car.seasonYear
        constructorStanding.carLiveryPrimaryColor = constructorStanding.carLiveryPrimaryColor ?? getCarDisplayInfo(team.car).carLiveryPrimaryColor
        constructorStanding.carLiverySecondaryColor = constructorStanding.carLiverySecondaryColor ?? getCarDisplayInfo(team.car).carLiverySecondaryColor
        constructorStanding.carLiveryAccentColor = constructorStanding.carLiveryAccentColor ?? getCarDisplayInfo(team.car).carLiveryAccentColor
        if (finishPosition === 1 && !entry.isSecondary) constructorStanding.wins++
        if (finishPosition <= 3 && entry.didFinish) constructorStanding.podiums++
      }
    }
    
    // Attach race diags to some global array if needed, but we can just map them later or store them in ChampionshipResult
    (races as any)._allDiags = ((races as any)._allDiags || []).concat(raceDiagnostics)
  }

  const driverStandings = Array.from(driverStandingsMap.values()).sort(
    (a, b) => b.points - a.points || a.bestResult - b.bestResult
  )

  const constructorStandings = Array.from(constructorStandingsMap.values()).sort(
    (a, b) => b.points - a.points
  )

  const championshipExplanations = explainChampionshipResult(
    driverStandings,
    constructorStandings,
    playerTeam,
    races
  )

  const allRaceDiags: RaceDiagnostics[] = (races as any)._allDiags || []
  
  const seasonDiagnostics = buildTeamSeasonDiagnostics(
    playerTeam,
    races,
    driverStandings,
    constructorStandings,
    allRaceDiags,
    circuits
  )

  const diagnostics: SimulationDiagnostics = {
    races: allRaceDiags,
    season: seasonDiagnostics,
    explanations: {
      raceSummaries: allRaceDiags.filter(d => d.teamId === playerTeam.id).map(d => explainRace(d, circuits.find(c => c.id === d.circuitId)!, playerTeam)),
      championshipSummary: explainChampionship(seasonDiagnostics, playerTeam),
      budgetSummary: explainBudgetEfficiency(seasonDiagnostics, playerTeam),
      bottleneckSummary: explainSeasonBottleneck(seasonDiagnostics),
      decisiveMoment: explainDecisiveMoment(seasonDiagnostics, races)
    }
  }

  return {
    campaignId: '',
    seed,
    races,
    driverStandings,
    constructorStandings,
    championshipExplanations,
    diagnostics
  }
}
