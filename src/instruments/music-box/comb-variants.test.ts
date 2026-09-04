import { describe, expect, it } from 'vitest'
import { applyMusicBoxCombVariant, getMusicBoxCombVariant, MUSIC_BOX_COMB_VARIANTS } from './comb-variants'
import { DEFAULT_MUSIC_BOX_CONFIG } from './mechanism'

describe('Music Box comb variants', () => {
  it('keeps the current 8-note prototype selectable and preserves its pitch set', () => {
    const config = applyMusicBoxCombVariant(DEFAULT_MUSIC_BOX_CONFIG, 'prototype-8')
    expect(config.notes).toEqual(DEFAULT_MUSIC_BOX_CONFIG.notes)
    expect(config.notes).not.toBe(DEFAULT_MUSIC_BOX_CONFIG.notes)
  })

  it('records real 72-note and 92-playing references without inventing pitch sets', () => {
    const reuge = getMusicBoxCombVariant('reuge-ch-3-72')
    const jaccard = getMusicBoxCombVariant('jaccard-1888-92-playing')

    expect(reuge.noteCount).toBe(72)
    expect(reuge.playableNotes).toBeNull()
    expect(reuge.selectable).toBe(false)
    expect(jaccard.noteCount).toBe(92)
    expect(jaccard.playableNotes).toBeNull()
    expect(MUSIC_BOX_COMB_VARIANTS.filter((entry) => entry.selectable)).toHaveLength(1)
  })

  it('fails closed when a real reference lacks evidenced playable geometry', () => {
    expect(() => applyMusicBoxCombVariant(DEFAULT_MUSIC_BOX_CONFIG, 'reuge-ch-3-72')).toThrow(/reference-only/)
    expect(() => applyMusicBoxCombVariant(DEFAULT_MUSIC_BOX_CONFIG, 'jaccard-1888-92-playing')).toThrow(/reference-only/)
  })

  it('rejects unknown variants', () => {
    expect(() => getMusicBoxCombVariant('unknown')).toThrow(/Unknown Music Box comb variant/)
  })
})
