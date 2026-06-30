/**
 * Normalization helpers for simulation scores.
 *
 * All game scores are in the 0–100 range. These helpers ensure values
 * stay bounded and are combined consistently.
 */

/** Clamp a value to [0, 100] */
export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value))
}

/** Normalize a value from a source range to [0, 100] */
export function normalize(value: number, sourceMin: number, sourceMax: number): number {
  if (sourceMax === sourceMin) return 50
  return clamp(((value - sourceMin) / (sourceMax - sourceMin)) * 100)
}

/**
 * Weighted average of attribute/weight pairs.
 * Weights do not need to sum to 1 — they will be normalized internally.
 *
 * Example:
 *   weightedAvg([
 *     [driver.racePace, 0.25],
 *     [carFit, 0.25],
 *   ])
 */
export function weightedAvg(pairs: [number, number][]): number {
  const totalWeight = pairs.reduce((sum, [, w]) => sum + w, 0)
  if (totalWeight === 0) return 0
  const weighted = pairs.reduce((sum, [v, w]) => sum + v * w, 0)
  return clamp(weighted / totalWeight)
}

/**
 * Apply a percentage modifier to a base value.
 * modifier = 0.05 means +5%, -0.10 means -10%.
 */
export function applyModifier(base: number, modifier: number): number {
  return clamp(base * (1 + modifier))
}

/**
 * Softly compresses elite ratings so a few 99s do not dominate every
 * composite score. Values below the threshold are preserved.
 */
export function softenElite(value: number, threshold = 85, scale = 0.6): number {
  if (value <= threshold) return value
  return clamp(threshold + (value - threshold) * scale)
}

/**
 * Dot product fit score between two vectors of equal length.
 * Used to compute how well a car matches a circuit's demands.
 *
 * Returns a value in [0, 100].
 */
export function fitScore(carAttributes: number[], circuitDemands: number[]): number {
  if (carAttributes.length !== circuitDemands.length) {
    throw new Error('fitScore: vectors must be same length')
  }
  let total = 0
  let weight = 0
  for (let i = 0; i < carAttributes.length; i++) {
    const demand = circuitDemands[i]
    const attr = carAttributes[i]
    // Higher demand amplifies the importance of that attribute
    total += attr * (demand / 100)
    weight += demand / 100
  }
  return weight === 0 ? 50 : clamp(total / weight)
}
