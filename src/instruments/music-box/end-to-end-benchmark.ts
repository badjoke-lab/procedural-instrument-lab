import { autoFitMusicBoxTune, type AutoFitOptions } from './auto-fit'
import { BENCHMARK_TUNE_CASES } from './benchmark-tunes'
import { extractMonophonicNotes, extractedNotesToTuneDocument } from './melody-extraction'
import {
  DEFAULT_MUSIC_BOX_CONFIG,
  pinContactWindow,
  pinTineEngagement,
  type MusicBoxConfig,
  type Pin,
} from './mechanism'
import { renderSyntheticAudio, SYNTHETIC_AUDIO_FIXTURES } from './synthetic-audio-fixtures'
import { compileTuneDocumentToCylinder } from './tune-cylinder'
import type { TuneDocument } from './tune-document'

const AUTO_FIT_OPTIONS: AutoFitOptions = {
  octaveMoves: true,
  nearestNoteMapping: true,
  quantizeStep: 0.25,
  simplifyDenseRepeats: true,
}

const RELEASE_PROBE_ANGLE = 0.002

export type EndToEndBenchmarkResult = {
  id: string
  source: 'tune' | 'audio'
  sourceNotes: number
  fittedNotes: number
  pinCount: number
  changes: number
  contactWindows: number
  releaseChecks: number
}

function normalizeAngle(angle: number) {
  const twoPi = Math.PI * 2
  const normalized = angle % twoPi
  return normalized < 0 ? normalized + twoPi : normalized
}

function assertContactReleaseInvariant(pin: Pin, config: MusicBoxConfig) {
  const direction = -1
  const window = pinContactWindow(pin, direction, config)
  if (!window) throw new Error(`pin lane ${pin.noteIndex} has no contact/release window`)

  const midWorldAngle = normalizeAngle(window.entryAngle - window.travelAngle / 2)
  const midPhase = midWorldAngle - pin.angle
  const engaged = pinTineEngagement(pin, midPhase, config, direction)
  if (!engaged.engaged || engaged.deflection <= 0) {
    throw new Error(`pin lane ${pin.noteIndex} is not loaded inside its contact window`)
  }

  const afterReleaseWorldAngle = normalizeAngle(window.releaseAngle - RELEASE_PROBE_ANGLE)
  const afterReleasePhase = afterReleaseWorldAngle - pin.angle
  const released = pinTineEngagement(pin, afterReleasePhase, config, direction)
  if (released.engaged || released.deflection !== 0) {
    throw new Error(`pin lane ${pin.noteIndex} remains engaged after release`)
  }
}

export function benchmarkTuneDocument(
  id: string,
  source: 'tune' | 'audio',
  document: TuneDocument,
  config: MusicBoxConfig = DEFAULT_MUSIC_BOX_CONFIG,
): EndToEndBenchmarkResult {
  const fit = autoFitMusicBoxTune(document, AUTO_FIT_OPTIONS, config)
  if (!fit.compatibility.playable) {
    const blockers = fit.compatibility.issues
      .filter((issue) => issue.severity === 'blocking')
      .map((issue) => issue.kind)
      .join(', ')
    throw new Error(`${id} remains mechanically blocked after Auto Fit: ${blockers}`)
  }

  const cylinder = compileTuneDocumentToCylinder(fit.document, config)
  for (const pin of cylinder.pins) assertContactReleaseInvariant(pin, config)

  return {
    id,
    source,
    sourceNotes: document.notes.length,
    fittedNotes: fit.document.notes.length,
    pinCount: cylinder.pins.length,
    changes: fit.changes.length,
    contactWindows: cylinder.pins.length,
    releaseChecks: cylinder.pins.length,
  }
}

export function runEndToEndConversionBenchmark(config: MusicBoxConfig = DEFAULT_MUSIC_BOX_CONFIG) {
  const tuneResults = BENCHMARK_TUNE_CASES.map((fixture) =>
    benchmarkTuneDocument(`tune:${fixture.id}`, 'tune', fixture.document, config),
  )

  const audioResults = SYNTHETIC_AUDIO_FIXTURES.map((fixture) => {
    const extracted = extractMonophonicNotes(renderSyntheticAudio(fixture), fixture.sampleRate)
    if (extracted.length === 0) throw new Error(`${fixture.id} produced no editable notes`)
    const document = extractedNotesToTuneDocument(
      extracted,
      fixture.tempoBpm,
      `benchmark-${fixture.id}`,
      `Benchmark ${fixture.id}`,
    )
    return benchmarkTuneDocument(`audio:${fixture.id}`, 'audio', document, config)
  })

  return [...tuneResults, ...audioResults]
}
