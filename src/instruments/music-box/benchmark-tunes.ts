import type { CompatibilityIssueKind } from './compatibility'
import type { TuneDocument, TuneDocumentNote } from './tune-document'

export type BenchmarkTuneCase = {
  id: string
  category: 'range' | 'timing' | 'density' | 'simultaneous' | 'length' | 'baseline'
  document: TuneDocument
  expectedPlayable: boolean
  expectedIssueKinds: CompatibilityIssueKind[]
}

function documentOf(id: string, lengthBeats: number, notes: Array<[number, number, number]>): TuneDocument {
  const tuneNotes: TuneDocumentNote[] = notes.map(([pitch, startBeat, durationBeats], index) => ({
    id: `${id}-n${index + 1}`,
    pitch,
    startBeat,
    durationBeats,
  }))

  return {
    version: 1,
    id,
    title: id,
    tempoBpm: 96,
    lengthBeats,
    notes: tuneNotes,
  }
}

export const BENCHMARK_TUNE_CASES: BenchmarkTuneCase[] = [
  { id: 'baseline-single-c4', category: 'baseline', document: documentOf('baseline-single-c4', 4, [[60, 0, 1]]), expectedPlayable: true, expectedIssueKinds: [] },
  { id: 'baseline-scale', category: 'baseline', document: documentOf('baseline-scale', 8, [[60,0,1],[62,1,1],[64,2,1],[65,3,1],[67,4,1],[69,5,1],[71,6,1],[72,7,1]]), expectedPlayable: true, expectedIssueKinds: [] },
  { id: 'baseline-reverse-scale', category: 'baseline', document: documentOf('baseline-reverse-scale', 8, [[72,0,1],[71,1,1],[69,2,1],[67,3,1],[65,4,1],[64,5,1],[62,6,1],[60,7,1]]), expectedPlayable: true, expectedIssueKinds: [] },

  { id: 'range-below-comb', category: 'range', document: documentOf('range-below-comb', 4, [[59,0,1],[60,1,1]]), expectedPlayable: false, expectedIssueKinds: ['range'] },
  { id: 'range-above-comb', category: 'range', document: documentOf('range-above-comb', 4, [[72,0,1],[74,1,1]]), expectedPlayable: false, expectedIssueKinds: ['range'] },
  { id: 'range-two-sided', category: 'range', document: documentOf('range-two-sided', 4, [[48,0,1],[60,1,1],[84,2,1]]), expectedPlayable: false, expectedIssueKinds: ['range'] },
  { id: 'range-edge-supported', category: 'range', document: documentOf('range-edge-supported', 4, [[60,0,1],[72,3,1]]), expectedPlayable: true, expectedIssueKinds: [] },

  { id: 'timing-quarter-grid', category: 'timing', document: documentOf('timing-quarter-grid', 4, [[60,0,0.25],[62,0.25,0.25],[64,0.5,0.25],[65,0.75,0.25]]), expectedPlayable: true, expectedIssueKinds: [] },
  { id: 'timing-off-grid', category: 'timing', document: documentOf('timing-off-grid', 4, [[60,0.13,0.37],[64,1.41,0.22],[67,2.87,0.5]]), expectedPlayable: true, expectedIssueKinds: [] },
  { id: 'timing-near-end', category: 'timing', document: documentOf('timing-near-end', 4, [[60,3.75,0.25]]), expectedPlayable: true, expectedIssueKinds: [] },
  { id: 'timing-wrap-safe', category: 'timing', document: documentOf('timing-wrap-safe', 16, [[60,0.1,0.5],[60,15.1,0.5]]), expectedPlayable: true, expectedIssueKinds: [] },

  { id: 'density-tight-repeat', category: 'density', document: documentOf('density-tight-repeat', 4, [[60,0,0.25],[60,0.02,0.25]]), expectedPlayable: false, expectedIssueKinds: ['pin-spacing'] },
  { id: 'density-borderline-repeat', category: 'density', document: documentOf('density-borderline-repeat', 4, [[60,0,0.25],[60,0.06,0.25]]), expectedPlayable: false, expectedIssueKinds: ['density'] },
  { id: 'density-safe-repeat', category: 'density', document: documentOf('density-safe-repeat', 4, [[60,0,0.25],[60,1,0.25]]), expectedPlayable: true, expectedIssueKinds: [] },
  { id: 'density-wrap-collision', category: 'density', document: documentOf('density-wrap-collision', 4, [[60,0.01,0.25],[60,3.99,0.01]]), expectedPlayable: false, expectedIssueKinds: ['pin-spacing'] },

  { id: 'simultaneous-two-note', category: 'simultaneous', document: documentOf('simultaneous-two-note', 4, [[60,0,1],[64,0,1]]), expectedPlayable: true, expectedIssueKinds: ['simultaneous'] },
  { id: 'simultaneous-three-note', category: 'simultaneous', document: documentOf('simultaneous-three-note', 4, [[60,1,1],[64,1,1],[67,1,1]]), expectedPlayable: true, expectedIssueKinds: ['simultaneous'] },
  { id: 'simultaneous-with-range-block', category: 'simultaneous', document: documentOf('simultaneous-with-range-block', 4, [[59,0,1],[60,0,1]]), expectedPlayable: false, expectedIssueKinds: ['range','simultaneous'] },
  { id: 'simultaneous-separated-chords', category: 'simultaneous', document: documentOf('simultaneous-separated-chords', 8, [[60,0,1],[64,0,1],[67,4,1],[72,4,1]]), expectedPlayable: true, expectedIssueKinds: ['simultaneous'] },

  { id: 'length-minimal', category: 'length', document: documentOf('length-minimal', 1, [[60,0,1]]), expectedPlayable: true, expectedIssueKinds: [] },
  { id: 'length-short-four', category: 'length', document: documentOf('length-short-four', 4, [[60,0,0.5],[64,1,0.5],[67,2,0.5],[72,3,0.5]]), expectedPlayable: true, expectedIssueKinds: [] },
  { id: 'length-medium-sixteen', category: 'length', document: documentOf('length-medium-sixteen', 16, Array.from({ length: 16 }, (_, i) => [[60,62,64,65,67,69,71,72][i % 8], i, 0.75] as [number,number,number])), expectedPlayable: true, expectedIssueKinds: [] },
  { id: 'length-long-sixty-four', category: 'length', document: documentOf('length-long-sixty-four', 64, Array.from({ length: 32 }, (_, i) => [[60,64,67,72][i % 4], i * 2, 1] as [number,number,number])), expectedPlayable: true, expectedIssueKinds: [] },
  { id: 'length-long-dense-failure', category: 'length', document: documentOf('length-long-dense-failure', 64, [[60,0,0.25],[60,0.1,0.25], ...Array.from({ length: 20 }, (_, i) => [64 + (i % 2) * 3, 2 + i * 2, 0.5] as [number,number,number])]), expectedPlayable: false, expectedIssueKinds: ['pin-spacing'] },
]
