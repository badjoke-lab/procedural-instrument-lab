import { describe, expect, it } from 'vitest'
import { DEFAULT_MUSIC_BOX_CONFIG } from './mechanism'
import { analyzeMusicBoxCompatibility } from './compatibility'
import { TUNE_DOCUMENT_VERSION, type TuneDocument } from './tune-document'

function tune(notes: TuneDocument['notes'], lengthBeats = 4): TuneDocument {
  return { version: TUNE_DOCUMENT_VERSION, id: 'compat', title: 'Compatibility', tempoBpm: 96, lengthBeats, notes }
}

describe('music-box compatibility analyzer', () => {
  it('accepts a spaced monophonic tune inside the comb', () => {
    const report = analyzeMusicBoxCompatibility(tune([
      { id: 'a', pitch: 60, startBeat: 0, durationBeats: 0.5 },
      { id: 'b', pitch: 62, startBeat: 1, durationBeats: 0.5 },
    ]))
    expect(report.playable).toBe(true)
    expect(report.issues).toEqual([])
  })

  it('reports range as blocking and simultaneous starts as review-only', () => {
    const report = analyzeMusicBoxCompatibility(tune([
      { id: 'a', pitch: 59, startBeat: 0, durationBeats: 0.5 },
      { id: 'b', pitch: 60, startBeat: 0, durationBeats: 0.5 },
    ]))
    expect(report.playable).toBe(false)
    expect(report.issues.map((issue) => [issue.kind, issue.severity])).toEqual([
      ['range', 'blocking'],
      ['simultaneous', 'review'],
    ])
    expect(report.issues[0].pitches).toEqual([59])
  })

  it('keeps simultaneous in-range notes playable while flagging chord loading for review', () => {
    const report = analyzeMusicBoxCompatibility(tune([
      { id: 'a', pitch: 60, startBeat: 0, durationBeats: 0.5 },
      { id: 'b', pitch: 64, startBeat: 0, durationBeats: 0.5 },
    ]))
    expect(report.playable).toBe(true)
    expect(report.issues).toHaveLength(1)
    expect(report.issues[0]).toMatchObject({ kind: 'simultaneous', severity: 'review', pitches: [60, 64] })
  })

  it('reports same-lane pins that are too close for the current pin radius', () => {
    const report = analyzeMusicBoxCompatibility(tune([
      { id: 'a', pitch: 60, startBeat: 0, durationBeats: 0.25 },
      { id: 'b', pitch: 60, startBeat: 0.01, durationBeats: 0.25 },
    ], 8), DEFAULT_MUSIC_BOX_CONFIG)
    expect(report.playable).toBe(false)
    expect(report.issues.some((issue) => issue.kind === 'pin-spacing' && issue.severity === 'blocking')).toBe(true)
  })

  it('separates dense spacing from direct pin overlap', () => {
    const circumference = Math.PI * 2 * DEFAULT_MUSIC_BOX_CONFIG.cylinderRadius
    const targetArc = DEFAULT_MUSIC_BOX_CONFIG.pinRadius * 2.25
    const beatGap = (targetArc / circumference) * 8
    const report = analyzeMusicBoxCompatibility(tune([
      { id: 'a', pitch: 60, startBeat: 0, durationBeats: 0.25 },
      { id: 'b', pitch: 60, startBeat: beatGap, durationBeats: 0.25 },
    ], 8), DEFAULT_MUSIC_BOX_CONFIG)
    expect(report.issues.some((issue) => issue.kind === 'density' && issue.severity === 'blocking')).toBe(true)
    expect(report.issues.some((issue) => issue.kind === 'pin-spacing')).toBe(false)
  })
})
