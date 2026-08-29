import { describe, expect, it } from 'vitest'
import { midiToHz, MUSIC_BOX_PARTIALS, MusicBoxAudio } from './audio'

describe('music box synthesis model', () => {
  it('uses concert A at MIDI note 69', () => {
    expect(midiToHz(69)).toBeCloseTo(440, 10)
  })

  it('keeps higher partials quieter and shorter than the fundamental', () => {
    const [fundamental, ...partials] = MUSIC_BOX_PARTIALS
    for (const partial of partials) {
      expect(partial.gain).toBeLessThan(fundamental.gain)
      expect(partial.decay).toBeLessThan(fundamental.decay)
    }
  })

  it('contains inharmonic upper partials rather than a pure sine-only voice', () => {
    expect(MUSIC_BOX_PARTIALS.length).toBeGreaterThan(1)
    expect(MUSIC_BOX_PARTIALS.some((partial) => !Number.isInteger(partial.ratio))).toBe(true)
  })

  it('never creates or resumes an audio context from a mechanical release', () => {
    const audio = new MusicBoxAudio()
    expect(audio.pluck(69)).toBe(false)
  })
})
