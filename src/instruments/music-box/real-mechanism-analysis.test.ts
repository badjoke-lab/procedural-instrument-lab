import { describe, expect, it } from 'vitest'
import { createMechanismRequirementReport } from './mechanism-requirement-report'
import { compareBenchmarkWithRealMechanism, REAL_MECHANISM_PROFILES } from './real-mechanism-analysis'

describe('benchmark x real mechanism analysis', () => {
  it('shows evidence-backed comb headroom without pretending unknown geometry is solved', () => {
    const report = createMechanismRequirementReport()
    const reuge = REAL_MECHANISM_PROFILES.find((profile) => profile.id === 'reuge-ch-3-72')
    expect(reuge).toBeDefined()

    const comparison = compareBenchmarkWithRealMechanism(report, reuge!)
    expect(comparison.currentCombNotes).toBe(8)
    expect(comparison.candidateCombNotes).toBe(72)
    expect(comparison.combNoteHeadroom).toBe(64)
    expect(comparison.pinCapacityEvidence).toBe(1200)
    expect(comparison.benchmarkRangeCases).toBe(report.issueCounts.range)
    expect(comparison.unresolved).toContain('playable pitch set')
    expect(comparison.unresolved).toContain('contact/release geometry')
  })

  it('keeps historical 92-playing-tooth evidence distinct from unproven pin capacity', () => {
    const report = createMechanismRequirementReport()
    const jaccard = REAL_MECHANISM_PROFILES.find((profile) => profile.id === 'jaccard-1888-92-playing')
    expect(jaccard).toBeDefined()

    const comparison = compareBenchmarkWithRealMechanism(report, jaccard!)
    expect(comparison.candidateCombNotes).toBe(92)
    expect(comparison.combNoteHeadroom).toBe(84)
    expect(comparison.pinCapacityEvidence).toBeNull()
  })
})
