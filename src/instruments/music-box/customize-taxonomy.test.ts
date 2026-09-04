import { describe, expect, it } from 'vitest'
import {
  controlsForCustomizeSection,
  MUSIC_BOX_CUSTOMIZE_CONTROLS,
  MUSIC_BOX_CUSTOMIZE_SECTIONS,
} from './customize-taxonomy'

describe('Music Box customize taxonomy', () => {
  it('locks the four top-level Customize sections', () => {
    expect(MUSIC_BOX_CUSTOMIZE_SECTIONS.map((section) => section.id)).toEqual([
      'music',
      'mechanism',
      'materials',
      'case',
    ])
  })

  it('assigns every control to exactly one section', () => {
    const ids = MUSIC_BOX_CUSTOMIZE_CONTROLS.map((control) => control.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const control of MUSIC_BOX_CUSTOMIZE_CONTROLS) {
      expect(MUSIC_BOX_CUSTOMIZE_SECTIONS.some((section) => section.id === control.section)).toBe(true)
    }
  })

  it('keeps researched mechanism work separate from materials and case controls', () => {
    expect(controlsForCustomizeSection('mechanism').map((control) => control.id)).toEqual([
      'comb',
      'tines',
      'cylinder',
      'dampers',
      'drive',
    ])
    expect(controlsForCustomizeSection('materials').map((control) => control.id)).toContain('bedplate-material')
    expect(controlsForCustomizeSection('case').map((control) => control.id)).toContain('enclosure')
  })
})
