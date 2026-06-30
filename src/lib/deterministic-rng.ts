/**
 * Deterministic PRNG — mulberry32 algorithm
 *
 * Given a numeric seed, produces a deterministic sequence of pseudo-random
 * numbers in [0, 1). Safe to use in simulation logic because it never relies
 * on Math.random(), guaranteeing reproducibility for any given seed.
 *
 * Usage:
 *   const rng = createRng(42)
 *   rng() // 0.xxxxx (always the same for seed 42)
 *   rng() // different value, but still deterministic
 */
export function createRng(seed: number): () => number {
  let s = seed >>> 0 // ensure unsigned 32-bit integer
  return function () {
    s += 0x6d2b79f5
    let z = s
    z = Math.imul(z ^ (z >>> 15), z | 1)
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61)
    z = (z ^ (z >>> 14)) >>> 0
    return z / 4294967296
  }
}

/**
 * Derives a child seed from a parent seed + a string key.
 * Used to get different-but-reproducible seeds per race, per driver, etc.
 *
 * Example: deriveSeed(baseSeed, `race-${raceIndex}-driver-${driverId}`)
 */
export function deriveSeed(base: number, key: string): number {
  let hash = base
  for (let i = 0; i < key.length; i++) {
    hash = Math.imul(hash ^ key.charCodeAt(i), 0x9e3779b9)
    hash += (hash << 6) + (hash >>> 2)
  }
  return hash >>> 0
}

/**
 * Returns a deterministic float in [min, max] using the given rng.
 */
export function rngRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min)
}

/**
 * Returns a deterministic integer in [min, max] using the given rng.
 */
export function rngInt(rng: () => number, min: number, max: number): number {
  return Math.floor(min + rng() * (max - min + 1))
}

/**
 * Returns true with the given probability (0–1), deterministically.
 */
export function rngBool(rng: () => number, probability: number): boolean {
  return rng() < probability
}
