import { describe, expect, it } from 'vitest'
import { DEFAULT_MUSIC_BOX_CONFIG, compileTune } from './mechanism'
import { tuneDocumentToNoteEvents, validateTuneDocument } from './tune-document'
import { DEFAULT_TUNE_ID, TUNE_PRESETS, getTunePreset } from './tunes'

describe('music-box tune presets', () => {
  it('provides three public-domain demo melodies with localized titles', () => {
    expect(TUNE_PRESETS).toHaveLength(3)
    for (const preset of TUNE_PRESETS) {
      expect(preset.publicDomain).toBe(true)
      expect(preset.title.en.length).toBeGreaterThan(0)
      expect(preset.title.ja.length).toBeGreaterThan(0)
      expect(preset.document.notes.length).toBeGreaterThan(8)
      expect(preset.attribution.length).toBeGreaterThan(0)
    }
  })

  it('backs every preset with a valid TuneDocument and derives mechanical events from it', () => {
    for (const preset of TUNE_PRESETS) {
      expect(validateTuneDocument(preset.document)).toEqual([])
      expect(preset.document.id).toBe(preset.id)
      expect(preset.events).toEqual(tuneDocumentToNoteEvents(preset.document))
    }
  })

  it('keeps every preset inside the current comb note set and one cylinder revolution', () => {
    for (const preset of TUNE_PRESETS) {
      for (const event of preset.events) {
        expect(DEFAULT_MUSIC_BOX_CONFIG.notes).toContain(event.note)
        expect(event.start).toBeGreaterThanOrEqual(0)
        expect(event.start).toBeLessThan(1)
      }
      expect(compileTune(preset.events, DEFAULT_MUSIC_BOX_CONFIG)).toHaveLength(preset.events.length)
    }
  })

  it('falls back to the default tune for an unknown id', () => {
    expect(getTunePreset('missing').id).toBe(DEFAULT_TUNE_ID)
  })
})
