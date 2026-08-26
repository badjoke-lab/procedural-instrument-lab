import { describe, expect, it } from 'vitest'
import {
  DEFAULT_MUSIC_BOX_CONFIG,
  compileTune,
  driveKinematics,
  gearRatio,
  pinTouchesTine,
  tineContactPoint,
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

function countContacts(framesPerRevolution: number) {
  const pins = compileTune(tune, config)
  const touching = new Set<number>()
  const startPhase = 0.2
  let count = 0

  for (let frame = 0; frame < framesPerRevolution; frame += 1) {
    const phase = startPhase + (frame / framesPerRevolution) * Math.PI * 2

    pins.forEach((pin, index) => {
      const contact = pinTouchesTine(pin, phase, config)
      if (contact && !touching.has(index)) {
        touching.add(index)
        count += 1
      }
      if (!contact) touching.delete(index)
    })
  }

  return count
}

describe('music box contact geometry', () => {
  it('places a pin tip on its tine contact point at the matching phase', () => {
    const [pin] = compileTune([{ note: 60, start: 0 }], config)
    const tip = pinTipWorldPosition(pin, 0, config)
    const contact = tineContactPoint(pin.noteIndex, config)

    expect(tip.x).toBeCloseTo(contact.x, 10)
    expect(tip.y).toBeCloseTo(contact.y, 10)
    expect(tip.z).toBeCloseTo(contact.z, 10)
    expect(pinTouchesTine(pin, 0, config)).toBe(true)
  })

  it('does not report contact a quarter turn away', () => {
    const [pin] = compileTune([{ note: 60, start: 0 }], config)
    expect(pinTouchesTine(pin, Math.PI / 2, config)).toBe(false)
  })

  it('emits one contact entry per pin across a full revolution at different sampling rates', () => {
    expect(countContacts(240)).toBe(tune.length)
    expect(countContacts(576)).toBe(tune.length)
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
