import { evaluateSanityRules } from '../src/domain/data-quality/ratingSanityRules'
import { formatCountryName } from '../src/lib/country'
import {
  buildStatRows,
  ensureReportsDir,
  formatNumber,
  loadCuratedData,
  writeJsonReport,
  writeReport,
} from './audit-support'

const data = loadCuratedData()

const driverMetrics = {
  qualifyingPace: (item: (typeof data.drivers)[number]) => item.qualifyingPace,
  racePace: (item: (typeof data.drivers)[number]) => item.racePace,
  wetSkill: (item: (typeof data.drivers)[number]) => item.wetSkill,
  tireManagement: (item: (typeof data.drivers)[number]) => item.tireManagement,
  overtaking: (item: (typeof data.drivers)[number]) => item.overtaking,
  defending: (item: (typeof data.drivers)[number]) => item.defending,
  consistency: (item: (typeof data.drivers)[number]) => item.consistency,
  adaptability: (item: (typeof data.drivers)[number]) => item.adaptability,
  technicalFeedback: (item: (typeof data.drivers)[number]) => item.technicalFeedback,
  pressureHandling: (item: (typeof data.drivers)[number]) => item.pressureHandling,
  aggression: (item: (typeof data.drivers)[number]) => item.aggression,
  teamPlay: (item: (typeof data.drivers)[number]) => item.teamPlay,
  errorProneness: (item: (typeof data.drivers)[number]) => item.errorProneness,
  incidentRisk: (item: (typeof data.drivers)[number]) => item.incidentRisk,
  politicalTension: (item: (typeof data.drivers)[number]) => item.politicalTension,
  budgetCost: (item: (typeof data.drivers)[number]) => item.budgetCost,
}

const carMetrics = {
  aeroEfficiency: (item: (typeof data.cars)[number]) => item.aeroEfficiency,
  slowCorner: (item: (typeof data.cars)[number]) => item.slowCorner,
  mediumCorner: (item: (typeof data.cars)[number]) => item.mediumCorner,
  fastCorner: (item: (typeof data.cars)[number]) => item.fastCorner,
  straightLineSpeed: (item: (typeof data.cars)[number]) => item.straightLineSpeed,
  mechanicalGrip: (item: (typeof data.cars)[number]) => item.mechanicalGrip,
  braking: (item: (typeof data.cars)[number]) => item.braking,
  tireWear: (item: (typeof data.cars)[number]) => item.tireWear,
  setupWindow: (item: (typeof data.cars)[number]) => item.setupWindow,
  reliability: (item: (typeof data.cars)[number]) => item.reliability,
  developmentPotential: (item: (typeof data.cars)[number]) => item.developmentPotential,
  budgetCost: (item: (typeof data.cars)[number]) => item.budgetCost,
}

const engineMetrics = {
  power: (item: (typeof data.engines)[number]) => item.power,
  torqueDelivery: (item: (typeof data.engines)[number]) => item.torqueDelivery,
  drivability: (item: (typeof data.engines)[number]) => item.drivability,
  fuelEfficiency: (item: (typeof data.engines)[number]) => item.fuelEfficiency,
  energyRecovery: (item: (typeof data.engines)[number]) => item.energyRecovery,
  weightEfficiency: (item: (typeof data.engines)[number]) => item.weightEfficiency,
  reliability: (item: (typeof data.engines)[number]) => item.reliability,
  coolingDemand: (item: (typeof data.engines)[number]) => item.coolingDemand,
  qualifyingMode: (item: (typeof data.engines)[number]) => item.qualifyingMode,
  racePaceSustainability: (item: (typeof data.engines)[number]) => item.racePaceSustainability,
  budgetCost: (item: (typeof data.engines)[number]) => item.budgetCost,
}

const tpMetrics = {
  leadership: (item: (typeof data.teamPrincipals)[number]) => item.leadership,
  politics: (item: (typeof data.teamPrincipals)[number]) => item.politics,
  crisisManagement: (item: (typeof data.teamPrincipals)[number]) => item.crisisManagement,
  driverManagement: (item: (typeof data.teamPrincipals)[number]) => item.driverManagement,
  operationalDiscipline: (item: (typeof data.teamPrincipals)[number]) => item.operationalDiscipline,
  strategicPatience: (item: (typeof data.teamPrincipals)[number]) => item.strategicPatience,
  riskTolerance: (item: (typeof data.teamPrincipals)[number]) => item.riskTolerance,
  developmentCulture: (item: (typeof data.teamPrincipals)[number]) => item.developmentCulture,
  budgetCost: (item: (typeof data.teamPrincipals)[number]) => item.budgetCost,
}

const tdMetrics = {
  aerodynamics: (item: (typeof data.technicalDirectors)[number]) => item.aerodynamics,
  mechanicalDesign: (item: (typeof data.technicalDirectors)[number]) => item.mechanicalDesign,
  innovation: (item: (typeof data.technicalDirectors)[number]) => item.innovation,
  reliabilityFocus: (item: (typeof data.technicalDirectors)[number]) => item.reliabilityFocus,
  developmentSpeed: (item: (typeof data.technicalDirectors)[number]) => item.developmentSpeed,
  regulationExploitation: (item: (typeof data.technicalDirectors)[number]) => item.regulationExploitation,
  setupUnderstanding: (item: (typeof data.technicalDirectors)[number]) => item.setupUnderstanding,
  budgetCost: (item: (typeof data.technicalDirectors)[number]) => item.budgetCost,
}

const audit = {
  generatedAt: new Date().toISOString(),
  source: 'data/curated',
  counts: {
    drivers: data.drivers.length,
    cars: data.cars.length,
    engines: data.engines.length,
    teamPrincipals: data.teamPrincipals.length,
    technicalDirectors: data.technicalDirectors.length,
    teamPhilosophies: data.teamPhilosophies.length,
    circuits: data.circuits.length,
  },
  drivers: {
    itemCount: data.drivers.length,
    attributes: buildStatRows(data.drivers, driverMetrics),
  },
  cars: {
    itemCount: data.cars.length,
    attributes: buildStatRows(data.cars, carMetrics),
  },
  engines: {
    itemCount: data.engines.length,
    attributes: buildStatRows(data.engines, engineMetrics),
  },
  teamPrincipals: {
    itemCount: data.teamPrincipals.length,
    attributes: buildStatRows(data.teamPrincipals, tpMetrics),
  },
  technicalDirectors: {
    itemCount: data.technicalDirectors.length,
    attributes: buildStatRows(data.technicalDirectors, tdMetrics),
  },
}

const sanity = evaluateSanityRules({
  drivers: data.drivers,
  cars: data.cars,
  engines: data.engines,
  teamPrincipals: data.teamPrincipals,
  technicalDirectors: data.technicalDirectors,
})

ensureReportsDir()
writeJsonReport('dataset-audit.json', { ...audit, sanity })

const wetSkill = audit.drivers.attributes.wetSkill
const wetBuckets = {
  eliteAbsolute: data.drivers.filter((driver) => driver.wetSkill >= 98),
  elite: data.drivers.filter((driver) => driver.wetSkill >= 94 && driver.wetSkill <= 97),
  strong: data.drivers.filter((driver) => driver.wetSkill >= 88 && driver.wetSkill <= 93),
  reviewHigh: data.drivers.filter((driver) => driver.wetSkill >= 94),
  reviewLow: data.drivers.filter((driver) => driver.wetSkill <= 80),
}

const wetRecommendations = [
  `${wetBuckets.eliteAbsolute.length} drivers sit at 98+ wet skill. This should remain a tiny group of absolute outliers.`,
  `${wetBuckets.reviewHigh.length} drivers sit at 94+ wet skill (${((wetBuckets.reviewHigh.length / data.drivers.length) * 100).toFixed(1)}% of the grid). The target is roughly 15-20% or less.`,
  `${wetBuckets.reviewLow.length} drivers are at 80 or below. These are the profiles that can be used to restore contrast if the top end is too flat.`,
]

const topWet = [...data.drivers].sort((a, b) => b.wetSkill - a.wetSkill)

const md = `# Dataset Audit

Generated at: ${audit.generatedAt}
Source: \`data/curated\`

## Summary

- Drivers: ${audit.counts.drivers}
- Cars: ${audit.counts.cars}
- Engines: ${audit.counts.engines}
- Team principals: ${audit.counts.teamPrincipals}
- Technical directors: ${audit.counts.technicalDirectors}

## Sanity Signals

${sanity.drivers.slice(0, 12).map((warning) => `- [${warning.severity.toUpperCase()}] ${warning.kind}/${warning.ruleId}: ${warning.name} - ${warning.message}`).join('\n')}

## Wet Skill Audit

- 98+ elite absolute: ${wetBuckets.eliteAbsolute.length}
- 94-97 elite: ${wetBuckets.elite.length}
- 88-93 strong: ${wetBuckets.strong.length}
- 94+ review group: ${wetBuckets.reviewHigh.length} (${((wetBuckets.reviewHigh.length / data.drivers.length) * 100).toFixed(1)}%)

### Top Wet Drivers

${topWet.slice(0, 10).map((driver, index) => `${index + 1}. ${driver.name} ${driver.seasonYear} - ${driver.wetSkill}`).join('\n')}

### Recommendations

${wetRecommendations.map((line) => `- ${line}`).join('\n')}

## Drivers

${Object.values(audit.drivers.attributes).map((row) => `### ${row.metric}
- Mean: ${formatNumber(row.mean)}
- Median: ${formatNumber(row.median)}
- Min/Max: ${row.min} / ${row.max}
- Std Dev: ${formatNumber(row.stdDev)}
- Outliers: ${row.outliers.length}
- Tier distribution: ${Object.entries(row.distributionByTier ?? {}).map(([key, value]) => `${key}:${value}`).join(', ')}
- Role distribution: ${Object.entries(row.distributionByRole ?? {}).map(([key, value]) => `${key}:${value}`).join(', ')}
`).join('\n')}

## Cars

${Object.values(audit.cars.attributes).map((row) => `### ${row.metric}
- Mean: ${formatNumber(row.mean)}
- Median: ${formatNumber(row.median)}
- Min/Max: ${row.min} / ${row.max}
- Std Dev: ${formatNumber(row.stdDev)}
- Outliers: ${row.outliers.length}
`).join('\n')}

## Engines

${Object.values(audit.engines.attributes).map((row) => `### ${row.metric}
- Mean: ${formatNumber(row.mean)}
- Median: ${formatNumber(row.median)}
- Min/Max: ${row.min} / ${row.max}
- Std Dev: ${formatNumber(row.stdDev)}
- Outliers: ${row.outliers.length}
`).join('\n')}

## Team Principals

${Object.values(audit.teamPrincipals.attributes).map((row) => `### ${row.metric}
- Mean: ${formatNumber(row.mean)}
- Median: ${formatNumber(row.median)}
- Min/Max: ${row.min} / ${row.max}
- Std Dev: ${formatNumber(row.stdDev)}
- Outliers: ${row.outliers.length}
`).join('\n')}

## Technical Directors

${Object.values(audit.technicalDirectors.attributes).map((row) => `### ${row.metric}
- Mean: ${formatNumber(row.mean)}
- Median: ${formatNumber(row.median)}
- Min/Max: ${row.min} / ${row.max}
- Std Dev: ${formatNumber(row.stdDev)}
- Outliers: ${row.outliers.length}
`).join('\n')}
`

writeReport('dataset-audit.md', md)
writeReport(
  'wet-skill-audit.md',
  `# Wet Skill Audit\n\n## Distribution Targets\n\n- 98-100: elite historical absolute\n- 94-97: elite proven\n- 88-93: very strong\n- 80-87: good\n- 70-79: average or unremarkable\n- 60-69: below average historical\n\n## Buckets\n\n### 98+\n${wetBuckets.eliteAbsolute.map((driver) => `- ${driver.name} ${driver.seasonYear} (${driver.wetSkill})`).join('\n') || '- None'}\n\n### 94-97\n${wetBuckets.elite.map((driver) => `- ${driver.name} ${driver.seasonYear} (${driver.wetSkill})`).join('\n') || '- None'}\n\n### 88-93\n${wetBuckets.strong.map((driver) => `- ${driver.name} ${driver.seasonYear} (${driver.wetSkill})`).join('\n') || '- None'}\n\n## Possible Overestimates\n${topWet.filter((driver) => driver.wetSkill >= 94 && !['ayrton_senna','michael_schumacher','lewis_hamilton','max_verstappen','jim_clark','juan_manual_fangio'].includes(driver.canonicalDriverId)).map((driver) => `- ${driver.name} ${driver.seasonYear} (${driver.wetSkill})`).join('\n') || '- None'}\n\n## Possible Underestimates\n${wetBuckets.reviewLow.slice(0, 10).map((driver) => `- ${driver.name} ${driver.seasonYear} (${driver.wetSkill})`).join('\n') || '- None'}\n\n## Recommendations\n${wetRecommendations.map((line) => `- ${line}`).join('\n')}\n`
)

console.log('dataset-audit reports generated')
