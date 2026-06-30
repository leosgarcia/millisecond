import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import fs from 'fs'
import path from 'path'

// Redefining the schema here specifically for the test to avoid running the seed script
const FiftyToOneHundred = z.number().min(50).max(100)

const DriverSchema = z.object({
  id: z.string(),
  name: z.string(),
  overall: FiftyToOneHundred,
  budgetCost: z.number().min(0),
  notes: z.string().min(1),
  confidence_level: z.string().min(1)
}).passthrough() // Pass through allows us to test just the core fields without typing the whole 30 fields again

const PhilosophySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  qualifyingModifier: z.number().min(-1.0).max(1.0)
}).passthrough()

describe('Dataset Importer Validation', () => {
  const dataDir = path.resolve(__dirname, '../../data/curated')

  it('should validate all drivers successfully against the schema', () => {
    const rawData = fs.readFileSync(path.resolve(dataDir, 'drivers.v1.json'), 'utf-8')
    const drivers = JSON.parse(rawData)
    
    // This should not throw
    const result = z.array(DriverSchema).safeParse(drivers)
    expect(result.success).toBe(true)
  })

  it('should validate all philosophies successfully against the schema', () => {
    const rawData = fs.readFileSync(path.resolve(dataDir, 'team_philosophies.v1.json'), 'utf-8')
    const philosophies = JSON.parse(rawData)
    
    // This should not throw
    const result = z.array(PhilosophySchema).safeParse(philosophies)
    expect(result.success).toBe(true)
  })

  it('should fail if a driver rating is out of bounds', () => {
    const invalidDriver = [{
      id: "driver-invalid",
      name: "Invalid Driver",
      overall: 105, // OVER 100!
      budgetCost: 100,
      notes: "This should fail",
      confidence_level: "low"
    }]

    const result = z.array(DriverSchema).safeParse(invalidDriver)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("expected number to be <=100")
    }
  })

  it('should fail if a driver is missing notes or confidence level', () => {
    const invalidDriver = [{
      id: "driver-missing-fields",
      name: "Missing Fields Driver",
      overall: 80,
      budgetCost: 100
      // Missing notes and confidence_level
    }]

    const result = z.array(DriverSchema).safeParse(invalidDriver)
    expect(result.success).toBe(false)
  })
})
