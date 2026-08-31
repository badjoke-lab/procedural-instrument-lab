import { analyzeMusicBoxCompatibility, type CompatibilityReport } from './compatibility'
import { DEFAULT_MUSIC_BOX_CONFIG, type MusicBoxConfig } from './mechanism'
import { assertTuneDocument, type TuneDocument, type TuneDocumentNote } from './tune-document'

export type AutoFitOptions = {
  octaveMoves: boolean
  nearestNoteMapping: boolean
  quantizeStep: number | null
  simplifyDenseRepeats: boolean
}

export type AutoFitChange =
  | { kind: 'octave'; noteId: string; fromPitch: number; toPitch: number }
  | { kind: 'nearest'; noteId: string; fromPitch: number; toPitch: number }
  | { kind: 'quantize'; noteId: string; fromStartBeat: number; toStartBeat: number; fromDurationBeats: number; toDurationBeats: number }
  | { kind: 'remove'; noteId: string; pitch: number; reason: 'pin-spacing' }

export type AutoFitResult = {
  sourceDocumentId: string
  document: TuneDocument
  changes: AutoFitChange[]
  compatibility: CompatibilityReport
}

const EPSILON = 1e-9

export function autoFitMusicBoxTune(document: TuneDocument, options: AutoFitOptions, config: MusicBoxConfig = DEFAULT_MUSIC_BOX_CONFIG): AutoFitResult {
  assertTuneDocument(document)
  if (options.quantizeStep !== null && (!Number.isFinite(options.quantizeStep) || options.quantizeStep <= 0)) throw new Error('quantizeStep must be positive when enabled')
  const changes: AutoFitChange[] = []
  const supported = new Set(config.notes)
  let notes = document.notes.map((note) => ({ ...note }))
  notes = notes.map((note) => {
    if (supported.has(note.pitch)) return note
    if (options.octaveMoves) {
      const target = findOctaveTarget(note.pitch, config.notes)
      if (target !== null) { changes.push({ kind: 'octave', noteId: note.id, fromPitch: note.pitch, toPitch: target }); return { ...note, pitch: target } }
    }
    if (options.nearestNoteMapping) {
      const target = findNearestTarget(note.pitch, config.notes)
      if (target !== null) { changes.push({ kind: 'nearest', noteId: note.id, fromPitch: note.pitch, toPitch: target }); return { ...note, pitch: target } }
    }
    return note
  })
  if (options.quantizeStep !== null) notes = notes.map((note) => quantizeNote(note, document.lengthBeats, options.quantizeStep as number, changes))
  if (options.simplifyDenseRepeats) notes = simplifyPinSpacing(notes, document.lengthBeats, config, changes)
  const fitted: TuneDocument = { ...document, id: document.id.endsWith('-fit') ? document.id : `${document.id}-fit`, notes: [...notes].sort((a, b) => a.startBeat - b.startBeat || a.pitch - b.pitch || a.id.localeCompare(b.id)) }
  assertTuneDocument(fitted)
  return { sourceDocumentId: document.id, document: fitted, changes, compatibility: analyzeMusicBoxCompatibility(fitted, config) }
}

function pitchClass(pitch: number) { return ((pitch % 12) + 12) % 12 }
function findOctaveTarget(pitch: number, supportedNotes: number[]): number | null { const targetClass = pitchClass(pitch); return supportedNotes.filter((candidate) => pitchClass(candidate) === targetClass).sort((a, b) => Math.abs(a - pitch) - Math.abs(b - pitch) || a - b)[0] ?? null }
function findNearestTarget(pitch: number, supportedNotes: number[]): number | null { return [...supportedNotes].sort((a, b) => Math.abs(a - pitch) - Math.abs(b - pitch) || a - b)[0] ?? null }
function quantizeNote(note: TuneDocumentNote, lengthBeats: number, step: number, changes: AutoFitChange[]): TuneDocumentNote {
  const minimumDuration = Math.min(step, lengthBeats)
  const maximumStart = Math.max(0, lengthBeats - minimumDuration)
  const startBeat = clamp(roundToStep(note.startBeat, step), 0, maximumStart)
  const availableDuration = lengthBeats - startBeat
  const durationBeats = Math.min(availableDuration, Math.max(minimumDuration, roundToStep(note.durationBeats, step)))
  if (Math.abs(startBeat - note.startBeat) > EPSILON || Math.abs(durationBeats - note.durationBeats) > EPSILON) changes.push({ kind: 'quantize', noteId: note.id, fromStartBeat: note.startBeat, toStartBeat: startBeat, fromDurationBeats: note.durationBeats, toDurationBeats: durationBeats })
  return { ...note, startBeat, durationBeats }
}
function roundToStep(value: number, step: number) { return Math.round(value / step) * step }
function clamp(value: number, minimum: number, maximum: number) { return Math.max(minimum, Math.min(maximum, value)) }
function simplifyPinSpacing(notes: TuneDocumentNote[], lengthBeats: number, config: MusicBoxConfig, changes: AutoFitChange[]): TuneDocumentNote[] {
  const circumference = Math.PI * 2 * config.cylinderRadius
  const minimumArcSpacing = config.pinRadius * 2.5
  const minimumBeatGap = (minimumArcSpacing / circumference) * lengthBeats
  const removeIds = new Set<string>()
  for (const pitch of config.notes) {
    const lane = notes.filter((note) => note.pitch === pitch).sort((a, b) => a.startBeat - b.startBeat || a.id.localeCompare(b.id))
    if (lane.length < 2) continue
    const kept: TuneDocumentNote[] = []
    for (const note of lane) {
      const previous = kept[kept.length - 1]
      if (!previous || note.startBeat - previous.startBeat + EPSILON >= minimumBeatGap) kept.push(note)
      else removeIds.add(note.id)
    }
    while (kept.length > 1) {
      const first = kept[0]; const last = kept[kept.length - 1]
      const wrapGap = lengthBeats - last.startBeat + first.startBeat
      if (wrapGap + EPSILON >= minimumBeatGap) break
      removeIds.add(last.id); kept.pop()
    }
  }
  for (const note of notes) if (removeIds.has(note.id)) changes.push({ kind: 'remove', noteId: note.id, pitch: note.pitch, reason: 'pin-spacing' })
  return notes.filter((note) => !removeIds.has(note.id))
}
