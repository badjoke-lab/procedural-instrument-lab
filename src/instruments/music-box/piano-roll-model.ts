import { TUNE_DOCUMENT_VERSION, assertTuneDocument, type TuneDocument, type TuneDocumentNote } from './tune-document'

export type PianoRollDraft = TuneDocument

export function cloneTuneDocument(document: TuneDocument, id = `${document.id}-edit`): PianoRollDraft {
  const draft: PianoRollDraft = {
    ...document,
    version: TUNE_DOCUMENT_VERSION,
    id,
    title: document.title,
    notes: document.notes.map((note) => ({ ...note })),
  }
  assertTuneDocument(draft)
  return draft
}

export function quantizeBeat(value: number, step = 0.25): number {
  if (!Number.isFinite(value)) throw new Error('beat must be finite')
  if (!Number.isFinite(step) || step <= 0) throw new Error('quantize step must be positive')
  return Math.round(value / step) * step
}

export function addPianoRollNote(
  document: PianoRollDraft,
  input: { pitch: number; startBeat: number; durationBeats?: number },
): PianoRollDraft {
  const durationBeats = input.durationBeats ?? 1
  const nextId = nextNoteId(document)
  return replaceNotes(document, [
    ...document.notes,
    { id: nextId, pitch: input.pitch, startBeat: input.startBeat, durationBeats },
  ])
}

export function updatePianoRollNote(
  document: PianoRollDraft,
  noteId: string,
  patch: Partial<Pick<TuneDocumentNote, 'pitch' | 'startBeat' | 'durationBeats'>>,
): PianoRollDraft {
  let found = false
  const notes = document.notes.map((note) => {
    if (note.id !== noteId) return note
    found = true
    return { ...note, ...patch }
  })
  if (!found) throw new Error(`Unknown note id: ${noteId}`)
  return replaceNotes(document, notes)
}

export function deletePianoRollNote(document: PianoRollDraft, noteId: string): PianoRollDraft {
  const notes = document.notes.filter((note) => note.id !== noteId)
  if (notes.length === document.notes.length) throw new Error(`Unknown note id: ${noteId}`)
  return replaceNotes(document, notes)
}

export function quantizePianoRollNote(
  document: PianoRollDraft,
  noteId: string,
  step = 0.25,
): PianoRollDraft {
  const note = document.notes.find((candidate) => candidate.id === noteId)
  if (!note) throw new Error(`Unknown note id: ${noteId}`)
  return updatePianoRollNote(document, noteId, {
    startBeat: quantizeBeat(note.startBeat, step),
    durationBeats: Math.max(step, quantizeBeat(note.durationBeats, step)),
  })
}

function replaceNotes(document: PianoRollDraft, notes: TuneDocumentNote[]): PianoRollDraft {
  const next = {
    ...document,
    notes: [...notes].sort((a, b) => a.startBeat - b.startBeat || a.pitch - b.pitch || a.id.localeCompare(b.id)),
  }
  assertTuneDocument(next)
  return next
}

function nextNoteId(document: PianoRollDraft): string {
  const used = new Set(document.notes.map((note) => note.id))
  let index = document.notes.length + 1
  while (used.has(`${document.id}-note-${index}`)) index += 1
  return `${document.id}-note-${index}`
}
