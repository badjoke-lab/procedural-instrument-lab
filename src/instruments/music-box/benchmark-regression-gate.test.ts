import { describe, expect, it } from 'vitest'
import { BENCHMARK_TUNE_CASES } from './benchmark-tunes'
import { runEndToEndConversionBenchmark } from './end-to-end-benchmark'
import { createMechanismRequirementReport } from './mechanism-requirement-report'
import { SYNTHETIC_AUDIO_FIXTURES } from './synthetic-audio-fixtures'

const BASELINE = {
  tuneFixtures: 24,
  audioFixtures: 7,
  totalFixtures: 31,
  combNotes: 8,
  lowestMidi: 60,
  highestMidi: 72,
  cylinderRadius: 1.05,
  cylinderLength: 3.2,
  tineSpacing: 0.34,
  pinRadius: 0.045,
  minimumPinArcSpacing: 0.1125,
} as const

describe('music-box benchmark regression gate', () => {
  const conversion = runEndToEndConversionBenchmark()
  const requirements = createMechanismRequirementReport()

  it('locks the committed deterministic fixture coverage', () => {
    expect(BENCHMARK_TUNE_CASES).toHaveLength(BASELINE.tuneFixtures)
    expect(SYNTHETIC_AUDIO_FIXTURES).toHaveLength(BASELINE.audioFixtures)
    expect(conversion).toHaveLength(BASELINE.totalFixtures)
    expect(requirements.benchmarkCases).toBe(BASELINE.tuneFixtures)
  })

  it('requires every benchmark tune to fit inside the current mechanism', () => {
    expect(requirements.playableAfterFit).toBe(BASELINE.tuneFixtures)
    expect(requirements.cases.every((entry) => entry.fittedPlayable)).toBe(true)
  })

  it('requires every fitted note to become one mechanically validated pin', () => {
    for (const result of conversion) {
      expect(result.fittedNotes).toBeGreaterThan(0)
      expect(result.pinCount).toBe(result.fittedNotes)
      expect(result.contactWindows).toBe(result.pinCount)
      expect(result.releaseChecks).toBe(result.pinCount)
    }
  })

  it('locks the current mechanism envelope used by the benchmark', () => {
    expect(requirements.mechanism).toMatchObject({
      combNotes: BASELINE.combNotes,
      lowestMidi: BASELINE.lowestMidi,
      highestMidi: BASELINE.highestMidi,
      cylinderRadius: BASELINE.cylinderRadius,
      cylinderLength: BASELINE.cylinderLength,
      tineSpacing: BASELINE.tineSpacing,
      pinRadius: BASELINE.pinRadius,
    })
    expect(requirements.mechanism.minimumPinArcSpacing).toBeCloseTo(BASELINE.minimumPinArcSpacing, 10)
    expect(requirements.mechanism.requiredLaneSpan).toBeLessThanOrEqual(
      requirements.mechanism.availableLaneSpan,
    )
  })

  it('keeps benchmark pressure represented instead of accidentally deleting hard cases', () => {
    expect(requirements.blockedWithoutFit).toBeGreaterThan(0)
    expect(requirements.issueCounts.range).toBeGreaterThan(0)
    expect(requirements.issueCounts.density + requirements.issueCounts['pin-spacing']).toBeGreaterThan(0)
    expect(requirements.issueCounts.simultaneous).toBeGreaterThan(0)
    expect(
      requirements.fitChangeCounts.octave +
        requirements.fitChangeCounts.nearest +
        requirements.fitChangeCounts.quantize +
        requirements.fitChangeCounts.remove,
    ).toBeGreaterThan(0)
  })
})
