import { describe, expect, it } from 'vitest'
import { autoFitMusicBoxTune, type AutoFitOptions } from './auto-fit'
import { DEFAULT_MUSIC_BOX_CONFIG } from './mechanism'
import { TUNE_DOCUMENT_VERSION, type TuneDocument } from './tune-document'

const NONE: AutoFitOptions = { octaveMoves: false, nearestNoteMapping: false, quantizeStep: null, simplifyDenseRepeats: false }

function tune(notes: TuneDocument['notes'], lengthBeats = 4): TuneDocument {
  return { version: TUNE_DOCUMENT_VERSION, id: 'auto-fit-source', title: 'Auto Fit Source', tempoBpm: 96, lengthBeats, notes }
}

describe('music-box Auto Fit', () => {
  it('moves out-of-range notes by octaves when their pitch class exists on the comb', () => {
    const source = tune([{ id: 'b3', pitch: 59, startBeat: 0, durationBeats: 0.5 }, { id: 'c6', pitch: 84, startBeat: 1, durationBeats: 0.5 }])
    const result = autoFitMusicBoxTune(source, { ...NONE, octaveMoves: true })
    expect(result.document.notes.map((note) => note.pitch)).toEqual([71, 72])
    expect(result.changes.map((change) => change.kind)).toEqual(['octave', 'octave'])
    expect(result.compatibility.playable).toBe(true)
    expect(source.notes.map((note) => note.pitch)).toEqual([59, 84])
  })

  it('maps remaining pitches to the nearest comb note with a deterministic lower-note tie break', () => {
    const result = autoFitMusicBoxTune(tune([{ id: 'c-sharp', pitch: 61, startBeat: 0, durationBeats: 0.5 }]), { ...NONE, nearestNoteMapping: true })
    expect(result.document.notes[0].pitch).toBe(60)
    expect(result.changes[0]).toMatchObject({ kind: 'nearest', fromPitch: 61, toPitch: 60 })
    expect(result.compatibility.playable).toBe(true)
  })

  it('quantizes start and duration without allowing notes to leave the document', () => {
    const result = autoFitMusicBoxTune(tune([{ id: 'timing', pitch: 60, startBeat: 0.37, durationBeats: 0.38 }, { id: 'ending', pitch: 62, startBeat: 3.82, durationBeats: 0.18 }]), { ...NONE, quantizeStep: 0.25 })
    expect(result.document.notes[0]).toMatchObject({ id: 'timing', startBeat: 0.25, durationBeats: 0.5 })
    expect(result.document.notes[1].startBeat + result.document.notes[1].durationBeats).toBeLessThanOrEqual(4)
    expect(result.changes.filter((change) => change.kind === 'quantize')).toHaveLength(2)
  })

  it('simplifies repeated same-lane pins until the configured spacing becomes playable', () => {
    const source = tune([{ id: 'first', pitch: 60, startBeat: 0, durationBeats: 0.25 }, { id: 'collision', pitch: 60, startBeat: 0.01, durationBeats: 0.25 }, { id: 'later', pitch: 60, startBeat: 4, durationBeats: 0.25 }], 8)
    const result = autoFitMusicBoxTune(source, { ...NONE, simplifyDenseRepeats: true }, DEFAULT_MUSIC_BOX_CONFIG)
    expect(result.document.notes.map((note) => note.id)).toEqual(['first', 'later'])
    expect(result.changes).toContainEqual({ kind: 'remove', noteId: 'collision', pitch: 60, reason: 'pin-spacing' })
    expect(result.compatibility.playable).toBe(true)
    expect(source.notes).toHaveLength(3)
  })

  it('combines transforms into a proposal without changing the source document', () => {
    const source = tune([{ id: 'range', pitch: 59, startBeat: 0.12, durationBeats: 0.31 }, { id: 'c4', pitch: 60, startBeat: 0.12, durationBeats: 0.31 }])
    const snapshot = structuredClone(source)
    const result = autoFitMusicBoxTune(source, { octaveMoves: true, nearestNoteMapping: true, quantizeStep: 0.25, simplifyDenseRepeats: true })
    expect(source).toEqual(snapshot)
    expect(result.sourceDocumentId).toBe(source.id)
    expect(result.document.id).toBe('auto-fit-source-fit')
    expect(result.compatibility.playable).toBe(true)
    expect(result.compatibility.issues.some((issue) => issue.kind === 'simultaneous')).toBe(true)
  })

  it('rejects invalid quantization steps', () => {
    expect(() => autoFitMusicBoxTune(tune([{ id: 'a', pitch: 60, startBeat: 0, durationBeats: 0.5 }]), { ...NONE, quantizeStep: 0 })).toThrow('quantizeStep must be positive')
  })
})
