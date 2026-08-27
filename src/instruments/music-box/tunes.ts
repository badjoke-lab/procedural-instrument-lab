import type { NoteEvent } from './mechanism'

export type TunePreset = {
  id: string
  title: { en: string; ja: string }
  events: NoteEvent[]
  attribution: string
  publicDomain: true
}

function sequence(notes: number[]): NoteEvent[] {
  return notes.map((note, index) => ({ note, start: index / notes.length }))
}

export const TUNE_PRESETS: TunePreset[] = [
  {
    id: 'twinkle',
    title: { en: 'Twinkle, Twinkle, Little Star', ja: 'きらきら星' },
    attribution: 'Traditional French melody, 18th century',
    publicDomain: true,
    events: sequence([
      60, 60, 67, 67, 69, 69, 67,
      65, 65, 64, 64, 62, 62, 60,
      67, 67, 65, 65, 64, 64, 62,
      67, 67, 65, 65, 64, 64, 62,
      60, 60, 67, 67, 69, 69, 67,
      65, 65, 64, 64, 62, 62, 60,
    ]),
  },
  {
    id: 'ode-to-joy',
    title: { en: 'Ode to Joy', ja: '歓喜の歌' },
    attribution: 'Ludwig van Beethoven, Symphony No. 9 (1824)',
    publicDomain: true,
    events: sequence([
      64, 64, 65, 67, 67, 65, 64, 62,
      60, 60, 62, 64, 64, 62, 62,
      64, 64, 65, 67, 67, 65, 64, 62,
      60, 60, 62, 64, 62, 60, 60,
    ]),
  },
  {
    id: 'au-clair-de-la-lune',
    title: { en: 'Au Clair de la Lune', ja: '月の光に' },
    attribution: 'Traditional French song, 18th century',
    publicDomain: true,
    events: sequence([
      60, 60, 60, 62, 64, 62, 60, 64,
      62, 62, 60, 60, 60, 62, 64, 62,
      60, 64, 62, 60,
    ]),
  },
]

export const DEFAULT_TUNE_ID = TUNE_PRESETS[0].id

export function getTunePreset(id: string): TunePreset {
  return TUNE_PRESETS.find((preset) => preset.id === id) ?? TUNE_PRESETS[0]
}
