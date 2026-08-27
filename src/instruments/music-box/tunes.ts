import type { NoteEvent } from './mechanism'
import { createSequenceTuneDocument, tuneDocumentToNoteEvents, type TuneDocument } from './tune-document'

export type TunePreset = {
  id: string
  title: { en: string; ja: string }
  document: TuneDocument
  events: NoteEvent[]
  attribution: string
  publicDomain: true
}

function createPreset({
  id,
  title,
  attribution,
  pitches,
}: {
  id: string
  title: { en: string; ja: string }
  attribution: string
  pitches: number[]
}): TunePreset {
  const document = createSequenceTuneDocument({ id, title: title.en, pitches })
  return {
    id,
    title,
    attribution,
    publicDomain: true,
    document,
    events: tuneDocumentToNoteEvents(document),
  }
}

export const TUNE_PRESETS: TunePreset[] = [
  createPreset({
    id: 'twinkle',
    title: { en: 'Twinkle, Twinkle, Little Star', ja: 'きらきら星' },
    attribution: 'Traditional French melody, 18th century',
    pitches: [
      60, 60, 67, 67, 69, 69, 67,
      65, 65, 64, 64, 62, 62, 60,
      67, 67, 65, 65, 64, 64, 62,
      67, 67, 65, 65, 64, 64, 62,
      60, 60, 67, 67, 69, 69, 67,
      65, 65, 64, 64, 62, 62, 60,
    ],
  }),
  createPreset({
    id: 'ode-to-joy',
    title: { en: 'Ode to Joy', ja: '歓喜の歌' },
    attribution: 'Ludwig van Beethoven, Symphony No. 9 (1824)',
    pitches: [
      64, 64, 65, 67, 67, 65, 64, 62,
      60, 60, 62, 64, 64, 62, 62,
      64, 64, 65, 67, 67, 65, 64, 62,
      60, 60, 62, 64, 62, 60, 60,
    ],
  }),
  createPreset({
    id: 'au-clair-de-la-lune',
    title: { en: 'Au Clair de la Lune', ja: '月の光に' },
    attribution: 'Traditional French song, 18th century',
    pitches: [
      60, 60, 60, 62, 64, 62, 60, 64,
      62, 62, 60, 60, 60, 62, 64, 62,
      60, 64, 62, 60,
    ],
  }),
]

export const DEFAULT_TUNE_ID = TUNE_PRESETS[0].id

export function getTunePreset(id: string): TunePreset {
  return TUNE_PRESETS.find((preset) => preset.id === id) ?? TUNE_PRESETS[0]
}
