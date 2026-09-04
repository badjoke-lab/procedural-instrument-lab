import type { MusicBoxConfig } from './mechanism'

export type MusicBoxCombVariant = {
  id: string
  label: string
  noteCount: number
  playableNotes: number[] | null
  evidence: string
  selectable: boolean
  blockedBy: string[]
}

export const MUSIC_BOX_COMB_VARIANTS: MusicBoxCombVariant[] = [
  {
    id: 'prototype-8',
    label: 'Prototype 8-note comb',
    noteCount: 8,
    playableNotes: [60, 62, 64, 65, 67, 69, 71, 72],
    evidence: 'src/instruments/music-box/mechanism.ts#DEFAULT_MUSIC_BOX_CONFIG',
    selectable: true,
    blockedBy: [],
  },
  {
    id: 'reuge-ch-3-72',
    label: 'Reuge CH 3.72 reference',
    noteCount: 72,
    playableNotes: null,
    evidence: 'docs/REAL_CYLINDER_MUSIC_BOX_RESEARCH.md#current-72-note-swiss-cylinder-movement',
    selectable: false,
    blockedBy: ['playable pitch set', 'cylinder dimensions', 'tine spacing', 'contact/release geometry'],
  },
  {
    id: 'jaccard-1888-92-playing',
    label: 'Eugène Félix Jaccard 92-playing reference',
    noteCount: 92,
    playableNotes: null,
    evidence: 'docs/REAL_CYLINDER_MUSIC_BOX_RESEARCH.md#historical-comb-scale-and-interchangeable-cylinder-drive',
    selectable: false,
    blockedBy: ['playable pitch set', 'cylinder dimensions', 'tine spacing', 'contact/release geometry'],
  },
]

export function getMusicBoxCombVariant(id: string): MusicBoxCombVariant {
  const variant = MUSIC_BOX_COMB_VARIANTS.find((entry) => entry.id === id)
  if (!variant) throw new Error(`Unknown Music Box comb variant: ${id}`)
  return variant
}

export function applyMusicBoxCombVariant(config: MusicBoxConfig, variantId: string): MusicBoxConfig {
  const variant = getMusicBoxCombVariant(variantId)
  if (!variant.selectable || !variant.playableNotes) {
    throw new Error(
      `Music Box comb variant ${variant.id} is reference-only until its playable pitch set and mechanism geometry are evidenced`,
    )
  }

  return {
    ...config,
    notes: [...variant.playableNotes],
    cylinderCenter: [...config.cylinderCenter] as MusicBoxConfig['cylinderCenter'],
  }
}
