import type { Car } from '../cars/types'
import type { Driver } from '../drivers/types'
import type { Engine } from '../engines/types'
import type { TeamPrincipal, TechnicalDirector } from '../teams/types'

export type AttributeDirection = 'higher-is-better' | 'higher-is-worse' | 'neutral'

export type SanityWarning = {
  kind: 'driver' | 'car' | 'engine' | 'teamPrincipal' | 'technicalDirector'
  id: string
  name: string
  severity: 'info' | 'warning' | 'critical'
  ruleId: string
  message: string
  recommendation: string
  value?: number
  context?: Record<string, string | number>
}

export type AttributeSemantics = Record<string, { direction: AttributeDirection; label: string }>

export const ATTRIBUTE_SEMANTICS: AttributeSemantics = {
  // Drivers
  qualifyingPace: { direction: 'higher-is-better', label: 'Qualifying pace' },
  racePace: { direction: 'higher-is-better', label: 'Race pace' },
  wetSkill: { direction: 'higher-is-better', label: 'Wet skill' },
  tireManagement: { direction: 'higher-is-better', label: 'Tire management' },
  overtaking: { direction: 'higher-is-better', label: 'Overtaking' },
  defending: { direction: 'higher-is-better', label: 'Defending' },
  consistency: { direction: 'higher-is-better', label: 'Consistency' },
  adaptability: { direction: 'higher-is-better', label: 'Adaptability' },
  technicalFeedback: { direction: 'higher-is-better', label: 'Technical feedback' },
  pressureHandling: { direction: 'higher-is-better', label: 'Pressure handling' },
  aggression: { direction: 'higher-is-better', label: 'Aggression' },
  teamPlay: { direction: 'higher-is-better', label: 'Team play' },
  errorProneness: { direction: 'higher-is-worse', label: 'Error proneness' },
  incidentRisk: { direction: 'higher-is-worse', label: 'Incident risk' },
  politicalTension: { direction: 'higher-is-worse', label: 'Political tension' },
  budgetCost: { direction: 'higher-is-worse', label: 'Budget cost' },

  // Cars
  aeroEfficiency: { direction: 'higher-is-better', label: 'Aero efficiency' },
  slowCorner: { direction: 'higher-is-better', label: 'Slow corner' },
  mediumCorner: { direction: 'higher-is-better', label: 'Medium corner' },
  fastCorner: { direction: 'higher-is-better', label: 'Fast corner' },
  straightLineSpeed: { direction: 'higher-is-better', label: 'Straight-line speed' },
  mechanicalGrip: { direction: 'higher-is-better', label: 'Mechanical grip' },
  braking: { direction: 'higher-is-better', label: 'Braking' },
  tireWear: { direction: 'higher-is-better', label: 'Tire preservation' },
  setupWindow: { direction: 'higher-is-better', label: 'Setup window' },
  reliability: { direction: 'higher-is-better', label: 'Reliability' },
  developmentPotential: { direction: 'higher-is-better', label: 'Development potential' },

  // Engines
  power: { direction: 'higher-is-better', label: 'Power' },
  torqueDelivery: { direction: 'higher-is-better', label: 'Torque delivery' },
  drivability: { direction: 'higher-is-better', label: 'Drivability' },
  fuelEfficiency: { direction: 'higher-is-better', label: 'Fuel efficiency' },
  energyRecovery: { direction: 'higher-is-better', label: 'Energy recovery' },
  weightEfficiency: { direction: 'higher-is-better', label: 'Weight efficiency' },
  coolingDemand: { direction: 'higher-is-worse', label: 'Cooling demand' },
  qualifyingMode: { direction: 'higher-is-better', label: 'Qualifying mode' },
  racePaceSustainability: { direction: 'higher-is-better', label: 'Race pace sustainability' },

  // Principals
  leadership: { direction: 'higher-is-better', label: 'Leadership' },
  politics: { direction: 'higher-is-better', label: 'Politics' },
  crisisManagement: { direction: 'higher-is-better', label: 'Crisis management' },
  driverManagement: { direction: 'higher-is-better', label: 'Driver management' },
  operationalDiscipline: { direction: 'higher-is-better', label: 'Operational discipline' },
  strategicPatience: { direction: 'higher-is-better', label: 'Strategic patience' },
  riskTolerance: { direction: 'higher-is-better', label: 'Risk tolerance' },
  developmentCulture: { direction: 'higher-is-better', label: 'Development culture' },

  // Technical directors
  aerodynamics: { direction: 'higher-is-better', label: 'Aerodynamics' },
  mechanicalDesign: { direction: 'higher-is-better', label: 'Mechanical design' },
  innovation: { direction: 'higher-is-better', label: 'Innovation' },
  reliabilityFocus: { direction: 'higher-is-better', label: 'Reliability focus' },
  developmentSpeed: { direction: 'higher-is-better', label: 'Development speed' },
  regulationExploitation: { direction: 'higher-is-better', label: 'Regulation exploitation' },
  setupUnderstanding: { direction: 'higher-is-better', label: 'Setup understanding' },
}

const ELITE_WET_CANONICAL_IDS = new Set([
  'ayrton_senna',
  'michael_schumacher',
  'lewis_hamilton',
  'max_verstappen',
  'jim_clark',
  'juan_manual_fangio',
])

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value))
}

function eliteAttributeCount(driver: Driver) {
  return [
    driver.qualifyingPace,
    driver.racePace,
    driver.wetSkill,
    driver.tireManagement,
    driver.overtaking,
    driver.defending,
    driver.consistency,
    driver.adaptability,
    driver.technicalFeedback,
    driver.pressureHandling,
    driver.aggression,
    driver.teamPlay,
  ].filter((value) => value >= 95).length
}

export function normalizeTirePerformance(value?: number | null) {
  return clamp(value ?? 0) / 100
}

export function normalizeCoolingRisk(value?: number | null) {
  return clamp(value ?? 0) / 100
}

export function normalizeReliability(value?: number | null) {
  return clamp(value ?? 0) / 100
}

export function normalizeErrorRisk(value?: number | null) {
  return clamp(value ?? 0) / 100
}

export function normalizePoliticalTension(value?: number | null) {
  return clamp(value ?? 0) / 100
}

export function evaluateDriverSanity(driver: Driver): SanityWarning[] {
  const warnings: SanityWarning[] = []
  const eliteCount = eliteAttributeCount(driver)

  if (driver.wetSkill >= 97 && !ELITE_WET_CANONICAL_IDS.has(driver.canonicalDriverId)) {
    warnings.push({
      kind: 'driver',
      id: driver.id,
      name: driver.name,
      severity: 'warning',
      ruleId: 'driver-wet-skill-elite',
      message: `Wet skill ${driver.wetSkill} is above the elite threshold for a non-legendary profile.`,
      recommendation: 'Lower wet skill unless the historical case is a true all-time wet specialist.',
      value: driver.wetSkill,
    })
  }

  if (driver.consistency >= 98) {
    warnings.push({
      kind: 'driver',
      id: driver.id,
      name: driver.name,
      severity: 'warning',
      ruleId: 'driver-consistency-elite',
      message: `Consistency ${driver.consistency} is extremely rare and should appear only in very few cases.`,
      recommendation: 'Verify that consistency reflects historical record and not general hero inflation.',
      value: driver.consistency,
    })
  }

  if (driver.qualifyingPace >= 99) {
    warnings.push({
      kind: 'driver',
      id: driver.id,
      name: driver.name,
      severity: 'warning',
      ruleId: 'driver-qualifying-elite',
      message: `Qualifying pace ${driver.qualifyingPace} is reserved for historic qualifiers of exceptional status.`,
      recommendation: 'Keep 99 only for the very small top tier of qualifying specialists.',
      value: driver.qualifyingPace,
    })
  }

  if (driver.role === 'secondary' && (driver.overall >= 90 || driver.budgetCost >= 160)) {
    warnings.push({
      kind: 'driver',
      id: driver.id,
      name: driver.name,
      severity: 'warning',
      ruleId: 'driver-secondary-premium',
      message: `Secondary driver ${driver.name} looks too close to a premium lead-driver profile.`,
      recommendation: 'Reduce either overall or budgetCost so the second seat stays clearly below Tier S lead-driver pricing.',
      value: driver.budgetCost,
      context: { overall: driver.overall, role: driver.role },
    })
  }

  if (driver.aggression >= 95) {
    warnings.push({
      kind: 'driver',
      id: driver.id,
      name: driver.name,
      severity: 'info',
      ruleId: 'driver-high-aggression',
      message: `Aggression ${driver.aggression} should come with real trade-offs in incident risk or cost.`,
      recommendation: 'Ensure aggressive drivers are not priced like balanced, low-risk profiles.',
      value: driver.aggression,
    })
  }

  if (driver.politicalTension >= 85) {
    warnings.push({
      kind: 'driver',
      id: driver.id,
      name: driver.name,
      severity: 'info',
      ruleId: 'driver-high-political-tension',
      message: `Political tension ${driver.politicalTension} should have visible team-synergy consequences.`,
      recommendation: 'Check that high-tension pairings are not still scoring like harmonious teammates.',
      value: driver.politicalTension,
    })
  }

  if (eliteCount >= 7) {
    warnings.push({
      kind: 'driver',
      id: driver.id,
      name: driver.name,
      severity: 'critical',
      ruleId: 'driver-too-perfect',
      message: `Driver has ${eliteCount} attributes at 95+; the profile is likely too perfect.`,
      recommendation: 'Lower one or more secondary attributes unless this is one of the absolute historical outliers.',
      value: eliteCount,
    })
  }

  return warnings
}

export function evaluateCarSanity(car: Car): SanityWarning[] {
  const warnings: SanityWarning[] = []
  const eliteCount = [
    car.aeroEfficiency,
    car.slowCorner,
    car.mediumCorner,
    car.fastCorner,
    car.straightLineSpeed,
    car.mechanicalGrip,
    car.braking,
    car.setupWindow,
    car.reliability,
    car.developmentPotential,
  ].filter((value) => value >= 95).length

  if (car.reliability >= 97 && car.overall >= 97) {
    warnings.push({
      kind: 'car',
      id: car.id,
      name: car.name,
      severity: 'warning',
      ruleId: 'car-perfect-reliability',
      message: `Car reliability ${car.reliability} is extremely high for an already dominant package.`,
      recommendation: 'Dominant cars should still carry at least one visible weakness.',
      value: car.reliability,
    })
  }

  if (car.reliability <= 70 && car.budgetCost >= 200) {
    warnings.push({
      kind: 'car',
      id: car.id,
      name: car.name,
      severity: 'warning',
      ruleId: 'car-overpriced-reliability',
      message: `Car reliability ${car.reliability} looks too fragile for a premium price.`,
      recommendation: 'Lower the cost or raise reliability if this package is meant to be competitive.',
      value: car.budgetCost,
    })
  }

  if (car.tireWear >= 95 && car.reliability >= 95 && car.overall >= 97) {
    warnings.push({
      kind: 'car',
      id: car.id,
      name: car.name,
      severity: 'info',
      ruleId: 'car-all-rounder',
      message: `Car is very strong across performance, reliability and tire preservation.`,
      recommendation: 'Avoid letting a dominant car become perfect in every axis.',
      value: car.overall,
    })
  }

  if (eliteCount >= 7) {
    warnings.push({
      kind: 'car',
      id: car.id,
      name: car.name,
      severity: 'warning',
      ruleId: 'car-too-perfect',
      message: `Car has ${eliteCount} attributes at 95+; the package is likely too flat and universal.`,
      recommendation: 'Keep a clear weakness in either braking, tire life, setup window or straight-line speed.',
      value: eliteCount,
    })
  }

  return warnings
}

export function evaluateEngineSanity(engine: Engine): SanityWarning[] {
  const warnings: SanityWarning[] = []
  const eliteCount = [
    engine.power,
    engine.torqueDelivery,
    engine.drivability,
    engine.fuelEfficiency,
    engine.energyRecovery,
    engine.weightEfficiency,
    engine.reliability,
    engine.qualifyingMode,
    engine.racePaceSustainability,
  ].filter((value) => value >= 95).length

  if (engine.power >= 97 && engine.reliability >= 97) {
    warnings.push({
      kind: 'engine',
      id: engine.id,
      name: engine.name,
      severity: 'warning',
      ruleId: 'engine-double-elite',
      message: `Engine combines elite power (${engine.power}) with elite reliability (${engine.reliability}).`,
      recommendation: 'Ensure that engines with extreme power still carry a meaningful trade-off.',
      value: engine.power,
    })
  }

  if (engine.coolingDemand >= 95) {
    warnings.push({
      kind: 'engine',
      id: engine.id,
      name: engine.name,
      severity: 'info',
      ruleId: 'engine-cooling-demand',
      message: `Cooling demand ${engine.coolingDemand} is interpreted as a worse trait, not a bonus.`,
      recommendation: 'Document this clearly and avoid using coolingDemand as a positive capability in gameplay text.',
      value: engine.coolingDemand,
    })
  }

  if (eliteCount >= 7) {
    warnings.push({
      kind: 'engine',
      id: engine.id,
      name: engine.name,
      severity: 'warning',
      ruleId: 'engine-too-perfect',
      message: `Engine has ${eliteCount} attributes at 95+; the powertrain is likely too perfect.`,
      recommendation: 'Keep at least one visible compromise such as cooling, drivability, or race sustainability.',
      value: eliteCount,
    })
  }

  return warnings
}

export function evaluateTeamPrincipalSanity(teamPrincipal: TeamPrincipal): SanityWarning[] {
  const warnings: SanityWarning[] = []
  const eliteCount = [
    teamPrincipal.leadership,
    teamPrincipal.politics,
    teamPrincipal.crisisManagement,
    teamPrincipal.driverManagement,
    teamPrincipal.operationalDiscipline,
    teamPrincipal.strategicPatience,
    teamPrincipal.riskTolerance,
    teamPrincipal.developmentCulture,
  ].filter((value) => value >= 95).length

  if (eliteCount >= 5) {
    warnings.push({
      kind: 'teamPrincipal',
      id: teamPrincipal.id,
      name: teamPrincipal.name,
      severity: 'warning',
      ruleId: 'tp-too-perfect',
      message: `Team principal has ${eliteCount} attributes at 95+ and may be too compressed at the top.`,
      recommendation: 'Keep true greats strong, but leave room between an elite principal and a merely very good one.',
      value: eliteCount,
    })
  }

  return warnings
}

export function evaluateTechnicalDirectorSanity(technicalDirector: TechnicalDirector): SanityWarning[] {
  const warnings: SanityWarning[] = []
  const eliteCount = [
    technicalDirector.aerodynamics,
    technicalDirector.mechanicalDesign,
    technicalDirector.innovation,
    technicalDirector.reliabilityFocus,
    technicalDirector.developmentSpeed,
    technicalDirector.regulationExploitation,
    technicalDirector.setupUnderstanding,
    technicalDirector.riskProfile,
  ].filter((value) => value >= 95).length

  if (eliteCount >= 5) {
    warnings.push({
      kind: 'technicalDirector',
      id: technicalDirector.id,
      name: technicalDirector.name,
      severity: 'warning',
      ruleId: 'td-too-perfect',
      message: `Technical director has ${eliteCount} attributes at 95+ and may be too uniform.`,
      recommendation: 'Keep the best technical directors exceptional but not universally near-perfect.',
      value: eliteCount,
    })
  }

  return warnings
}

export function evaluateSanityRules(input: {
  drivers: Driver[]
  cars: Car[]
  engines: Engine[]
  teamPrincipals: TeamPrincipal[]
  technicalDirectors: TechnicalDirector[]
}) {
  return {
    drivers: input.drivers.flatMap(evaluateDriverSanity),
    cars: input.cars.flatMap(evaluateCarSanity),
    engines: input.engines.flatMap(evaluateEngineSanity),
    teamPrincipals: input.teamPrincipals.flatMap(evaluateTeamPrincipalSanity),
    technicalDirectors: input.technicalDirectors.flatMap(evaluateTechnicalDirectorSanity),
  }
}
