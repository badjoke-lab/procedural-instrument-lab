import { describe, expect, it } from 'vitest'
import { createSequenceTuneDocument } from './tune-document'
import { recordScreenKeyboardNote, secondsToBeats } from './screen-keyboard-model'

describe('screen keyboard recording model', () => {
  it('converts seconds to beats using TuneDocument tempo', () => {
    expect(secondsToBeats(1.5, 120)).toBe(3)
  })

  it('records a performed note into TuneDocument with quarter-beat quantization', () => {
    const document = createSequenceTuneDocument({ id: 'test', title: 'Test', pitches: [60, 62], tempoBpm: 120 })
    const next = recordScreenKeyboardNote(document, {
      pitch: 67,
      sessionStartedAtSeconds: 10,
      keyStartedAtSeconds: 10.61,
      keyEndedAtSeconds: 11.12,
    })

    const added = next.notes.find((note) => note.pitch === 67)
    expect(added).toMatchObject({ startBeat: 1.25, durationBeats: 1 })
  })

  it('extends the document when a recorded performance passes the existing end', () => {
    const document = createSequenceTuneDocument({ id: 'short', title: 'Short', pitches: [60], tempoBpm: 60 })
    const next = recordScreenKeyboardNote(document, {
      pitch: 64,
      sessionStartedAtSeconds: 0,
      keyStartedAtSeconds: 1.8,
      keyEndedAtSeconds: 2.6,
    })

    expect(next.lengthBeats).toBe(3)
    expect(next.notes.find((note) => note.pitch === 64)).toMatchObject({ startBeat: 1.75, durationBeats: 0.75 })
  })

  it('rejects impossible timing', () => {
    const document = createSequenceTuneDocument({ id: 'test', title: 'Test', pitches: [60] })
    expect(() => recordScreenKeyboardNote(document, {
      pitch: 60,
      sessionStartedAtSeconds: 2,
      keyStartedAtSeconds: 1,
      keyEndedAtSeconds: 3,
    })).toThrow(/precedes recording session/)
  })
})
