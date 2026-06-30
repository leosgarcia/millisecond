/**
 * millisecond — Zod JSON Importer
 *
 * Importa e valida datasets em data/curated/*.v1.json e persiste no banco de dados.
 */

import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'
import fs from 'fs'
import { z } from 'zod'

const dbPath = path.resolve(__dirname, '../dev.db')
const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })

const DATA_DIR = path.resolve(__dirname, '../data/curated')

// ─── SCHEMAS ZOD ─────────────────────────────────────────────────────────────

const FiftyToOneHundred = z.number().min(50).max(100)
const BooleanFloat = z.number().refine(val => val === 0 || val === 1, {
  message: "Must be 0 or 1"
})

const DriverSchema = z.object({
  id: z.string(),
  canonicalDriverId: z.string(),
  name: z.string(),
  seasonYear: z.number(),
  nationality: z.string(),
  tier: z.string(),
  role: z.string(),
  era: z.string(),
  overall: FiftyToOneHundred,
  qualifyingPace: FiftyToOneHundred,
  racePace: FiftyToOneHundred,
  wetSkill: FiftyToOneHundred,
  tireManagement: FiftyToOneHundred,
  overtaking: FiftyToOneHundred,
  defending: FiftyToOneHundred,
  consistency: FiftyToOneHundred,
  adaptability: FiftyToOneHundred,
  technicalFeedback: FiftyToOneHundred,
  pressureHandling: FiftyToOneHundred,
  aggression: FiftyToOneHundred,
  teamPlay: FiftyToOneHundred,
  errorProneness: FiftyToOneHundred,
  incidentRisk: FiftyToOneHundred,
  politicalTension: FiftyToOneHundred,
  preferredCarTraits: z.string(), // JSON string
  weakCarTraits: z.string(), // JSON string
  notes: z.string().min(1),
  budgetCost: z.number().min(0),
  confidence_level: z.string().min(1)
})

const CarSchema = z.object({
  id: z.string(),
  name: z.string(),
  seasonYear: z.number(),
  teamName: z.string(),
  tier: z.string(),
  era: z.string(),
  overall: FiftyToOneHundred,
  aeroEfficiency: FiftyToOneHundred,
  slowCorner: FiftyToOneHundred,
  mediumCorner: FiftyToOneHundred,
  fastCorner: FiftyToOneHundred,
  straightLineSpeed: FiftyToOneHundred,
  mechanicalGrip: FiftyToOneHundred,
  braking: FiftyToOneHundred,
  tireWear: FiftyToOneHundred,
  setupWindow: FiftyToOneHundred,
  reliability: FiftyToOneHundred,
  developmentPotential: FiftyToOneHundred,
  stableRear: BooleanFloat,
  strongFrontEnd: BooleanFloat,
  nervousRear: BooleanFloat,
  traction: BooleanFloat,
  strengths: z.string(),
  weaknesses: z.string(),
  notes: z.string().min(1),
  budgetCost: z.number().min(0),
  confidence_level: z.string().min(1)
})

const EngineSchema = z.object({
  id: z.string(),
  name: z.string(),
  manufacturer: z.string(),
  seasonYear: z.number(),
  era: z.string(),
  overall: FiftyToOneHundred,
  power: FiftyToOneHundred,
  torqueDelivery: FiftyToOneHundred,
  drivability: FiftyToOneHundred,
  fuelEfficiency: FiftyToOneHundred,
  energyRecovery: FiftyToOneHundred,
  weightEfficiency: FiftyToOneHundred,
  reliability: FiftyToOneHundred,
  coolingDemand: FiftyToOneHundred,
  qualifyingMode: FiftyToOneHundred,
  racePaceSustainability: FiftyToOneHundred,
  compatibleEras: z.string(),
  notes: z.string().min(1),
  budgetCost: z.number().min(0),
  confidence_level: z.string().min(1)
})

const PrincipalSchema = z.object({
  id: z.string(),
  name: z.string(),
  era: z.string(),
  leadership: FiftyToOneHundred,
  politics: FiftyToOneHundred,
  crisisManagement: FiftyToOneHundred,
  driverManagement: FiftyToOneHundred,
  operationalDiscipline: FiftyToOneHundred,
  strategicPatience: FiftyToOneHundred,
  riskTolerance: FiftyToOneHundred,
  developmentCulture: FiftyToOneHundred,
  notes: z.string().min(1),
  budgetCost: z.number().min(0),
  confidence_level: z.string().min(1)
})

const DirectorSchema = z.object({
  id: z.string(),
  name: z.string(),
  era: z.string(),
  aerodynamics: FiftyToOneHundred,
  mechanicalDesign: FiftyToOneHundred,
  innovation: FiftyToOneHundred,
  reliabilityFocus: FiftyToOneHundred,
  developmentSpeed: FiftyToOneHundred,
  regulationExploitation: FiftyToOneHundred,
  setupUnderstanding: FiftyToOneHundred,
  riskProfile: FiftyToOneHundred,
  notes: z.string().min(1),
  budgetCost: z.number().min(0),
  confidence_level: z.string().min(1)
})

const CircuitSchema = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string(),
  straightDemand: FiftyToOneHundred,
  slowCornerDemand: FiftyToOneHundred,
  mediumCornerDemand: FiftyToOneHundred,
  fastCornerDemand: FiftyToOneHundred,
  brakingDemand: FiftyToOneHundred,
  mechanicalGripDemand: FiftyToOneHundred,
  aeroDemand: FiftyToOneHundred,
  tireStress: FiftyToOneHundred,
  overtakingDifficulty: FiftyToOneHundred,
  qualifyingImportance: FiftyToOneHundred,
  rainProbability: z.number().min(0).max(100), // Percentages
  safetyCarProbability: z.number().min(0).max(100),
  reliabilityStress: FiftyToOneHundred,
  driverErrorStress: FiftyToOneHundred,
  notes: z.string().min(1),
  confidence_level: z.string().min(1)
})

const PhilosophySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  qualifyingModifier: z.number().min(-1.0).max(1.0),
  raceModifier: z.number().min(-1.0).max(1.0),
  reliabilityModifier: z.number().min(-1.0).max(1.0),
  tireModifier: z.number().min(-1.0).max(1.0),
  aggressionModifier: z.number().min(-1.0).max(1.0),
  developmentModifier: z.number().min(-1.0).max(1.0)
})

// Exporting schemas so they can be tested
export const schemas = {
  drivers: z.array(DriverSchema),
  cars: z.array(CarSchema),
  engines: z.array(EngineSchema),
  team_principals: z.array(PrincipalSchema),
  technical_directors: z.array(DirectorSchema),
  circuits: z.array(CircuitSchema),
  team_philosophies: z.array(PhilosophySchema)
}

function parseJSON(filename: string, schema: z.ZodSchema) {
  const filePath = path.resolve(DATA_DIR, filename)
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }
  const rawData = fs.readFileSync(filePath, 'utf-8')
  const jsonData = JSON.parse(rawData)
  const result = schema.safeParse(jsonData)
  if (!result.success) {
    console.error(`❌ Validation failed for ${filename}`)
    console.error(result.error.format())
    throw new Error(`Zod validation error in ${filename}`)
  }
  
  // Filter out `confidence_level` as it's not in Prisma schema but required in JSON for curation
  return (result.data as any[]).map((item: any) => {
    const { confidence_level, ...rest } = item
    if (filename === 'drivers.v1.json' || filename === 'circuits.v1.json') {
      return { ...rest, confidenceLevel: confidence_level || "medium" }
    }
    return rest
  })
}

async function main() {
  console.log('--- MILLISECOND DATASET IMPORTER ---')
  console.log('Clearing old dev database entries...')
  
  // Wipe all existing entries in development
  await prisma.campaign.deleteMany()
  await prisma.teamPhilosophy.deleteMany()
  await prisma.circuit.deleteMany()
  await prisma.technicalDirector.deleteMany()
  await prisma.teamPrincipal.deleteMany()
  await prisma.engine.deleteMany()
  await prisma.car.deleteMany()
  await prisma.driver.deleteMany()

  console.log('✅ Database wiped.')

  console.log('Loading and validating JSON datasets...')

  const drivers = parseJSON('drivers.v1.json', schemas.drivers)
  const cars = parseJSON('cars.v1.json', schemas.cars)
  const engines = parseJSON('engines.v1.json', schemas.engines)
  const principals = parseJSON('team_principals.v1.json', schemas.team_principals)
  const directors = parseJSON('technical_directors.v1.json', schemas.technical_directors)
  const circuits = parseJSON('circuits.v1.json', schemas.circuits)
  const philosophies = parseJSON('team_philosophies.v1.json', schemas.team_philosophies)

  console.log('✅ Validation passed. Inserting into database...')

  await prisma.driver.createMany({ data: drivers })
  await prisma.car.createMany({ data: cars })
  await prisma.engine.createMany({ data: engines })
  await prisma.teamPrincipal.createMany({ data: principals })
  await prisma.technicalDirector.createMany({ data: directors })
  await prisma.circuit.createMany({ data: circuits })
  await prisma.teamPhilosophy.createMany({ data: philosophies })

  console.log('\n--- IMPORT SUMMARY ---')
  console.log(`- Drivers: ${drivers.length}`)
  console.log(`- Cars: ${cars.length}`)
  console.log(`- Engines: ${engines.length}`)
  console.log(`- Team Principals: ${principals.length}`)
  console.log(`- Technical Directors: ${directors.length}`)
  console.log(`- Circuits: ${circuits.length}`)
  console.log(`- Team Philosophies: ${philosophies.length}`)
  console.log('✅ Dataset Import Complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
