export type LiveryPalette = {
  primaryColor: string
  secondaryColor?: string
  accentColor?: string
}

const FALLBACK_LIVERY: LiveryPalette = {
  primaryColor: '#64748B',
  secondaryColor: '#1F2937',
  accentColor: '#CBD5E1',
}

const LIVERY_BY_TEAM: Record<string, LiveryPalette> = {
  mclaren: { primaryColor: '#FFFFFF', secondaryColor: '#E10600', accentColor: '#111111' },
  ferrari: { primaryColor: '#DC0000', secondaryColor: '#111111', accentColor: '#FFFFFF' },
  mercedes: { primaryColor: '#050505', secondaryColor: '#00D2BE', accentColor: '#C0C0C0' },
  redbull: { primaryColor: '#0600EF', secondaryColor: '#DC0000', accentColor: '#FCD700' },
  renault: { primaryColor: '#1B3CFF', secondaryColor: '#FFD500', accentColor: '#FFFFFF' },
  brawngp: { primaryColor: '#FFFFFF', secondaryColor: '#DFFF00', accentColor: '#111111' },
  williams: { primaryColor: '#005AFF', secondaryColor: '#FFFFFF', accentColor: '#F7D117' },
  benetton: { primaryColor: '#00A3E0', secondaryColor: '#00A651', accentColor: '#FFD100' },
  lotus: { primaryColor: '#111111', secondaryColor: '#FFEB00', accentColor: '#FFFFFF' },
  sauber: { primaryColor: '#FFFFFF', secondaryColor: '#1F3D7A', accentColor: '#D00000' },
  alpine: { primaryColor: '#0F2DFF', secondaryColor: '#FF5F8F', accentColor: '#FFFFFF' },
  aston: { primaryColor: '#006F62', secondaryColor: '#0D1B2A', accentColor: '#D6F5E3' },
}

function normalizeKey(value?: string | null) {
  return (value || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
}

export function resolveHistoricalLivery(input?: {
  id?: string
  name?: string
  teamName?: string
  seasonYear?: number
  liveryPrimaryColor?: string | null
  liverySecondaryColor?: string | null
  liveryAccentColor?: string | null
}): LiveryPalette {
  if (!input) {
    return FALLBACK_LIVERY
  }

  if (input.liveryPrimaryColor) {
    return {
      primaryColor: input.liveryPrimaryColor,
      secondaryColor: input.liverySecondaryColor ?? FALLBACK_LIVERY.secondaryColor,
      accentColor: input.liveryAccentColor ?? FALLBACK_LIVERY.accentColor,
    }
  }

  const key = normalizeKey(`${input.teamName || ''} ${input.name || ''} ${input.id || ''}`)

  for (const [token, palette] of Object.entries(LIVERY_BY_TEAM)) {
    if (key.includes(token)) return palette
  }

  return FALLBACK_LIVERY
}
