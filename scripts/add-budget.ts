import fs from 'fs'
import path from 'path'

const OUT_DIR = path.resolve(process.cwd(), 'data/curated')
const CSV_DIR = path.resolve(OUT_DIR, 'csv')

function exportCSV(name: string, data: any[]) {
  if (data.length === 0) return
  const headers = Object.keys(data[0])
  const csvRows = [headers.join(',')]
  
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header]
      if (typeof val === 'string') {
        return `"${val.replace(/"/g, '""')}"`
      }
      return val
    })
    csvRows.push(values.join(','))
  }
  
  const filePath = path.resolve(CSV_DIR, `${name}.v1.csv`)
  fs.writeFileSync(filePath, csvRows.join('\n'))
}

function interpolate(val: number, minVal: number, maxVal: number, minBud: number, maxBud: number) {
  const clamped = Math.max(minVal, Math.min(maxVal, val))
  const ratio = (clamped - minVal) / (maxVal - minVal)
  return Math.round(minBud + ratio * (maxBud - minBud))
}

function processJSON(filename: string, processor: (item: any) => number) {
  const filePath = path.resolve(OUT_DIR, filename)
  if (!fs.existsSync(filePath)) return
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  for (const item of data) {
    item.budgetCost = processor(item)
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  exportCSV(filename.replace('.v1.json', ''), data)
  console.log(`✅ Processed ${filename}`)
}

function run() {
  processJSON('drivers.v1.json', (d) => {
    const ov = d.overall
    if (d.role === 'secondary') {
      if (d.tier === 'S' || d.tier === 'A') return interpolate(ov, 85, 95, 110, 150)
      if (d.tier === 'B') return interpolate(ov, 75, 84, 80, 110)
      return interpolate(ov, 60, 74, 50, 80)
    } else {
      if (d.tier === 'S') return interpolate(ov, 94, 100, 190, 230)
      if (d.tier === 'A') return interpolate(ov, 90, 93, 150, 190)
      if (d.tier === 'B') return interpolate(ov, 80, 89, 100, 150)
      return interpolate(ov, 60, 79, 70, 100)
    }
  })

  processJSON('cars.v1.json', (c) => {
    const ov = c.overall
    if (ov >= 94) return interpolate(ov, 94, 100, 210, 250)
    if (ov >= 90) return interpolate(ov, 90, 93, 170, 210)
    if (ov >= 80) return interpolate(ov, 80, 89, 120, 170)
    return interpolate(ov, 60, 79, 70, 120)
  })

  processJSON('engines.v1.json', (e) => {
    const ov = e.overall
    if (ov >= 94) return interpolate(ov, 94, 100, 140, 180)
    if (ov >= 90) return interpolate(ov, 90, 93, 110, 140)
    if (ov >= 80) return interpolate(ov, 80, 89, 70, 110)
    return interpolate(ov, 60, 79, 40, 70)
  })

  processJSON('team_principals.v1.json', (tp) => {
    const ov = Math.round((tp.leadership + tp.operationalDiscipline + tp.driverManagement) / 3)
    if (ov >= 90) return interpolate(ov, 90, 100, 90, 130)
    if (ov >= 80) return interpolate(ov, 80, 89, 60, 90)
    return interpolate(ov, 60, 79, 40, 60)
  })

  processJSON('technical_directors.v1.json', (td) => {
    const ov = Math.round((td.aerodynamics + td.mechanicalDesign + td.innovation) / 3)
    if (ov >= 90) return interpolate(ov, 90, 100, 100, 150)
    if (ov >= 80) return interpolate(ov, 80, 89, 70, 100)
    return interpolate(ov, 60, 79, 40, 70)
  })

  console.log('✅ Budgets generated and saved.')
}

run()
