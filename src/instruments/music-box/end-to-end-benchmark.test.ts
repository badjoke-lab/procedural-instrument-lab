import { describe, expect, it } from 'vitest'
import { BENCHMARK_TUNE_CASES } from './benchmark-tunes'
import { runEndToEndConversionBenchmark } from './end-to-end-benchmark'
import { SYNTHETIC_AUDIO_FIXTURES } from './synthetic-audio-fixtures'

describe('end-to-end conversion benchmark', () => {
  const results = runEndToEndConversionBenchmark()

  it('covers every tune and synthetic audio fixture', () => {
    expect(results).toHaveLength(BENCHMARK_TUNE_CASES.length + SYNTHETIC_AUDIO_FIXTURES.length)
    expect(results.filter((result) => result.source === 'tune')).toHaveLength(BENCHMARK_TUNE_CASES.length)
    expect(results.filter((result) => result.source === 'audio')).toHaveLength(SYNTHETIC_AUDIO_FIXTURES.length)
  })

  it('converts every accepted fitted note into exactly one cylinder pin', () => {
    for (const result of results) {
      expect(result.pinCount).toBe(result.fittedNotes)
      expect(result.contactWindows).toBe(result.pinCount)
      expect(result.releaseChecks).toBe(result.pinCount)
    }
  })

  it('exercises Auto Fit changes on mechanically incompatible source fixtures', () => {
    const changedTuneResults = results.filter((result) => result.source === 'tune' && result.changes > 0)
    expect(changedTuneResults.length).toBeGreaterThan(0)
  })

  it('keeps at least one already-compatible tune unchanged through Auto Fit', () => {
    expect(results.some((result) => result.source === 'tune' && result.changes === 0)).toBe(true)
  })

  it('keeps extracted audio notes non-empty through fitting and compilation', () => {
    for (const result of results.filter((candidate) => candidate.source === 'audio')) {
      expect(result.sourceNotes).toBeGreaterThan(0)
      expect(result.fittedNotes).toBeGreaterThan(0)
      expect(result.pinCount).toBeGreaterThan(0)
    }
  })
})
