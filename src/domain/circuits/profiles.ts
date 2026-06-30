import type { Circuit, TrackProfile } from './types'

const PROFILE_RULES: Array<{ profile: TrackProfile; matches: (circuit: Circuit) => boolean }> = [
  { profile: 'power_track', matches: (circuit) => circuit.straightDemand >= 85 || circuit.reliabilityStress >= 80 },
  { profile: 'street_circuit', matches: (circuit) => circuit.overtakingDifficulty >= 85 || circuit.slowCornerDemand >= 90 },
  { profile: 'high_downforce', matches: (circuit) => circuit.aeroDemand >= 90 || circuit.slowCornerDemand >= 85 },
  { profile: 'high_speed_aero', matches: (circuit) => circuit.fastCornerDemand >= 90 || circuit.aeroDemand >= 90 },
  { profile: 'technical_flow', matches: (circuit) => circuit.mediumCornerDemand >= 85 || (circuit.fastCornerDemand >= 80 && circuit.slowCornerDemand >= 70) },
  { profile: 'mixed_classic', matches: (circuit) => circuit.straightDemand >= 75 && circuit.fastCornerDemand >= 75 && circuit.slowCornerDemand >= 65 },
  { profile: 'tire_limited', matches: (circuit) => circuit.tireStress >= 80 },
  { profile: 'wet_prone', matches: (circuit) => circuit.rainProbability >= 35 || circuit.safetyCarProbability >= 70 },
  { profile: 'braking_heavy', matches: (circuit) => circuit.brakingDemand >= 85 || circuit.reliabilityStress >= 85 },
]

const MANUAL_OVERRIDES: Record<string, TrackProfile[]> = {
  'circuit-monza': ['power_track'],
  'circuit-monaco': ['street_circuit', 'high_downforce'],
  'circuit-spa': ['mixed_classic', 'high_speed_aero', 'wet_prone'],
  'circuit-suzuka': ['technical_flow', 'high_speed_aero'],
  'circuit-singapore': ['street_circuit', 'tire_limited'],
  'circuit-bahrain': ['braking_heavy', 'tire_limited', 'power_track'],
  'circuit-silverstone': ['high_speed_aero', 'technical_flow'],
  'circuit-interlagos': ['mixed_classic', 'wet_prone'],
  'circuit-baku': ['power_track', 'street_circuit', 'braking_heavy'],
  'circuit-hungaroring': ['high_downforce', 'technical_flow'],
  'circuit-barcelona': ['high_downforce', 'technical_flow'],
  'circuit-abudhabi': ['mixed_classic', 'braking_heavy'],
}

export function inferTrackProfiles(circuit: Circuit): TrackProfile[] {
  const override = MANUAL_OVERRIDES[circuit.id]
  if (override) {
    return override
  }

  return PROFILE_RULES.filter((rule) => rule.matches(circuit)).map((rule) => rule.profile)
}

export function getTrackProfiles(circuit: Circuit): TrackProfile[] {
  return circuit.trackProfiles?.length ? circuit.trackProfiles : inferTrackProfiles(circuit)
}
