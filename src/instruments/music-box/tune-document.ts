import type { NoteEvent } from './mechanism'

export const TUNE_DOCUMENT_VERSION = 1 as const

export type TuneDocumentNote = {
  id: string
  pitch: number
  startBeat: number
  durationBeats: number
}

export type TuneDocument = {
  version: typeof TUNE_DOCUMENT_VERSION
  id: string
  title: string
  tempoBpm: number
  lengthBeats: number
  notes: TuneDocumentNote[]
}

export function validateTuneDocument(document: TuneDocument): string[] {
  const issues: string[] = []
  const ids = new Set<string>()

  if (document.version !== TUNE_DOCUMENT_VERSION) issues.push('unsupported TuneDocument version')
  if (document.id.trim().length === 0) issues.push('id must not be empty')
  if (document.title.trim().length === 0) issues.push('title must not be empty')
  if (!Number.isFinite(document.tempoBpm) || document.tempoBpm <= 0) issues.push('tempoBpm must be positive')
  if (!Number.isFinite(document.lengthBeats) || document.lengthBeats <= 0) issues.push('lengthBeats must be positive')

  for (const note of document.notes) {
    if (note.id.trim().length === 0) issues.push('note id must not be empty')
    if (ids.has(note.id)) issues.push(`duplicate note id: ${note.id}`)
    ids.add(note.id)

    if (!Number.isInteger(note.pitch) || note.pitch < 0 || note.pitch > 127) issues.push(`invalid MIDI pitch: ${note.pitch}`)
    if (!Number.isFinite(note.startBeat) || note.startBeat < 0) issues.push(`invalid startBeat for note: ${note.id}`)
    if (!Number.isFinite(note.durationBeats) || note.durationBeats <= 0) issues.push(`invalid durationBeats for note: ${note.id}`)
    if (note.startBeat >= document.lengthBeats) issues.push(`note starts outside document: ${note.id}`)
    if (note.startBeat + note.durationBeats > document.lengthBeats) issues.push(`note ends outside document: ${note.id}`)
  }

  return issues
}

export function assertTuneDocument(document: TuneDocument): void {
  const issues = validateTuneDocument(document)
  if (issues.length > 0) throw new Error(`Invalid TuneDocument: ${issues.join('; ')}`)
}

export function tuneDocumentToNoteEvents(document: TuneDocument): NoteEvent[] {
  assertTuneDocument(document)
  return document.notes
    .map((note) => ({ note: note.pitch, start: note.startBeat / document.lengthBeats }))
    .sort((a, b) => a.start - b.start || a.note - b.note)
}

export function createSequenceTuneDocument({
  id,
  title,
  pitches,
  tempoBpm = 96,
}: {
  id: string
  title: string
  pitches: number[]
  tempoBpm?: number
}): TuneDocument {
  const lengthBeats = Math.max(1, pitches.length)
  const document: TuneDocument = {
    version: TUNE_DOCUMENT_VERSION,
    id,
    title,
    tempoBpm,
    lengthBeats,
    notes: pitches.map((pitch, index) => ({
      id: `${id}-note-${index + 1}`,
      pitch,
      startBeat: index,
      durationBeats: 1,
    })),
  }
  assertTuneDocument(document)
  return document
}
