import { describe, expect, it } from 'vitest'
import { analyzeMusicBoxCompatibility } from './compatibility'
import { BENCHMARK_TUNE_CASES } from './benchmark-tunes'
import { validateTuneDocument } from './tune-document'

describe('benchmark tune set', () => {
  it('contains a broad deterministic fixture set', () => {
    expect(BENCHMARK_TUNE_CASES.length).toBeGreaterThanOrEqual(20)
    expect(new Set(BENCHMARK_TUNE_CASES.map((entry) => entry.id)).size).toBe(BENCHMARK_TUNE_CASES.length)
    expect(new Set(BENCHMARK_TUNE_CASES.map((entry) => entry.category))).toEqual(
      new Set(['range', 'timing', 'density', 'simultaneous', 'length', 'baseline']),
    )
  })

  it('keeps every fixture schema-valid so failures remain mechanical, not malformed input', () => {
    for (const entry of BENCHMARK_TUNE_CASES) {
      expect(validateTuneDocument(entry.document), entry.id).toEqual([])
    }
  })

  it('matches declared compatibility expectations', () => {
    for (const entry of BENCHMARK_TUNE_CASES) {
      const report = analyzeMusicBoxCompatibility(entry.document)
      const kinds = new Set(report.issues.map((issue) => issue.kind))

      expect(report.playable, entry.id).toBe(entry.expectedPlayable)
      for (const kind of entry.expectedIssueKinds) {
        expect(kinds.has(kind), `${entry.id} should include ${kind}`).toBe(true)
      }
    }
  })

  it('contains both playable and blocking cases plus review-only simultaneous cases', () => {
    const reports = BENCHMARK_TUNE_CASES.map((entry) => analyzeMusicBoxCompatibility(entry.document))
    expect(reports.some((report) => report.playable)).toBe(true)
    expect(reports.some((report) => !report.playable)).toBe(true)
    expect(reports.some((report) => report.playable && report.issues.some((issue) => issue.kind === 'simultaneous'))).toBe(true)
  })
})
