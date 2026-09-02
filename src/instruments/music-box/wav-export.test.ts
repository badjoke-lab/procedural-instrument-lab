import { describe, expect, it } from 'vitest'
import { DEFAULT_MUSIC_BOX_CONFIG } from './mechanism'
import { createSequenceTuneDocument } from './tune-document'
import { createMusicBoxWavExport, encodeMonoPcm16Wav } from './wav-export'

function ascii(bytes: Uint8Array, offset: number, length: number) {
  return String.fromCharCode(...bytes.slice(offset, offset + length))
}

describe('Music Box WAV export', () => {
  it('encodes a standards-shaped mono PCM16 WAV header', () => {
    const bytes = encodeMonoPcm16Wav(new Float32Array([0, 1, -1]), 8_000)
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)

    expect(ascii(bytes, 0, 4)).toBe('RIFF')
    expect(ascii(bytes, 8, 4)).toBe('WAVE')
    expect(ascii(bytes, 12, 4)).toBe('fmt ')
    expect(ascii(bytes, 36, 4)).toBe('data')
    expect(view.getUint16(20, true)).toBe(1)
    expect(view.getUint16(22, true)).toBe(1)
    expect(view.getUint32(24, true)).toBe(8_000)
    expect(view.getUint16(34, true)).toBe(16)
    expect(view.getUint32(40, true)).toBe(6)
    expect(view.getInt16(44, true)).toBe(0)
    expect(view.getInt16(46, true)).toBe(32_767)
    expect(view.getInt16(48, true)).toBe(-32_768)
  })

  it('exports mechanically rendered audio with a stable WAV filename', () => {
    const tune = createSequenceTuneDocument({ id: 'wav-export', title: 'My Tune', pitches: [60, 64, 67], tempoBpm: 120 })
    const exported = createMusicBoxWavExport(tune, DEFAULT_MUSIC_BOX_CONFIG, 8_000)

    expect(exported.filename).toBe('My Tune.wav')
    expect(exported.sampleRate).toBe(8_000)
    expect(exported.durationSeconds).toBeGreaterThan(0)
    expect(exported.bytes.length).toBeGreaterThan(44)
    expect(ascii(exported.bytes, 0, 4)).toBe('RIFF')
  })

  it('sanitizes filesystem-hostile title characters', () => {
    const tune = createSequenceTuneDocument({ id: 'wav-name', title: 'A/B:C*D?', pitches: [60] })
    expect(createMusicBoxWavExport(tune, DEFAULT_MUSIC_BOX_CONFIG, 8_000).filename).toBe('A-B-C-D-.wav')
  })
})
