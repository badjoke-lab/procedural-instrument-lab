import { autoFitMusicBoxTune, type AutoFitChange, type AutoFitOptions } from './auto-fit'
import { BENCHMARK_TUNE_CASES } from './benchmark-tunes'
import { analyzeMusicBoxCompatibility, type CompatibilityIssueKind } from './compatibility'
import { DEFAULT_MUSIC_BOX_CONFIG, type MusicBoxConfig } from './mechanism'

const REPORT_AUTO_FIT_OPTIONS: AutoFitOptions = {
  octaveMoves: true,
  nearestNoteMapping: true,
  quantizeStep: 0.25,
  simplifyDenseRepeats: true,
}

export type MechanismRequirementCase = {
  id: string
  category: string
  sourcePlayable: boolean
  sourceIssues: CompatibilityIssueKind[]
  fittedPlayable: boolean
  fitChanges: AutoFitChange['kind'][]
  sourceNotes: number
  fittedNotes: number
}

export type MechanismRequirementReport = {
  benchmarkCases: number
  playableWithoutFit: number
  blockedWithoutFit: number
  playableAfterFit: number
  issueCounts: Record<CompatibilityIssueKind, number>
  fitChangeCounts: Record<AutoFitChange['kind'], number>
  mechanism: {
    combNotes: number
    lowestMidi: number
    highestMidi: number
    cylinderRadius: number
    cylinderLength: number
    cylinderCircumference: number
    tineSpacing: number
    pinRadius: number
    minimumPinArcSpacing: number
    availableLaneSpan: number
    requiredLaneSpan: number
  }
  cases: MechanismRequirementCase[]
}

function countIssueKinds(kinds: CompatibilityIssueKind[]) {
  return kinds.reduce<Record<CompatibilityIssueKind, number>>(
    (counts, kind) => ({ ...counts, [kind]: counts[kind] + 1 }),
    { range: 0, simultaneous: 0, density: 0, 'pin-spacing': 0 },
  )
}

function countFitChanges(changes: AutoFitChange[]) {
  return changes.reduce<Record<AutoFitChange['kind'], number>>(
    (counts, change) => ({ ...counts, [change.kind]: counts[change.kind] + 1 }),
    { octave: 0, nearest: 0, quantize: 0, remove: 0 },
  )
}

export function createMechanismRequirementReport(
  config: MusicBoxConfig = DEFAULT_MUSIC_BOX_CONFIG,
): MechanismRequirementReport {
  const cases = BENCHMARK_TUNE_CASES.map<MechanismRequirementCase>((fixture) => {
    const sourceCompatibility = analyzeMusicBoxCompatibility(fixture.document, config)
    const fit = autoFitMusicBoxTune(fixture.document, REPORT_AUTO_FIT_OPTIONS, config)
    return {
      id: fixture.id,
      category: fixture.category,
      sourcePlayable: sourceCompatibility.playable,
      sourceIssues: [...new Set(sourceCompatibility.issues.map((issue) => issue.kind))],
      fittedPlayable: fit.compatibility.playable,
      fitChanges: fit.changes.map((change) => change.kind),
      sourceNotes: fixture.document.notes.length,
      fittedNotes: fit.document.notes.length,
    }
  })

  const issueCounts = cases.reduce(
    (totals, entry) => {
      const counts = countIssueKinds(entry.sourceIssues)
      return {
        range: totals.range + counts.range,
        simultaneous: totals.simultaneous + counts.simultaneous,
        density: totals.density + counts.density,
        'pin-spacing': totals['pin-spacing'] + counts['pin-spacing'],
      }
    },
    { range: 0, simultaneous: 0, density: 0, 'pin-spacing': 0 },
  )

  const fitChangeCounts = BENCHMARK_TUNE_CASES.reduce(
    (totals, fixture) => {
      const counts = countFitChanges(autoFitMusicBoxTune(fixture.document, REPORT_AUTO_FIT_OPTIONS, config).changes)
      return {
        octave: totals.octave + counts.octave,
        nearest: totals.nearest + counts.nearest,
        quantize: totals.quantize + counts.quantize,
        remove: totals.remove + counts.remove,
      }
    },
    { octave: 0, nearest: 0, quantize: 0, remove: 0 },
  )

  const circumference = Math.PI * 2 * config.cylinderRadius
  const requiredLaneSpan = Math.max(0, config.notes.length - 1) * config.tineSpacing + config.pinRadius * 2
  return {
    benchmarkCases: cases.length,
    playableWithoutFit: cases.filter((entry) => entry.sourcePlayable).length,
    blockedWithoutFit: cases.filter((entry) => !entry.sourcePlayable).length,
    playableAfterFit: cases.filter((entry) => entry.fittedPlayable).length,
    issueCounts,
    fitChangeCounts,
    mechanism: {
      combNotes: config.notes.length,
      lowestMidi: Math.min(...config.notes),
      highestMidi: Math.max(...config.notes),
      cylinderRadius: config.cylinderRadius,
      cylinderLength: config.cylinderLength,
      cylinderCircumference: circumference,
      tineSpacing: config.tineSpacing,
      pinRadius: config.pinRadius,
      minimumPinArcSpacing: config.pinRadius * 2.5,
      availableLaneSpan: config.cylinderLength,
      requiredLaneSpan,
    },
    cases,
  }
}

export function formatMechanismRequirementReport(report: MechanismRequirementReport) {
  const lines = [
    '# Music Box Mechanism Requirement Report',
    '',
    `Benchmark cases: ${report.benchmarkCases}`,
    `Playable without Auto Fit: ${report.playableWithoutFit}`,
    `Blocked without Auto Fit: ${report.blockedWithoutFit}`,
    `Playable after Auto Fit: ${report.playableAfterFit}`,
    '',
    '## Current mechanism envelope',
    '',
    `- Comb: ${report.mechanism.combNotes} notes (MIDI ${report.mechanism.lowestMidi}-${report.mechanism.highestMidi})`,
    `- Cylinder: radius ${report.mechanism.cylinderRadius}, length ${report.mechanism.cylinderLength}, circumference ${report.mechanism.cylinderCircumference.toFixed(3)}`,
    `- Lane span: ${report.mechanism.requiredLaneSpan.toFixed(3)} required / ${report.mechanism.availableLaneSpan.toFixed(3)} available`,
    `- Pin radius: ${report.mechanism.pinRadius}; minimum same-lane arc spacing ${report.mechanism.minimumPinArcSpacing.toFixed(3)}`,
    '',
    '## Benchmark pressure',
    '',
    `- Range cases: ${report.issueCounts.range}`,
    `- Simultaneous-note review cases: ${report.issueCounts.simultaneous}`,
    `- Density cases: ${report.issueCounts.density}`,
    `- Pin-spacing cases: ${report.issueCounts['pin-spacing']}`,
    `- Auto Fit octave moves: ${report.fitChangeCounts.octave}`,
    `- Auto Fit nearest-note mappings: ${report.fitChangeCounts.nearest}`,
    `- Auto Fit quantizations: ${report.fitChangeCounts.quantize}`,
    `- Auto Fit removed notes for spacing: ${report.fitChangeCounts.remove}`,
  ]
  return `${lines.join('\n')}\n`
}
