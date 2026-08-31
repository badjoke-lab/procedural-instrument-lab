import { describe, expect, it } from 'vitest'
import {
  DEFAULT_MUSIC_BOX_CONFIG,
  TINE_REST_Y,
  compileTune,
  driveKinematics,
  gearRatio,
  pinContactWindow,
  pinRenderGeometry,
  pinTineEngagement,
  pinTineSurfaceGap,
  pinTouchesTine,
  sampleCylinderPhaseSegment,
  tineAnchorPoint,
  tineContactPoint,
  tineLength,
  tineLoadAngle,
  tineTipPosition,
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

function phaseAtWindowProgress(pinAngle: number, entryAngle: number, travelAngle: number, direction: number, progress: number) {
  const cylinderAngle = direction < 0
    ? entryAngle - travelAngle * progress
    : entryAngle + travelAngle * progress
  return cylinderAngle - pinAngle
}

function countReleases(framesPerRevolution: number, direction: -1 | 1) {
  const pins = compileTune(tune, config)
  const engaged = new Set<number>()
  const startPhase = 0.41
  let releases = 0
  let previousPhase = startPhase

  for (let frame = 1; frame <= framesPerRevolution; frame += 1) {
    const phase = startPhase + direction * (frame / framesPerRevolution) * Math.PI * 2
    for (const sampledPhase of sampleCylinderPhaseSegment(previousPhase, phase)) {
      pins.forEach((pin, index) => {
        const state = pinTineEngagement(pin, sampledPhase, config, direction)
        if (state.engaged) engaged.add(index)
        if (!state.engaged && engaged.delete(index)) releases += 1
      })
    }
    previousPhase = phase
  }

  return releases
}

describe('music box contact geometry', () => {
  it('uses the rendered pin sphere and rendered tine box as the contact pair', () => {
    const [pin] = compileTune([{ note: 60, start: 0 }], config)
    const contact = tineContactPoint(pin.noteIndex, config)
    const anchor = tineAnchorPoint(pin.noteIndex, config)
    const window = pinContactWindow(pin, -1, config)
    expect(window).not.toBeNull()
    if (!window) return

    const phase = phaseAtWindowProgress(pin.angle, window.entryAngle, window.travelAngle, -1, 0.5)
    const state = pinTineEngagement(pin, phase, config, -1)

    expect(contact.y).toBeCloseTo(config.cylinderCenter[1] + TINE_REST_Y, 10)
    expect(anchor.y).toBeCloseTo(contact.y, 10)
    expect(anchor.z).toBeCloseTo(contact.z, 10)
    expect(tineLength(pin.noteIndex, config)).toBeCloseTo(anchor.x - contact.x, 10)
    expect(state.engaged).toBe(true)
    expect(state.deflection).toBeGreaterThan(0)
    expect(Math.abs(pinTineSurfaceGap(pin, phase, state.loadAngle, config))).toBeLessThan(1e-5)
    expect(pinTouchesTine(pin, phase, config, -1)).toBe(true)
  })

  it('derives renderer pin stem and tip geometry from the same polar source as contact resolution', () => {
    const [pin] = compileTune([{ note: 60, start: 0.25 }], config)
    const rendered = pinRenderGeometry(pin, config)

    expect(rendered.stemCenter.x).toBeCloseTo(Math.cos(pin.angle) * (config.cylinderRadius + config.pinLength / 2), 10)
    expect(rendered.stemCenter.y).toBeCloseTo(Math.sin(pin.angle) * (config.cylinderRadius + config.pinLength / 2), 10)
    expect(rendered.tipCenter.x).toBeCloseTo(Math.cos(pin.angle) * (config.cylinderRadius + config.pinLength), 10)
    expect(rendered.tipCenter.y).toBeCloseTo(Math.sin(pin.angle) * (config.cylinderRadius + config.pinLength), 10)
    expect(rendered.tipCenter.z).toBe(pin.axialPosition)
  })

  it('keeps the default physical contact window long enough to remain visibly inspectable', () => {
    const [pin] = compileTune([{ note: 60, start: 0 }], config)
    const window = pinContactWindow(pin, -1, config)
    expect(window).not.toBeNull()
    if (!window) return

    expect(window.travelAngle).toBeGreaterThan(0.18)
    expect(window.travelAngle).toBeLessThan(0.3)
  })

  it('starts at the resting visible surface and reaches configured elastic travel at release', () => {
    const [pin] = compileTune([{ note: 60, start: 0 }], config)
    const window = pinContactWindow(pin, -1, config)
    expect(window).not.toBeNull()
    if (!window) return

    const entryPhase = phaseAtWindowProgress(pin.angle, window.entryAngle, window.travelAngle, -1, 0)
    const nearReleasePhase = phaseAtWindowProgress(pin.angle, window.entryAngle, window.travelAngle, -1, 0.999)
    const entry = pinTineEngagement(pin, entryPhase, config, -1)
    const nearRelease = pinTineEngagement(pin, nearReleasePhase, config, -1)
    const restTip = tineContactPoint(pin.noteIndex, config)
    const loadedTip = tineTipPosition(pin.noteIndex, nearRelease.loadAngle, config)

    expect(entry.engaged).toBe(true)
    expect(entry.deflection).toBeLessThan(0.01)
    expect(nearRelease.engaged).toBe(true)
    expect(nearRelease.deflection).toBeGreaterThan(0.98)
    expect(Math.abs(loadedTip.y - restTip.y)).toBeCloseTo(config.contactTolerance, 3)
    expect(Math.abs(pinTineSurfaceGap(pin, nearReleasePhase, nearRelease.loadAngle, config))).toBeLessThan(1e-5)
  })

  it('keeps the visible sphere in box-surface contact while the tine loads monotonically forward', () => {
    const [pin] = compileTune([{ note: 60, start: 0 }], config)
    const window = pinContactWindow(pin, -1, config)
    expect(window).not.toBeNull()
    if (!window) return

    const states = [0.2, 0.5, 0.8].map((progress) => {
      const phase = phaseAtWindowProgress(pin.angle, window.entryAngle, window.travelAngle, -1, progress)
      const state = pinTineEngagement(pin, phase, config, -1)
      expect(Math.abs(pinTineSurfaceGap(pin, phase, state.loadAngle, config))).toBeLessThan(1e-5)
      return state
    })

    expect(states[0].loadAngle).toBeGreaterThan(0)
    expect(states[0].deflection).toBeLessThan(states[1].deflection)
    expect(states[1].deflection).toBeLessThan(states[2].deflection)
  })

  it('mirrors the same box-surface contact loading when the cylinder is manually reversed', () => {
    const [pin] = compileTune([{ note: 60, start: 0 }], config)
    const window = pinContactWindow(pin, 1, config)
    expect(window).not.toBeNull()
    if (!window) return

    const states = [0.2, 0.5, 0.8].map((progress) => {
      const phase = phaseAtWindowProgress(pin.angle, window.entryAngle, window.travelAngle, 1, progress)
      const state = pinTineEngagement(pin, phase, config, 1)
      expect(Math.abs(pinTineSurfaceGap(pin, phase, state.loadAngle, config))).toBeLessThan(1e-5)
      return state
    })

    expect(states[0].loadAngle).toBeLessThan(0)
    expect(states[0].deflection).toBeLessThan(states[1].deflection)
    expect(states[1].deflection).toBeLessThan(states[2].deflection)
  })

  it('releases immediately after the directional surface-contact window instead of re-engaging on the far side', () => {
    const [pin] = compileTune([{ note: 60, start: 0 }], config)
    for (const direction of [-1, 1] as const) {
      const window = pinContactWindow(pin, direction, config)
      expect(window).not.toBeNull()
      if (!window) continue
      const beforeEntryPhase = phaseAtWindowProgress(pin.angle, window.entryAngle, window.travelAngle, direction, -0.1)
      const afterReleasePhase = phaseAtWindowProgress(pin.angle, window.entryAngle, window.travelAngle, direction, 1.1)
      expect(pinTineEngagement(pin, beforeEntryPhase, config, direction).engaged).toBe(false)
      expect(pinTineEngagement(pin, afterReleasePhase, config, direction).engaged).toBe(false)
    }
  })

  it('does not claim contact at the old rightmost-cylinder point while the visible surfaces are separated', () => {
    const [pin] = compileTune([{ note: 60, start: 0 }], config)
    expect(pinTineEngagement(pin, 0, config, -1).engaged).toBe(false)
  })

  it('loads the tine away from the approaching pin with symmetric maximum travel', () => {
    const forward = tineLoadAngle(0, 1, -1, config)
    const reverse = tineLoadAngle(0, 1, 1, config)
    expect(forward).toBeGreaterThan(0)
    expect(reverse).toBeLessThan(0)
    expect(Math.abs(forward)).toBeCloseTo(Math.abs(reverse), 10)
    expect(Math.abs(forward)).toBeGreaterThan(0.2)
    expect(Math.abs(forward)).toBeLessThan(0.35)
  })

  it('subsamples coarse phase jumps so a contact zone cannot be skipped', () => {
    const samples = sampleCylinderPhaseSegment(0, 0.4)
    expect(samples.length).toBeGreaterThan(50)
    expect(samples.at(-1)).toBeCloseTo(0.4, 10)
  })

  it('produces one release per pin in either direction across very different render sampling rates', () => {
    for (const direction of [-1, 1] as const) {
      expect(countReleases(24, direction)).toBe(tune.length)
      expect(countReleases(576, direction)).toBe(tune.length)
    }
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
