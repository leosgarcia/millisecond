import fs from 'fs'
import path from 'path'
import { drivers } from './data/drivers'
import { cars } from './data/cars'
import { engines } from './data/engines'
import { principals } from './data/principals'
import { directors } from './data/directors'
import { circuits } from './data/circuits'

// The rating rules to export
const ratingRules = {
  version: "1.0",
  scale: "50-100",
  description: "Relative strength within the era",
  note: "Refer to docs/RATING_METHODOLOGY.md for the full specification."
}

const OUT_DIR = path.resolve(process.cwd(), 'data/curated')
const CSV_DIR = path.resolve(OUT_DIR, 'csv')

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })
if (!fs.existsSync(CSV_DIR)) fs.mkdirSync(CSV_DIR, { recursive: true })

function validateData(name: string, data: any[]) {
  const ids = new Set<string>()
  for (const item of data) {
    // Check ID uniqueness
    if (ids.has(item.id)) {
      throw new Error(`Duplicate ID found in ${name}: ${item.id}`)
    }
    ids.add(item.id)

    // Check bounds (50-100) for performance numbers, excluding specific non-rating fields
    const excludedFields = ['id', 'name', 'seasonYear', 'nationality', 'tier', 'role', 'era', 'teamName', 'manufacturer', 'country', 'compatibleEras', 'preferredCarTraits', 'weakCarTraits', 'notes', 'strengths', 'weaknesses', 'confidence_level', 'rainProbability', 'safetyCarProbability']
    
    for (const [key, value] of Object.entries(item)) {
      if (typeof value === 'number' && !excludedFields.includes(key)) {
        // exception for car traits which are 0 or 1
        if (['stableRear', 'strongFrontEnd', 'nervousRear', 'traction'].includes(key)) {
          if (value !== 0 && value !== 1) {
            throw new Error(`Invalid boolean trait value for ${key} in ${item.id}: ${value}`)
          }
          continue
        }
        
        if (value < 50 || value > 100) {
          throw new Error(`Value out of bounds (50-100) in ${name} -> ${item.id} -> ${key}: ${value}`)
        }
      }
    }

    // Check notes and confidence_level
    if (!item.notes) throw new Error(`Missing notes in ${name} -> ${item.id}`)
    if (!item.confidence_level) throw new Error(`Missing confidence_level in ${name} -> ${item.id}`)
  }
}

function exportJSON(name: string, data: any) {
  const filePath = path.resolve(OUT_DIR, `${name}.v1.json`)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  console.log(`✅ Exported ${name}.v1.json`)
}

function exportCSV(name: string, data: any[]) {
  if (data.length === 0) return
  const headers = Object.keys(data[0])
  const csvRows = [headers.join(',')]
  
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header]
      if (typeof val === 'string') {
        // Escape quotes and wrap in quotes
        return `"${val.replace(/"/g, '""')}"`
      }
      return val
    })
    csvRows.push(values.join(','))
  }
  
  const filePath = path.resolve(CSV_DIR, `${name}.v1.csv`)
  fs.writeFileSync(filePath, csvRows.join('\n'))
  console.log(`✅ Exported ${name}.v1.csv`)
}

function run() {
  console.log('Validating dataset...')
  validateData('drivers', drivers)
  validateData('cars', cars)
  validateData('engines', engines)
  validateData('team_principals', principals)
  validateData('technical_directors', directors)
  validateData('circuits', circuits)
  console.log('✅ Validation passed.')

  console.log('Exporting JSONs...')
  exportJSON('drivers', drivers)
  exportJSON('cars', cars)
  exportJSON('engines', engines)
  exportJSON('team_principals', principals)
  exportJSON('technical_directors', directors)
  exportJSON('circuits', circuits)
  exportJSON('rating_rules', ratingRules)
  
  console.log('Exporting CSVs...')
  exportCSV('drivers', drivers)
  exportCSV('cars', cars)
  exportCSV('engines', engines)
  exportCSV('team_principals', principals)
  exportCSV('technical_directors', directors)
  exportCSV('circuits', circuits)
}

run()
