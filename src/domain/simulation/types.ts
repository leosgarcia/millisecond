import { z } from 'zod'
import { Driver } from '../drivers/types'
import { Car } from '../cars/types'
import { Engine } from '../engines/types'
import { Circuit } from '../circuits/types'
import { TeamPrincipal, TechnicalDirector, TeamPhilosophy } from '../teams/types'

// ─── DIFFICULTY & GHOSTS ──────────────────────────────────────────────────────
export type DifficultyMode = 'casual' | 'standard' | 'hard' | 'legend'

export const DIFFICULTY_CONFIG: Record<DifficultyMode, { playerBudgetLimit: number, ghostBudgetLimit: number, ghostOptimization: 'medium' | 'high' | 'very_high' }> = {
  casual: { playerBudgetLimit: 1050, ghostBudgetLimit: 950, ghostOptimization: 'medium' },
  standard: { playerBudgetLimit: 1000, ghostBudgetLimit: 1000, ghostOptimization: 'high' },
  hard: { playerBudgetLimit: 950, ghostBudgetLimit: 1000, ghostOptimization: 'high' },
  legend: { playerBudgetLimit: 900, ghostBudgetLimit: 1025, ghostOptimization: 'very_high' }
}

export type GhostArchetype =
  | "balanced_constructor"
  | "aero_monster"
  | "straight_line_rocket"
  | "wet_weather_specialists"
  | "reliability_machine"
  | "qualifying_kings"
  | "elite_driver_underdog_car"
  | "economic_fallback"

// ─── RESOLVED TEAM ────────────────────────────────────────────────────────────
export interface ResolvedTeam {
  id: string
  name: string
  driverPrimary: Driver
  driverSecondary: Driver
  car: Car
  engine: Engine
  teamPrincipal: TeamPrincipal
  technicalDirector: TechnicalDirector
  philosophy: TeamPhilosophy
  isGhost: boolean
  archetype?: GhostArchetype
}

// ─── RACE ENTRY ───────────────────────────────────────────────────────────────
export interface RaceEntry {
  teamId: string
  teamName: string
  teamCountryCode?: string
  driverId: string
  driverName: string
  driverSeasonYear?: number
  driverNationalityCode?: string
  isSecondary: boolean
  qualifyingScore: number
  raceScore: number
  didFinish: boolean
  dnfReason?: string
  carName?: string
  carSeasonYear?: number
  carLiveryPrimaryColor?: string
  carLiverySecondaryColor?: string
  carLiveryAccentColor?: string
}

// ─── RACE RESULT ──────────────────────────────────────────────────────────────
export interface RaceResult {
  circuitId: string
  circuitName: string
  circuitCountry: string
  raceNumber: number
  entries: RaceEntry[]        // sorted by finish position
  qualifyingOrder: RaceEntry[] // sorted by qualifying score
  conditions: RaceConditions
  explanations: string[]
  podium: {
    position: number
    driverName: string
    driverDisplayName: string
    driverSeasonYear?: number
    teamName: string
    teamCountryCode?: string
    countryCode: string
    carName?: string
    carSeasonYear?: number
    carLiveryPrimaryColor?: string
    carLiverySecondaryColor?: string
    carLiveryAccentColor?: string
  }[]
}

// ─── CONDITIONS ───────────────────────────────────────────────────────────────
export interface RaceConditions {
  isWet: boolean
  hasSafetyCar: boolean
  tireStressLevel: 'low' | 'medium' | 'high'
}

// ─── CHAMPIONSHIP ENTRY ───────────────────────────────────────────────────────
export interface DriverStanding {
  driverId: string
  driverName: string
  driverSeasonYear?: number
  driverNationalityCode?: string
  teamId: string
  teamName: string
  teamCountryCode?: string
  points: number
  wins: number
  podiums: number
  dnfs: number
  bestResult: number
}

export interface ConstructorStanding {
  teamId: string
  teamName: string
  teamCountryCode?: string
  carName?: string
  carSeasonYear?: number
  carLiveryPrimaryColor?: string
  carLiverySecondaryColor?: string
  carLiveryAccentColor?: string
  points: number
  wins: number
  podiums: number
}

// ─── CHAMPIONSHIP RESULT ──────────────────────────────────────────────────────
export type ChampionshipResult = {
  campaignId?: string
  snapshotVersion?: number
  seed: number
  races: RaceResult[]
  driverStandings: DriverStanding[]
  constructorStandings: ConstructorStanding[]
  championshipExplanations: string[]
  diagnostics?: SimulationDiagnostics
}

// ─── SIMULATION INPUT ─────────────────────────────────────────────────────────
export interface SimulationInput {
  seed: number
  playerTeam: ResolvedTeam
  ghostTeams: ResolvedTeam[]
  circuits: Circuit[]
  difficulty?: DifficultyMode
  championshipFormat?: "quick" | "standard"
}

// ─── RACE DIAGNOSTICS ─────────────────────────────────────────────────────────
export interface DiagnosticFactor {
  key: string
  label: string
  value: number
  impact: 'positive' | 'negative' | 'neutral'
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface RaceDiagnostics {
  raceId: string
  circuitId: string
  teamId: string
  driverId: string

  qualifyingScore: number
  raceScore: number

  carTrackFit: number
  engineTrackFit: number
  driverCarCompatibility: number
  driverPairSynergy: number
  reliabilityRisk: number
  errorRisk: number
  strategyFit: number

  mainStrengths: DiagnosticFactor[]
  mainWeaknesses: DiagnosticFactor[]
}

export interface TeamSeasonDiagnostics {
  teamId: string
  budgetEfficiency: number
  bestBudgetValue?: { type: string, name: string, efficiency: number }
  worstBudgetValue?: { type: string, name: string, efficiency: number }
  seasonBottleneck: DiagnosticFactor | null
  decisiveRaceId: string | null
  leadDriverImpact: DiagnosticFactor | null
  secondDriverImpact: DiagnosticFactor | null
}

export type NarrativeEvent = {
  key: string
  params?: Record<string, string | number>
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

export interface ExplanationSet {
  raceSummaries: NarrativeEvent[][]
  championshipSummary: NarrativeEvent
  budgetSummary: NarrativeEvent
  bottleneckSummary: NarrativeEvent
  decisiveMoment: NarrativeEvent
}

export interface SimulationDiagnostics {
  races: RaceDiagnostics[]
  season: TeamSeasonDiagnostics
  explanations: ExplanationSet
}

// ─── SCORE BREAKDOWN ──────────────────────────────────────────────────────────
export interface ScoreBreakdown {
  qualifyingScore: number
  raceScore: number
  carTrackFit: number
  engineTrackFit: number
  driverCarCompatibility: number
  driverPairSynergy: number
  teamPrincipalBonus: number
  technicalDirectorBonus: number
  strategyFit: number
  setupFit: number
  teamOperationalBonus: number
  reliabilityRisk: number
  errorRisk: number
}

// ─── POINTS TABLE ─────────────────────────────────────────────────────────────
export const POINTS_TABLE: Record<number, number> = {
  1: 25,
  2: 18,
  3: 15,
  4: 12,
  5: 10,
  6: 8,
  7: 6,
  8: 4,
  9: 2,
  10: 1,
}
