import { MUSIC_BOX_PARTIALS, midiToHz } from './audio'
import { pinContactWindow, type MusicBoxConfig, type Pin } from './mechanism'
import { compileTuneDocumentToCylinder } from './tune-cylinder'
import type { TuneDocument } from './tune-document'

const TWO_PI = Math.PI * 2
const MOTION_DIRECTION = -1
const LIVE_MASTER_GAIN = 0.72
const ATTACK_SECONDS = 0.003
const RELEASE_TAIL_SECONDS = 0.05

export type MechanicalReleaseEvent = {
  note: number
  noteIndex: number
  timeSeconds: number
}

export type OfflineAudioRender = {
  sampleRate: number
  durationSeconds: number
  samples: Float32Array
  releases: MechanicalReleaseEvent[]
}

function normalizePositiveAngle(angle: number) {
  const normalized = angle % TWO_PI
  return normalized < 0 ? normalized + TWO_PI : normalized
}

function releaseProgress(pin: Pin, config: MusicBoxConfig) {
  const window = pinContactWindow(pin, MOTION_DIRECTION, config)
  if (!window) throw new Error(`pin lane ${pin.noteIndex} has no mechanical release window`)
  return normalizePositiveAngle(pin.angle - window.releaseAngle) / TWO_PI
}

export function createMechanicalReleaseSchedule(
  document: TuneDocument,
  config: MusicBoxConfig,
): MechanicalReleaseEvent[] {
  const cylinder = compileTuneDocumentToCylinder(document, config)
  const rotationDurationSeconds = (document.lengthBeats * 60) / document.tempoBpm

  return cylinder.pins
    .map((pin) => ({
      note: config.notes[pin.noteIndex],
      noteIndex: pin.noteIndex,
      timeSeconds: releaseProgress(pin, config) * rotationDurationSeconds,
    }))
    .sort((a, b) => a.timeSeconds - b.timeSeconds || a.note - b.note)
}

function addPluck(samples: Float32Array, sampleRate: number, release: MechanicalReleaseEvent) {
  const startSample = Math.max(0, Math.round(release.timeSeconds * sampleRate))
  const frequency = midiToHz(release.note)

  for (const partial of MUSIC_BOX_PARTIALS) {
    const decaySeconds = partial.decay
    const endSample = Math.min(samples.length, startSample + Math.ceil((decaySeconds + RELEASE_TAIL_SECONDS) * sampleRate))
    const partialFrequency = frequency * partial.ratio * Math.pow(2, (partial.detune ?? 0) / 1200)

    for (let index = startSample; index < endSample; index += 1) {
      const elapsed = (index - startSample) / sampleRate
      const attack = Math.min(1, elapsed / ATTACK_SECONDS)
      const decay = Math.exp((-6.9 * Math.max(0, elapsed - ATTACK_SECONDS)) / Math.max(0.001, decaySeconds))
      samples[index] += Math.sin(TWO_PI * partialFrequency * elapsed) * partial.gain * attack * decay * LIVE_MASTER_GAIN
    }
  }
}

export function renderMusicBoxOfflineAudio(
  document: TuneDocument,
  config: MusicBoxConfig,
  sampleRate = 44_100,
): OfflineAudioRender {
  if (!Number.isInteger(sampleRate) || sampleRate < 8_000 || sampleRate > 192_000) {
    throw new Error('sampleRate must be an integer between 8000 and 192000')
  }

  const releases = createMechanicalReleaseSchedule(document, config)
  const rotationDurationSeconds = (document.lengthBeats * 60) / document.tempoBpm
  const longestDecay = Math.max(...MUSIC_BOX_PARTIALS.map((partial) => partial.decay))
  const durationSeconds = rotationDurationSeconds + longestDecay + RELEASE_TAIL_SECONDS
  const samples = new Float32Array(Math.ceil(durationSeconds * sampleRate))

  for (const release of releases) addPluck(samples, sampleRate, release)

  let peak = 0
  for (const sample of samples) peak = Math.max(peak, Math.abs(sample))
  if (peak > 1) {
    const scale = 1 / peak
    for (let index = 0; index < samples.length; index += 1) samples[index] *= scale
  }

  return { sampleRate, durationSeconds, samples, releases }
}
