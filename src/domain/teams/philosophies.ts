import type { Circuit } from '../circuits/types'
import type { Driver } from '../drivers/types'
import type { Car } from '../cars/types'
import type { Engine } from '../engines/types'
import type { TeamPrincipal, TechnicalDirector, TeamPhilosophy } from './types'
import type { NarrativeEvent } from '../simulation/types'
import { clamp } from '@/lib/normalization'

export type PhilosophyKey =
  | 'balanced'
  | 'aggressive'
  | 'conservative'
  | 'qualifying_focused'
  | 'development_focused'

export type PhilosophyTagKey =
  | 'qualifying'
  | 'race'
  | 'overtaking'
  | 'tires'
  | 'reliability'
  | 'risk'
  | 'error'
  | 'development'

export type PhilosophyModifierSet = {
  qualifyingModifier: number
  raceModifier: number
  reliabilityModifier: number
  tireModifier: number
  aggressionModifier: number
  overtakingModifier: number
  consistencyModifier: number
  errorRiskModifier: number
  trackPositionModifier: number
  developmentModifier: number
}

export type PhilosophyPhaseModifierSet = Partial<PhilosophyModifierSet>

export type PhilosophyProgressionPhase = {
  startRace: number
  endRace: number
  labelKey: string
  modifiers: PhilosophyPhaseModifierSet
}

export type PhilosophyProgressionModel = {
  quickWarningKey?: string
  phases: PhilosophyProgressionPhase[]
}

export type PhilosophyDefinition = TeamPhilosophy & PhilosophyModifierSet & {
  key: PhilosophyKey
  nameKey: string
  descriptionKey: string
  bestForKey: string
  riskKey: string
  tags: PhilosophyTagKey[]
  progressionModel?: PhilosophyProgressionModel
  aliases?: string[]
}

export type PhilosophyFitSelection = {
  driverPrimary: Pick<Driver, 'qualifyingPace' | 'racePace' | 'consistency' | 'wetSkill' | 'tireManagement' | 'overtaking' | 'defending' | 'adaptability' | 'technicalFeedback' | 'pressureHandling' | 'aggression' | 'teamPlay' | 'errorProneness' | 'incidentRisk' | 'politicalTension'>
  driverSecondary: Pick<Driver, 'consistency' | 'wetSkill' | 'tireManagement' | 'overtaking' | 'defending' | 'adaptability' | 'technicalFeedback' | 'pressureHandling' | 'aggression' | 'teamPlay' | 'errorProneness' | 'incidentRisk' | 'politicalTension'>
  car: Pick<Car, 'reliability' | 'tireWear' | 'setupWindow' | 'developmentPotential' | 'overall'>
  engine: Pick<Engine, 'reliability' | 'drivability' | 'qualifyingMode' | 'racePaceSustainability' | 'power' | 'overall'>
  teamPrincipal: Pick<TeamPrincipal, 'strategicPatience' | 'developmentCulture' | 'operationalDiscipline' | 'leadership' | 'crisisManagement'>
  technicalDirector: Pick<TechnicalDirector, 'developmentSpeed' | 'setupUnderstanding' | 'reliabilityFocus' | 'aerodynamics' | 'mechanicalDesign' | 'innovation'>
}

export type ChampionshipFormat = 'quick' | 'standard'

export type PhilosophyFitResult = {
  rating: 'recommended' | 'neutral' | 'risky' | 'not_recommended'
  score: number
  reasons: NarrativeEvent[]
}

export type GhostPhilosophyArchetype =
  | 'balanced_constructor'
  | 'aero_monster'
  | 'straight_line_rocket'
  | 'wet_weather_specialists'
  | 'reliability_machine'
  | 'qualifying_kings'
  | 'elite_driver_underdog_car'
  | 'economic_fallback'

function modifierBundle(input: Partial<PhilosophyModifierSet>): PhilosophyModifierSet {
  return {
    qualifyingModifier: input.qualifyingModifier ?? 0,
    raceModifier: input.raceModifier ?? 0,
    reliabilityModifier: input.reliabilityModifier ?? 0,
    tireModifier: input.tireModifier ?? 0,
    aggressionModifier: input.aggressionModifier ?? 0,
    overtakingModifier: input.overtakingModifier ?? 0,
    consistencyModifier: input.consistencyModifier ?? 0,
    errorRiskModifier: input.errorRiskModifier ?? 0,
    trackPositionModifier: input.trackPositionModifier ?? 0,
    developmentModifier: input.developmentModifier ?? 0,
  }
}

export const TEAM_PHILOSOPHIES: PhilosophyDefinition[] = [
  {
    id: 'philosophy-balanced',
    key: 'balanced',
    name: 'Balanced',
    nameKey: 'philosophy.balanced.name',
    description: 'Uma abordagem equilibrada, sem grandes forças ou fraquezas.',
    descriptionKey: 'philosophy.balanced.description',
    bestForKey: 'philosophy.balanced.bestFor',
    riskKey: 'philosophy.balanced.risk',
    tags: ['race', 'reliability', 'qualifying', 'development'],
    ...modifierBundle({
      qualifyingModifier: 0,
      raceModifier: 0,
      reliabilityModifier: 0,
      tireModifier: 0,
      aggressionModifier: 0,
      overtakingModifier: 0,
      consistencyModifier: 0,
      errorRiskModifier: 0,
      trackPositionModifier: 0,
      developmentModifier: 0,
    }),
    notes: 'Apenas uma base neutra para equipes que não querem assumir risco extra.',
    budgetCost: 0,
  },
  {
    id: 'philosophy-aggressive',
    key: 'aggressive',
    name: 'Aggressive',
    nameKey: 'philosophy.aggressive.name',
    description: 'Foco total em performance bruta, sacrificando confiabilidade e pneus.',
    descriptionKey: 'philosophy.aggressive.description',
    bestForKey: 'philosophy.aggressive.bestFor',
    riskKey: 'philosophy.aggressive.risk',
    tags: ['qualifying', 'race', 'overtaking', 'risk', 'error', 'tires'],
    ...modifierBundle({
      qualifyingModifier: 0.04,
      raceModifier: 0.03,
      reliabilityModifier: -0.04,
      tireModifier: -0.05,
      aggressionModifier: 0.06,
      overtakingModifier: 0.04,
      consistencyModifier: -0.02,
      errorRiskModifier: 0.08,
      trackPositionModifier: 0.02,
      developmentModifier: 0,
    }),
    notes: 'Foco total em performance bruta, sacrificando confiabilidade e pneus.',
    budgetCost: 0,
  },
  {
    id: 'philosophy-conservative',
    key: 'conservative',
    name: 'Conservative',
    nameKey: 'philosophy.conservative.name',
    description: 'Prioriza terminar corridas, preservar pneus e somar pontos constantes.',
    descriptionKey: 'philosophy.conservative.description',
    bestForKey: 'philosophy.conservative.bestFor',
    riskKey: 'philosophy.conservative.risk',
    tags: ['reliability', 'tires', 'race', 'development'],
    ...modifierBundle({
      qualifyingModifier: -0.03,
      raceModifier: -0.02,
      reliabilityModifier: 0.08,
      tireModifier: 0.06,
      aggressionModifier: -0.04,
      overtakingModifier: -0.03,
      consistencyModifier: 0.04,
      errorRiskModifier: -0.06,
      trackPositionModifier: -0.02,
      developmentModifier: 0,
    }),
    notes: 'Prioriza terminar corridas, preservar pneus e somar pontos constantes.',
    budgetCost: 0,
  },
  {
    id: 'philosophy-qualifying-focused',
    key: 'qualifying_focused',
    name: 'Qualifying Focused',
    nameKey: 'philosophy.qualifying_focused.name',
    description: 'Prioriza posição de largada e performance de volta rápida.',
    descriptionKey: 'philosophy.qualifying_focused.description',
    bestForKey: 'philosophy.qualifying_focused.bestFor',
    riskKey: 'philosophy.qualifying_focused.risk',
    tags: ['qualifying', 'race', 'overtaking', 'risk'],
    ...modifierBundle({
      qualifyingModifier: 0.07,
      raceModifier: -0.02,
      reliabilityModifier: 0,
      tireModifier: -0.03,
      aggressionModifier: 0.01,
      overtakingModifier: -0.02,
      consistencyModifier: 0.01,
      errorRiskModifier: 0.01,
      trackPositionModifier: 0.04,
      developmentModifier: 0,
    }),
    notes: 'Prioriza posição de largada e performance de volta rápida.',
    budgetCost: 0,
  },
  {
    id: 'philosophy-development-focused',
    key: 'development_focused',
    name: 'Development Focused',
    nameKey: 'philosophy.development_focused.name',
    description: 'Sacrifica performance inicial para evoluir o carro ao longo da temporada.',
    descriptionKey: 'philosophy.development_focused.description',
    bestForKey: 'philosophy.development_focused.bestFor',
    riskKey: 'philosophy.development_focused.risk',
    tags: ['development', 'reliability', 'race', 'qualifying'],
    aliases: ['philosophy-development'],
    progressionModel: {
      quickWarningKey: 'philosophy.development_focused.quickWarning',
      phases: [
        {
          startRace: 1,
          endRace: 4,
          labelKey: 'philosophy.earlySeason',
          modifiers: {
            qualifyingModifier: -0.03,
            raceModifier: -0.03,
            developmentModifier: 0.02,
          },
        },
        {
          startRace: 5,
          endRace: 8,
          labelKey: 'philosophy.midSeason',
          modifiers: {
            qualifyingModifier: 0.01,
            raceModifier: 0.01,
            reliabilityModifier: 0.02,
            developmentModifier: 0.05,
          },
        },
        {
          startRace: 9,
          endRace: 99,
          labelKey: 'philosophy.lateSeason',
          modifiers: {
            qualifyingModifier: 0.04,
            raceModifier: 0.04,
            reliabilityModifier: 0.04,
            tireModifier: 0.03,
            developmentModifier: 0.08,
          },
        },
      ],
    },
    ...modifierBundle({
      qualifyingModifier: 0,
      raceModifier: 0,
      reliabilityModifier: 0,
      tireModifier: 0,
      aggressionModifier: 0,
      overtakingModifier: 0,
      consistencyModifier: 0,
      errorRiskModifier: 0,
      trackPositionModifier: 0,
      developmentModifier: 0.08,
    }),
    notes: 'Sacrifica performance inicial para evoluir o carro ao longo da temporada.',
    budgetCost: 0,
  },
]

const PHILOSOPHY_BY_ID = new Map(TEAM_PHILOSOPHIES.map((item) => [item.id, item]))
const PHILOSOPHY_BY_KEY = new Map(TEAM_PHILOSOPHIES.map((item) => [item.key, item]))
const PHILOSOPHY_ALIASES = new Map<string, PhilosophyDefinition>(
  TEAM_PHILOSOPHIES.flatMap((item) => (item.aliases ?? []).map((alias) => [alias, item] as const))
)

export function getTeamPhilosophies(): PhilosophyDefinition[] {
  return [...TEAM_PHILOSOPHIES]
}

export function getTeamPhilosophyById(id?: string | null): PhilosophyDefinition | undefined {
  if (!id) return undefined
  return PHILOSOPHY_BY_ID.get(id) ?? PHILOSOPHY_BY_KEY.get(id as PhilosophyKey) ?? PHILOSOPHY_ALIASES.get(id)
}

export function getPhilosophyLabels(philosophy: TeamPhilosophy | PhilosophyDefinition) {
  const resolved = getTeamPhilosophyById(philosophy.id) ?? TEAM_PHILOSOPHIES[0]
  return {
    key: resolved.key,
    nameKey: resolved.nameKey,
    descriptionKey: resolved.descriptionKey,
    bestForKey: resolved.bestForKey,
    riskKey: resolved.riskKey,
    tags: resolved.tags,
    progressionModel: resolved.progressionModel,
  }
}

export function getPhilosophyModifiersForRace(
  philosophy: TeamPhilosophy | PhilosophyDefinition,
  raceIndex: number,
  totalRaces: number,
  circuit?: Circuit
): PhilosophyModifierSet {
  const resolved = modifierBundle(philosophy)
  const catalog = getTeamPhilosophyById(philosophy.id)
  const total = Math.max(totalRaces, 1)
  const phaseNumber = raceIndex + 1

  if (catalog?.key === 'development_focused') {
    const phase = catalog.progressionModel?.phases.find((item) => phaseNumber >= item.startRace && phaseNumber <= item.endRace)
    if (phase) {
      return modifierBundle({ ...resolved, ...phase.modifiers })
    }
  }

  if (catalog?.key === 'qualifying_focused' && circuit) {
    const qualifyingBoost = circuit.qualifyingImportance >= 85 || circuit.overtakingDifficulty >= 85 ? 0.02 : 0
    const streetBoost = circuit.overtakingDifficulty >= 85 ? 0.02 : 0
    return modifierBundle({
      ...resolved,
      qualifyingModifier: resolved.qualifyingModifier + qualifyingBoost + streetBoost,
      trackPositionModifier: resolved.trackPositionModifier + streetBoost,
    })
  }

  if (catalog?.key === 'aggressive') {
    const finalThird = phaseNumber > total * 0.66 ? 0.01 : 0
    return modifierBundle({
      ...resolved,
      raceModifier: resolved.raceModifier + finalThird,
      errorRiskModifier: resolved.errorRiskModifier + finalThird,
    })
  }

  return resolved
}

export function getGhostPhilosophyIdsForArchetype(archetype: GhostPhilosophyArchetype): string[] {
  switch (archetype) {
    case 'balanced_constructor':
      return ['philosophy-balanced']
    case 'aero_monster':
      return ['philosophy-qualifying-focused', 'philosophy-aggressive']
    case 'straight_line_rocket':
      return ['philosophy-aggressive']
    case 'wet_weather_specialists':
      return ['philosophy-conservative', 'philosophy-balanced']
    case 'reliability_machine':
      return ['philosophy-conservative']
    case 'qualifying_kings':
      return ['philosophy-qualifying-focused']
    case 'elite_driver_underdog_car':
      return ['philosophy-conservative', 'philosophy-development-focused']
    case 'economic_fallback':
      return ['philosophy-balanced']
  }
}

function scoreComponent(value: number, target: number, weight: number) {
  return (value - target) * weight
}

function riskComponent(value: number, threshold: number, weight: number) {
  return value < threshold ? (threshold - value) * weight : 0
}

function buildReasons(keys: Array<{ key: string; params?: Record<string, string | number> }>): NarrativeEvent[] {
  return keys.map((item) => ({ key: item.key, params: item.params }))
}

export function evaluatePhilosophyFit(
  selection: PhilosophyFitSelection,
  philosophy: TeamPhilosophy | PhilosophyDefinition,
  championshipFormat: ChampionshipFormat
): PhilosophyFitResult {
  const resolved = getTeamPhilosophyById(philosophy.id) ?? TEAM_PHILOSOPHIES[0]
  const carReliability = (selection.car.reliability + selection.engine.reliability) / 2
  const leadDriver = selection.driverPrimary
  const secondaryDriver = selection.driverSecondary
  const teamStability = (leadDriver.teamPlay + secondaryDriver.teamPlay + selection.teamPrincipal.operationalDiscipline) / 3
  const technicalDepth = (selection.car.developmentPotential + selection.technicalDirector.developmentSpeed + selection.teamPrincipal.strategicPatience + selection.teamPrincipal.developmentCulture) / 4

  let score = 50
  const reasons: NarrativeEvent[] = []

  if (resolved.key === 'balanced') {
    score = 72
    reasons.push(
      ...buildReasons([
        { key: 'philosophy.fit.balancedNeutral' },
        { key: 'philosophy.fit.balancedStability' },
      ])
    )
  } else if (resolved.key === 'aggressive') {
    score = 65
    score += scoreComponent(carReliability, 82, 0.45)
    score += scoreComponent(leadDriver.consistency, 85, 0.35)
    score += scoreComponent(100 - leadDriver.errorProneness, 80, 0.22)
    score += scoreComponent(100 - leadDriver.incidentRisk, 80, 0.18)
    score += scoreComponent(selection.car.tireWear, 82, 0.15)
    score += scoreComponent(leadDriver.aggression, 85, 0.12)
    score -= riskComponent(carReliability, 85, 0.5)
    score -= riskComponent(selection.engine.reliability, 85, 0.3)
    score -= riskComponent(leadDriver.incidentRisk, 18, 0.6)
    reasons.push(
      ...buildReasons([
        { key: 'philosophy.fit.aggressivePower' },
        { key: 'philosophy.fit.aggressiveRisk' },
        { key: 'philosophy.fit.recommendedReliability' },
      ])
    )
  } else if (resolved.key === 'conservative') {
    score += scoreComponent(100 - carReliability, 10, 0.4)
    score += scoreComponent(secondaryDriver.consistency, 85, 0.2)
    score += scoreComponent(teamStability, 80, 0.2)
    score += scoreComponent(leadDriver.racePace, 85, 0.18)
    score += scoreComponent(100 - leadDriver.aggression, 85, 0.12)
    score += scoreComponent(selection.car.tireWear, 85, 0.18)
    score += scoreComponent(selection.engine.reliability, 82, 0.2)
    reasons.push(
      ...buildReasons([
        { key: 'philosophy.fit.conservativeStability' },
        { key: 'philosophy.fit.conservativeReliability' },
      ])
    )
  } else if (resolved.key === 'qualifying_focused') {
    score += scoreComponent(leadDriver.qualifyingPace, 90, 0.45)
    score += scoreComponent(selection.car.setupWindow, 85, 0.22)
    score += scoreComponent(selection.engine.qualifyingMode, 86, 0.18)
    score += scoreComponent(selection.teamPrincipal.operationalDiscipline, 85, 0.1)
    score += scoreComponent(selection.technicalDirector.setupUnderstanding, 85, 0.15)
    score -= riskComponent(leadDriver.racePace, 80, 0.25)
    score -= riskComponent(selection.car.tireWear, 80, 0.25)
    score -= riskComponent(selection.engine.drivability, 80, 0.18)
    reasons.push(
      ...buildReasons([
        { key: 'philosophy.fit.qualifyingFocus' },
        { key: 'philosophy.fit.qualifyingStreet' },
      ])
    )
  } else if (resolved.key === 'development_focused') {
    score = 58
    score += championshipFormat === 'standard' ? 14 : -12
    score += scoreComponent(technicalDepth, 85, 0.55)
    score += scoreComponent(selection.technicalDirector.developmentSpeed, 90, 0.32)
    score += scoreComponent(selection.car.developmentPotential, 85, 0.25)
    score += scoreComponent(selection.teamPrincipal.strategicPatience, 85, 0.24)
    score += scoreComponent(selection.teamPrincipal.developmentCulture, 85, 0.24)
    if (championshipFormat === 'quick') {
      reasons.push({ key: 'philosophy.fit.developmentQuickWarning' })
    }
    reasons.push(
      ...buildReasons([
        { key: 'philosophy.fit.developmentGrowth' },
        { key: 'philosophy.fit.developmentLateSeason' },
      ])
    )
  }

  if (championshipFormat === 'quick' && resolved.key === 'development_focused') {
    score -= 10
  }

  if (resolved.key === 'balanced' && score < 0) score = 65

  score = clamp(score, 0, 100)

  const rating: PhilosophyFitResult['rating'] =
    score >= 74 ? 'recommended'
      : score >= 56 ? 'neutral'
      : score >= 40 ? 'risky'
      : 'not_recommended'

  return { rating, score, reasons }
}
