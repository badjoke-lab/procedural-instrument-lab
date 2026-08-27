import { describe, expect, it } from 'vitest'
import { importMidi } from './midi-import'

function midi(track: number[], division = 96): Uint8Array {
  const length = track.length
  return new Uint8Array([
    0x4d,0x54,0x68,0x64, 0,0,0,6, 0,0, 0,1, division >> 8, division & 0xff,
    0x4d,0x54,0x72,0x6b, (length >>> 24)&255,(length >>> 16)&255,(length >>> 8)&255,length&255,
    ...track,
  ])
}

describe('importMidi', () => {
  it('imports note timing and tempo into TuneDocument', () => {
    const result = importMidi(midi([
      0x00,0xff,0x51,0x03,0x07,0xa1,0x20,
      0x00,0x90,60,100,
      0x60,0x80,60,0,
      0x00,0xff,0x2f,0x00,
    ]), 'Fixture')
    expect(result.document.title).toBe('Fixture')
    expect(result.document.tempoBpm).toBe(120)
    expect(result.document.notes).toEqual([{ id: 'midi-note-1', pitch: 60, startBeat: 0, durationBeats: 1 }])
    expect(result.warnings).toEqual([])
  })

  it('preserves pitches outside the current comb for later Auto Fit', () => {
    const result = importMidi(midi([0x00,0x90,84,100, 0x60,0x90,84,0, 0x00,0xff,0x2f,0x00]))
    expect(result.document.notes[0].pitch).toBe(84)
  })

  it('rejects SMPTE division', () => {
    expect(() => importMidi(midi([0x00,0xff,0x2f,0x00], 0xe728))).toThrow(/SMPTE/)
  })
})
