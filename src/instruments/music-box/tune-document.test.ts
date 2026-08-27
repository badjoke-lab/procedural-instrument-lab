import { describe, expect, it } from 'vitest'
import {
  createSequenceTuneDocument,
  tuneDocumentToNoteEvents,
  validateTuneDocument,
  type TuneDocument,
} from './tune-document'

describe('TuneDocument', () => {
  it('converts an editable beat timeline into normalized mechanical note events', () => {
    const document = createSequenceTuneDocument({
      id: 'example',
      title: 'Example',
      pitches: [60, 64, 67, 72],
      tempoBpm: 120,
    })

    expect(document.version).toBe(1)
    expect(document.lengthBeats).toBe(4)
    expect(document.notes.map((note) => note.startBeat)).toEqual([0, 1, 2, 3])
    expect(tuneDocumentToNoteEvents(document)).toEqual([
      { note: 60, start: 0 },
      { note: 64, start: 0.25 },
      { note: 67, start: 0.5 },
      { note: 72, start: 0.75 },
    ])
  })

  it('keeps duration in editable data while mechanical pin compilation uses note onset', () => {
    const document: TuneDocument = {
      version: 1,
      id: 'duration-test',
      title: 'Duration test',
      tempoBpm: 90,
      lengthBeats: 4,
      notes: [
        { id: 'n1', pitch: 60, startBeat: 0, durationBeats: 0.5 },
        { id: 'n2', pitch: 64, startBeat: 2, durationBeats: 1.5 },
      ],
    }

    expect(validateTuneDocument(document)).toEqual([])
    expect(tuneDocumentToNoteEvents(document)).toEqual([
      { note: 60, start: 0 },
      { note: 64, start: 0.5 },
    ])
  })

  it('rejects invalid timelines before they reach the mechanical compiler', () => {
    const document: TuneDocument = {
      version: 1,
      id: 'bad',
      title: 'Bad',
      tempoBpm: 0,
      lengthBeats: 4,
      notes: [
        { id: 'same', pitch: 60, startBeat: 0, durationBeats: 1 },
        { id: 'same', pitch: 200, startBeat: 3.5, durationBeats: 1 },
      ],
    }

    const issues = validateTuneDocument(document)
    expect(issues).toContain('tempoBpm must be positive')
    expect(issues).toContain('duplicate note id: same')
    expect(issues).toContain('invalid MIDI pitch: 200')
    expect(issues).toContain('note ends outside document: same')
  })
})
