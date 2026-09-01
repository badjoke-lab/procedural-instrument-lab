import { describe, expect, it } from 'vitest'
import { extractMonophonicNotes } from './melody-extraction'
import { renderSyntheticAudio, SYNTHETIC_AUDIO_FIXTURES } from './synthetic-audio-fixtures'

describe('synthetic audio benchmark fixtures', () => {
  it('keeps fixture ids unique and deterministic', () => {
    expect(new Set(SYNTHETIC_AUDIO_FIXTURES.map((fixture) => fixture.id)).size).toBe(SYNTHETIC_AUDIO_FIXTURES.length)
    for (const fixture of SYNTHETIC_AUDIO_FIXTURES) {
      expect(renderSyntheticAudio(fixture)).toEqual(renderSyntheticAudio(fixture))
    }
  })

  it.each(SYNTHETIC_AUDIO_FIXTURES)('$id recovers expected monophonic pitches', (fixture) => {
    const extracted = extractMonophonicNotes(renderSyntheticAudio(fixture), fixture.sampleRate)
    expect(extracted.map((note) => note.pitch)).toEqual(fixture.notes.map((note) => note.pitch))
  })

  it.each(SYNTHETIC_AUDIO_FIXTURES)('$id keeps onset timing within one analysis frame', (fixture) => {
    const extracted = extractMonophonicNotes(renderSyntheticAudio(fixture), fixture.sampleRate)
    expect(extracted).toHaveLength(fixture.notes.length)
    for (let index = 0; index < extracted.length; index += 1) {
      expect(Math.abs(extracted[index].startSeconds - fixture.notes[index].startSeconds)).toBeLessThanOrEqual(2048 / fixture.sampleRate)
    }
  })

  it('covers clean, noisy and tempo-varied inputs', () => {
    expect(SYNTHETIC_AUDIO_FIXTURES.some((fixture) => fixture.noiseAmplitude === 0)).toBe(true)
    expect(SYNTHETIC_AUDIO_FIXTURES.some((fixture) => fixture.noiseAmplitude > 0)).toBe(true)
    expect(new Set(SYNTHETIC_AUDIO_FIXTURES.map((fixture) => fixture.tempoBpm)).size).toBeGreaterThanOrEqual(3)
  })
})
