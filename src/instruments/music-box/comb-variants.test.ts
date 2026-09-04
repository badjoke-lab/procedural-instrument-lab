import { describe, expect, it } from 'vitest'
import {
  applyMusicBoxCombVariant,
  getMusicBoxCombVariant,
  identifyMusicBoxCombVariant,
} from './comb-variants'
import { DEFAULT_MUSIC_BOX_CONFIG, compileTune, validateMusicBoxConfig } from './mechanism'

describe('Music Box comb variants', () => {
  it('keeps the current eight-note prototype as the baseline variant', () => {
    expect(identifyMusicBoxCombVariant(DEFAULT_MUSIC_BOX_CONFIG)).toBe('prototype-8')
  })

  it('applies the evidence-backed 18-note count without claiming a historical pitch layout', () => {
    const variant = getMusicBoxCombVariant('sankyo-18-sim')
    const config = applyMusicBoxCombVariant(DEFAULT_MUSIC_BOX_CONFIG, variant.id)

    expect(variant.noteCount).toBe(18)
    expect(variant.pitchLayoutClaim).toBe('project-defined')
    expect(variant.evidence).toContain('historical-18-note-sankyo-movement')
    expect(config.notes).toHaveLength(18)
    expect(config.notes[0]).toBe(60)
    expect(config.notes[17]).toBe(77)
    expect(validateMusicBoxConfig(config)).toEqual([])
    expect(identifyMusicBoxCombVariant(config)).toBe('sankyo-18-sim')
  })

  it('compiles notes from the expanded simulated comb through the normal cylinder path', () => {
    const config = applyMusicBoxCombVariant(DEFAULT_MUSIC_BOX_CONFIG, 'sankyo-18-sim')
    const pins = compileTune([{ note: 77, start: 0.5 }], config)

    expect(pins).toHaveLength(1)
    expect(pins[0].noteIndex).toBe(17)
    expect(Math.abs(pins[0].axialPosition)).toBeLessThan(config.cylinderLength / 2)
  })
})
