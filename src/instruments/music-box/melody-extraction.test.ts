import { describe, expect, it } from 'vitest'
import { extractMonophonicNotes, extractedNotesToTuneDocument, frequencyToMidi } from './melody-extraction'

function sine(frequency: number, seconds: number, sampleRate = 48_000, phaseOffset = 0): Float32Array {
  const length = Math.round(seconds * sampleRate)
  const output = new Float32Array(length)
  for (let i = 0; i < length; i += 1) output[i] = Math.sin(2 * Math.PI * frequency * (i / sampleRate) + phaseOffset) * 0.7
  return output
}

function silence(seconds: number, sampleRate = 48_000): Float32Array {
  return new Float32Array(Math.round(seconds * sampleRate))
}

function join(...parts: Float32Array[]): Float32Array {
  const output = new Float32Array(parts.reduce((length, part) => length + part.length, 0))
  let offset = 0
  for (const part of parts) {
    output.set(part, offset)
    offset += part.length
  }
  return output
}

describe('monophonic melody extraction', () => {
  it('maps concert A to MIDI A4', () => {
    expect(frequencyToMidi(440)).toBe(69)
  })

  it('ignores silence', () => {
    expect(extractMonophonicNotes(silence(0.5), 48_000)).toEqual([])
  })

  it('detects stable synthetic notes separated by silence', () => {
    const sampleRate = 48_000
    const samples = join(
      silence(0.12, sampleRate),
      sine(440, 0.45, sampleRate),
      silence(0.14, sampleRate),
      sine(523.251, 0.45, sampleRate),
      silence(0.12, sampleRate),
    )
    const notes = extractMonophonicNotes(samples, sampleRate)
    expect(notes.length).toBeGreaterThanOrEqual(2)
    expect(notes[0].pitch).toBe(69)
    expect(notes.at(-1)?.pitch).toBe(72)
  })

  it('converts extracted timing into an editable TuneDocument', () => {
    const document = extractedNotesToTuneDocument([
      { pitch: 60, startSeconds: 0, durationSeconds: 0.5 },
      { pitch: 64, startSeconds: 0.5, durationSeconds: 0.5 },
    ], 120)
    expect(document.notes.map((note) => note.pitch)).toEqual([60, 64])
    expect(document.notes.map((note) => note.startBeat)).toEqual([0, 1])
    expect(document.lengthBeats).toBe(2)
  })
})
