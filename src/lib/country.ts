const FALLBACK_COUNTRY_EMOJI = '🌐'

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  // Adjectives / nationalities from the curated dataset
  brazilian: 'BR',
  british: 'GB',
  german: 'DE',
  french: 'FR',
  finnish: 'FI',
  spanish: 'ES',
  austrian: 'AT',
  argentine: 'AR',
  dutch: 'NL',
  mexican: 'MX',
  italian: 'IT',
  australian: 'AU',
  belgian: 'BE',
  japanese: 'JP',
  brazil: 'BR',
  britain: 'GB',
  uk: 'GB',
  unitedkingdom: 'GB',
  germany: 'DE',
  france: 'FR',
  finland: 'FI',
  spain: 'ES',
  austria: 'AT',
  argentina: 'AR',
  netherlands: 'NL',
  mexico: 'MX',
  italy: 'IT',
  australia: 'AU',
  belgium: 'BE',
  japan: 'JP',
  monaco: 'MC',
  monegasque: 'MC',
  swedish: 'SE',
  sweden: 'SE',
  swiss: 'CH',
  switzerland: 'CH',
  canadian: 'CA',
  canada: 'CA',
  american: 'US',
  usa: 'US',
  unitedstates: 'US',
  portuguese: 'PT',
  portugal: 'PT',
  danish: 'DK',
  denmark: 'DK',
  honda: 'JP',
  ferrari: 'IT',
  mercedes: 'DE',
  renault: 'FR',
  ford: 'US',
  redbull: 'AT',
  redbullracing: 'AT',
  brawn: 'GB',
  brawngp: 'GB',
  mclaren: 'GB',
  williams: 'GB',
  benetton: 'IT',
  lotus: 'GB',
  sauber: 'CH',
  alpine: 'FR',
  astonmartin: 'GB',
  rondennis: 'GB',
  jeantodt: 'FR',
  christianhorner: 'GB',
  totowolff: 'AT',
  flaviobriatore: 'IT',
  sirfrankwilliams: 'GB',
  enzoferrari: 'IT',
  colinchapman: 'GB',
  rossbrawn: 'GB',
  zakbrown: 'US',
  adriannewey: 'GB',
  rorybyrne: 'IE',
  gordonmurray: 'GB',
  jamesallison: 'GB',
  johnbarnard: 'GB',
  patrickhead: 'GB',
  aldocosta: 'IT',
  pierrewache: 'FR',
}

function normalizeLookupKey(value: string) {
  return value.toLowerCase().replace(/[^a-z]/g, '')
}

export function resolveCountryCode(value?: string | null): string | undefined {
  if (!value) return undefined

  const trimmed = value.trim()
  if (!trimmed) return undefined

  if (/^[A-Za-z]{2}$/.test(trimmed)) {
    return trimmed.toUpperCase()
  }

  return COUNTRY_NAME_TO_CODE[normalizeLookupKey(trimmed)]
}

export function countryCodeToFlagEmoji(code?: string | null): string {
  const normalized = resolveCountryCode(code)
  if (!normalized) return FALLBACK_COUNTRY_EMOJI

  const upperCode = normalized.toUpperCase()
  if (upperCode.length !== 2) return FALLBACK_COUNTRY_EMOJI

  const codePoints = upperCode.split('').map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

export function formatCountryName(code?: string | null, locale = 'pt-BR'): string {
  const normalized = resolveCountryCode(code)
  if (!normalized) {
    return locale === 'pt-BR' ? 'Sem país' : 'No country'
  }

  try {
    const displayNames = new Intl.DisplayNames([locale], { type: 'region' })
    return displayNames.of(normalized) || normalized
  } catch {
    return normalized
  }
}

export function formatWithFlag(label: string, countryCode?: string | null, locale = 'pt-BR'): string {
  const flag = countryCodeToFlagEmoji(countryCode)
  const countryName = formatCountryName(countryCode, locale)

  if (!label) return `${flag} ${countryName}`.trim()
  return `${flag} ${label}`
}
