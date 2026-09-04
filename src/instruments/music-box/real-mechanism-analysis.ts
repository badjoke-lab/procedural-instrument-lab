import type { MechanismRequirementReport } from './mechanism-requirement-report'

export type RealMechanismProfile = {
  id: string
  label: string
  playingCombNotes: number
  pinsPerCylinderAtLeast?: number
  melodiesPerCylinder?: number
  cycleSeconds?: number
  powerReserveMinutes?: number
  evidence: string
}

export const REAL_MECHANISM_PROFILES: RealMechanismProfile[] = [
  {
    id: 'reuge-ch-3-72',
    label: 'Reuge CH 3.72',
    playingCombNotes: 72,
    pinsPerCylinderAtLeast: 1200,
    melodiesPerCylinder: 3,
    cycleSeconds: 36,
    powerReserveMinutes: 16,
    evidence: 'docs/REAL_CYLINDER_MUSIC_BOX_RESEARCH.md#current-72-note-swiss-cylinder-movement',
  },
  {
    id: 'jaccard-1888-92-playing',
    label: 'Eugène Félix Jaccard (1888)',
    playingCombNotes: 92,
    evidence: 'docs/REAL_CYLINDER_MUSIC_BOX_RESEARCH.md#historical-comb-scale-and-interchangeable-cylinder-drive',
  },
]

export type RealMechanismComparison = {
  profileId: string
  profileLabel: string
  currentCombNotes: number
  candidateCombNotes: number
  combNoteHeadroom: number
  benchmarkRangeCases: number
  benchmarkSimultaneousCases: number
  benchmarkDensityCases: number
  benchmarkPinSpacingCases: number
  pinCapacityEvidence: number | null
  unresolved: string[]
}

/**
 * Compare benchmark pressure with facts that are actually evidenced for a real mechanism.
 * This deliberately does not manufacture pitch sets, cylinder dimensions, tine spacing,
 * pin radius or contact geometry when the source material does not specify them.
 */
export function compareBenchmarkWithRealMechanism(
  report: MechanismRequirementReport,
  profile: RealMechanismProfile,
): RealMechanismComparison {
  const unresolved = [
    'playable pitch set',
    'cylinder dimensions',
    'tine spacing',
    'pin geometry and minimum arc spacing',
    'contact/release geometry',
  ]

  return {
    profileId: profile.id,
    profileLabel: profile.label,
    currentCombNotes: report.mechanism.combNotes,
    candidateCombNotes: profile.playingCombNotes,
    combNoteHeadroom: profile.playingCombNotes - report.mechanism.combNotes,
    benchmarkRangeCases: report.issueCounts.range,
    benchmarkSimultaneousCases: report.issueCounts.simultaneous,
    benchmarkDensityCases: report.issueCounts.density,
    benchmarkPinSpacingCases: report.issueCounts['pin-spacing'],
    pinCapacityEvidence: profile.pinsPerCylinderAtLeast ?? null,
    unresolved,
  }
}

export function createRealMechanismComparisons(report: MechanismRequirementReport) {
  return REAL_MECHANISM_PROFILES.map((profile) => compareBenchmarkWithRealMechanism(report, profile))
}
