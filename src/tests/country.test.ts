import { describe, it, expect } from 'vitest'
import { countryCodeToFlagEmoji } from '@/lib/country'

describe('Country flags', () => {
  it('returns valid emojis for known codes', () => {
    expect(countryCodeToFlagEmoji('BR')).toBe('🇧🇷')
    expect(countryCodeToFlagEmoji('GB')).toBe('🇬🇧')
    expect(countryCodeToFlagEmoji('IT')).toBe('🇮🇹')
  })

  it('returns a globe fallback for undefined or unknown codes', () => {
    expect(countryCodeToFlagEmoji(undefined as any)).toBe('🌐')
    expect(countryCodeToFlagEmoji('UNKNOWN')).toBe('🌐')
  })
})
