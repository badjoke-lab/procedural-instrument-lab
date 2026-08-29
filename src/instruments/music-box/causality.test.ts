import { describe, expect, it } from 'vitest'
import {
  DEFAULT_MUSIC_BOX_CONFIG,
  compileTune,
  driveKinematics,
  pinTineEngagement,
  sampleCylinderPhaseSegment,
  type NoteEvent,
} from './mechanism'

const config = DEFAULT_MUSIC_BOX_CONFIG
const tune: NoteEvent[] = [
  { note: 60, start: 0 },
  { note: 62, start: 0.125 },
  { note: 64, start: 0.25 },
  { note: 65, start: 0.375 },
  { note: 67, start: 0.5 },
  { note: 69, start: 0.625 },
  { note: 71, start: 0.75 },
  { note: 72, start: 0.875 },
]

function sampleOneCylinderRevolution(frames: number) {
  const pins = compileTune(tune, config)
  const engaged = new Set<number>()
  const releases: number[] = []
  let sawLoadedTine = false

  // cylinderPhase = -crankAngle * ratio, so this crank span advances one full cylinder turn.
  const ratio = config.driverGearTeeth / config.cylinderGearTeeth
  const crankSpan = (Math.PI * 2) / ratio
  const startCrank = 0.37
  let previousPhase = driveKinematics(startCrank, config).cylinderPhase

  for (let frame = 1; frame <= frames; frame += 1) {
    const crankAngle = startCrank - (frame / frames) * crankSpan
    const drive = driveKinematics(crankAngle, config)

    for (const phase of sampleCylinderPhaseSegment(previousPhase, drive.cylinderPhase)) {
      pins.forEach((pin, index) => {
        const state = pinTineEngagement(pin, phase, config)
        if (state.engaged) {
          engaged.add(index)
          if (state.deflection > 0) sawLoadedTine = true
        } else if (engaged.delete(index)) {
          releases.push(pin.noteIndex)
        }
      })
    }

    previousPhase = drive.cylinderPhase
  }

  return { releases, sawLoadedTine }
}

describe('music box mechanical causality', () => {
  it('derives cylinder phase from the same crank/gear state used for contact', () => {
    const drive = driveKinematics(Math.PI / 5, config)
    expect(drive.driverGearAngle).toBeCloseTo(Math.PI / 5, 10)
    expect(drive.cylinderGearAngle).toBeCloseTo(-2 * Math.PI / 5, 10)
    expect(drive.cylinderPhase).toBe(drive.cylinderGearAngle)
  })

  it('loads a tine before release and produces exactly one release per pin even at coarse render sampling', () => {
    const coarse = sampleOneCylinderRevolution(24)
    const fine = sampleOneCylinderRevolution(1440)

    expect(coarse.sawLoadedTine).toBe(true)
    expect(fine.sawLoadedTine).toBe(true)
    expect(coarse.releases).toHaveLength(tune.length)
    expect(fine.releases).toHaveLength(tune.length)
    expect([...coarse.releases].sort((a, b) => a - b)).toEqual([...fine.releases].sort((a, b) => a - b))
  })
})
