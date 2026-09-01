import { describe, expect, it } from 'vitest'
import { BENCHMARK_TUNE_CASES } from './benchmark-tunes'
import { createMechanismRequirementReport, formatMechanismRequirementReport } from './mechanism-requirement-report'

describe('mechanism requirement report', () => {
  const report = createMechanismRequirementReport()

  it('summarizes every benchmark tune case', () => {
    expect(report.benchmarkCases).toBe(BENCHMARK_TUNE_CASES.length)
    expect(report.cases).toHaveLength(BENCHMARK_TUNE_CASES.length)
    expect(report.playableWithoutFit + report.blockedWithoutFit).toBe(report.benchmarkCases)
  })

  it('records current comb and cylinder capacity', () => {
    expect(report.mechanism.combNotes).toBeGreaterThan(0)
    expect(report.mechanism.lowestMidi).toBeLessThan(report.mechanism.highestMidi)
    expect(report.mechanism.cylinderLength).toBeGreaterThan(0)
    expect(report.mechanism.cylinderCircumference).toBeGreaterThan(0)
    expect(report.mechanism.requiredLaneSpan).toBeLessThanOrEqual(report.mechanism.availableLaneSpan)
    expect(report.mechanism.minimumPinArcSpacing).toBeGreaterThan(0)
  })

  it('captures range and same-lane spacing pressure from the benchmark set', () => {
    expect(report.issueCounts.range).toBeGreaterThan(0)
    expect(report.issueCounts['pin-spacing'] + report.issueCounts.density).toBeGreaterThan(0)
    expect(report.fitChangeCounts.octave + report.fitChangeCounts.nearest).toBeGreaterThan(0)
    expect(report.fitChangeCounts.remove).toBeGreaterThan(0)
  })

  it('shows Auto Fit can make the full deterministic tune set mechanically compilable', () => {
    expect(report.playableAfterFit).toBe(report.benchmarkCases)
  })

  it('formats a stable human-readable requirement summary', () => {
    const markdown = formatMechanismRequirementReport(report)
    expect(markdown).toContain('# Music Box Mechanism Requirement Report')
    expect(markdown).toContain('## Current mechanism envelope')
    expect(markdown).toContain('## Benchmark pressure')
    expect(markdown).toContain(`Benchmark cases: ${BENCHMARK_TUNE_CASES.length}`)
  })
})
