import { describe, expect, it } from 'vitest'
import { createSequenceTuneDocument, type TuneDocument } from './tune-document'
import { compileTuneDocumentToCylinder } from './tune-cylinder'

describe('TuneDocument -> cylinder', () => {
  it('compiles every accepted playable note into one visible mechanical pin', () => {
    const document = createSequenceTuneDocument({
      id: 'accepted-fit',
      title: 'Accepted fit',
      pitches: [60, 64, 67, 72],
    })

    const result = compileTuneDocumentToCylinder(document)
    expect(result.documentId).toBe(document.id)
    expect(result.compatibility.playable).toBe(true)
    expect(result.pins).toHaveLength(document.notes.length)
    expect(result.pins.map((pin) => pin.noteIndex)).toEqual([0, 2, 4, 7])
  })

  it('fails closed instead of silently dropping an out-of-range accepted note', () => {
    const document: TuneDocument = {
      version: 1,
      id: 'needs-fit',
      title: 'Needs fit',
      tempoBpm: 120,
      lengthBeats: 4,
      notes: [
        { id: 'low-b', pitch: 59, startBeat: 0, durationBeats: 1 },
        { id: 'c4', pitch: 60, startBeat: 2, durationBeats: 1 },
      ],
    }

    expect(() => compileTuneDocumentToCylinder(document)).toThrow(/range/)
  })

  it('fails closed on same-lane pin-spacing conflicts before mechanical compilation', () => {
    const document: TuneDocument = {
      version: 1,
      id: 'dense-repeat',
      title: 'Dense repeat',
      tempoBpm: 120,
      lengthBeats: 4,
      notes: [
        { id: 'a', pitch: 60, startBeat: 0, durationBeats: 0.25 },
        { id: 'b', pitch: 60, startBeat: 0.01, durationBeats: 0.25 },
      ],
    }

    expect(() => compileTuneDocumentToCylinder(document)).toThrow(/pin-spacing/)
  })
})
