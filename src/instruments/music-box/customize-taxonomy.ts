export type MusicBoxCustomizeSectionId = 'music' | 'mechanism' | 'materials' | 'case'

export type MusicBoxCustomizeControlStage = 'current' | 'researched' | 'planned'

export type MusicBoxCustomizeControl = {
  id: string
  section: MusicBoxCustomizeSectionId
  stage: MusicBoxCustomizeControlStage
}

export const MUSIC_BOX_CUSTOMIZE_SECTIONS = [
  { id: 'music', labelKey: 'customize.section.music' },
  { id: 'mechanism', labelKey: 'customize.section.mechanism' },
  { id: 'materials', labelKey: 'customize.section.materials' },
  { id: 'case', labelKey: 'customize.section.case' },
] as const

export const MUSIC_BOX_CUSTOMIZE_CONTROLS: MusicBoxCustomizeControl[] = [
  { id: 'tune', section: 'music', stage: 'current' },
  { id: 'tempo', section: 'music', stage: 'current' },
  { id: 'auto-fit', section: 'music', stage: 'current' },
  { id: 'comb', section: 'mechanism', stage: 'researched' },
  { id: 'tines', section: 'mechanism', stage: 'researched' },
  { id: 'cylinder', section: 'mechanism', stage: 'researched' },
  { id: 'dampers', section: 'mechanism', stage: 'researched' },
  { id: 'drive', section: 'mechanism', stage: 'researched' },
  { id: 'tine-material', section: 'materials', stage: 'planned' },
  { id: 'cylinder-material', section: 'materials', stage: 'researched' },
  { id: 'bedplate-material', section: 'materials', stage: 'researched' },
  { id: 'enclosure', section: 'case', stage: 'researched' },
  { id: 'case-material', section: 'case', stage: 'researched' },
  { id: 'case-resonance', section: 'case', stage: 'planned' },
]

export function controlsForCustomizeSection(section: MusicBoxCustomizeSectionId) {
  return MUSIC_BOX_CUSTOMIZE_CONTROLS.filter((control) => control.section === section)
}
