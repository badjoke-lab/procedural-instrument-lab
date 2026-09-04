import { DEFAULT_MUSIC_BOX_CONFIG, type MusicBoxConfig } from './mechanism'

export type MusicBoxCombVariantId = 'prototype-8' | 'sankyo-18-sim'

export type MusicBoxCombVariant = {
  id: MusicBoxCombVariantId
  noteCount: number
  notes: number[]
  preferredTineSpacing: number
  evidence: string | null
  pitchLayoutClaim: 'project-defined'
}

const prototypeNotes = [...DEFAULT_MUSIC_BOX_CONFIG.notes]
const simulatedChromatic18 = Array.from({ length: 18 }, (_, index) => 60 + index)

export const MUSIC_BOX_COMB_VARIANTS: MusicBoxCombVariant[] = [
  {
    id: 'prototype-8',
    noteCount: prototypeNotes.length,
    notes: prototypeNotes,
    preferredTineSpacing: DEFAULT_MUSIC_BOX_CONFIG.tineSpacing,
    evidence: null,
    pitchLayoutClaim: 'project-defined',
  },
  {
    id: 'sankyo-18-sim',
    noteCount: 18,
    notes: simulatedChromatic18,
    preferredTineSpacing: 0.155,
    evidence: 'docs/REAL_CYLINDER_MUSIC_BOX_RESEARCH.md#historical-18-note-sankyo-movement',
    pitchLayoutClaim: 'project-defined',
  },
]

export function getMusicBoxCombVariant(id: MusicBoxCombVariantId) {
  const variant = MUSIC_BOX_COMB_VARIANTS.find((entry) => entry.id === id)
  if (!variant) throw new Error(`Unknown music box comb variant: ${id}`)
  return variant
}

export function identifyMusicBoxCombVariant(config: MusicBoxConfig): MusicBoxCombVariantId | null {
  const variant = MUSIC_BOX_COMB_VARIANTS.find((entry) =>
    entry.notes.length === config.notes.length && entry.notes.every((note, index) => note === config.notes[index]),
  )
  return variant?.id ?? null
}

export function applyMusicBoxCombVariant(config: MusicBoxConfig, id: MusicBoxCombVariantId): MusicBoxConfig {
  const variant = getMusicBoxCombVariant(id)
  return {
    ...config,
    notes: [...variant.notes],
    tineSpacing: variant.preferredTineSpacing,
  }
}
