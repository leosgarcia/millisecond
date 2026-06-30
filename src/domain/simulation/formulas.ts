/**
 * millisecond — Simulation Formulas
 *
 * All functions here are pure (no side effects, no Math.random).
 * Any variation must come via a seeded RNG passed as argument.
 *
 * See: docs/SIMULATION_FORMULAS.md for full rationale.
 */

import { Driver } from '../drivers/types'
import { Car } from '../cars/types'
import { Engine } from '../engines/types'
import { Circuit } from '../circuits/types'
import { TeamPrincipal, TechnicalDirector, TeamPhilosophy } from '../teams/types'
import { getTrackProfiles } from '../circuits/profiles'
import { getPhilosophyModifiersForRace } from '../teams/philosophies'
import { ScoreBreakdown } from './types'
import { weightedAvg, clamp, applyModifier, softenElite } from '@/lib/normalization'

type FitMode = 'qualifying' | 'race'
export type PhilosophyRaceContext = {
  raceIndex?: number
  totalRaces?: number
}

type WeightedField = [number, number]

function profileFit(values: number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 50
}

function profilePenalty(value: number, threshold: number, weight = 0.3) {
  return value < threshold ? (threshold - value) * weight : 0
}

function scoreCarProfile(car: Car, profile: string): number {
  switch (profile) {
    case 'power_track':
      return weightedAvg([
        [car.straightLineSpeed, 0.7],
        [car.braking, 0.25],
        [car.setupWindow, 0.03],
        [car.overall, 0.02],
      ]) - profilePenalty(car.straightLineSpeed, 88, 0.45) - profilePenalty(car.braking, 88, 0.35)
    case 'street_circuit':
      return weightedAvg([
        [car.slowCorner, 0.35],
        [car.mechanicalGrip, 0.25],
        [car.braking, 0.2],
        [car.setupWindow, 0.1],
        [car.tireWear, 0.1],
      ]) - profilePenalty(car.slowCorner, 85, 0.32) - profilePenalty(car.mechanicalGrip, 85, 0.28) - profilePenalty(car.setupWindow, 80, 0.2)
    case 'high_downforce':
      return weightedAvg([
        [car.aeroEfficiency, 0.45],
        [car.slowCorner, 0.25],
        [car.mediumCorner, 0.2],
        [car.mechanicalGrip, 0.1],
      ]) - profilePenalty(car.aeroEfficiency, 85, 0.35)
    case 'high_speed_aero':
      return weightedAvg([
        [car.aeroEfficiency, 0.35],
        [car.fastCorner, 0.35],
        [car.mediumCorner, 0.2],
        [car.overall, 0.1],
      ]) - profilePenalty(car.aeroEfficiency, 85, 0.3) - profilePenalty(car.fastCorner, 85, 0.25)
    case 'technical_flow':
      return weightedAvg([
        [car.mediumCorner, 0.3],
        [car.fastCorner, 0.25],
        [car.setupWindow, 0.2],
        [car.mechanicalGrip, 0.15],
        [car.overall, 0.1],
      ]) - profilePenalty(car.mediumCorner, 85, 0.28) - profilePenalty(car.fastCorner, 82, 0.18)
    case 'mixed_classic':
      return weightedAvg([
        [car.aeroEfficiency, 0.18],
        [car.mediumCorner, 0.18],
        [car.fastCorner, 0.18],
        [car.straightLineSpeed, 0.18],
        [car.mechanicalGrip, 0.14],
        [car.braking, 0.14],
      ]) - profilePenalty(car.braking, 80, 0.16)
    case 'tire_limited':
      return weightedAvg([
        [car.tireWear, 0.35],
        [car.reliability, 0.25],
        [car.setupWindow, 0.2],
        [car.mechanicalGrip, 0.1],
        [car.overall, 0.1],
      ]) - profilePenalty(car.tireWear, 85, 0.28) - profilePenalty(car.reliability, 85, 0.24)
    case 'wet_prone':
      return weightedAvg([
        [car.tireWear, 0.22],
        [car.mechanicalGrip, 0.25],
        [car.slowCorner, 0.15],
        [car.reliability, 0.18],
        [car.overall, 0.2],
      ]) - profilePenalty(car.mechanicalGrip, 85, 0.24)
    case 'braking_heavy':
      return weightedAvg([
        [car.braking, 0.45],
        [car.mechanicalGrip, 0.25],
        [car.reliability, 0.15],
        [car.overall, 0.15],
      ]) - profilePenalty(car.braking, 85, 0.35) - profilePenalty(car.mechanicalGrip, 85, 0.22)
    default:
      return car.overall
  }
}

function scoreEngineProfile(engine: Engine, profile: string, circuit: Circuit): number {
  const thermalPressure = weightedAvg([
    [circuit.tireStress, 0.55],
    [circuit.slowCornerDemand, 0.2],
    [circuit.reliabilityStress, 0.25],
  ])

  const coolingRiskPenalty = (engine.coolingDemand * thermalPressure) / 100 / 4

  switch (profile) {
    case 'power_track':
      return weightedAvg([
        [engine.power, 0.7],
        [engine.racePaceSustainability, 0.18],
        [engine.qualifyingMode, 0.08],
        [engine.overall, 0.04],
      ]) - coolingRiskPenalty - profilePenalty(engine.power, 88, 0.18)
    case 'street_circuit':
      return weightedAvg([
        [engine.drivability, 0.4],
        [engine.torqueDelivery, 0.25],
        [engine.reliability, 0.2],
        [engine.overall, 0.15],
      ]) - coolingRiskPenalty - profilePenalty(engine.power, 80, 0.08)
    case 'high_downforce':
    case 'high_speed_aero':
      return weightedAvg([
        [engine.qualifyingMode, 0.3],
        [engine.power, 0.25],
        [engine.racePaceSustainability, 0.2],
        [engine.drivability, 0.15],
        [engine.overall, 0.1],
      ]) - coolingRiskPenalty
    case 'technical_flow':
      return weightedAvg([
        [engine.drivability, 0.35],
        [engine.torqueDelivery, 0.2],
        [engine.racePaceSustainability, 0.2],
        [engine.qualifyingMode, 0.15],
        [engine.overall, 0.1],
      ]) - coolingRiskPenalty
    case 'mixed_classic':
      return weightedAvg([
        [engine.power, 0.25],
        [engine.drivability, 0.2],
        [engine.qualifyingMode, 0.2],
        [engine.racePaceSustainability, 0.2],
        [engine.overall, 0.15],
      ]) - coolingRiskPenalty
    case 'tire_limited':
      return weightedAvg([
        [engine.drivability, 0.3],
        [engine.fuelEfficiency, 0.2],
        [engine.racePaceSustainability, 0.2],
        [engine.reliability, 0.15],
        [engine.overall, 0.15],
      ]) - coolingRiskPenalty
    case 'wet_prone':
      return weightedAvg([
        [engine.drivability, 0.35],
        [engine.torqueDelivery, 0.2],
        [engine.reliability, 0.2],
        [engine.racePaceSustainability, 0.15],
        [engine.overall, 0.1],
      ]) - coolingRiskPenalty
    case 'braking_heavy':
      return weightedAvg([
        [engine.torqueDelivery, 0.3],
        [engine.drivability, 0.25],
        [engine.reliability, 0.2],
        [engine.power, 0.15],
        [engine.overall, 0.1],
      ]) - coolingRiskPenalty
    default:
      return engine.overall
  }
}

function scoreDriverProfile(driver: Driver, circuit: Circuit, mode: FitMode, isWet = false): number {
  const trackProfiles = getTrackProfiles(circuit)
  const powerTrack = trackProfiles.includes('power_track')
  const isStreet = trackProfiles.includes('street_circuit')
  const isWetProne = trackProfiles.includes('wet_prone')
  const highError = circuit.driverErrorStress >= 80

  const qualifyingFocus = powerTrack
    ? weightedAvg([
        [driver.qualifyingPace, 0.1],
        [driver.racePace, 0.28],
        [driver.overtaking, 0.2],
        [driver.pressureHandling, 0.14],
        [driver.consistency, 0.14],
        [driver.adaptability, 0.14],
      ])
    : weightedAvg([
        [driver.qualifyingPace, mode === 'qualifying' ? 0.3 : 0.18],
        [driver.pressureHandling, 0.22],
        [driver.consistency, 0.18],
        [driver.adaptability, 0.15],
        [driver.racePace, 0.15],
      ])

  const raceFocus = powerTrack
    ? weightedAvg([
        [driver.racePace, 0.28],
        [driver.overtaking, 0.18],
        [driver.consistency, 0.16],
        [driver.tireManagement, 0.14],
        [driver.adaptability, 0.14],
        [driver.qualifyingPace, 0.1],
      ])
    : weightedAvg([
        [driver.racePace, 0.25],
        [driver.consistency, 0.22],
        [driver.tireManagement, 0.16],
        [driver.adaptability, 0.14],
        [driver.overtaking, 0.12],
        [driver.defending, 0.11],
      ])

  let wetBonus = 0
  if (isWet || isWetProne) {
    wetBonus = (driver.wetSkill - 50) * 0.12
  }

  let errorMitigation = 0
  if (isStreet || highError) {
    errorMitigation = (driver.consistency + driver.pressureHandling) / 20
  }

  return clamp((mode === 'qualifying' ? qualifyingFocus : raceFocus) + wetBonus + errorMitigation)
}

// ─── CAR TRACK FIT ────────────────────────────────────────────────────────────
/**
 * How well the car's capabilities match the circuit's demands.
 * Returns 0–100.
 */
export function calculateCarTrackFit(car: Car, circuit: Circuit): number {
  const trackProfiles = getTrackProfiles(circuit)
  const profileScore = trackProfiles.length
    ? profileFit(trackProfiles.map((profile) => scoreCarProfile(car, profile)))
    : car.overall

  return weightedAvg([
    [car.overall, 0.16],
    [profileScore, 0.84],
  ])
}

// ─── ENGINE TRACK FIT ─────────────────────────────────────────────────────────
/**
 * How well the engine suits the circuit.
 * High straightDemand → raw power matters more.
 * High reliabilityStress → engine reliability matters more.
 * High coolingDemand in circuit → engine coolingDemand is penalizing.
 * The final score blends track fit with a light overall anchor so the
 * powertrain still matters when the grid is compressed at the top.
 */
export function calculateEngineTrackFit(engine: Engine, circuit: Circuit): number {
  const trackProfiles = getTrackProfiles(circuit)
  const profileScore = trackProfiles.length
    ? profileFit(trackProfiles.map((profile) => scoreEngineProfile(engine, profile, circuit)))
    : engine.overall
  return weightedAvg([
    [engine.overall, 0.2],
    [profileScore, 0.8],
  ])
}

// ─── DRIVER–CAR COMPATIBILITY ─────────────────────────────────────────────────
/**
 * Checks how well the driver's preferences match the car's traits.
 * Returns a bonus/penalty in [-10, +10] added to scores.
 */
export function calculateDriverCarCompatibility(driver: Driver, car: Car): number {
  const carTraits: Record<string, number> = {
    stableRear: car.stableRear * 100,
    strongFrontEnd: car.strongFrontEnd * 100,
    nervousRear: car.nervousRear * 100,
    traction: car.traction * 100,
  }

  let bonus = 0
  for (const trait of driver.preferredCarTraits) {
    if (trait in carTraits) {
      bonus += (carTraits[trait] / 100) * 5 // up to +5 per preferred trait
    }
  }
  for (const trait of driver.weakCarTraits) {
    if (trait in carTraits) {
      bonus -= (carTraits[trait] / 100) * 5 // up to -5 per weak trait
    }
  }

  return clamp(bonus, -10, 10)
}

// ─── DRIVER PAIR SYNERGY ──────────────────────────────────────────────────────
/**
 * Measures how well the two drivers work together.
 * High politicalTension on either driver lowers synergy.
 * High teamPlay on both raises it.
 * Returns a team bonus/penalty in [-5, +5].
 */
export function calculateDriverPairSynergy(primary: Driver, secondary: Driver): number {
  const avgTeamPlay = (primary.teamPlay + secondary.teamPlay) / 2
  const avgTension = (primary.politicalTension + secondary.politicalTension) / 2
  const synergy = (avgTeamPlay - avgTension) / 100 // -1 to +1
  return clamp(synergy * 5, -5, 5) // maps to [-5, +5]
}

// ─── SETUP FIT ────────────────────────────────────────────────────────────────
/**
 * How well the car can be set up for the circuit.
 * Wide setup window + high technicalFeedback = better setup.
 */
export function calculateSetupFit(
  car: Car,
  driver: Driver,
  technicalDirector: TechnicalDirector
): number {
  return weightedAvg([
    [car.setupWindow, 0.4],
    [driver.technicalFeedback, 0.35],
    [technicalDirector.setupUnderstanding, 0.25],
  ])
}

// ─── TEAM OPERATIONAL BONUS ───────────────────────────────────────────────────
/**
 * Bonus from the Team Principal's operational discipline and the TD's innovation.
 * Returns 0–100 combined score used as a 5% weight in qualifying.
 */
export function calculateTeamOperationalBonus(
  teamPrincipal: TeamPrincipal,
  technicalDirector: TechnicalDirector
): number {
  return weightedAvg([
    [teamPrincipal.operationalDiscipline, 0.6],
    [technicalDirector.innovation, 0.4],
  ])
}

// ─── TEAM PRINCIPAL BONUS ─────────────────────────────────────────────────────
/**
 * In-race bonus from Team Principal: crisis management + strategy patience.
 * Returns 0–100 score used as 5% weight in race.
 */
export function calculateTeamPrincipalBonus(teamPrincipal: TeamPrincipal): number {
  return weightedAvg([
    [teamPrincipal.leadership, 0.22],
    [teamPrincipal.crisisManagement, 0.3],
    [teamPrincipal.driverManagement, 0.16],
    [teamPrincipal.strategicPatience, 0.16],
    [teamPrincipal.riskTolerance, 0.16],
  ])
}

// ─── TECHNICAL DIRECTOR BONUS ─────────────────────────────────────────────────
/**
 * In-race bonus from Technical Director: aerodynamics + reliability focus.
 * Returns 0–100 score used as 5% weight in race.
 */
export function calculateTechnicalDirectorBonus(technicalDirector: TechnicalDirector): number {
  return weightedAvg([
    [technicalDirector.aerodynamics, 0.24],
    [technicalDirector.reliabilityFocus, 0.24],
    [technicalDirector.mechanicalDesign, 0.22],
    [technicalDirector.setupUnderstanding, 0.18],
    [technicalDirector.developmentSpeed, 0.12],
  ])
}

// ─── STRATEGY FIT ─────────────────────────────────────────────────────────────
/**
 * How well the team strategy fits the circuit.
 * High overtakingDifficulty → strategy and tire management matter more.
 * Conservative philosophy can help in tire-heavy races.
 */
export function calculateStrategyFit(
  driver: Driver,
  philosophy: TeamPhilosophy,
  circuit: Circuit,
  raceContext: PhilosophyRaceContext = {}
): number {
  const mods = getPhilosophyModifiersForRace(
    philosophy,
    raceContext.raceIndex ?? 0,
    raceContext.totalRaces ?? 1,
    circuit
  )
  const tireScore = driver.tireManagement * 0.35
  const adaptabilityScore = driver.adaptability * 0.25
  const consistencyScore = driver.consistency * 0.15
  const trackPressureScore = (((100 - circuit.overtakingDifficulty) + (100 - circuit.driverErrorStress)) / 2) * 0.1
  const philosophyBonus = (
    mods.tireModifier * 18 +
    mods.raceModifier * 18 +
    mods.consistencyModifier * 16 +
    mods.overtakingModifier * 12 -
    mods.errorRiskModifier * 10
  )

  return clamp(tireScore + adaptabilityScore + consistencyScore + trackPressureScore + philosophyBonus)
}

// ─── QUALIFYING SCORE ─────────────────────────────────────────────────────────
/**
 * QualifyingScore =
 *   softenElite(driver.qualifyingPace) * 0.14
 * + carTrackFit * 0.31
 * + engineTrackFit * 0.30
 * + setupFit * 0.10
 * + softenElite(driver.pressureHandling) * 0.06
 * + teamOperationalBonus * 0.11
 *
 * Then: apply philosophy modifier + driver–car compatibility offset.
 */
export function calculateQualifyingScore(
  driver: Driver,
  car: Car,
  engine: Engine,
  circuit: Circuit,
  teamPrincipal: TeamPrincipal,
  technicalDirector: TechnicalDirector,
  philosophy: TeamPhilosophy,
  raceContext: PhilosophyRaceContext = {}
): number {
  const mods = getPhilosophyModifiersForRace(
    philosophy,
    raceContext.raceIndex ?? 0,
    raceContext.totalRaces ?? 1,
    circuit
  )
  const carTrackFit = calculateCarTrackFit(car, circuit)
  const engineTrackFit = calculateEngineTrackFit(engine, circuit)
  const setupFit = calculateSetupFit(car, driver, technicalDirector)
  const teamOpBonus = calculateTeamOperationalBonus(teamPrincipal, technicalDirector)
  const driverCarCompat = calculateDriverCarCompatibility(driver, car)
  const trackDriverFit = scoreDriverProfile(driver, circuit, 'qualifying')
  const qualifyingPace = softenElite(driver.qualifyingPace)
  const pressureHandling = softenElite(driver.pressureHandling)

  const base = weightedAvg([
    [qualifyingPace, 0.1],
    [trackDriverFit, 0.18],
    [carTrackFit, 0.31],
    [engineTrackFit, 0.30],
    [setupFit, 0.10],
    [pressureHandling, 0.06],
    [teamOpBonus, 0.05],
  ])

  // Apply philosophy qualifying modifier (+/- up to modifier * base)
  const withPhilosophy = applyModifier(base, mods.qualifyingModifier + mods.trackPositionModifier * 0.5)
  // Add driver–car compatibility offset and a small pair-management effect
  return clamp(withPhilosophy + driverCarCompat * 0.18)
}

// ─── RACE SCORE ───────────────────────────────────────────────────────────────
/**
 * RaceScore =
 *   softenElite(driver.racePace) * 0.06
 * + carTrackFit * 0.26
 * + engineTrackFit * 0.33
 * + softenElite(driver.tireManagement) * 0.08
 * + softenElite(driver.consistency) * 0.07
 * + strategyFit * 0.10
 * + teamPrincipalBonus * 0.05
 * + technicalDirectorBonus * 0.08
 *
 * Then: apply philosophy race modifier + wet condition modifier + synergy offset.
 */
export function calculateRaceScore(
  driver: Driver,
  car: Car,
  engine: Engine,
  circuit: Circuit,
  teamPrincipal: TeamPrincipal,
  technicalDirector: TechnicalDirector,
  philosophy: TeamPhilosophy,
  driverPairSynergy: number,
  isWet: boolean,
  raceContext: PhilosophyRaceContext = {}
): number {
  const mods = getPhilosophyModifiersForRace(
    philosophy,
    raceContext.raceIndex ?? 0,
    raceContext.totalRaces ?? 1,
    circuit
  )
  const carTrackFit = calculateCarTrackFit(car, circuit)
  const engineTrackFit = calculateEngineTrackFit(engine, circuit)
  const strategyFit = calculateStrategyFit(driver, philosophy, circuit, raceContext)
  const tpBonus = calculateTeamPrincipalBonus(teamPrincipal)
  const tdBonus = calculateTechnicalDirectorBonus(technicalDirector)
  const driverCarCompat = calculateDriverCarCompatibility(driver, car)
  const trackDriverFit = scoreDriverProfile(driver, circuit, 'race', isWet)
  const racePace = softenElite(driver.racePace)
  const tireManagement = softenElite(driver.tireManagement)
  const consistency = softenElite(driver.consistency)

  const base = weightedAvg([
    [racePace, 0.04],
    [trackDriverFit, 0.22],
    [carTrackFit, 0.25],
    [engineTrackFit, 0.27],
    [tireManagement, 0.08],
    [consistency, 0.07],
    [strategyFit, 0.10],
    [tpBonus, 0.04],
    [tdBonus, 0.03],
  ])

  // Apply philosophy
  let score = applyModifier(base, mods.raceModifier + mods.aggressionModifier * 0.25 + mods.overtakingModifier * 0.2)

  // Wet conditions: boost wet skill, penalize consistency of nervous drivers
  if (isWet) {
    const wetBonus = (driver.wetSkill - 50) * 0.15 // -7.5 to +7.5
    score = clamp(score + wetBonus)
  }

  // Apply pair synergy and driver-car compatibility
  return clamp(score + driverPairSynergy * 0.7 + driverCarCompat * 0.09 + mods.consistencyModifier * 4)
}

// ─── RELIABILITY RISK ─────────────────────────────────────────────────────────
/**
 * Returns a DNF probability (0–1) for a given entry.
 * Higher reliabilityStress on circuit → higher DNF risk.
 * Better engine + car reliability → lower risk.
 */
export function calculateReliabilityRisk(
  car: Car,
  engine: Engine,
  circuit: Circuit,
  philosophy: TeamPhilosophy,
  raceContext: PhilosophyRaceContext = {}
): number {
  const mods = getPhilosophyModifiersForRace(
    philosophy,
    raceContext.raceIndex ?? 0,
    raceContext.totalRaces ?? 1,
    circuit
  )
  const avgReliability = (car.reliability + engine.reliability) / 2
  const stressedReliability = avgReliability * (1 - circuit.reliabilityStress / 200)
  const withPhilosophy = applyModifier(stressedReliability, mods.reliabilityModifier)
  // Convert to failure probability: 100 reliability = 1% DNF, 0 = 30% DNF
  const failureProbability = clamp(30 - withPhilosophy * 0.29) / 100
  return clamp(failureProbability, 0, 0.30)
}

// ─── ERROR RISK ───────────────────────────────────────────────────────────────
/**
 * Returns a driver error/incident probability (0–1).
 * High errorProneness + high circuit driverErrorStress → higher risk.
 */
export function calculateErrorRisk(
  driver: Driver,
  circuit: Circuit,
  philosophy?: TeamPhilosophy,
  raceContext: PhilosophyRaceContext = {}
): number {
  const baseProbability = (driver.errorProneness / 100) * (circuit.driverErrorStress / 100)
  if (!philosophy) {
    return clamp(baseProbability, 0, 0.20)
  }

  const mods = getPhilosophyModifiersForRace(
    philosophy,
    raceContext.raceIndex ?? 0,
    raceContext.totalRaces ?? 1,
    circuit
  )
  const adjusted = baseProbability + mods.errorRiskModifier * 0.12 + mods.aggressionModifier * 0.05
  // Clamp to max 20% error chance
  return clamp(adjusted, 0, 0.20)
}

// ─── FULL BREAKDOWN ───────────────────────────────────────────────────────────
/**
 * Computes the full score breakdown for a driver entry.
 * Used by explainer to produce detailed text explanations.
 */
export function computeScoreBreakdown(
  driver: Driver,
  car: Car,
  engine: Engine,
  circuit: Circuit,
  teamPrincipal: TeamPrincipal,
  technicalDirector: TechnicalDirector,
  philosophy: TeamPhilosophy,
  driverPairSynergy: number,
  isWet: boolean,
  raceContext: PhilosophyRaceContext = {}
): ScoreBreakdown {
  const carTrackFit = calculateCarTrackFit(car, circuit)
  const engineTrackFit = calculateEngineTrackFit(engine, circuit)
  const driverCarCompatibility = calculateDriverCarCompatibility(driver, car)
  const setupFit = calculateSetupFit(car, driver, technicalDirector)
  const teamPrincipalBonus = calculateTeamPrincipalBonus(teamPrincipal)
  const technicalDirectorBonus = calculateTechnicalDirectorBonus(technicalDirector)
  const strategyFit = calculateStrategyFit(driver, philosophy, circuit, raceContext)
  const teamOperationalBonus = calculateTeamOperationalBonus(teamPrincipal, technicalDirector)
  const reliabilityRisk = calculateReliabilityRisk(car, engine, circuit, philosophy, raceContext)
  const errorRisk = calculateErrorRisk(driver, circuit, philosophy, raceContext)

  const qualifyingScore = calculateQualifyingScore(
    driver, car, engine, circuit, teamPrincipal, technicalDirector, philosophy, raceContext
  )
  const raceScore = calculateRaceScore(
    driver, car, engine, circuit, teamPrincipal, technicalDirector,
    philosophy, driverPairSynergy, isWet, raceContext
  )

  return {
    qualifyingScore,
    raceScore,
    carTrackFit,
    engineTrackFit,
    driverCarCompatibility,
    driverPairSynergy,
    teamPrincipalBonus,
    technicalDirectorBonus,
    strategyFit,
    setupFit,
    teamOperationalBonus,
    reliabilityRisk,
    errorRisk,
  }
}
