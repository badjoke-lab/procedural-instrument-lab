import { describe, expect, it } from 'vitest'
import {
  DEFAULT_MUSIC_BOX_CONFIG,
  TINE_REST_Y,
  compileTune,
  driveKinematics,
  gearRatio,
  pinTineEngagement,
  pinTouchesTine,
  sampleCylinderPhaseSegment,
  tineAnchorPoint,
  tineContactPoint,
  tineLength,
  tineLoadAngle,
  pinTipWorldPosition,
  validateMusicBoxConfig,
  type MusicBoxConfig,
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

function closestVisibleContactPhase(pinAngle = 0) {
  const contact = tineContactPoint(0, config)
  const [cx, cy] = config.cylinderCenter
  return Math.atan2(contact.y - cy, contact.x - cx) - pinAngle
}

function countReleases(framesPerRevolution: number) {
  const pins = compileTune(tune, config)
  const engaged = new Set<number>()
  const startPhase = 0.2
  let releases = 0
  let previousPhase = startPhase

  for (let frame = 1; frame <= framesPerRevolution; frame += 1) {
    const phase = startPhase + (frame / framesPerRevolution) * Math.PI * 2
    for (const sampledPhase of sampleCylinderPhaseSegment(previousPhase, phase)) {
      pins.forEach((pin, index) => {
        const state = pinTineEngagement(pin, sampledPhase, config)
        if (state.engaged) engaged.add(index)
        if (!state.engaged && engaged.delete(index)) releases += 1
      })
    }
    previousPhase = phase
  }

  return releases
}

describe('music box contact geometry', () => {
  it('resolves contact against the same visible resting tine tip instead of an abstract y=0 point', () => {
    const [pin] = compileTune([{ note: 60, start: 0 }], config)
    const contact = tineContactPoint(pin.noteIndex, config)
    const anchor = tineAnchorPoint(pin.noteIndex, config)
    const phase = closestVisibleContactPhase(pin.angle)
    const tip = pinTipWorldPosition(pin, phase, config)
    const state = pinTineEngagement(pin, phase, config)

    expect(contact.y).toBeCloseTo(config.cylinderCenter[1] + TINE_REST_Y, 10)
    expect(anchor.y).toBeCloseTo(contact.y, 10)
    expect(anchor.z).toBeCloseTo(contact.z, 10)
    expect(tineLength(pin.noteIndex, config)).toBeCloseTo(anchor.x - contact.x, 10)
    expect(Math.abs(tip.y - contact.y)).toBeLessThan(config.contactTolerance)
    expect(state.engaged).toBe(true)
    expect(state.deflection).toBeGreaterThan(0)
    expect(pinTouchesTine(pin, phase, config)).toBe(true)
  })

  it('does not claim contact at the old rightmost-cylinder point while the visible tine is still separated', () => {
    const [pin] = compileTune([{ note: 60, start: 0 }], config)
    expect(pinTineEngagement(pin, 0, config).engaged).toBe(false)
  })

  it('derives progressively smaller loading toward the visible contact edge', () => {
    const [pin] = compileTune([{ note: 60, start: 0 }], config)
    const centerPhase = closestVisibleContactPhase(pin.angle)
    const centered = pinTineEngagement(pin, centerPhase, config)
    const nearEdge = pinTineEngagement(pin, centerPhase + 0.04, config)

    expect(nearEdge.engaged).toBe(true)
    expect(nearEdge.deflection).toBeGreaterThan(0)
    expect(nearEdge.deflection).toBeLessThan(centered.deflection)
  })

  it('loads the tine away from the approaching pin and scales the angle from real contact tolerance', () => {
    const forward = tineLoadAngle(0, 0.7, -1, config)
    const reverse = tineLoadAngle(0, 0.7, 1, config)
    expect(forward).toBeGreaterThan(0)
    expect(reverse).toBeLessThan(0)
    expect(Math.abs(forward)).toBeLessThan(0.1)
    expect(Math.abs(reverse)).toBeCloseTo(Math.abs(forward), 10)
  })

  it('does not report engagement a quarter turn away', () => {
    const [pin] = compileTune([{ note: 60, start: 0 }], config)
    const state = pinTineEngagement(pin, Math.PI / 2, config)
    expect(state.engaged).toBe(false)
    expect(state.deflection).toBe(0)
  })

  it('subsamples coarse phase jumps so a contact zone cannot be skipped', () => {
    const samples = sampleCylinderPhaseSegment(0, 0.4)
    expect(samples.length).toBeGreaterThan(10)
    expect(samples.at(-1)).toBeCloseTo(0.4, 10)
  })

  it('produces one release per pin across a full revolution at very different render sampling rates', () => {
    expect(countReleases(24)).toBe(tune.length)
    expect(countReleases(576)).toBe(tune.length)
  })
})

describe('music box drive train', () => {
  it('derives the ratio from visible gear tooth counts', () => {
    expect(gearRatio(config)).toBe(2)
  })

  it('derives crank, gear and cylinder angles from one drive angle', () => {
    const state = driveKinematics(Math.PI / 3, config)
    expect(state.driverGearAngle).toBeCloseTo(Math.PI / 3, 10)
    expect(state.cylinderGearAngle).toBeCloseTo(-2 * Math.PI / 3, 10)
    expect(state.cylinderPhase).toBe(state.cylinderGearAngle)
  })
})

describe('music box configuration', () => {
  it('rebuilds axial pin mapping when tine spacing changes', () => {
    const wider: MusicBoxConfig = { ...config, tineSpacing: 0.4, cylinderLength: 3.5 }
    const normalPins = compileTune(tune, config)
    const widerPins = compileTune(tune, wider)

    expect(widerPins[0].axialPosition).not.toBe(normalPins[0].axialPosition)
    expect(widerPins.at(-1)?.axialPosition).not.toBe(normalPins.at(-1)?.axialPosition)
  })

  it('reports note lanes that do not fit the cylinder', () => {
    const invalid: MusicBoxConfig = { ...config, cylinderLength: 1 }
    expect(validateMusicBoxConfig(invalid)).toContain('note lanes do not fit within cylinderLength')
    expect(() => compileTune(tune, invalid)).toThrow(/Invalid music box configuration/)
  })
})
