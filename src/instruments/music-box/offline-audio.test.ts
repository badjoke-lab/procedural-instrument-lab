import { describe, expect, it } from 'vitest'
import { DEFAULT_MUSIC_BOX_CONFIG } from './mechanism'
import { createMechanicalReleaseSchedule, renderMusicBoxOfflineAudio } from './offline-audio'
import { createSequenceTuneDocument } from './tune-document'

const tune = createSequenceTuneDocument({
  id: 'offline-audio-test',
  title: 'Offline Audio Test',
  pitches: [60, 64, 67],
  tempoBpm: 120,
})

describe('offline Music Box audio rendering', () => {
  it('derives one timed release from each mechanically compiled pin', () => {
    const releases = createMechanicalReleaseSchedule(tune, DEFAULT_MUSIC_BOX_CONFIG)
    const rotationDuration = (tune.lengthBeats * 60) / tune.tempoBpm

    expect(releases).toHaveLength(tune.notes.length)
    expect(releases.map((release) => release.note).sort((a, b) => a - b)).toEqual([60, 64, 67])
    expect(releases.every((release) => release.timeSeconds >= 0 && release.timeSeconds < rotationDuration)).toBe(true)
    expect(releases).toEqual([...releases].sort((a, b) => a.timeSeconds - b.timeSeconds || a.note - b.note))
  })

  it('renders deterministic non-silent PCM from the shared live partial model', () => {
    const first = renderMusicBoxOfflineAudio(tune, DEFAULT_MUSIC_BOX_CONFIG, 8_000)
    const second = renderMusicBoxOfflineAudio(tune, DEFAULT_MUSIC_BOX_CONFIG, 8_000)

    expect(first.sampleRate).toBe(8_000)
    expect(first.releases).toEqual(second.releases)
    expect(first.samples).toEqual(second.samples)
    expect(first.samples.some((sample) => sample !== 0)).toBe(true)
    expect(first.samples.every((sample) => Number.isFinite(sample) && Math.abs(sample) <= 1)).toBe(true)
  })

  it('rejects unsupported render sample rates', () => {
    expect(() => renderMusicBoxOfflineAudio(tune, DEFAULT_MUSIC_BOX_CONFIG, 7_999)).toThrow(/sampleRate/)
    expect(() => renderMusicBoxOfflineAudio(tune, DEFAULT_MUSIC_BOX_CONFIG, 44_100.5)).toThrow(/sampleRate/)
  })
})
