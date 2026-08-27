import { addPianoRollNote, quantizeBeat, type PianoRollDraft } from './piano-roll-model'

export type ScreenKeyboardRecording = {
  pitch: number
  sessionStartedAtSeconds: number
  keyStartedAtSeconds: number
  keyEndedAtSeconds: number
  quantizeStep?: number
}

export function secondsToBeats(seconds: number, tempoBpm: number): number {
  if (!Number.isFinite(seconds) || seconds < 0) throw new Error('seconds must be finite and non-negative')
  if (!Number.isFinite(tempoBpm) || tempoBpm <= 0) throw new Error('tempoBpm must be positive')
  return seconds * tempoBpm / 60
}

export function recordScreenKeyboardNote(
  document: PianoRollDraft,
  recording: ScreenKeyboardRecording,
): PianoRollDraft {
  const step = recording.quantizeStep ?? 0.25
  if (!Number.isInteger(recording.pitch) || recording.pitch < 0 || recording.pitch > 127) {
    throw new Error('pitch must be a MIDI note number')
  }
  if (recording.keyStartedAtSeconds < recording.sessionStartedAtSeconds) {
    throw new Error('key start precedes recording session')
  }
  if (recording.keyEndedAtSeconds < recording.keyStartedAtSeconds) {
    throw new Error('key end precedes key start')
  }

  const rawStart = secondsToBeats(
    recording.keyStartedAtSeconds - recording.sessionStartedAtSeconds,
    document.tempoBpm,
  )
  const rawDuration = secondsToBeats(
    recording.keyEndedAtSeconds - recording.keyStartedAtSeconds,
    document.tempoBpm,
  )
  const startBeat = Math.max(0, quantizeBeat(rawStart, step))
  const durationBeats = Math.max(step, quantizeBeat(rawDuration, step))
  const requiredLength = startBeat + durationBeats
  const nextLength = requiredLength > document.lengthBeats
    ? Math.ceil(requiredLength)
    : document.lengthBeats

  return addPianoRollNote(
    { ...document, lengthBeats: nextLength },
    { pitch: recording.pitch, startBeat, durationBeats },
  )
}
