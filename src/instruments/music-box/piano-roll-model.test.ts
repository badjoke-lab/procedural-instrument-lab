import { describe, expect, it } from 'vitest'
import { createSequenceTuneDocument } from './tune-document'
import {
  addPianoRollNote,
  cloneTuneDocument,
  deletePianoRollNote,
  quantizeBeat,
  quantizePianoRollNote,
  updatePianoRollNote,
} from './piano-roll-model'

function draft() {
  return cloneTuneDocument(createSequenceTuneDocument({
    id: 'source',
    title: 'Source',
    pitches: [60, 64, 67, 72],
  }), 'draft')
}

describe('piano roll editing model', () => {
  it('clones a TuneDocument without sharing mutable note objects', () => {
    const source = createSequenceTuneDocument({ id: 'source', title: 'Source', pitches: [60, 62] })
    const copy = cloneTuneDocument(source, 'copy')
    expect(copy.id).toBe('copy')
    expect(copy.notes).not.toBe(source.notes)
    expect(copy.notes[0]).not.toBe(source.notes[0])
  })

  it('adds, updates and deletes notes while preserving a valid document', () => {
    let current = draft()
    current = addPianoRollNote(current, { pitch: 69, startBeat: 0.5, durationBeats: 0.5 })
    const added = current.notes.find((note) => note.pitch === 69)
    expect(added).toBeTruthy()

    current = updatePianoRollNote(current, added!.id, { pitch: 71, startBeat: 1.5, durationBeats: 0.25 })
    expect(current.notes.find((note) => note.id === added!.id)).toMatchObject({ pitch: 71, startBeat: 1.5, durationBeats: 0.25 })

    current = deletePianoRollNote(current, added!.id)
    expect(current.notes.some((note) => note.id === added!.id)).toBe(false)
  })

  it('quantizes timing without creating zero-length notes', () => {
    expect(quantizeBeat(1.13, 0.25)).toBe(1.25)
    let current = addPianoRollNote(draft(), { pitch: 69, startBeat: 1.13, durationBeats: 0.12 })
    const added = current.notes.find((note) => note.pitch === 69)!
    current = quantizePianoRollNote(current, added.id, 0.25)
    expect(current.notes.find((note) => note.id === added.id)).toMatchObject({ startBeat: 1.25, durationBeats: 0.25 })
  })

  it('rejects edits that would leave the TuneDocument invalid', () => {
    const current = draft()
    const noteId = current.notes[0].id
    expect(() => updatePianoRollNote(current, noteId, { pitch: 200 })).toThrow(/Invalid TuneDocument/)
    expect(() => updatePianoRollNote(current, noteId, { startBeat: current.lengthBeats })).toThrow(/Invalid TuneDocument/)
  })
})
