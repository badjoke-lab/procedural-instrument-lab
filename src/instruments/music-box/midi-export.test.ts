import { describe, expect, it } from 'vitest'
import { importMidi } from './midi-import'
import { exportMidi, midiExportFilename } from './midi-export'
import type { TuneDocument } from './tune-document'

const document: TuneDocument = {
  version: 1,
  id: 'round-trip',
  title: 'Round Trip / Tune',
  tempoBpm: 120,
  lengthBeats: 4,
  notes: [
    { id: 'n1', pitch: 60, startBeat: 0, durationBeats: 0.5 },
    { id: 'n2', pitch: 73, startBeat: 1.25, durationBeats: 1 },
    { id: 'n3', pitch: 67, startBeat: 2.5, durationBeats: 0.25 },
  ],
}

describe('MIDI export', () => {
  it('writes a format-0 MIDI file that round-trips pitch, beats, duration and tempo', () => {
    const bytes = exportMidi(document)
    expect(String.fromCharCode(...bytes.slice(0, 4))).toBe('MThd')

    const imported = importMidi(bytes, 'Round trip')
    expect(imported.document.tempoBpm).toBeCloseTo(120, 4)
    expect(imported.document.notes.map((note) => note.pitch)).toEqual([60, 73, 67])
    expect(imported.document.notes.map((note) => note.startBeat)).toEqual([0, 1.25, 2.5])
    expect(imported.document.notes.map((note) => note.durationBeats)).toEqual([0.5, 1, 0.25])
  })

  it('keeps pitches outside the current physical comb in exported MIDI', () => {
    const imported = importMidi(exportMidi(document), 'Round trip')
    expect(imported.document.notes.some((note) => note.pitch === 73)).toBe(true)
  })

  it('creates a filesystem-friendly .mid filename', () => {
    expect(midiExportFilename(document.title)).toBe('Round Trip - Tune.mid')
    expect(midiExportFilename('   ')).toBe('music-box-tune.mid')
  })
})
