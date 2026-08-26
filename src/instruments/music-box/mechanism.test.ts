import { describe, expect, it } from 'vitest'
import {
  DEFAULT_MUSIC_BOX_CONFIG,
  compileTune,
  pinTouchesTine,
  tineContactPoint,
  pinTipWorldPosition,
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
  let count = 0

  for (let frame = 0; frame <= framesPerRevolution; frame += 1) {
    const phase = (frame / framesPerRevolution) * Math.PI * 2

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
