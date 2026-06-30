import { describe, it, expect } from 'vitest'
import { formatDriverName, formatCarName, formatEngineName } from '../domain/display/formatters'

describe('Domain Formatters', () => {
  it('formats driver name with year', () => {
    const driver = { name: 'Michael Schumacher', seasonYear: 2002 }
    expect(formatDriverName(driver)).toBe('Michael Schumacher 2002')
  })

  it('formats car name with year', () => {
    const car = { name: 'Mercedes-AMG F1 W11', seasonYear: 2020 }
    expect(formatCarName(car)).toBe('Mercedes-AMG F1 W11 2020')
  })

  it('formats engine name with manufacturer and year', () => {
    const engine = { manufacturer: 'Honda', name: 'RA168E', seasonYear: 1988 }
    expect(formatEngineName(engine)).toBe('Honda RA168E 1988')
  })

  it('returns translation fallback when item is null', () => {
    const t = (key: string, opts: any) => opts.defaultMessage
    expect(formatDriverName(null, t)).toBe('Item não encontrado')
  })

  it('returns default fallback when no translation function is provided', () => {
    expect(formatDriverName(null)).toBe('Item not found')
  })
})
