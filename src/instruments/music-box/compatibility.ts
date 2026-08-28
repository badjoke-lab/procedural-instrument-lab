import { DEFAULT_MUSIC_BOX_CONFIG, type MusicBoxConfig } from './mechanism'
import { assertTuneDocument, type TuneDocument } from './tune-document'

export type CompatibilityIssueKind = 'range' | 'simultaneous' | 'density' | 'pin-spacing'

export type CompatibilityIssue = {
  kind: CompatibilityIssueKind
  noteIds: string[]
  detail: string
}

export type CompatibilityReport = {
  playable: boolean
  supportedNotes: number
  totalNotes: number
  issues: CompatibilityIssue[]
}

const EPSILON = 1e-6

export function analyzeMusicBoxCompatibility(
  document: TuneDocument,
  config: MusicBoxConfig = DEFAULT_MUSIC_BOX_CONFIG,
): CompatibilityReport {
  assertTuneDocument(document)
  const issues: CompatibilityIssue[] = []
  const supported = new Set(config.notes)

  for (const note of document.notes) {
    if (!supported.has(note.pitch)) {
      issues.push({ kind: 'range', noteIds: [note.id], detail: `MIDI ${note.pitch} is outside the current comb.` })
    }
  }

  const byStart = new Map<number, typeof document.notes>()
  for (const note of document.notes) {
    const group = byStart.get(note.startBeat) ?? []
    group.push(note)
    byStart.set(note.startBeat, group)
  }
  for (const [startBeat, notes] of byStart) {
    if (notes.length > 1) {
      issues.push({
        kind: 'simultaneous',
        noteIds: notes.map((note) => note.id),
        detail: `${notes.length} notes start together at beat ${startBeat}; review chord loading before fitting.`,
      })
    }
  }

  const circumference = Math.PI * 2 * config.cylinderRadius
  const minimumSpacing = config.pinRadius * 2.5
  for (const pitch of config.notes) {
    const lane = document.notes
      .filter((note) => note.pitch === pitch)
      .sort((a, b) => a.startBeat - b.startBeat)
    if (lane.length < 2) continue

    for (let index = 0; index < lane.length; index += 1) {
      const current = lane[index]
      const next = lane[(index + 1) % lane.length]
      const beatGap = index === lane.length - 1
        ? document.lengthBeats - current.startBeat + next.startBeat
        : next.startBeat - current.startBeat
      const arcSpacing = circumference * (beatGap / document.lengthBeats)
      if (arcSpacing + EPSILON >= minimumSpacing) continue
      const kind: CompatibilityIssueKind = arcSpacing < config.pinRadius * 2 ? 'pin-spacing' : 'density'
      issues.push({
        kind,
        noteIds: [current.id, next.id],
        detail: `${pitch} pins are ${arcSpacing.toFixed(3)} units apart; current minimum is ${minimumSpacing.toFixed(3)}.`,
      })
    }
  }

  return {
    playable: issues.length === 0,
    supportedNotes: document.notes.filter((note) => supported.has(note.pitch)).length,
    totalNotes: document.notes.length,
    issues,
  }
}
